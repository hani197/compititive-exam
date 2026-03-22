from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import User, RegistrationRequest
from .serializers import RegisterSerializer, UserSerializer, RegistrationRequestSerializer


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role == 'admin' or request.user.is_staff
        )


from coaching_centres.models import CoachingCentre

class RegistrationRequestCreateView(generics.CreateAPIView):
    """Public: Register account or submit request."""
    serializer_class = RegistrationRequestSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        role = request.data.get('role')
        # If it's a coaching centre, create it directly
        if role == 'coaching_centre':
            email = request.data.get('email')
            username = request.data.get('username') or email.split('@')[0]
            password = request.data.get('password', 'Admin@123') # Default if not provided
            
            if User.objects.filter(username=username).exists():
                return Response({'error': 'Username already taken'}, status=400)
            
            # 1. Create Centre
            centre = CoachingCentre.objects.create(
                name=request.data.get('centre_name'),
                code=f"C-{request.data.get('centre_name')[:3].upper()}-{timezone.now().strftime('%S%f')[:4]}",
                email=email,
                phone=request.data.get('phone'),
                city=request.data.get('city'),
                address=request.data.get('centre_address', ''),
                contact_person=request.data.get('full_name')
            )
            
            # 2. Create Admin User for this centre
            names = request.data.get('full_name', '').split(' ', 1)
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=names[0],
                last_name=names[1] if len(names) > 1 else '',
                role='admin', # They are the admin of this centre
                coaching_centre=centre
            )
            centre.director = user
            centre.save()
            
            return Response({'message': 'Coaching Centre registered successfully!', 'username': username}, status=201)
        
        # For students/instructors, create a pending request
        return super().create(request, *args, **kwargs)


class RegistrationRequestListView(generics.ListAPIView):
    """Admin: List registration requests filtered by status and centre."""
    serializer_class = RegistrationRequestSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        user = self.request.user
        s = self.request.query_params.get('status', 'pending')
        qs = RegistrationRequest.objects.filter(status=s)
        
        # If not a global superuser, only show requests for their own centre
        if not user.is_superuser:
            qs = qs.filter(coaching_centre=user.coaching_centre)
            
        return qs.order_by('-requested_at')


@api_view(['POST'])
@permission_classes([IsAdmin])
def approve_request(request, pk):
    """Admin approves a request and creates the student account."""
    try:
        reg = RegistrationRequest.objects.get(pk=pk, status='pending')
    except RegistrationRequest.DoesNotExist:
        return Response({'error': 'Request not found or already processed.'}, status=404)

    username = request.data.get('username')
    if not username:
        return Response({'error': 'Username is required.'}, status=400)
    
    if User.objects.filter(username=username).exists():
        return Response({'error': f'Username "{username}" is already taken.'}, status=400)
    
    if User.objects.filter(email=reg.email).exists():
        return Response({'error': f'Email "{reg.email}" is already registered.'}, status=400)

    try:
        if (reg.role == 'coaching_centre'):
            # Check if centre name already exists
            from coaching_centres.models import CoachingCentre
            if CoachingCentre.objects.filter(name=reg.centre_name).exists():
                return Response({'error': f'Coaching Centre "{reg.centre_name}" is already registered.'}, status=400)

            # 1. Create the Coaching Centre
            centre = CoachingCentre.objects.create(
                name=reg.centre_name or f"Centre {reg.id}",
                code=f"C-{reg.id}",
                email=reg.email,
                phone=reg.phone,
                address=reg.centre_address or '',
                city=reg.city or '',
                contact_person=reg.full_name,
                contact_person_phone=reg.phone
            )
            
            # 2. Create the Director User
            names = reg.full_name.split(' ', 1)
            user = User.objects.create_user(
                username=username,
                email=reg.email,
                password=request.data.get('password'),
                first_name=names[0],
                last_name=names[1] if len(names) > 1 else '',
                role='instructor', # Directors are instructors with centre access
                coaching_centre=centre
            )
            centre.director = user
            centre.save()
            reg.created_user = user
        else:
            # Standard student/instructor creation
            names = reg.full_name.split(' ', 1)
            serializer = RegisterSerializer(data={
                'username': username,
                'email': reg.email,
                'first_name': names[0],
                'last_name': names[1] if len(names) > 1 else '',
                'password': request.data.get('password'),
                'password2': request.data.get('password2'),
                'role': request.data.get('role', reg.role),
                'phone': reg.phone,
            })
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            reg.created_user = user

            # Auto-enroll in requested exam
            if reg.exam_interested:
                from enrollments.models import Enrollment
                Enrollment.objects.get_or_create(
                    student=user, exam_type=reg.exam_interested,
                    defaults={'enrolled_by': request.user}
                )

        reg.status = 'approved'
        reg.reviewed_by = request.user
        reg.reviewed_at = timezone.now()
        reg.save()
        
        return Response({'message': 'Request approved and account created', 'user': UserSerializer(user).data},
                        status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': f'An integrity error occurred: {str(e)}'}, status=400)


@api_view(['POST'])
@permission_classes([IsAdmin])
def reject_request(request, pk):
    try:
        reg = RegistrationRequest.objects.get(pk=pk, status='pending')
    except RegistrationRequest.DoesNotExist:
        return Response({'error': 'Request not found or already processed.'}, status=404)
    reg.status = 'rejected'
    reg.reviewed_by = request.user
    reg.reviewed_at = timezone.now()
    reg.save()
    return Response({'message': 'Request rejected.'})


class RegisterView(generics.CreateAPIView):
    """Admin-only: directly create a student account."""
    serializer_class = RegisterSerializer
    permission_classes = [IsAdmin]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class StudentListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return User.objects.filter(role__in=['student', 'instructor']).order_by('-created_at')
