from django.db import models
from django.conf import settings
from exams.models import ExamType, Subject, Chapter


class GeneratedPaper(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
        ('mixed', 'Mixed'),
    ]
    STATUS_CHOICES = [
        ('generating', 'Generating'),
        ('ready', 'Ready'),
        ('failed', 'Failed'),
    ]

    exam_type = models.ForeignKey(ExamType, on_delete=models.CASCADE, related_name='papers')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='papers')
    chapters = models.ManyToManyField(Chapter, related_name='papers')
    title = models.CharField(max_length=200)
    total_questions = models.PositiveIntegerField(default=30)
    duration_minutes = models.PositiveIntegerField(default=60)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='mixed')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='generating')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_papers'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.exam_type.code} - {self.subject.name} - {self.title}"


class Question(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('mcq', 'Multiple Choice'),
        ('short', 'Short Answer'),
        ('long', 'Long Answer'),
    ]

    paper = models.ForeignKey(GeneratedPaper, on_delete=models.CASCADE, related_name='questions')
    chapter = models.ForeignKey(Chapter, on_delete=models.SET_NULL, null=True, blank=True)
    question_number = models.PositiveIntegerField()
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPE_CHOICES, default='mcq')
    question_text = models.TextField()
    option_a = models.CharField(max_length=500, blank=True)
    option_b = models.CharField(max_length=500, blank=True)
    option_c = models.CharField(max_length=500, blank=True)
    option_d = models.CharField(max_length=500, blank=True)
    correct_answer = models.CharField(max_length=1000)
    explanation = models.TextField(blank=True)
    marks = models.FloatField(default=1.0)
    negative_marks = models.FloatField(default=0.0)

    class Meta:
        ordering = ['question_number']

    def __str__(self):
        return f"Q{self.question_number} - {self.paper.title}"


class AssignedPaper(models.Model):
    paper = models.ForeignKey(GeneratedPaper, on_delete=models.CASCADE, related_name='assignments')
    students = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='assigned_papers')
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='paper_assignments'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    instructions = models.TextField(blank=True)

    def __str__(self):
        return f"Assignment: {self.paper.title}"


class PreviousYearPaper(models.Model):
    exam_type = models.ForeignKey(ExamType, on_delete=models.CASCADE, related_name='old_papers')
    title = models.CharField(max_length=255)
    year = models.PositiveIntegerField()
    file = models.FileField(upload_to='old_papers/')
    description = models.TextField(blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='uploaded_old_papers'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.exam_type.code} - {self.year} - {self.title}"

