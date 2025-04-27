'use client'
import { 
  Camera, 
  Mail, 
  Save 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ChangeEvent } from 'react';

// Interface for StatCard props
interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
}

// Helper components
const StatCard = ({ title, value, suffix = "" }: StatCardProps) => (
  <Card>
    <CardHeader className="p-4 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <p className="text-2xl font-bold">{value}{suffix}</p>
    </CardContent>
  </Card>
);

// Props interface
interface ProfileInformationProps {
  user: {
    name: string;
    email: string;
    avatar: string;
    description: string;
    role: string;
    createdAt: string;
    stats: {
      tasksCreated: number;
      tasksCompleted: number;
      completionRate: number;
    };
  };
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  isSaving: boolean;
  formData: {
    name: string;
    email: string;
    description: string;
  };
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSaveProfile: () => void;
  handleCancelEdit: () => void;
}

export const ProfileInformation = ({
  user,
  isEditing,
  setIsEditing,
  isSaving,
  formData,
  handleChange,
  handleSaveProfile,
  handleCancelEdit
}: ProfileInformationProps) => {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "administrator": return "bg-primary text-primary-foreground";
      case "moderator": return "bg-purple-500 text-white";
      case "user": return "bg-secondary text-secondary-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              View and manage your personal information
            </CardDescription>
          </div>

          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Avatar and Name Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            {isEditing && (
              <Button
                size="icon"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Member since {formatDate(user.createdAt)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Information</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>

              {isEditing ? (
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              ) : (
                <p className="text-muted-foreground">{user.email}</p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* description */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">About Me</h3>

          {isEditing ? (
            <Textarea
              id="description"
              name="description"
              placeholder="Tell us a bit about yourself..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          ) : (
            <p className="whitespace-pre-line">
              {user.description || <span className="text-muted-foreground italic">No description provided</span>}
            </p>
          )}
        </div>

        <Separator />

        {/* Stats */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Activity Statistics</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Tasks Created"
              value={user.stats.tasksCreated}
            />
            <StatCard
              title="Tasks Completed"
              value={user.stats.tasksCompleted}
            />
            <StatCard
              title="Completion Rate"
              value={user.stats.completionRate}
              suffix="%"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};