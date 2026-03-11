from rest_framework import serializers
from .models import ExamSession, StudentAnswer
from papers.serializers import GeneratedPaperSerializer


class StudentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAnswer
        fields = ['id', 'question', 'selected_option', 'answer_text', 'answered_at']


class ExamSessionSerializer(serializers.ModelSerializer):
    paper_detail = GeneratedPaperSerializer(source='paper', read_only=True)

    class Meta:
        model = ExamSession
        fields = ['id', 'paper', 'paper_detail', 'status', 'started_at',
                  'submitted_at', 'time_taken_seconds']
        read_only_fields = ['id', 'status', 'started_at', 'submitted_at']


class SubmitExamSerializer(serializers.Serializer):
    answers = serializers.ListField(child=serializers.DictField())
    time_taken_seconds = serializers.IntegerField(min_value=0)
