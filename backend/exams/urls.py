from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExamTypeViewSet, SubjectViewSet, ChapterViewSet

router = DefaultRouter()
router.register('exam-types', ExamTypeViewSet, basename='exam-type')
router.register('subjects', SubjectViewSet, basename='subject')
router.register('chapters', ChapterViewSet, basename='chapter')

urlpatterns = [path('', include(router.urls))]
