from rest_framework import serializers
from .models import ExamType, Subject, Chapter, Topic


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'name', 'description', 'order']


class ChapterSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Chapter
        fields = ['id', 'subject', 'name', 'description', 'order', 'topics']


class SubjectSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'exam_type', 'name', 'code', 'description', 'order', 'chapters']


class ExamTypeSerializer(serializers.ModelSerializer):
    subjects = SubjectSerializer(many=True, read_only=True)

    class Meta:
        model = ExamType
        fields = ['id', 'name', 'code', 'description', 'is_active', 'subjects']


class ExamTypeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamType
        fields = ['id', 'name', 'code', 'description', 'is_active']
