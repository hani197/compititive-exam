import json
import google.generativeai as genai
from django.conf import settings
from PyPDF2 import PdfReader
import io
import re
import os

# Configure Gemini
api_key = getattr(settings, 'GEMINI_API_KEY', None)
if not api_key:
    api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')

if api_key:
    print(f"DEBUG: GEMINI_API_KEY loaded successfully (length: {len(api_key)})")
    genai.configure(api_key=api_key)
else:
    print("CRITICAL: No GEMINI_API_KEY found in settings or environment.")

# Confirmed models available for this account
MODELS_TO_TRY = [
    'gemini-2.0-flash-lite',      # Highest quota limits
    'gemini-flash-lite-latest',   # 1.5 Lite fallback
    'gemini-2.0-flash',           # Standard Flash
    'gemma-3-4b-it'               # Confirmed working in gemini.js
]

def clean_json_string(text):
    """Deep clean JSON string for common LLM errors."""
    if not text:
        return "{}"
    text = re.sub(r'```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```', '', text)
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        text = text[start:end+1]
    return text.strip()

def extract_text_from_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        text = ""
        for i in range(min(15, len(reader.pages))):
            text += reader.pages[i].extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""

def generate_exam_paper(exam_type: str, subject: str, chapters: list[str], 
                         total_questions: int = 10, difficulty: str = 'mixed',
                         mode: str = 'ai_generated',
                         reference_papers: list[str] = None,
                         model_index: int = 0) -> dict:
    
    if model_index >= len(MODELS_TO_TRY):
        raise Exception("All AI models are currently busy or at quota limit. Please wait 60 seconds and try again.")

    model_name = MODELS_TO_TRY[model_index]
    print(f"DEBUG: Attempting AI generation with {model_name}...")
    
    model = genai.GenerativeModel(model_name)
    chapter_list = ", ".join(chapters)
    
    source_context = ""
    if reference_papers:
        limit = 8000 # Truncate slightly more to stay under token limits
        combined_ref = "\n".join([p[:limit] for p in reference_papers])
        source_context = f"CONTEXT TEXT:\n{combined_ref}\n\n"

    prompt = f"""{source_context}
Task: Generate exactly {total_questions} MCQ questions for Indian exam '{exam_type}', Subject: '{subject}', Chapters: {chapter_list}.
Difficulty: {difficulty}

Return ONLY a JSON object with this exact structure:
{{
  "questions": [
    {{
      "question_number": 1,
      "question_text": "...",
      "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...",
      "correct_answer": "A",
      "explanation": "...",
      "chapter": "...",
      "marks": 1.0
    }}
  ]
}}
"""

    try:
        config = {}
        if 'gemini' in model_name:
            config = {"response_mime_type": "application/json"}
            
        response = model.generate_content(prompt, generation_config=config)
        raw = response.text
        print(f"DEBUG: Received response from {model_name}")
        
        return json.loads(clean_json_string(raw))
    except Exception as e:
        err_msg = str(e)
        print(f"ERROR with {model_name}: {err_msg}")
        
        # If quota (429) or model error, try next one immediately
        if "429" in err_msg or "quota" in err_msg.lower() or "404" in err_msg or "not found" in err_msg.lower() or "400" in err_msg:
            return generate_exam_paper(exam_type, subject, chapters, total_questions, difficulty, mode, reference_papers, model_index + 1)
            
        # For small papers, try one last time with minimal questions
        if total_questions > 2:
             return generate_exam_paper(exam_type, subject, chapters, 2, difficulty, mode, reference_papers, model_index)
             
        raise e

def evaluate_descriptive_answer(question: str, correct_answer: str, student_answer: str, marks: float) -> dict:
    model = genai.GenerativeModel(MODELS_TO_TRY[0])
    prompt = f"Evaluate. JSON only. Q: {question} | A: {correct_answer} | Student: {student_answer} | Marks: {marks}"
    response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
    return json.loads(clean_json_string(response.text))

def generate_performance_analysis(student_name: str, exam_type: str, subject: str,
                                   chapter_analysis: dict, percentage: float) -> str:
    model = genai.GenerativeModel(MODELS_TO_TRY[0])
    prompt = f"Analyze performance. Student: {student_name} | Score: {percentage}% | Data: {json.dumps(chapter_analysis)}"
    response = model.generate_content(prompt)
    return response.text.strip()
