from rest_framework import viewsets, permissions
from .models import ExamType, Subject, Chapter, Topic
from .serializers import ExamTypeSerializer, ExamTypeListSerializer, SubjectSerializer, ChapterSerializer, TopicSerializer


class ExamTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ExamType.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return ExamTypeListSerializer
        return ExamTypeSerializer


class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Subject.objects.filter(is_active=True)
        exam_type_id = self.request.query_params.get('exam_type')
        if exam_type_id:
            qs = qs.filter(exam_type_id=exam_type_id)
        return qs


class ChapterViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Chapter.objects.filter(is_active=True)
        subject_id = self.request.query_params.get('subject')
        if subject_id:
            qs = qs.filter(subject_id=subject_id)
        return qs
