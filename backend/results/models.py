from django.db import models
from django.conf import settings
from exam_sessions.models import ExamSession


class ExamResult(models.Model):
    session = models.OneToOneField(ExamSession, on_delete=models.CASCADE, related_name='result')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='results')
    total_marks = models.FloatField(default=0)
    obtained_marks = models.FloatField(default=0)
    percentage = models.FloatField(default=0)
    correct_count = models.PositiveIntegerField(default=0)
    wrong_count = models.PositiveIntegerField(default=0)
    unattempted_count = models.PositiveIntegerField(default=0)
    ai_overall_feedback = models.TextField(blank=True)
    chapter_analysis = models.JSONField(default=dict)
    weak_chapters = models.JSONField(default=list)
    strong_chapters = models.JSONField(default=list)
    recommendations = models.TextField(blank=True)
    evaluated_at = models.DateTimeField(auto_now_add=True)
    # Admin confirmation
    analysis_confirmed = models.BooleanField(default=False)
    confirmed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='confirmed_results'
    )
    confirmed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.student.username} - {self.percentage:.1f}%"


class StudentProgress(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress')
    exam_type = models.ForeignKey('exams.ExamType', on_delete=models.CASCADE)
    subject = models.ForeignKey('exams.Subject', on_delete=models.CASCADE)
    chapter = models.ForeignKey('exams.Chapter', on_delete=models.CASCADE)
    total_attempts = models.PositiveIntegerField(default=0)
    avg_score = models.FloatField(default=0)
    best_score = models.FloatField(default=0)
    last_attempted = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'chapter')
