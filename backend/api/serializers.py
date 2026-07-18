from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import StudentProfile, EmployerProfile, Skill, Project, VerifiedWorkRecord, Opportunity, Application

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='STUDENT')
    
    # Extra fields for profile creation
    name_or_company = serializers.CharField(write_only=True)
    university_or_website = serializers.CharField(write_only=True, required=False, allow_blank=True)
    gender = serializers.CharField(write_only=True, required=False, allow_blank=True)
    address = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'role', 'username', 'name_or_company', 'university_or_website', 'gender', 'address')

    def create(self, validated_data):
        role = validated_data.get('role', 'STUDENT')
        email = validated_data.get('email')
        username = validated_data.get('username')
        password = validated_data.get('password')
        
        name_or_company = validated_data.get('name_or_company')
        university_or_website = validated_data.get('university_or_website', '')
        gender = validated_data.get('gender', '')
        address = validated_data.get('address', '')

        # Create user
        user = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            role=role
        )

        # Create corresponding profile
        if role == 'STUDENT':
            StudentProfile.objects.create(
                user=user,
                name=name_or_company,
                university=university_or_website,
                gender=gender,
                address=address
            )
        else:
            EmployerProfile.objects.create(
                user=user,
                company_name=name_or_company,
                website=university_or_website
            )

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role')


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ('id', 'name')


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'student', 'title', 'description', 'github_url', 'live_demo_url', 'image_url')
        read_only_fields = ('student',)


class VerifiedWorkRecordSerializer(serializers.ModelSerializer):
    verified_by_company = serializers.SerializerMethodField()

    class Meta:
        model = VerifiedWorkRecord
        fields = ('id', 'student', 'task_title', 'organization', 'responsibilities', 
                  'start_date', 'end_date', 'status', 'verified_by', 'verified_by_company', 'remarks')
        read_only_fields = ('student', 'status', 'verified_by')

    def get_verified_by_company(self, obj):
        if obj.verified_by and hasattr(obj.verified_by, 'employer_profile'):
            return obj.verified_by.employer_profile.company_name
        return None


class StudentProfileSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    projects = ProjectSerializer(many=True, read_only=True)
    work_records = VerifiedWorkRecordSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = StudentProfile
        fields = ('id', 'user_email', 'name', 'photo_url', 'university', 'gender', 'address', 'bio', 'linkedin_url', 'github_url', 'skills', 'skill_ids', 'projects', 'work_records')

    def update(self, instance, validated_data):
        skill_ids = validated_data.pop('skill_ids', None)
        instance = super().update(instance, validated_data)
        if skill_ids is not None:
            skills = Skill.objects.filter(id__in=skill_ids)
            instance.skills.set(skills)
        return instance


class EmployerProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = EmployerProfile
        fields = ('id', 'user_email', 'company_name', 'website', 'description', 'logo_url')


# Anonymous Student Profile Serializer (used for bias-free reviewing)
class AnonymousStudentProfileSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    work_records = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        # Excludes: name, photo_url, university, gender, address
        fields = ('id', 'bio', 'linkedin_url', 'github_url', 'skills', 'projects', 'work_records')

    def get_work_records(self, obj):
        # We only want to show work records. We can serialize them normally.
        # But we make sure their verification status is displayed.
        records = obj.work_records.all()
        return VerifiedWorkRecordSerializer(records, many=True).data


