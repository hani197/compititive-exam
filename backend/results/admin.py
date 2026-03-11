from django.contrib import admin
from .models import ExamResult

@admin.register(ExamResult)
class ExamResultAdmin(admin.ModelAdmin):
    list_display = ['student', 'percentage', 'correct_count', 'wrong_count', 'evaluated_at']
    list_filter = ['session__paper__exam_type']
    search_fields = ['student__username']
