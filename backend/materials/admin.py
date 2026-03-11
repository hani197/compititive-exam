from django.contrib import admin
from .models import StudyMaterial

@admin.register(StudyMaterial)
class StudyMaterialAdmin(admin.ModelAdmin):
    list_display = ['title', 'exam_type', 'subject', 'material_type', 'is_active']
    list_filter = ['exam_type', 'material_type', 'is_active']
