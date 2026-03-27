import json
import google.generativeai as genai
from django.conf import settings
from PyPDF2 import PdfReader
import io
import re
import os

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-flash-latest')

def clean_json_string(text):
    """Deep clean JSON string for common LLM errors."""
    if not text:
        return "{}"
        
    # 1. Remove markdown formatting
    text = re.sub(r'```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```', '', text)
    
    # 2. Extract content between first { or [ and last } or ]
    start_brace = text.find('{')
    start_bracket = text.find('[')
    
    if start_brace == -1 and start_bracket == -1:
        return text.strip()
        
    start = start_brace if (start_brace != -1 and (start_bracket == -1 or start_brace < start_bracket)) else start_bracket
    
    end_brace = text.rfind('}')
    end_bracket = text.rfind(']')
    end = end_brace if end_brace > end_bracket else end_bracket
    
    if start != -1 and end != -1:
        text = text[start:end+1]
    
    # 3. Fix unescaped control characters
    # Replace actual newlines inside strings with \n
    def replace_unescaped(match):
        content = match.group(0)
        return content.replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
    
    text = re.sub(r'"[^"]*"', replace_unescaped, text, flags=re.DOTALL)

    # 4. Remove trailing commas
    text = re.sub(r',\s*([\]}])', r'\1', text)
    
    return text.strip()

def extract_text_from_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        text = ""
        # Read more pages if possible to get better question bank
        for i in range(min(15, len(reader.pages))):
            text += reader.pages[i].extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""

def generate_exam_paper(exam_type: str, subject: str, chapters: list[str], 
                         total_questions: int = 10, difficulty: str = 'mixed',
                         mode: str = 'ai_generated',
                         reference_papers: list[str] = None) -> dict:
    print(f"DEBUG: Calling AI for {exam_type} - {subject} (Mode: {mode})")
    chapter_list = ", ".join(chapters)
    
    source_context = ""
    if reference_papers:
        # Heavily truncate reference to keep Gemini focused, but allow more if extracting
        limit = 10000 if mode == 'from_pdf' else 1500
        combined_ref = "\n".join([p[:limit] for p in reference_papers])
        
        if mode == 'from_pdf':
            source_context = f"""ACT AS A QUESTION EXTRACTOR. 
YOUR PRIMARY GOAL: Find the 'EXERCISE' or 'PRACTICE QUESTIONS' section in the text below and extract exactly {total_questions} questions from it.
IF NO EXERCISE SECTION EXISTS: Create {total_questions} questions based strictly on the factual content of the text.
TEXT TO USE:
{combined_ref}
\n\n"""
        else:
            source_context = f"ACT AS A QUESTION GENERATOR. USE THIS TEXT AS INSPIRATION AND STYLE REFERENCE:\n{combined_ref}\n\n"

    task_description = f"Generate {total_questions} MCQ questions"
    if mode == 'from_pdf' and reference_papers:
        task_description = f"Extract exactly {total_questions} real MCQ questions from the provided text"

    prompt = f"""{source_context}
Task: {task_description} for Indian exam '{exam_type}', Subject: '{subject}', Chapters: {chapter_list}.
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
        # Define log_path if it doesn't exist yet
        try:
            log_path = os.path.join(settings.BASE_DIR, "ai_debug.log")
        except:
            log_path = "ai_debug.log"
            
        print(f"DEBUG: Error occurred during AI generation. Exception: {e}")
        # If it failed, try one more time with a much simpler request
        if "total_questions" in locals() and total_questions > 5:
             return generate_exam_paper(exam_type, subject, chapters, 5, difficulty, mode, reference_papers)
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
