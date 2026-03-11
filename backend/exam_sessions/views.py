from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from papers.models import GeneratedPaper, AssignedPaper
from .models import ExamSession, StudentAnswer
from .serializers import ExamSessionSerializer, SubmitExamSerializer
from results.models import ExamResult
from ai_service.paper_generator import evaluate_descriptive_answer, generate_performance_analysis
from users.views import IsAdmin


class ExamSessionViewSet(viewsets.ModelViewSet):
    serializer_class = ExamSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin' or user.is_staff:
            return ExamSession.objects.all().select_related('paper', 'student')
        return ExamSession.objects.filter(student=user).select_related('paper')

    def create(self, request):
        paper_id = request.data.get('paper_id')
        try:
            paper = GeneratedPaper.objects.get(id=paper_id, status='ready')
        except GeneratedPaper.DoesNotExist:
            return Response({'error': 'Paper not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Students can only start assigned papers
        if not (request.user.role == 'admin' or request.user.is_staff):
            if not AssignedPaper.objects.filter(paper=paper, students=request.user).exists():
                return Response({'error': 'This paper is not assigned to you.'}, status=status.HTTP_403_FORBIDDEN)

        # Prevent duplicate sessions
        existing = ExamSession.objects.filter(student=request.user, paper=paper).first()
        if existing:
            return Response(ExamSessionSerializer(existing).data, status=status.HTTP_200_OK)

        session = ExamSession.objects.create(student=request.user, paper=paper)
        return Response(ExamSessionSerializer(session).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='submit')
    def submit(self, request, pk=None):
        session = self.get_object()
        if session.student != request.user:
            return Response({'error': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        if session.status != 'in_progress':
            return Response({'error': 'Session already submitted.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = SubmitExamSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        questions = {q.id: q for q in session.paper.questions.all()}
        total_marks = obtained_marks = correct_count = wrong_count = unattempted_count = 0
        chapter_analysis = {}

        for ans in data['answers']:
            question = questions.get(ans.get('question_id'))
            if not question:
                continue

            selected = ans.get('selected_option', '').strip().upper()
            answer_text = ans.get('answer_text', '').strip()
            total_marks += question.marks

            ckey = str(question.chapter_id) if question.chapter_id else 'unknown'
            if ckey not in chapter_analysis:
                chapter_analysis[ckey] = {
                    'chapter_name': question.chapter.name if question.chapter else 'Unknown',
                    'correct': 0, 'wrong': 0, 'total': 0, 'marks_obtained': 0
                }
            chapter_analysis[ckey]['total'] += 1

            q_marks = is_correct = 0
            ai_feedback = ''

            if question.question_type == 'mcq':
                if not selected:
                    unattempted_count += 1
                elif selected == question.correct_answer.upper():
                    is_correct = True
                    q_marks = question.marks
                    correct_count += 1
                    chapter_analysis[ckey]['correct'] += 1
                else:
                    is_correct = False
                    q_marks = -question.negative_marks
                    wrong_count += 1
                    chapter_analysis[ckey]['wrong'] += 1
            else:
                if not answer_text:
                    unattempted_count += 1
                else:
                    ev = evaluate_descriptive_answer(
                        question=question.question_text,
                        correct_answer=question.correct_answer,
                        student_answer=answer_text,
                        marks=question.marks
                    )
                    q_marks = ev.get('marks_obtained', 0)
                    is_correct = ev.get('is_correct', False)
                    ai_feedback = ev.get('feedback', '')
                    if is_correct:
                        correct_count += 1
                        chapter_analysis[ckey]['correct'] += 1
                    else:
                        wrong_count += 1
                        chapter_analysis[ckey]['wrong'] += 1

            obtained_marks += q_marks
            chapter_analysis[ckey]['marks_obtained'] += q_marks

            StudentAnswer.objects.update_or_create(
                session=session, question=question,
                defaults={
                    'selected_option': selected, 'answer_text': answer_text,
                    'is_correct': is_correct, 'marks_obtained': q_marks, 'ai_feedback': ai_feedback,
                }
            )

        # Mark unanswered
        answered_ids = {a.get('question_id') for a in data['answers']}
        for qid, q in questions.items():
            if qid not in answered_ids:
                unattempted_count += 1
                StudentAnswer.objects.get_or_create(session=session, question=q, defaults={'marks_obtained': 0})

        obtained_marks = max(0, obtained_marks)
        percentage = (obtained_marks / total_marks * 100) if total_marks > 0 else 0

        weak = [k for k, v in chapter_analysis.items() if v['total'] > 0 and (v['correct'] / v['total']) < 0.4]
        strong = [k for k, v in chapter_analysis.items() if v['total'] > 0 and (v['correct'] / v['total']) >= 0.7]

        ai_feedback = generate_performance_analysis(
            student_name=request.user.get_full_name() or request.user.username,
            exam_type=session.paper.exam_type.name,
            subject=session.paper.subject.name,
            chapter_analysis=chapter_analysis,
            percentage=percentage
        )

        ExamResult.objects.create(
            session=session, student=request.user,
            total_marks=total_marks, obtained_marks=obtained_marks,
            percentage=percentage, correct_count=correct_count,
            wrong_count=wrong_count, unattempted_count=unattempted_count,
            ai_overall_feedback=ai_feedback, chapter_analysis=chapter_analysis,
            weak_chapters=weak, strong_chapters=strong, recommendations=ai_feedback,
            analysis_confirmed=False,
        )

        session.status = 'evaluated'
        session.submitted_at = timezone.now()
        session.time_taken_seconds = data['time_taken_seconds']
        session.save()

        return Response({
            'session_id': session.id,
            'message': 'Submitted successfully. Results will be available after admin review.',
            'percentage': round(percentage, 2),
        })
