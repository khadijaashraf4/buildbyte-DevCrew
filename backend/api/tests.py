from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from api.models import Skill, StudentProfile, EmployerProfile, Opportunity, Application
from datetime import date

User = get_user_model()

class ProofPathBackendTests(APITestCase):

    def setUp(self):
        # Create standard test skills
        self.skill_react = Skill.objects.create(name="React")
        self.skill_python = Skill.objects.create(name="Python")
        self.skill_django = Skill.objects.create(name="Django")
        self.skill_tailwind = Skill.objects.create(name="Tailwind CSS")

        # Create students
        self.student_user = User.objects.create_user(
            email='alex@test.com',
            username='alextest',
            password='password123',
            role='STUDENT'
        )
        self.student_profile = StudentProfile.objects.create(
            user=self.student_user,
            name='Alex Mercer',
            university='Stanford University',
            gender='Male',
            address='Palo Alto, CA',
            bio='Test student profile.'
        )
        self.student_profile.skills.add(self.skill_react, self.skill_python)

        # Create employer
        self.employer_user = User.objects.create_user(
            email='recruiter@testcorp.com',
            username='testcorphr',
            password='password123',
            role='EMPLOYER'
        )
        self.employer_profile = EmployerProfile.objects.create(
            user=self.employer_user,
            company_name='TestCorp Inc.',
            website='https://testcorp.com'
        )

        # Create opportunity
        self.opportunity = Opportunity.objects.create(
            employer=self.employer_profile,
            title='React & Django Developer',
            description='Test description.',
            opportunity_type='JOB',
            deadline=date(2026, 12, 31)
        )
        # Requires React, Django, Tailwind (3 skills)
        self.opportunity.required_skills.add(self.skill_react, self.skill_django, self.skill_tailwind)

    def test_user_registration(self):
        url = reverse('auth_register')
        data = {
            "email": "newstudent@test.com",
            "username": "newstudent",
            "password": "password123",
            "role": "STUDENT",
            "name_or_company": "Jane Doe",
            "university_or_website": "MIT",
            "gender": "Female",
            "address": "Boston, MA"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="newstudent@test.com").exists())
        self.assertTrue(StudentProfile.objects.filter(name="Jane Doe").exists())

    def test_jwt_login(self):
        url = reverse('token_obtain_pair')
        data = {
            "email": "alex@test.com",
            "password": "password123"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_profile_retrieval(self):
        # Login and get token
        login_url = reverse('token_obtain_pair')
        login_res = self.client.post(login_url, {"email": "alex@test.com", "password": "password123"}, format='json')
        token = login_res.data['access']

        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        profile_url = reverse('auth_profile')
        response = self.client.get(profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Alex Mercer')

    def test_match_percentage_calculation(self):
        # Student has: React, Python (2 skills)
        # Opportunity requires: React, Django, Tailwind (3 skills)
        # Match is: React (1 matching skill out of 3 required) -> 1/3 * 100 = 33%
        # Sarah has React (1/3)
        # Let's test the opportunity matching inside Application serializer
        application = Application.objects.create(
            opportunity=self.opportunity,
            student=self.student_profile,
            cover_letter="Interested"
        )
        
        # Authenticate employer to view applications
        login_url = reverse('token_obtain_pair')
        login_res = self.client.post(login_url, {"email": "recruiter@testcorp.com", "password": "password123"}, format='json')
        token = login_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

        app_url = reverse('application-detail', args=[application.id])
        response = self.client.get(app_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['match_percentage'], 33)
        self.assertIn('React', response.data['matched_skills'])
        self.assertIn('Django', response.data['missing_skills'])
        self.assertIn('Tailwind CSS', response.data['missing_skills'])

    def test_bias_free_anonymization_and_reveal_flow(self):
        application = Application.objects.create(
            opportunity=self.opportunity,
            student=self.student_profile,
            cover_letter="Interested"
        )

        # Authenticate employer
        login_url = reverse('token_obtain_pair')
        login_res = self.client.post(login_url, {"email": "recruiter@testcorp.com", "password": "password123"}, format='json')
        token = login_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

        app_url = reverse('application-detail', args=[application.id])
        
        # 1. Verify initially anonymized
        response = self.client.get(app_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        student_data = response.data['student_profile']
        
        # Verify hidden details
        self.assertEqual(student_data['name'], f"Candidate #{self.student_profile.id}")
        self.assertNilOrHidden(student_data['university'])
        self.assertEqual(student_data['gender'], "Hidden")
        self.assertEqual(student_data['address'], "Hidden")
        
        # Verify visible portfolio details
        self.assertEqual(student_data['bio'], 'Test student profile.')
        self.assertTrue(len(student_data['skills']) > 0)

        # 2. Shortlist candidate
        shortlist_url = reverse('application-shortlist', args=[application.id])
        res = self.client.post(shortlist_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['status'], 'SHORTLISTED')

        # Check detail still anonymized after shortlisting but before reveal
        response = self.client.get(app_url)
        self.assertEqual(response.data['student_profile']['name'], f"Candidate #{self.student_profile.id}")

        # 3. Reveal Identity
        reveal_url = reverse('application-reveal', args=[application.id])
        res = self.client.post(reveal_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['status'], 'REVEALED')

        # Check detail now reveals identity
        response = self.client.get(app_url)
        revealed_profile = response.data['student_profile']
        self.assertEqual(revealed_profile['name'], 'Alex Mercer')
        self.assertEqual(revealed_profile['university'], 'Stanford University')
        self.assertEqual(revealed_profile['gender'], 'Male')
        self.assertEqual(revealed_profile['address'], 'Palo Alto, CA')

    def assertNilOrHidden(self, value):
        self.assertTrue(value is None or "Hidden" in str(value))