class OpportunitySerializer(serializers.ModelSerializer):
    required_skills = SkillSerializer(many=True, read_only=True)
    required_skill_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    employer_company = serializers.CharField(source='employer.company_name', read_only=True)
    employer_logo = serializers.CharField(source='employer.logo_url', read_only=True)
    match_percentage = serializers.SerializerMethodField()
    matched_skills = serializers.SerializerMethodField()
    missing_skills = serializers.SerializerMethodField()

    class Meta:
        model = Opportunity
        fields = ('id', 'employer', 'employer_company', 'employer_logo', 'title', 'description', 
                  'opportunity_type', 'required_skills', 'required_skill_ids', 'deadline', 'created_at',
                  'match_percentage', 'matched_skills', 'missing_skills')
        read_only_fields = ('employer',)

    def create(self, validated_data):
        required_skill_ids = validated_data.pop('required_skill_ids', [])
        opportunity = Opportunity.objects.create(**validated_data)
        if required_skill_ids:
            skills = Skill.objects.filter(id__in=required_skill_ids)
            opportunity.required_skills.set(skills)
        return opportunity

    def update(self, instance, validated_data):
        required_skill_ids = validated_data.pop('required_skill_ids', None)
        instance = super().update(instance, validated_data)
        if required_skill_ids is not None:
            skills = Skill.objects.filter(id__in=required_skill_ids)
            instance.required_skills.set(skills)
        return instance

    def _get_student_profile(self):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            if hasattr(request.user, 'student_profile'):
                return request.user.student_profile
        return None

    def get_match_percentage(self, obj):
        student = self._get_student_profile()
        if not student:
            return 0
        req_skills = set(obj.required_skills.values_list('id', flat=True))
        if not req_skills:
            return 100
        stud_skills = set(student.skills.values_list('id', flat=True))
        matching = stud_skills.intersection(req_skills)
        return int((len(matching) / len(req_skills)) * 100)

    def get_matched_skills(self, obj):
        student = self._get_student_profile()
        if not student:
            return []
        req_skills = set(obj.required_skills.all())
        stud_skills = set(student.skills.all())
        matching = req_skills.intersection(stud_skills)
        return [skill.name for skill in matching]

    def get_missing_skills(self, obj):
        student = self._get_student_profile()
        if not student:
            return [skill.name for skill in obj.required_skills.all()]
        req_skills = set(obj.required_skills.all())
        stud_skills = set(student.skills.all())
        missing = req_skills - stud_skills
        return [skill.name for skill in missing]


class ApplicationSerializer(serializers.ModelSerializer):
    opportunity_details = OpportunitySerializer(source='opportunity', read_only=True)
    student_profile = serializers.SerializerMethodField()
    match_percentage = serializers.SerializerMethodField()
    matched_skills = serializers.SerializerMethodField()
    missing_skills = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = ('id', 'opportunity', 'opportunity_details', 'student', 'student_profile', 
                  'status', 'applied_at', 'cover_letter', 'match_percentage', 'matched_skills', 'missing_skills')
        read_only_fields = ('student',)

    def get_match_percentage(self, obj):
        req_skills = set(obj.opportunity.required_skills.values_list('id', flat=True))
        if not req_skills:
            return 100
        stud_skills = set(obj.student.skills.values_list('id', flat=True))
        matching = stud_skills.intersection(req_skills)
        return int((len(matching) / len(req_skills)) * 100)

    def get_matched_skills(self, obj):
        req_skills = set(obj.opportunity.required_skills.all())
        stud_skills = set(obj.student.skills.all())
        matching = req_skills.intersection(stud_skills)
        return [skill.name for skill in matching]

    def get_missing_skills(self, obj):
        req_skills = set(obj.opportunity.required_skills.all())
        stud_skills = set(obj.student.skills.all())
        missing = req_skills - stud_skills
        return [skill.name for skill in missing]

    def get_student_profile(self, obj):
        # Implement Bias-Free Anonymization Logic
        student = obj.student
        
        # If application status is PENDING or SHORTLISTED, and NOT REVEALED, anonymize the profile
        if obj.status in ['PENDING', 'SHORTLISTED', 'REJECTED']:
            # Return anonymized representation
            data = AnonymousStudentProfileSerializer(student).data
            data['name'] = f"Candidate #{student.id}"
            data['photo_url'] = None
            data['university'] = "Hidden until Shortlisted & Identity Revealed"
            data['gender'] = "Hidden"
            data['address'] = "Hidden"
            data['is_anonymous'] = True
            return data
        else:
            # Status is REVEALED, return full profile
            data = StudentProfileSerializer(student).data
            data['is_anonymous'] = False
            return data
