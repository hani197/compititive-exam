from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('instructor', 'Instructor'),
        ('admin', 'Admin'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    coaching_centre = models.ForeignKey(
        'coaching_centres.CoachingCentre', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='users'
    )
    
    # Common Extra Fields
    address = models.TextField(blank=True, null=True)
    qualification = models.CharField(max_length=255, blank=True, null=True)

    # Student Specific
    exam_type = models.ForeignKey(
        'exams.ExamType', on_delete=models.SET_NULL, null=True, blank=True, related_name='enrolled_users'
    )
    parent_name = models.CharField(max_length=200, blank=True, null=True)
    parent_phone = models.CharField(max_length=15, blank=True, null=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    tenth_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    tenth_year = models.PositiveIntegerField(null=True, blank=True)
    intermediate_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    intermediate_year = models.PositiveIntegerField(null=True, blank=True)
    degree_type = models.CharField(max_length=50, blank=True, null=True) # BSc, BCom, BTech, etc.
    degree_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    degree_year = models.PositiveIntegerField(null=True, blank=True)

    # Instructor Specific
    experience_years = models.PositiveIntegerField(null=True, blank=True)
    faculty_field = models.CharField(max_length=100, blank=True, null=True)
    work_history = models.TextField(blank=True, null=True) # Previous/Current company/college

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class RegistrationRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('instructor', 'Instructor'),
        ('coaching_centre', 'Coaching Centre'),
    ]

    full_name = models.CharField(max_length=200)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    
    # Extra fields for registration
    address = models.TextField(blank=True, null=True)
    qualification = models.CharField(max_length=255, blank=True, null=True)
    
    # Student specific
    exam_interested = models.ForeignKey(
        'exams.ExamType', on_delete=models.SET_NULL, null=True, blank=True
    )
    parent_name = models.CharField(max_length=200, blank=True, null=True)
    parent_phone = models.CharField(max_length=15, blank=True, null=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    tenth_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    tenth_year = models.PositiveIntegerField(null=True, blank=True)
    intermediate_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    intermediate_year = models.PositiveIntegerField(null=True, blank=True)
    degree_type = models.CharField(max_length=50, blank=True, null=True)
    degree_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    degree_year = models.PositiveIntegerField(null=True, blank=True)

    # Instructor specific
    experience_years = models.PositiveIntegerField(null=True, blank=True)
    faculty_field = models.CharField(max_length=100, blank=True, null=True)
    work_history = models.TextField(blank=True, null=True)

    # Centre specific fields
    centre_name = models.CharField(max_length=255, blank=True, null=True)
    centre_address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    coaching_centre = models.ForeignKey(
        'coaching_centres.CoachingCentre', on_delete=models.SET_NULL, 
        null=True, blank=True, related_name='registration_requests'
    )
    exam_interested = models.ForeignKey(
        'exams.ExamType', on_delete=models.SET_NULL, null=True, blank=True
    )
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name='reviewed_requests'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_user = models.OneToOneField(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name='from_request'
    )

    def __str__(self):
        return f"{self.full_name} ({self.status})"


class StudentInstructorAssignment(models.Model):
    instructor = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='assigned_students_set',
        limit_choices_to={'role': 'instructor'}
    )
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='assigned_instructors_set',
        limit_choices_to={'role': 'student'}
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='made_assignments'
    )
    notes = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('instructor', 'student')

    def __str__(self):
        return f"{self.student.username} assigned to {self.instructor.username}"

