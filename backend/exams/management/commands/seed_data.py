from django.core.management.base import BaseCommand
from exams.models import ExamType, Subject, Chapter


EXAM_DATA = {
    'EAMCET': {
        'name': 'EAMCET (Engineering)',
        'subjects': {
            'Mathematics': ['Sets, Relations and Functions', 'Complex Numbers', 'Quadratic Equations',
                            'Matrices and Determinants', 'Trigonometry', 'Vectors', 'Coordinate Geometry',
                            'Calculus', 'Probability', 'Statistics'],
            'Physics': ['Physical World', 'Units and Measurements', 'Motion in a Straight Line',
                        'Laws of Motion', 'Work Energy and Power', 'Gravitation', 'Thermodynamics',
                        'Waves', 'Electric Charges', 'Current Electricity', 'Optics'],
            'Chemistry': ['Some Basic Concepts', 'Atomic Structure', 'Chemical Bonding',
                          'States of Matter', 'Electrochemistry', 'Organic Chemistry Basics',
                          'Hydrocarbons', 'Polymers'],
        }
    },
    'DSC': {
        'name': 'DSC (District Selection Committee)',
        'subjects': {
            'Telugu': ['Telugu Grammar', 'Prose', 'Poetry', 'Literature', 'Comprehension'],
            'Child Development': ['Growth and Development', 'Learning Theories', 'Child Psychology',
                                   'Classroom Management', 'Assessment'],
            'General Knowledge': ['Current Affairs', 'Indian History', 'Indian Constitution',
                                   'Geography', 'Science & Technology'],
            'Mathematics': ['Number System', 'Fractions', 'Arithmetic', 'Algebra', 'Geometry',
                            'Mensuration', 'Statistics'],
        }
    },
    'CIVILS': {
        'name': 'Civil Services (UPSC/APPSC)',
        'subjects': {
            'General Studies': ['Indian History', 'Modern India', 'Indian Polity', 'Indian Economy',
                                'Geography', 'Science & Technology', 'Environment', 'Current Affairs'],
            'General Aptitude': ['Quantitative Aptitude', 'Logical Reasoning', 'Data Interpretation',
                                  'English Comprehension', 'Decision Making'],
            'Essay': ['Essay Writing Techniques', 'Current Issues', 'Social Problems'],
        }
    },
    'GROUPS': {
        'name': 'Group Services (APPSC Groups)',
        'subjects': {
            'General Studies': ['AP History & Culture', 'Indian Constitution', 'Economy',
                                'Science', 'Current Events', 'Mental Ability'],
            'General English': ['Grammar', 'Vocabulary', 'Comprehension', 'Writing Skills'],
        }
    },
    'CEEP': {
        'name': 'CEEP (Polytechnic)',
        'subjects': {
            'Mathematics': ['Algebra', 'Trigonometry', 'Geometry', 'Coordinate Geometry', 'Statistics'],
            'Physics': ['Mechanics', 'Heat', 'Light', 'Electricity', 'Modern Physics'],
            'Chemistry': ['Atomic Structure', 'Chemical Bonding', 'Acids and Bases', 'Organic Chemistry'],
        }
    },
    'ECET': {
        'name': 'ECET (Engineering Common Entrance)',
        'subjects': {
            'Mathematics': ['Matrices', 'Differential Calculus', 'Integral Calculus',
                            'Differential Equations', 'Probability and Statistics'],
            'Physics': ['Electrostatics', 'Magnetism', 'Optics', 'Semiconductors'],
            'Chemistry': ['Electrochemistry', 'Polymers', 'Fuels', 'Water Treatment'],
            'Engineering': ['Engineering Drawing', 'Workshop Technology', 'Strength of Materials'],
        }
    },
    'BANK': {
        'name': 'Bank Exams',
        'subjects': {
            'SBI - Clerical (Clerk)': [
                'Reasoning Ability', 'Numerical Ability', 'English Language',
                'General/Financial Awareness', 'Computer Aptitude',
            ],
            'SBI - Officers (PO)': [
                'Reasoning & Computer Aptitude', 'Data Analysis & Interpretation',
                'English Language', 'General/Economy/Banking Awareness',
                'Data Sufficiency', 'Descriptive English',
            ],
            'ICICI Bank - Clerical': [
                'Reasoning Ability', 'Quantitative Aptitude', 'English Language',
                'General Awareness', 'Computer Knowledge',
            ],
            'ICICI Bank - Officers': [
                'Logical Reasoning', 'Quantitative Aptitude', 'English Language',
                'Banking & Financial Awareness', 'Case Studies',
            ],
            'Canara Bank - Clerical': [
                'Reasoning Ability', 'Quantitative Aptitude', 'English Language',
                'General Awareness (with Banking)', 'Computer Knowledge',
            ],
            'Canara Bank - Officers': [
                'Reasoning', 'Quantitative Aptitude', 'English Language',
                'Professional Knowledge', 'Financial Awareness',
            ],
            'Union Bank - Clerical': [
                'Reasoning Ability', 'Numerical Ability', 'English Language',
                'General/Financial Awareness', 'Computer Aptitude',
            ],
            'Union Bank - Officers': [
                'Reasoning & Computer Aptitude', 'Quantitative Aptitude', 'English Language',
                'General/Economy Awareness', 'Professional Knowledge',
            ],
            'Other Banks - Clerical': [
                'Reasoning Ability', 'Quantitative Aptitude', 'English Language',
                'General Awareness', 'Computer Knowledge',
            ],
            'Other Banks - Officers': [
                'Reasoning Ability', 'Quantitative Aptitude', 'English Language',
                'General/Economy/Banking Awareness', 'Computer & IT Knowledge',
            ],
        }
    },
}


class Command(BaseCommand):
    help = 'Seed exam types, subjects, and chapters'

    def handle(self, *args, **kwargs):
        for code, data in EXAM_DATA.items():
            exam_type, created = ExamType.objects.get_or_create(
                code=code,
                defaults={'name': data['name'], 'description': f"Preparation for {data['name']}"}
            )
            if created:
                self.stdout.write(f"Created ExamType: {exam_type.name}")

            for sub_name, chapters in data['subjects'].items():
                import re
                code = re.sub(r'[^A-Z0-9]', '_', sub_name.upper())[:20].strip('_')
                subject, _ = Subject.objects.get_or_create(
                    exam_type=exam_type,
                    code=code,
                    defaults={'name': sub_name}
                )
                for i, chapter_name in enumerate(chapters, 1):
                    Chapter.objects.get_or_create(
                        subject=subject,
                        name=chapter_name,
                        defaults={'order': i}
                    )

        self.stdout.write(self.style.SUCCESS('Seed data created successfully!'))
