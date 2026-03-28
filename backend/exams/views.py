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
        # Direct seed for environments without shell access
        if not ExamType.objects.exists():
            try:
                from exams.models import ExamType, Subject, Chapter
                
                # Define data locally to ensure it works even if management command is inaccessible
                EXAM_DATA = {
                    'EAMCET': {
                        'name': 'EAMCET (Engineering)',
                        'subjects': {
                            'Mathematics': ['Sets, Relations and Functions', 'Quadratic Equations', 'Calculus'],
                            'Physics': ['Units and Measurements', 'Thermodynamics', 'Optics'],
                            'Chemistry': ['Atomic Structure', 'Chemical Bonding', 'Organic Chemistry'],
                        }
                    },
                    'DSC': {
                        'name': 'DSC (District Selection Committee)',
                        'subjects': {
                            'Telugu': ['Telugu Grammar', 'Literature'],
                            'Mathematics': ['Number System', 'Algebra', 'Geometry'],
                            'General Knowledge': ['Current Affairs', 'Indian History'],
                        }
                    },
                    'CIVILS': {
                        'name': 'Civil Services (UPSC/APPSC)',
                        'subjects': {
                            'General Studies': ['Indian History', 'Economy', 'Polity'],
                            'General Aptitude': ['Quantitative Aptitude', 'Logical Reasoning'],
                        }
                    },
                    'GROUPS': {
                        'name': 'Group Services (APPSC Groups)',
                        'subjects': {
                            'General Studies': ['AP History & Culture', 'Constitution'],
                        }
                    },
                    'CEEP': {
                        'name': 'CEEP (Polytechnic)',
                        'subjects': {
                            'Mathematics': ['Algebra', 'Trigonometry'],
                            'Physics': ['Mechanics', 'Electricity'],
                        }
                    },
                    'ECET': {
                        'name': 'ECET (Engineering Common Entrance)',
                        'subjects': {
                            'Mathematics': ['Matrices', 'Calculus'],
                            'Engineering': ['Strength of Materials'],
                        }
                    }
                }

                for code, data in EXAM_DATA.items():
                    et, _ = ExamType.objects.get_or_create(code=code, defaults={'name': data['name']})
                    for sub_name, chapters in data['subjects'].items():
                        import re
                        sub_code = re.sub(r'[^A-Z0-9]', '_', sub_name.upper())[:20].strip('_')
                        subject, _ = Subject.objects.get_or_create(exam_type=et, code=sub_code, defaults={'name': sub_name})
                        for i, ch_name in enumerate(chapters, 1):
                            Chapter.objects.get_or_create(subject=subject, name=ch_name, defaults={'order': i})
                print("Direct seeding successful.")
            except Exception as e:
                print(f"Direct seed error: {e}")

        user = self.request.user
        role = getattr(user, 'role', 'unknown')
        is_staff = getattr(user, 'is_staff', False)

        if role == 'admin' or is_staff:
            qs = ExamType.objects.all()
        else:
            qs = ExamType.objects.filter(is_active=True)
            
        return qs.order_by('id')

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
