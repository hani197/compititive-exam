from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from exams.models import ExamType, Subject, Chapter
from users.models import User
from users.views import IsAdmin
from .models import GeneratedPaper, Question, AssignedPaper
from .serializers import GeneratedPaperSerializer, GeneratePaperInputSerializer, AssignedPaperSerializer
from ai_service.paper_generator import generate_exam_paper


class PaperViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = GeneratedPaperSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin' or user.is_staff:
            return GeneratedPaper.objects.all().order_by('-created_at')
        assigned_ids = AssignedPaper.objects.filter(students=user).values_list('paper_id', flat=True)
        return GeneratedPaper.objects.filter(id__in=assigned_ids, status='ready')

    @action(detail=False, methods=['post'], url_path='generate', permission_classes=[IsAdmin])
    def generate(self, request):
        serializer = GeneratePaperInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        exam_type = ExamType.objects.get(id=data['exam_type_id'])
        subject = Subject.objects.get(id=data['subject_id'])
        chapters = Chapter.objects.filter(id__in=data['chapter_ids'])
        chapter_names = list(chapters.values_list('name', flat=True))

        title = data.get('title') or f"{exam_type.code} - {subject.name} Paper"
        paper = GeneratedPaper.objects.create(
            exam_type=exam_type, subject=subject, title=title,
            total_questions=data['total_questions'],
            duration_minutes=data['duration_minutes'],
            difficulty=data['difficulty'],
            status='generating', created_by=request.user
        )
        paper.chapters.set(chapters)

        try:
            result = generate_exam_paper(
                exam_type=exam_type.name, subject=subject.name,
                chapters=chapter_names, total_questions=data['total_questions'],
                difficulty=data['difficulty']
            )
            for q in result.get('questions', []):
                chapter = chapters.filter(name=q.get('chapter', '')).first() or chapters.first()
                Question.objects.create(
                    paper=paper, chapter=chapter,
                    question_number=q['question_number'],
                    question_type=q.get('question_type', 'mcq'),
                    question_text=q['question_text'],
                    option_a=q.get('option_a', ''), option_b=q.get('option_b', ''),
                    option_c=q.get('option_c', ''), option_d=q.get('option_d', ''),
                    correct_answer=q['correct_answer'],
                    explanation=q.get('explanation', ''),
                    marks=q.get('marks', 1.0), negative_marks=q.get('negative_marks', 0.0),
                )
            paper.status = 'ready'
            paper.save()
        except Exception as e:
            paper.status = 'failed'
            paper.save()
            return Response({'error': f'Generation failed: {str(e)}'}, status=500)

        return Response(GeneratedPaperSerializer(paper).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='assign', permission_classes=[IsAdmin])
    def assign(self, request, pk=None):
        paper = self.get_object()
        student_ids = request.data.get('student_ids', [])
        students = User.objects.filter(id__in=student_ids, role='student')

        assignment, _ = AssignedPaper.objects.get_or_create(
            paper=paper,
            defaults={
                'assigned_by': request.user,
                'due_date': request.data.get('due_date'),
                'instructions': request.data.get('instructions', ''),
            }
        )
        assignment.students.add(*students)
        return Response({'message': f'Paper assigned to {students.count()} student(s).'})


class AssignedPaperViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AssignedPaperSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin' or user.is_staff:
            return AssignedPaper.objects.all().order_by('-assigned_at')
        return AssignedPaper.objects.filter(students=user).order_by('-assigned_at')
