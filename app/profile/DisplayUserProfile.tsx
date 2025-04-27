'use client'

import { useEffect, useState, ChangeEvent } from 'react';
import { ProfileInformation } from './ProfileInformation';
import { SecuritySettings } from './SecuritySettings';

// User interface
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  description: string;
  role: string;
  createdAt: string;
  lastLogin: string; // ✅ Add lastLogin
  stats: {
    tasksCompleted: number;
    tasksCreated: number;
    completionRate: number;
  };
}

// Form data interface
interface FormData {
  name: string;
  email: string;
  description: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Password visibility interface
interface PasswordVisibility {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

// Main component
const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [passwordVisibility, setPasswordVisibility] = useState<PasswordVisibility>({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    description: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();

        const profile: User = {
          id: data.user.id ?? '',
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar,
          description: data.user.description,
          role: data.user.role,
          createdAt: data.user.createdAt,
          lastLogin: data.user.lastLogin ?? new Date().toISOString(), // Fallback default
          stats: {
            tasksCreated: data.user.stats.tasksCreated,
            tasksCompleted: data.user.stats.tasksCompleted,
            completionRate: data.user.stats.completionRate
          }
        };

        setUser(profile);
        setFormData({
          name: profile.name,
          email: profile.email,
          description: profile.description || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchProfile();
  }, []);

  // Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field: keyof PasswordVisibility) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          description: formData.description,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      // Ambil response kalau perlu (optional)
      // const result = await res.json();

      // Update local user state
      if (user) {
        setUser({
          ...user,
          name: formData.name,
          email: formData.email,
          description: formData.description,
        });
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };


  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        description: user.description,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setIsEditing(false);
  };

  // Update password
  const handleChangePassword = async () => {
    setIsSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update password');
      }

      // Reset password fields setelah sukses
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // Optional: Alert success (nanti bisa pakai toast)
      console.log('Password updated successfully');

    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmDelete) return;

    setIsSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete account');
      }

      console.log('Account deleted successfully');
      // Redirect setelah delete berhasil
      window.location.href = '/login'; // atau ke "/goodbye" page kalau mau
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsSaving(false);
    }
  };


  const isPasswordFormValid: boolean = Boolean(
    formData.currentPassword &&
    formData.newPassword &&
    formData.confirmPassword &&
    formData.newPassword === formData.confirmPassword &&
    formData.newPassword.length >= 8
  );

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ProfileInformation section */}
        <ProfileInformation
          user={{
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            description: user.description,
            role: user.role,
            createdAt: user.createdAt,
            stats: user.stats
          }}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          isSaving={isSaving}
          formData={formData}
          handleChange={handleChange}
          handleSaveProfile={handleSaveProfile}
          handleCancelEdit={handleCancelEdit}
        />

        {/* SecuritySettings section */}
        <SecuritySettings
          user={{ lastLogin: user.lastLogin }}
          isSaving={isSaving}
          formData={formData}
          handleChange={handleChange}
          handleChangePassword={handleChangePassword}
          handleDeleteAccount={handleDeleteAccount}
          passwordVisibility={passwordVisibility}
          togglePasswordVisibility={togglePasswordVisibility}
          isPasswordFormValid={isPasswordFormValid}
        />

      </div>
    </div>
  );
};

export default UserProfile;
