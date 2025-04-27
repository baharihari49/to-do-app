'use client';

import { AlertTriangle, Eye, EyeOff, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChangeEvent, useEffect, useState } from 'react';

// Interface for PasswordInput props
interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder?: string;
  showPassword: boolean;
  toggleShowPassword: () => void;
}

// Define PasswordVisibility type
interface PasswordVisibility {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

// PasswordInput component
const PasswordInput = ({
  id,
  value,
  onChange,
  label,
  placeholder,
  showPassword,
  toggleShowPassword,
}: PasswordInputProps) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative">
      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        id={id}
        name={id}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder || '••••••••'}
        className="pl-10 pr-10"
        value={value}
        onChange={onChange}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-1 top-1 h-8 w-8 p-0"
        onClick={toggleShowPassword}
      >
        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
      </Button>
    </div>
  </div>
);

// Interface for SecuritySettings props
interface SecuritySettingsProps {
  user: {
    lastLogin: string;
  };
  isSaving: boolean;
  formData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleChangePassword: () => void;
  handleDeleteAccount: () => void; // ✅ Tambahan props baru
  passwordVisibility: PasswordVisibility;
  togglePasswordVisibility: (field: keyof PasswordVisibility) => void;
  isPasswordFormValid: boolean;
}

// Main SecuritySettings component
export const SecuritySettings = ({
  user,
  isSaving,
  formData,
  handleChange,
  handleChangePassword,
  handleDeleteAccount, // ✅ Pakai props ini
  passwordVisibility,
  togglePasswordVisibility,
  isPasswordFormValid,
}: SecuritySettingsProps) => {
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    setFormattedDate(new Date(user.lastLogin).toLocaleString());
  }, [user.lastLogin]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Password & Security</CardTitle>
        <CardDescription>
          Manage your password and account security settings
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Password Change Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Change Password</h3>

          <div className="space-y-4">
            <PasswordInput
              id="currentPassword"
              label="Current Password"
              value={formData.currentPassword}
              onChange={handleChange}
              showPassword={passwordVisibility.current}
              toggleShowPassword={() => togglePasswordVisibility('current')}
            />

            <PasswordInput
              id="newPassword"
              label="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              showPassword={passwordVisibility.new}
              toggleShowPassword={() => togglePasswordVisibility('new')}
            />
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters and include a mix of letters, numbers, and symbols.
            </p>

            <PasswordInput
              id="confirmPassword"
              label="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              showPassword={passwordVisibility.confirm}
              toggleShowPassword={() => togglePasswordVisibility('confirm')}
            />

            {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>{`Passwords don't match`}</span>
              </div>
            )}

            <Button
              onClick={handleChangePassword}
              disabled={isSaving || !isPasswordFormValid}
              className="mt-2 w-full sm:w-auto"
            >
              {isSaving ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Account Security */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Account Security</h3>

          <div className="space-y-6">
            <div className="bg-secondary/50 p-4 rounded-lg">
              <p className="font-medium">Last Login</p>
              <p className="text-sm text-muted-foreground">{formattedDate || '—'}</p>
            </div>

            <div className="border border-destructive/20 p-4 rounded-lg">
              <p className="font-medium text-destructive">Danger Zone</p>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and remove all associated data.
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive"
                      onClick={handleDeleteAccount} // ✅ Klik delete akan trigger fungsi
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
