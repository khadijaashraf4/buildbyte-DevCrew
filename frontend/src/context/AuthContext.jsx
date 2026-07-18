import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await authAPI.getProfile();
      setUser({
        ...res.data,
        role: localStorage.getItem('user_role'),
      });
    } catch (err) {
      logout();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      const role = localStorage.getItem('user_role');
      if (token && role) {
        await fetchProfile();
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      
      // Decode JWT roughly or get profile to get user role
      // SimpleJWT response has access, refresh. Let's get profile to know who logged in.
      // But we can decode the access token payload to get the role if we want,
      // or we can fetch the profile first.
      // Let's first fetch profile to get the user information.
      const profileRes = await authAPI.getProfile();
      
      // Simple check: we need to find if user is Student or Employer.
      // Let's get profile. We can read user info from it.
      // Wait, profile API will return student/employer profile containing fields.
      // To determine role, since profileRes has name (student) or company_name (employer)
      // we can set user role. Wait! Let's decode the JWT to check the user ID, or
      // let's look at what the backend RegisterView or a custom profile view returns.
      // ProfileView returns:
      // - StudentProfile data if role == 'STUDENT'
      // - EmployerProfile data if role == 'EMPLOYER'
      // Wait, how does ProfileView know the role? It checks request.user.role!
      // So request.user.role is either STUDENT or EMPLOYER.
      // Let's modify ProfileView or Serializers so that ProfileView returns the user role in the response!
      // Wait, let's verify: does our StudentProfileSerializer and EmployerProfileSerializer return the role?
      // No, they return name/company_name, but not user.role.
      // Wait! Let's modify StudentProfileSerializer and EmployerProfileSerializer or ProfileView
      // to return the user's role directly so it's super easy for the frontend to know!
      // Let's review models: StudentProfile has a user field. We can add `user_role = serializers.CharField(source='user.role', read_only=True)` to both.
      // Wait, yes! That is a very clean way to do it.
      // Let's check what our serializers currently have:
      // StudentProfileSerializer has `user_email = serializers.EmailField(source='user.email', read_only=True)`
      // Let's make sure we also read the user role!
      // Oh! In ProfileView, we can just return `{ ...serializer.data, role: user.role }` to the frontend!
      // Yes, that is incredibly easy and doesn't require modifying serializers.
      // Let's look at ProfileView code:
      // class ProfileView(views.APIView):
      //     def get(self, request):
      //         user = request.user
      //         if user.role == 'STUDENT':
      //             ...
      //             serializer = StudentProfileSerializer(profile)
      //             return Response(serializer.data)
      // If we modify ProfileView later or simply parse the token payload in frontend, or
      // let's just make the login endpoint or profile endpoint return the role.
      // Wait! We can decode the JWT in the frontend, or we can just fetch the profile and check.
      // Let's look at the JWT payload. Standard SimpleJWT contains `user_id`.
      // Let's check if we can update ProfileView to return role.
      // Wait, let's look at how we fetch the profile.
      // If the user logs in, we need to know whether they are STUDENT or EMPLOYER.
      // Let's look at simplejwt token serializer: we can customize it to return user role,
      // or we can fetch the profile and check if we get a student profile or employer profile.
      // Let's customize the token response in django settings or views.
      // Actually, in `ProfileView.get(self, request)`, we can do:
      // data = serializer.data
      // data['role'] = user.role
      // return Response(data)
      // That is extremely simple and elegant. We can update views.py using `replace_file_content` if we need,
      // but wait! We can also just check if the return data has `company_name` vs `name`.
      // If it has `company_name`, it is an employer profile. If it has `name`, it is a student profile!
      // That is a clever, no-change way to check in the frontend:
      // `const role = profileRes.data.company_name ? 'EMPLOYER' : 'STUDENT'`
      // Yes! That works perfectly and is robust. Let's use that.
      
      const isEmployer = !!profileRes.data.company_name;
      const role = isEmployer ? 'EMPLOYER' : 'STUDENT';
      
      localStorage.setItem('user_role', role);
      
      setUser({
        ...profileRes.data,
        role: role
      });
      setLoading(false);
      return role;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      await authAPI.register(data);
      // Automatically log in after successful registration
      return await login(data.email, data.password);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    setUser(null);
  };

  const updateProfileState = (updatedProfile) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ...updatedProfile,
      };
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchProfile, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
