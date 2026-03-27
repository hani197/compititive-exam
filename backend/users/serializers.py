from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, RegistrationRequest, StudentInstructorAssignment


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'password', 'password2', 'role', 'phone', 'date_of_birth',
                  'address', 'qualification', 'parent_name', 'parent_phone', 'age',
                  'tenth_percentage', 'tenth_year', 'intermediate_percentage', 
                  'intermediate_year', 'degree_type', 'degree_percentage', 'degree_year',
                  'experience_years', 'faculty_field', 'work_history', 'exam_type']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    exam_type_name = serializers.CharField(source='exam_type.name', read_only=True)
    coaching_centre_name = serializers.CharField(source='coaching_centre.name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'role', 'phone', 'date_of_birth', 'profile_picture',
                  'created_at', 'is_staff', 'address', 'qualification',
                  'parent_name', 'parent_phone', 'age', 'tenth_percentage', 'tenth_year',
                  'intermediate_percentage', 'intermediate_year', 'degree_type', 
                  'degree_percentage', 'degree_year',
                  'experience_years', 'faculty_field', 'work_history', 'exam_type', 
                  'exam_type_name', 'coaching_centre', 'coaching_centre_name']
        read_only_fields = ['id', 'created_at', 'is_staff', 'exam_type_name', 'coaching_centre_name']


class RegistrationRequestSerializer(serializers.ModelSerializer):
    exam_interested_name = serializers.SerializerMethodField()

    class Meta:
        model = RegistrationRequest
        fields = ['id', 'full_name', 'role', 'email', 'phone', 'exam_interested',
                  'exam_interested_name', 'centre_name', 'centre_address', 'city',
                  'coaching_centre', 'message', 'status', 'requested_at',
                  'address', 'qualification', 'parent_name', 'parent_phone', 'age',
                  'tenth_percentage', 'tenth_year', 'intermediate_percentage', 
                  'intermediate_year', 'degree_type', 'degree_percentage', 'degree_year',
                  'experience_years', 'faculty_field', 'work_history']
        read_only_fields = ['id', 'status', 'requested_at']

    def get_exam_interested_name(self, obj):
        return obj.exam_interested.name if obj.exam_interested else None


class StudentInstructorAssignmentSerializer(serializers.ModelSerializer):
    instructor_detail = UserSerializer(source='instructor', read_only=True)
    student_detail = UserSerializer(source='student', read_only=True)

    class Meta:
        model = StudentInstructorAssignment
        fields = ['id', 'instructor', 'student', 'instructor_detail', 'student_detail', 
                  'assigned_at', 'notes']
        read_only_fields = ['id', 'assigned_at']
