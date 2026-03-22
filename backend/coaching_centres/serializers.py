from rest_framework import serializers
from .models import CoachingCentre, CoachingCentreStaff


class CoachingCentreSerializer(serializers.ModelSerializer):
    director_name = serializers.CharField(source='director.get_full_name', read_only=True)

    class Meta:
        model = CoachingCentre
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class CoachingCentreStaffSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    coaching_centre_name = serializers.CharField(source='coaching_centre.name', read_only=True)

    class Meta:
        model = CoachingCentreStaff
        fields = '__all__'
        read_only_fields = ('joined_at',)
