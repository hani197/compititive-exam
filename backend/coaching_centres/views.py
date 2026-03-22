from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CoachingCentre, CoachingCentreStaff
from .serializers import CoachingCentreSerializer, CoachingCentreStaffSerializer


class CoachingCentreViewSet(viewsets.ModelViewSet):
    queryset = CoachingCentre.objects.all()
    serializer_class = CoachingCentreSerializer
    
    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), permissions.IsAdminUser()]

    @action(detail=True, methods=['get'])
    def staff(self, request, pk=None):
        """Get all staff members of a coaching centre"""
        centre = self.get_object()
        staff = centre.staff.all()
        serializer = CoachingCentreStaffSerializer(staff, many=True)
        return Response(serializer.data)


class CoachingCentreStaffViewSet(viewsets.ModelViewSet):
    queryset = CoachingCentreStaff.objects.all()
    serializer_class = CoachingCentreStaffSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
