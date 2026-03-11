from django.contrib import admin
from .models import ExamType, Subject, Chapter, Topic

@admin.register(ExamType)
class ExamTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active']

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'exam_type', 'code', 'is_active']
    list_filter = ['exam_type']

@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ['name', 'subject', 'order', 'is_active']
    list_filter = ['subject__exam_type', 'subject']

admin.site.register(Topic)
