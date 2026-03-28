import json
import google.generativeai as genai
from django.conf import settings
from PyPDF2 import PdfReader
import io
import re
import os
import time

# Configure Gemini
api_key = getattr(settings, 'GEMINI_API_KEY', None)
if not api_key:
    # Try environment variable directly as fallback
    api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')

if api_key:
    print(f"DEBUG: GEMINI_API_KEY loaded successfully (length: {len(api_key)})")
    genai.configure(api_key=api_key)
else:
    print("CRITICAL: No GEMINI_API_KEY found in settings or environment.")

# List of models to try in order of preference
# Including gemma-3-4b-it as it was confirmed working in gemini.js
MODELS_TO_TRY = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemma-3-4b-it'
]

def clean_json_string(text):
    """Deep clean JSON string for common LLM errors."""
    if not text:
        return "{}"
    # Remove markdown formatting
    text = re.sub(r'```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```', '', text)
    
    # Extract content between first { or [ and last } or ]
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
        raise Exception("All available AI models failed or exceeded quota. Please try again in a few minutes.")

    model_name = MODELS_TO_TRY[model_index]
    print(f"DEBUG: Calling AI model {model_name} for {exam_type} - {subject}")
    
    model = genai.GenerativeModel(model_name)
    chapter_list = ", ".join(chapters)
    
    source_context = ""
    if reference_papers:
        limit = 10000 if mode == 'from_pdf' else 1500
        combined_ref = "\n".join([p[:limit] for p in reference_papers])
        if mode == 'from_pdf':
            source_context = f"TEXT CONTENT TO EXTRACT FROM:\n{combined_ref}\n\n"
        else:
            source_context = f"INSPIRATION TEXT:\n{combined_ref}\n\n"

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
        # Use JSON mode for Gemini models (Gemma doesn't support it via this config)
        config = {}
        if 'gemini' in model_name:
            config = {"response_mime_type": "application/json"}
            
        response = model.generate_content(prompt, generation_config=config)
        raw = response.text
        print(f"DEBUG: Received AI response from {model_name} ({len(raw)} chars)")
        
        cleaned = clean_json_string(raw)
        return json.loads(cleaned)
    except Exception as e:
        err_msg = str(e)
        print(f"ERROR with model {model_name}: {err_msg}")
        
        # If it's a quota, availability, or formatting error, try the next model
        # 429=Quota, 404=Not Found, 400=Invalid (often formatting)
        if any(code in err_msg for code in ["429", "404", "400"]) or "quota" in err_msg.lower():
            print(f"DEBUG: Attempting next model...")
            return generate_exam_paper(exam_type, subject, chapters, total_questions, difficulty, mode, reference_papers, model_index + 1)
            
        # For other errors, try a very small set as a fallback
        if total_questions > 2:
             print("DEBUG: Retrying same model with minimal question count...")
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
