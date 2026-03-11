from rest_framework import serializers
from .models import ExamResult


class ExamResultSerializer(serializers.ModelSerializer):
    exam_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = ExamResult
        fields = ['id', 'session', 'student_name', 'exam_name', 'subject_name',
                  'total_marks', 'obtained_marks', 'percentage',
                  'correct_count', 'wrong_count', 'unattempted_count',
                  'ai_overall_feedback', 'chapter_analysis', 'weak_chapters',
                  'strong_chapters', 'recommendations', 'evaluated_at',
                  'analysis_confirmed', 'confirmed_at']

    def get_exam_name(self, obj):
        return obj.session.paper.exam_type.name

    def get_subject_name(self, obj):
        return obj.session.paper.subject.name

    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username
