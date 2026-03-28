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

# Safety settings to prevent "Candidate was blocked" errors
SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
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
    print(f"DEBUG: Attempting AI generation with {model_name} (Attempt {model_index + 1})...")
    
    model = genai.GenerativeModel(model_name)
    chapter_list = ", ".join(chapters)
    
    source_context = ""
    if reference_papers:
        limit = 8000 
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
            
        response = model.generate_content(prompt, generation_config=config, safety_settings=SAFETY_SETTINGS)
        raw = response.text
        return json.loads(clean_json_string(raw))
    except Exception as e:
        err_msg = str(e)
        print(f"ERROR with {model_name}: {err_msg}")
        if any(code in err_msg for code in ["429", "404", "400"]) or "quota" in err_msg.lower() or "blocked" in err_msg.lower():
            return generate_exam_paper(exam_type, subject, chapters, total_questions, difficulty, mode, reference_papers, model_index + 1)
        if total_questions > 2:
             return generate_exam_paper(exam_type, subject, chapters, 2, difficulty, mode, reference_papers, model_index)
        raise e

def evaluate_descriptive_answer(question: str, correct_answer: str, student_answer: str, marks: float, model_index: int = 0) -> dict:
    if model_index >= len(MODELS_TO_TRY):
        return {"marks_obtained": 0, "is_correct": False, "feedback": "AI Evaluation failed."}
        
    model_name = MODELS_TO_TRY[model_index]
    try:
        model = genai.GenerativeModel(model_name)
        prompt = f"Evaluate. JSON only. Q: {question} | A: {correct_answer} | Student: {student_answer} | Marks: {marks}"
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"}, safety_settings=SAFETY_SETTINGS)
        return json.loads(clean_json_string(response.text))
    except Exception as e:
        print(f"Eval error with {model_name}: {e}")
        return evaluate_descriptive_answer(question, correct_answer, student_answer, marks, model_index + 1)

def generate_performance_analysis(student_name: str, exam_type: str, subject: str,
                                   chapter_analysis: dict, percentage: float, model_index: int = 0) -> str:
    if model_index >= len(MODELS_TO_TRY):
        raise Exception("All AI models failed to generate analysis.")
        
    model_name = MODELS_TO_TRY[model_index]
    print(f"DEBUG: Attempting beautiful analysis with {model_name}...")
    try:
        model = genai.GenerativeModel(model_name)
        prompt = f"""
ACT AS AN EXPERT ACADEMIC COUNSELOR AND MENTOR.
Analyze the following student performance data and provide a BEAUTIFUL, MOTIVATIONAL, and DETAILED performance report in Markdown format.

STUDENT INFO:
- Name: {student_name}
- Exam: {exam_type}
- Subject: {subject}
- Overall Score: {percentage}%

PERFORMANCE DATA:
{json.dumps(chapter_analysis, indent=2)}

THE REPORT MUST INCLUDE:
1. 🌟 **Overall Performance**: A warm, encouraging summary of their results.
2. ✅ **Key Strengths**: Specific praise for chapters where they scored well.
3. 🛠️ **Focus Areas**: Constructive and detailed advice for chapters that need more work.
4. 📈 **7-Day Action Plan**: A step-by-step study schedule to improve.
5. 💡 **Pro Tip**: A specific test-taking strategy relevant to {exam_type}.
6. ✨ **Motivational Closing**: An inspiring final quote or thought.

FORMATTING RULES:
- Use clear headers and bullet points.
- Use bold text for key insights.
- Keep the tone professional, supportive, and inspiring.
"""
        response = model.generate_content(prompt, safety_settings=SAFETY_SETTINGS)
        return response.text.strip()
    except Exception as e:
        print(f"Analysis error with {model_name}: {e}")
        return generate_performance_analysis(student_name, exam_type, subject, chapter_analysis, percentage, model_index + 1)
