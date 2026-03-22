from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from users.views import IsAdmin
from .models import ExamResult
from .serializers import ExamResultSerializer


class ResultViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ExamResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin' or user.is_staff:
            return ExamResult.objects.all().select_related(
                'session__paper__exam_type', 'session__paper__subject', 'student'
            ).order_by('-evaluated_at')
        # Students only see confirmed results
        return ExamResult.objects.filter(
            student=user, analysis_confirmed=True
        ).select_related(
            'session__paper__exam_type', 'session__paper__subject'
        ).order_by('-evaluated_at')

    @action(detail=True, methods=['post'], url_path='confirm', permission_classes=[IsAdmin])
    def confirm(self, request, pk=None):
        result = self.get_object()
        result.analysis_confirmed = True
        result.confirmed_by = request.user
        result.confirmed_at = timezone.now()
        result.save()
        return Response({'message': 'Analysis confirmed. Student can now view their result.'})

    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard(self, request):
        user = request.user
        if user.role == 'admin' or user.is_staff:
            from users.models import User
            from papers.models import GeneratedPaper
            
            qs_users = User.objects.all()
            if not user.is_superuser and user.coaching_centre:
                qs_users = qs_users.filter(coaching_centre=user.coaching_centre)
            
            total_students = qs_users.filter(role='student').count()
            total_instructors = qs_users.filter(role='instructor').count()
            total_papers = GeneratedPaper.objects.count()
            if not user.is_superuser and user.coaching_centre:
                total_papers = GeneratedPaper.objects.filter(created_by__coaching_centre=user.coaching_centre).count()

            recent_submissions = ExamResult.objects.all()
            if not user.is_superuser and user.coaching_centre:
                recent_submissions = recent_submissions.filter(student__coaching_centre=user.coaching_centre)
            
            return Response({
                'is_admin': True,
                'total_students': total_students,
                'total_instructors': total_instructors,
                'total_papers': total_papers,
                'pending_confirmation': recent_submissions.filter(analysis_confirmed=False).count(),
                'recent_results': ExamResultSerializer(recent_submissions.order_by('-evaluated_at')[:5], many=True).data
            })

        results = ExamResult.objects.filter(student=user, analysis_confirmed=True)
        total = results.count()
        avg = sum(r.percentage for r in results) / total if total else 0
        best = max((r.percentage for r in results), default=0)
        return Response({
            'total_exams_taken': total,
            'average_percentage': round(avg, 2),
            'best_score': round(best, 2),
            'recent_results': ExamResultSerializer(results[:5], many=True).data,
        })

    @action(detail=False, methods=['get'], url_path='pending', permission_classes=[IsAdmin])
    def pending(self, request):
        results = ExamResult.objects.filter(analysis_confirmed=False).select_related(
            'student', 'session__paper__exam_type', 'session__paper__subject'
        ).order_by('-evaluated_at')
        return Response(ExamResultSerializer(results, many=True).data)
