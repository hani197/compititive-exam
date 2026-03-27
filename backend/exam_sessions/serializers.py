from rest_framework import serializers
from .models import ExamSession, StudentAnswer
from papers.serializers import GeneratedPaperSerializer


class StudentAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    correct_answer = serializers.CharField(source='question.correct_answer', read_only=True)
    explanation = serializers.CharField(source='question.explanation', read_only=True)
    option_a = serializers.CharField(source='question.option_a', read_only=True)
    option_b = serializers.CharField(source='question.option_b', read_only=True)
    option_c = serializers.CharField(source='question.option_c', read_only=True)
    option_d = serializers.CharField(source='question.option_d', read_only=True)

    class Meta:
        model = StudentAnswer
        fields = ['id', 'question', 'question_text', 'selected_option', 
                  'correct_answer', 'explanation', 'option_a', 'option_b', 
                  'option_c', 'option_d', 'is_correct', 'marks_obtained', 
                  'ai_feedback', 'answered_at']


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
