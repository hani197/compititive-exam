from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import CoachingCentre, CoachingCentreStaff

User = get_user_model()


class CoachingCentreTestCase(TestCase):
    def setUp(self):
        self.coaching_centre = CoachingCentre.objects.create(
            name='Test Coaching Centre',
            code='TCC001',
            email='test@coaching.com',
            phone='9876543210',
            address='Test Address',
            city='Test City',
            state='Test State',
            pincode='123456',
            contact_person='Test Person',
            contact_person_phone='9876543210'
        )

    def test_coaching_centre_creation(self):
        self.assertEqual(self.coaching_centre.name, 'Test Coaching Centre')
        self.assertEqual(self.coaching_centre.status, 'active')

    def test_coaching_centre_str(self):
        self.assertEqual(str(self.coaching_centre), 'Test Coaching Centre (TCC001)')
