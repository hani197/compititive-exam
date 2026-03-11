from rest_framework import viewsets, permissions
from enrollments.models import Enrollment
from .models import StudyMaterial
from .serializers import StudyMaterialSerializer


class StudyMaterialViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StudyMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        enrolled_exams = Enrollment.objects.filter(
            student=self.request.user, status='active'
        ).values_list('exam_type_id', flat=True)

        qs = StudyMaterial.objects.filter(exam_type__in=enrolled_exams, is_active=True)

        exam_type_id = self.request.query_params.get('exam_type')
        subject_id = self.request.query_params.get('subject')
        chapter_id = self.request.query_params.get('chapter')

        if exam_type_id:
            qs = qs.filter(exam_type_id=exam_type_id)
        if subject_id:
            qs = qs.filter(subject_id=subject_id)
        if chapter_id:
            qs = qs.filter(chapter_id=chapter_id)

        return qs

