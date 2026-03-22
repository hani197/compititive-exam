import json
import google.generativeai as genai
from django.conf import settings
from PyPDF2 import PdfReader
import io

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
# Using gemma-3-4b-it as verified to work on free tier
model = genai.GenerativeModel('gemma-3-4b-it')

def extract_text_from_pdf(file_path):
    """Utility to extract text from a PDF file."""
    try:
        reader = PdfReader(file_path)
        text = ""
        # Read up to 10 pages to avoid context window issues
        for i in range(min(10, len(reader.pages))):
            text += reader.pages[i].extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""

def generate_exam_paper(exam_type: str, subject: str, chapters: list[str], 
                         total_questions: int = 10, difficulty: str = 'mixed',
                         reference_papers: list[str] = None) -> dict:
    """
    Generate exam questions using Gemini AI.
    If reference_papers (list of text) is provided, pick/adapt questions from them.
    """
    chapter_list = ", ".join(chapters)
    
    source_instruction = ""
    if reference_papers:
        combined_ref = "\n---\n".join(reference_papers)
        source_instruction = f"""
I am providing some PREVIOUS YEAR PAPERS as reference below. 
Please PICK or CLOSELY ADAPT {total_questions} questions from these reference texts that match the chapters: {chapter_list}.

REFERENCE PAPERS CONTENT:
{combined_ref}
---
"""

    prompt = f"""{source_instruction}
Generate {total_questions} exam questions for the following:

Exam: {exam_type}
Subject: {subject}
Chapters: {chapter_list}
Difficulty: {difficulty}

Generate a mix of MCQ questions. For each question return JSON with this exact format:
{{
  "questions": [
    {{
      "question_number": 1,
      "question_type": "mcq",
      "question_text": "...",
      "option_a": "...",
      "option_b": "...",
      "option_c": "...",
      "option_d": "...",
      "correct_answer": "A",
      "explanation": "...",
      "chapter": "chapter name from the list",
      "marks": 1.0,
      "negative_marks": 0.25
    }}
  ]
}}

Make questions relevant to {exam_type} exam pattern in India.
Return ONLY valid JSON, no extra text."""

    response = model.generate_content(prompt)
    response_text = response.text.strip()
    
    # Extract JSON if wrapped in markdown
    if "```json" in response_text:
        response_text = response_text.split("```json")[1].split("```")[0].strip()
    elif "```" in response_text:
        response_text = response_text.split("```")[1].split("```")[0].strip()

    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        print(f"Failed to decode JSON. Raw response: {response_text}")
        raise

def evaluate_descriptive_answer(question: str, correct_answer: str, student_answer: str, marks: float) -> dict:
    """
    Evaluate a descriptive answer using Gemini AI.
    """
    prompt = f"""Evaluate this student's answer for the exam question:

Question: {question}
Model Answer: {correct_answer}
Student's Answer: {student_answer}
Total Marks: {marks}

Evaluate and return JSON:
{{
  "marks_obtained": <float between 0 and {marks}>,
  "is_correct": <true if >= 60% marks>,
  "feedback": "detailed feedback on the answer",
  "key_points_covered": ["list of key points the student mentioned"],
  "missing_points": ["important points the student missed"]
}}

Return ONLY valid JSON."""

    response = model.generate_content(prompt)
    response_text = response.text.strip()
    
    if "```json" in response_text:
        response_text = response_text.split("```json")[1].split("```")[0].strip()
    elif "```" in response_text:
        response_text = response_text.split("```")[1].split("```")[0].strip()

    return json.loads(response_text)

def generate_performance_analysis(student_name: str, exam_type: str, subject: str,
                                   chapter_analysis: dict, percentage: float) -> str:
    """
    Generate AI-based performance analysis and recommendations.
    """
    prompt = f"""Analyze this student's exam performance and provide recommendations:

Student: {student_name}
Exam: {exam_type}
Subject: {subject}
Score: {percentage:.1f}%
Chapter-wise performance: {json.dumps(chapter_analysis, indent=2)}

Provide:
1. Overall performance summary (2-3 sentences)
2. Strong areas
3. Weak areas that need improvement
4. Specific study recommendations
5. Tips for the next attempt

Keep it encouraging, specific, and actionable. Response in plain text (no JSON)."""

    response = model.generate_content(prompt)
    return response.text.strip()
