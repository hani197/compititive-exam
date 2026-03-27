from rest_framework import viewsets, permissions
from .models import ExamType, Subject, Chapter, Topic
from .serializers import ExamTypeSerializer, ExamTypeListSerializer, SubjectSerializer, ChapterSerializer, TopicSerializer
from users.views import IsAdmin


class ExamTypeViewSet(viewsets.ModelViewSet):
    queryset = ExamType.objects.all()
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.role == 'admin' or self.request.user.is_staff:
            return ExamType.objects.all().order_by('id')
        return ExamType.objects.filter(is_active=True).order_by('id')

    def get_serializer_class(self):
        if self.action == 'list':
            return ExamTypeListSerializer
        return ExamTypeSerializer


class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.role == 'admin' or self.request.user.is_staff:
            qs = Subject.objects.all()
        else:
            qs = Subject.objects.filter(is_active=True)
            
        exam_type_id = self.request.query_params.get('exam_type')
        if exam_type_id:
            qs = qs.filter(exam_type_id=exam_type_id)
        return qs.order_by('order', 'id')


class ChapterViewSet(viewsets.ModelViewSet):
    serializer_class = ChapterSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.role == 'admin' or self.request.user.is_staff:
            qs = Chapter.objects.all()
        else:
            qs = Chapter.objects.filter(is_active=True)
            
        subject_id = self.request.query_params.get('subject')
        exam_type_id = self.request.query_params.get('exam_type')
        
        if subject_id:
            qs = qs.filter(subject_id=subject_id)
        if exam_type_id:
            qs = qs.filter(subject__exam_type_id=exam_type_id)
            
        return qs.order_by('order', 'id')
