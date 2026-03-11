from django.contrib import admin
from .models import Enrollment

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'exam_type', 'status', 'enrolled_at', 'valid_until']
    list_filter = ['exam_type', 'status']
    search_fields = ['student__username', 'student__email']
