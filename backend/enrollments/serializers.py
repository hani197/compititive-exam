from rest_framework import serializers
from .models import Enrollment
from exams.serializers import ExamTypeListSerializer


class EnrollmentSerializer(serializers.ModelSerializer):
    exam_type_detail = ExamTypeListSerializer(source='exam_type', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'exam_type', 'exam_type_detail', 'status', 'enrolled_at', 'valid_until']
        read_only_fields = ['id', 'enrolled_at', 'status']

    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)
