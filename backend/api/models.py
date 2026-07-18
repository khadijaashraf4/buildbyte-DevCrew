from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('STUDENT', 'Student'),
        ('EMPLOYER', 'Employer'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='STUDENT')
    email = models.EmailField(unique=True)

    # Use email for authentication instead of username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    name = models.CharField(max_length=255)
    photo_url = models.TextField(blank=True, null=True)
    university = models.CharField(max_length=255)
    gender = models.CharField(max_length=50)
    address = models.CharField(max_length=255)
    bio = models.TextField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    skills = models.ManyToManyField(Skill, related_name='students', blank=True)

    def __str__(self):
        return self.name


class EmployerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employer_profile')
    company_name = models.CharField(max_length=255)
    website = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    logo_url = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.company_name


class Project(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=255)
    description = models.TextField()
    github_url = models.URLField()
    live_demo_url = models.URLField(blank=True, null=True)
    image_url = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} - {self.student.name}"


class VerifiedWorkRecord(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
    )
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='work_records')
    task_title = models.CharField(max_length=255)
    organization = models.CharField(max_length=255)
    responsibilities = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='verified_records')
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.task_title} at {self.organization} ({self.status})"


class Opportunity(models.Model):
    TYPE_CHOICES = (
        ('INTERNSHIP', 'Internship'),
        ('JOB', 'Job'),
        ('VOLUNTEER', 'Volunteer Opportunity'),
    )
    employer = models.ForeignKey(EmployerProfile, on_delete=models.CASCADE, related_name='opportunities')
    title = models.CharField(max_length=255)
    description = models.TextField()
    opportunity_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    required_skills = models.ManyToManyField(Skill, related_name='opportunities')
    deadline = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} at {self.employer.company_name}"


class Application(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('SHORTLISTED', 'Shortlisted'),
        ('REJECTED', 'Rejected'),
        ('REVEALED', 'Revealed'),
    )
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='applications')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    applied_at = models.DateTimeField(auto_now_add=True)
    cover_letter = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('opportunity', 'student')

    def __str__(self):
        return f"{self.student.name} -> {self.opportunity.title}"
