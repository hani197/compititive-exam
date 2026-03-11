from rest_framework import serializers
from .models import GeneratedPaper, Question, AssignedPaper
from users.serializers import UserSerializer


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question_number', 'question_type', 'question_text',
                  'option_a', 'option_b', 'option_c', 'option_d', 'marks', 'negative_marks']


class GeneratedPaperSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    exam_type_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()

    class Meta:
        model = GeneratedPaper
        fields = ['id', 'exam_type', 'exam_type_name', 'subject', 'subject_name',
                  'chapters', 'title', 'total_questions', 'duration_minutes',
                  'difficulty', 'status', 'created_at', 'questions']

    def get_exam_type_name(self, obj):
        return obj.exam_type.name

    def get_subject_name(self, obj):
        return obj.subject.name


class GeneratePaperInputSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, default='')
    exam_type_id = serializers.IntegerField()
    subject_id = serializers.IntegerField()
    chapter_ids = serializers.ListField(child=serializers.IntegerField(), min_length=1)
    total_questions = serializers.IntegerField(default=30, min_value=5, max_value=100)
    difficulty = serializers.ChoiceField(choices=['easy', 'medium', 'hard', 'mixed'], default='mixed')
    duration_minutes = serializers.IntegerField(default=60, min_value=15, max_value=180)


class AssignedPaperSerializer(serializers.ModelSerializer):
    paper_detail = GeneratedPaperSerializer(source='paper', read_only=True)
    student_count = serializers.SerializerMethodField()
    students_detail = UserSerializer(source='students', many=True, read_only=True)

    class Meta:
        model = AssignedPaper
        fields = ['id', 'paper', 'paper_detail', 'students', 'students_detail',
                  'student_count', 'assigned_at', 'due_date', 'instructions']

    def get_student_count(self, obj):
        return obj.students.count()
