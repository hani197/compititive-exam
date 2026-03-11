from django.db import models
from django.conf import settings
from papers.models import GeneratedPaper, Question


class ExamSession(models.Model):
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
        ('evaluated', 'Evaluated'),
        ('timed_out', 'Timed Out'),
    ]

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='exam_sessions')
    paper = models.ForeignKey(GeneratedPaper, on_delete=models.CASCADE, related_name='sessions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    time_taken_seconds = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.student.username} - {self.paper.title} ({self.status})"


class StudentAnswer(models.Model):
    session = models.ForeignKey(ExamSession, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=1, blank=True)  # For MCQ: A/B/C/D
    answer_text = models.TextField(blank=True)  # For descriptive
    is_correct = models.BooleanField(null=True, blank=True)
    marks_obtained = models.FloatField(null=True, blank=True)
    ai_feedback = models.TextField(blank=True)
    answered_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('session', 'question')

    def __str__(self):
        return f"Session {self.session.id} - Q{self.question.question_number}"
