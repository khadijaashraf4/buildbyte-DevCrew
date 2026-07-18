from rest_framework import viewsets, permissions, status, views, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import StudentProfile, EmployerProfile, Skill, Project, VerifiedWorkRecord, Opportunity, Application
from .serializers import (
    RegisterSerializer, UserSerializer, StudentProfileSerializer, 
    EmployerProfileSerializer, SkillSerializer, ProjectSerializer, 
    VerifiedWorkRecordSerializer, OpportunitySerializer, ApplicationSerializer
)

class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "user": UserSerializer(user).data,
                "message": "User registered successfully."
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'STUDENT':
            try:
                profile = user.student_profile
                serializer = StudentProfileSerializer(profile)
                return Response(serializer.data)
            except StudentProfile.DoesNotExist:
                return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            try:
                profile = user.employer_profile
                serializer = EmployerProfileSerializer(profile)
                return Response(serializer.data)
            except EmployerProfile.DoesNotExist:
                return Response({"detail": "Employer profile not found."}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        user = request.user
        if user.role == 'STUDENT':
            profile = get_object_or_404(StudentProfile, user=user)
            serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
        else:
            profile = get_object_or_404(EmployerProfile, user=user)
            serializer = EmployerProfileSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all().order_by('name')
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None # Return all skills for autocomplete/selection


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Students can see and edit their own projects
        if hasattr(self.request.user, 'student_profile'):
            return Project.objects.filter(student=self.request.user.student_profile)
        return Project.objects.none()

    def perform_create(self, serializer):
        serializer.save(student=self.request.user.student_profile)


class VerifiedWorkRecordViewSet(viewsets.ModelViewSet):
    serializer_class = VerifiedWorkRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'STUDENT':
            return VerifiedWorkRecord.objects.filter(student=user.student_profile)
        # Employers can see work records submitted for verification
        return VerifiedWorkRecord.objects.all()

    def perform_create(self, serializer):
        serializer.save(student=self.request.user.student_profile, status='PENDING')

    # Employer Action to Verify/Reject Work Records
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def verify(self, request, pk=None):
        record = self.get_object()
        if request.user.role != 'EMPLOYER':
            return Response({"detail": "Only employers can verify work records."}, status=status.HTTP_403_FORBIDDEN)
        
        status_val = request.data.get('status')
        remarks = request.data.get('remarks', '')

        if status_val not in ['VERIFIED', 'REJECTED']:
            return Response({"detail": "Status must be 'VERIFIED' or 'REJECTED'."}, status=status.HTTP_400_BAD_REQUEST)

        record.status = status_val
        record.remarks = remarks
        record.verified_by = request.user
        record.save()
        
        return Response(VerifiedWorkRecordSerializer(record).data)


class OpportunityViewSet(viewsets.ModelViewSet):
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Opportunity.objects.all().order_by('-created_at')

        # Filter by search query (title, description, skills)
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(required_skills__name__icontains=search_query)
            ).distinct()

        # If employer, they can filter by "mine" to see only their posts
        mine = self.request.query_params.get('mine', None)
        if mine and user.role == 'EMPLOYER' and hasattr(user, 'employer_profile'):
            queryset = queryset.filter(employer=user.employer_profile)

        return queryset

    def perform_create(self, serializer):
        serializer.save(employer=self.request.user.employer_profile)

    # Student apply action
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def apply(self, request, pk=None):
        opportunity = self.get_object()
        user = request.user
        if user.role != 'STUDENT':
            return Response({"detail": "Only students can apply to opportunities."}, status=status.HTTP_403_FORBIDDEN)

        student = user.student_profile
        cover_letter = request.data.get('cover_letter', '')

        # Check if already applied
        if Application.objects.filter(opportunity=opportunity, student=student).exists():
            return Response({"detail": "You have already applied to this opportunity."}, status=status.HTTP_400_BAD_REQUEST)

        application = Application.objects.create(
            opportunity=opportunity,
            student=student,
            cover_letter=cover_letter,
            status='PENDING'
        )

        return Response(ApplicationSerializer(application).data, status=status.HTTP_201_CREATED)


class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'STUDENT':
            # Students see their own applications
            return Application.objects.filter(student=user.student_profile).order_by('-applied_at')
        else:
            # Employers see applications for their opportunities
            employer = user.employer_profile
            queryset = Application.objects.filter(opportunity__employer=employer).order_by('-applied_at')
            
            # Allow filtering by opportunity
            opp_id = self.request.query_params.get('opportunity', None)
            if opp_id:
                queryset = queryset.filter(opportunity_id=opp_id)
            return queryset

    # Shortlist application (Employer only)
    @action(detail=True, methods=['post'])
    def shortlist(self, request, pk=None):
        application = self.get_object()
        if request.user.role != 'EMPLOYER' or application.opportunity.employer.user != request.user:
            return Response({"detail": "You do not have permission to shortlist this candidate."}, status=status.HTTP_403_FORBIDDEN)

        application.status = 'SHORTLISTED'
        application.save()
        return Response(ApplicationSerializer(application).data)

    # Reject application (Employer only)
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        application = self.get_object()
        if request.user.role != 'EMPLOYER' or application.opportunity.employer.user != request.user:
            return Response({"detail": "You do not have permission to reject this candidate."}, status=status.HTTP_403_FORBIDDEN)

        application.status = 'REJECTED'
        application.save()
        return Response(ApplicationSerializer(application).data)

    # Reveal identity (Employer only, after shortlisting)
    @action(detail=True, methods=['post'])
    def reveal(self, request, pk=None):
        application = self.get_object()
        if request.user.role != 'EMPLOYER' or application.opportunity.employer.user != request.user:
            return Response({"detail": "You do not have permission to reveal this candidate's identity."}, status=status.HTTP_403_FORBIDDEN)

        if application.status != 'SHORTLISTED':
            return Response({"detail": "Candidate must be shortlisted before revealing identity."}, status=status.HTTP_400_BAD_REQUEST)

        application.status = 'REVEALED'
        application.save()
        return Response(ApplicationSerializer(application).data)
