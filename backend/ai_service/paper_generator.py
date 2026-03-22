import json
import google.generativeai as genai
from django.conf import settings
from PyPDF2 import PdfReader
import io
import re
import os

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemma-3-4b-it')

def clean_json_string(text):
    """Deep clean JSON string for common LLM errors."""
    # 1. Remove markdown formatting
    text = re.sub(r'```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```', '', text)
    
    # 2. Extract content between first { and last }
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        text = text[start:end+1]
    
    # 3. Fix unescaped newlines within JSON strings (common in gemma)
    # This regex looks for newlines that are NOT preceded by a comma or bracket (simplified)
    # Actually, a better way is to replace newlines inside double quotes
    def replace_newlines(match):
        return match.group(0).replace('\n', '\\n')
    text = re.sub(r'"[^"]*"', replace_newlines, text, flags=re.DOTALL)

    # 4. Remove trailing commas
    text = re.sub(r',\s*([\]}])', r'\1', text)
    
    return text.strip()

def extract_text_from_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        text = ""
        for i in range(min(5, len(reader.pages))):
            text += reader.pages[i].extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""

def generate_exam_paper(exam_type: str, subject: str, chapters: list[str], 
                         total_questions: int = 10, difficulty: str = 'mixed',
                         reference_papers: list[str] = None) -> dict:
    chapter_list = ", ".join(chapters)
    
    source_context = ""
    if reference_papers:
        # Heavily truncate reference to keep Gemini focused
        combined_ref = "\n".join([p[:1500] for p in reference_papers])
        source_context = f"ACT AS A QUESTION EXTRACTOR. USE THIS TEXT:\n{combined_ref}\n\n"

    prompt = f"""{source_context}
Task: Generate {total_questions} MCQ questions for Indian exam '{exam_type}', Subject: '{subject}', Chapters: {chapter_list}.
Difficulty: {difficulty}

Strict JSON output format:
{{
  "questions": [
    {{
      "question_number": 1,
      "question_text": "text",
      "option_a": "a", "option_b": "b", "option_c": "c", "option_d": "d",
      "correct_answer": "A",
      "explanation": "why",
      "chapter": "chapter name",
      "marks": 1.0
    }}
  ]
}}

CRITICAL:
- Return ONLY JSON.
- No markdown, no preamble.
- Ensure all quotes are escaped.
- Each question must be valid JSON."""

    try:
        response = model.generate_content(prompt)
        raw = response.text
        
        # LOG FOR DEBUGGING
        log_path = os.path.join(settings.BASE_DIR, "ai_debug.log")
        with open(log_path, "w") as f:
            f.write(raw)
            
        cleaned = clean_json_string(raw)
        return json.loads(cleaned)
    except Exception as e:
        print(f"DEBUG: Raw response was saved to {log_path}")
        # If it failed, try one more time with a much simpler request
        if "total_questions" in locals() and total_questions > 5:
             return generate_exam_paper(exam_type, subject, chapters, 5, difficulty, reference_papers)
        raise

def evaluate_descriptive_answer(question: str, correct_answer: str, student_answer: str, marks: float) -> dict:
    prompt = f"Evaluate. JSON only. Q: {question} | A: {correct_answer} | Student: {student_answer} | Marks: {marks}"
    response = model.generate_content(prompt)
    return json.loads(clean_json_string(response.text))

def generate_performance_analysis(student_name: str, exam_type: str, subject: str,
                                   chapter_analysis: dict, percentage: float) -> str:
    prompt = f"Analyze performance. Student: {student_name} | Score: {percentage}% | Data: {json.dumps(chapter_analysis)}"
    response = model.generate_content(prompt)
    return response.text.strip()
