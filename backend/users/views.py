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


class RegistrationRequestCreateView(generics.CreateAPIView):
    """Public: Student submits a registration request."""
    serializer_class = RegistrationRequestSerializer
    permission_classes = [permissions.AllowAny]


class RegistrationRequestListView(generics.ListAPIView):
    """Admin: List registration requests filtered by status."""
    serializer_class = RegistrationRequestSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        s = self.request.query_params.get('status', 'pending')
        return RegistrationRequest.objects.filter(status=s).order_by('-requested_at')


@api_view(['POST'])
@permission_classes([IsAdmin])
def approve_request(request, pk):
    """Admin approves a request and creates the student account."""
    try:
        reg = RegistrationRequest.objects.get(pk=pk, status='pending')
    except RegistrationRequest.DoesNotExist:
        return Response({'error': 'Request not found or already processed.'}, status=404)

    names = reg.full_name.split(' ', 1)
    serializer = RegisterSerializer(data={
        'username': request.data.get('username'),
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

    reg.status = 'approved'
    reg.reviewed_by = request.user
    reg.reviewed_at = timezone.now()
    reg.created_user = user
    reg.save()

    # Auto-enroll in requested exam
    if reg.exam_interested:
        from enrollments.models import Enrollment
        Enrollment.objects.get_or_create(
            student=user, exam_type=reg.exam_interested,
            defaults={'enrolled_by': request.user}
        )

    return Response({'message': f'Account created: {user.username}', 'user': UserSerializer(user).data},
                    status=status.HTTP_201_CREATED)


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
