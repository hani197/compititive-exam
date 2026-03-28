from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from .views import ExamTypeViewSet, SubjectViewSet, ChapterViewSet

router = DefaultRouter()
router.register('exam-types', ExamTypeViewSet, basename='exam-type')
router.register('subjects', SubjectViewSet, basename='subject')
router.register('chapters', ChapterViewSet, basename='chapter')

urlpatterns = [
    re_path(r'^exam-types/?$', ExamTypeViewSet.as_view({'get': 'list', 'post': 'create'})),
    re_path(r'^subjects/?$', SubjectViewSet.as_view({'get': 'list', 'post': 'create'})),
    re_path(r'^chapters/?$', ChapterViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('', include(router.urls))
]
