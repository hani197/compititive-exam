from django.contrib import admin
from .models import GeneratedPaper, Question

@admin.register(GeneratedPaper)
class PaperAdmin(admin.ModelAdmin):
    list_display = ['title', 'exam_type', 'subject', 'total_questions', 'difficulty', 'status']
    list_filter = ['exam_type', 'status', 'difficulty']

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['question_number', 'paper', 'question_type', 'marks']
    list_filter = ['question_type', 'paper__exam_type']
