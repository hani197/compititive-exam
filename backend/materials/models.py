from django.db import models
from django.conf import settings
from exams.models import ExamType, Subject, Chapter


class StudyMaterial(models.Model):
    MATERIAL_TYPE_CHOICES = [
        ('pdf', 'PDF'),
        ('video', 'Video'),
        ('notes', 'Notes'),
        ('practice', 'Practice Set'),
    ]

    exam_type = models.ForeignKey(ExamType, on_delete=models.CASCADE, related_name='materials')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='materials', null=True, blank=True)
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='materials', null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    material_type = models.CharField(max_length=20, choices=MATERIAL_TYPE_CHOICES)
    file = models.FileField(upload_to='materials/', null=True, blank=True)
    video_url = models.URLField(blank=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.exam_type.code} - {self.title}"


class MaterialAccess(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    material = models.ForeignKey(StudyMaterial, on_delete=models.CASCADE)
    accessed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'material')
