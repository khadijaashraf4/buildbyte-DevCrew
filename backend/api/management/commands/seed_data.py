from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Skill, StudentProfile, EmployerProfile, Project, VerifiedWorkRecord, Opportunity, Application
from datetime import date

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with realistic sample data for ProofPath MVP'

    def handle(self, *args, **kwargs):
        self.stdout.write("Deleting existing data...")
        Application.objects.all().delete()
        Opportunity.objects.all().delete()
        VerifiedWorkRecord.objects.all().delete()
        Project.objects.all().delete()
        StudentProfile.objects.all().delete()
        EmployerProfile.objects.all().delete()
        Skill.objects.all().delete()
        User.objects.all().delete()

        self.stdout.write("Creating skills...")
        skills_names = [
            "React", "Vue", "Angular", "Python", "Django", "NodeJS", "Express", 
            "SQLite", "PostgreSQL", "Tailwind CSS", "Git", "Figma", "REST APIs", 
            "Project Management", "Docker"
        ]
        skills = {}
        for name in skills_names:
            skills[name] = Skill.objects.create(name=name)

        # Create students
        self.stdout.write("Creating student accounts...")
        
        # Student 1: Alex
        alex_user = User.objects.create_user(
            email='alex@student.com',
            username='alex_mercer',
            password='password123',
            role='STUDENT'
        )
        alex_profile = StudentProfile.objects.create(
            user=alex_user,
            name='Alex Mercer',
            photo_url='https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
            university='Stanford University',
            gender='Male',
            address='Palo Alto, CA',
            bio='Passionate full-stack developer with experience in React and Django. Love building clean web applications.',
            linkedin_url='https://linkedin.com/in/alexmercer',
            github_url='https://github.com/alexmercer'
        )
        alex_profile.skills.add(skills["React"], skills["Python"], skills["Django"], skills["Tailwind CSS"], skills["Git"], skills["REST APIs"])

        # Projects for Alex
        Project.objects.create(
            student=alex_profile,
            title='TaskMaster App',
            description='A Django and React productivity tool featuring real-time task drag-and-drop and team collaboration spaces.',
            github_url='https://github.com/alexmercer/taskmaster',
            live_demo_url='https://taskmaster-demo.herokuapp.com',
            image_url='https://images.unsplash.com/photo-1611224885990-ab7363d1f2a9?w=600&auto=format&fit=crop&q=80'
        )
        Project.objects.create(
            student=alex_profile,
            title='Personal Dev Portfolio',
            description='A modern glassmorphic website displaying skills, achievements, and projects with beautiful Tailwind CSS gradients.',
            github_url='https://github.com/alexmercer/portfolio',
            image_url='https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80'
        )

        # Work records for Alex
        VerifiedWorkRecord.objects.create(
            student=alex_profile,
            task_title='Frontend Engineering Intern',
            organization='InnovateTech',
            responsibilities='Developed new responsive React panels for the customer dashboard. Resolved layout bugs and integrated REST endpoints.',
            start_date=date(2025, 6, 1),
            end_date=date(2025, 8, 31),
            status='VERIFIED',
            remarks='Alex was a stellar intern. He quickly picked up React and delivered layout panels ahead of schedule.'
        )
        VerifiedWorkRecord.objects.create(
            student=alex_profile,
            task_title='Backend Developer (Volunteer)',
            organization='OpenSource Initiative',
            responsibilities='Refactored data models and developed API endpoints using Python and Django.',
            start_date=date(2025, 9, 15),
            status='PENDING'
        )

        # Student 2: Sarah
        sarah_user = User.objects.create_user(
            email='sarah@student.com',
            username='sarah_jenkins',
            password='password123',
            role='STUDENT'
        )
        sarah_profile = StudentProfile.objects.create(
            user=sarah_user,
            name='Sarah Jenkins',
            photo_url='https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
            university='MIT',
            gender='Female',
            address='Cambridge, MA',
            bio='Aspiring software engineer specializing in UI/UX design systems and React frontend layouts.',
            linkedin_url='https://linkedin.com/in/sarahjenkins',
            github_url='https://github.com/sarahjenkins'
        )
        sarah_profile.skills.add(skills["React"], skills["Tailwind CSS"], skills["Figma"])

        # Projects for Sarah
        Project.objects.create(
            student=sarah_profile,
            title='UI/UX Design System',
            description='A comprehensive design kit created in Figma and coded in React + Tailwind CSS containing 30+ reusable micro-animated components.',
            github_url='https://github.com/sarahjenkins/design-system',
            image_url='https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&auto=format&fit=crop&q=80'
        )

        # Work records for Sarah
        VerifiedWorkRecord.objects.create(
            student=sarah_profile,
            task_title='UI Designer Volunteer',
            organization='CodeForGood',
            responsibilities='Redesigned user registration and onboard experience in Figma. Built mockups and tested with users.',
            start_date=date(2025, 10, 1),
            end_date=date(2025, 12, 15),
            status='VERIFIED',
            remarks='Sarah is extremely talented. Her design solutions greatly simplified user flows.'
        )

        # Create Employers
        self.stdout.write("Creating employer accounts...")
        
        # Employer 1: TechCorp
        tech_user = User.objects.create_user(
            email='recruiter@techcorp.com',
            username='techcorp_hr',
            password='password123',
            role='EMPLOYER'
        )
        tech_profile = EmployerProfile.objects.create(
            user=tech_user,
            company_name='TechCorp Inc.',
            website='https://techcorp.com',
            description='A leading provider of enterprise cloud computing services and developer tooling.',
            logo_url='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&h=150&fit=crop'
        )

        # Employer 2: DesignHub
        design_user = User.objects.create_user(
            email='recruiter@designhub.com',
            username='designhub_hr',
            password='password123',
            role='EMPLOYER'
        )
        design_profile = EmployerProfile.objects.create(
            user=design_user,
            company_name='DesignHub Studio',
            website='https://designhub.co',
            description='Boutique agency specializing in building state-of-the-art web interfaces and brands.',
            logo_url='https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop'
        )

        # Opportunities
        self.stdout.write("Creating opportunities...")
        
        opp1 = Opportunity.objects.create(
            employer=tech_profile,
            title='React Frontend Developer',
            description='We are looking for a frontend developer fluent in React and Tailwind CSS. You will construct high-fidelity components, optimize app performance, and cooperate closely with backend engineers.',
            opportunity_type='JOB',
            deadline=date(2026, 12, 31)
        )
        opp1.required_skills.add(skills["React"], skills["Tailwind CSS"], skills["Git"])

        opp2 = Opportunity.objects.create(
            employer=tech_profile,
            title='Python Backend Intern',
            description='Join our core cloud team as an intern. You will develop backend services, structure SQLite databases, and write API integrations in Django REST Framework.',
            opportunity_type='INTERNSHIP',
            deadline=date(2026, 9, 30)
        )
        opp2.required_skills.add(skills["Python"], skills["Django"], skills["SQLite"], skills["REST APIs"])

        opp3 = Opportunity.objects.create(
            employer=design_profile,
            title='Junior UI/UX Engineer',
            description='Looking for a volunteer or junior dev to assist in design operations. Must be familiar with Figma and coding responsive Tailwind UI pages.',
            opportunity_type='VOLUNTEER',
            deadline=date(2026, 8, 15)
        )
        opp3.required_skills.add(skills["React"], skills["Figma"], skills["Tailwind CSS"])

        # Applications
        self.stdout.write("Creating applications...")
        
        # Alex applies to React Frontend Developer (TechCorp) - 100% skill match!
        Application.objects.create(
            opportunity=opp1,
            student=alex_profile,
            cover_letter="I am very interested in this job since I use React and Tailwind daily. I'd love to contribute.",
            status='PENDING'
        )
        
        # Sarah applies to Junior UI/UX Engineer (DesignHub) - 100% skill match!
        Application.objects.create(
            opportunity=opp3,
            student=sarah_profile,
            cover_letter="My profile is a great fit because I design in Figma and code in React and Tailwind CSS.",
            status='PENDING'
        )

        # Alex applies to Python Backend Intern (TechCorp) - 100% match!
        # Let's make it shortlisted already to demonstrate reveal mechanics
        Application.objects.create(
            opportunity=opp2,
            student=alex_profile,
            cover_letter="I have built Django apps and worked with SQLite for local development. I am excited to learn.",
            status='SHORTLISTED'
        )

        self.stdout.write(self.style.SUCCESS("Database seeded successfully with sample data!"))
