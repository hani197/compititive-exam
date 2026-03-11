import json
import anthropic
from django.conf import settings


client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def generate_exam_paper(exam_type: str, subject: str, chapters: list[str], 
                         total_questions: int = 30, difficulty: str = 'mixed') -> dict:
    """
    Generate exam questions using Claude AI.
    Returns a dict with list of questions.
    """
    chapter_list = ", ".join(chapters)
    prompt = f"""Generate {total_questions} exam questions for the following:

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

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=8192,
        messages=[{"role": "user", "content": prompt}]
    )

    response_text = message.content[0].text.strip()
    # Extract JSON if wrapped in markdown
    if response_text.startswith("```"):
        response_text = response_text.split("```")[1]
        if response_text.startswith("json"):
            response_text = response_text[4:]

    return json.loads(response_text)


def evaluate_descriptive_answer(question: str, correct_answer: str, student_answer: str, marks: float) -> dict:
    """
    Evaluate a descriptive answer using Claude AI.
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

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    response_text = message.content[0].text.strip()
    if response_text.startswith("```"):
        response_text = response_text.split("```")[1]
        if response_text.startswith("json"):
            response_text = response_text[4:]

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

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    return message.content[0].text.strip()
