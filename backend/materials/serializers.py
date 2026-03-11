from rest_framework import serializers
from .models import StudyMaterial


class StudyMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyMaterial
        fields = ['id', 'exam_type', 'subject', 'chapter', 'title', 'description',
                  'material_type', 'file', 'video_url', 'is_active', 'created_at']
