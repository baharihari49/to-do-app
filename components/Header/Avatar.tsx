'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export const AvatarUser = () => {
    const { user, logout } = useAuth();
    const router = useRouter();

    // Generate initials from user's name
    const getInitials = () => {
        if (!user) return 'U';
        
        const firstInitial = user.firstName ? user.firstName.charAt(0) : '';
        const lastInitial = user.lastName ? user.lastName.charAt(0) : '';
        
        return `${firstInitial}${lastInitial}`;
    };

    // Handle logout
    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    // Handle profile navigation
    const handleProfileClick = () => {
        router.push('/profile');
    };

    // Handle settings navigation
    const handleSettingsClick = () => {
        router.push('/settings');
    };

    // If no user is logged in, show a simplified avatar
    if (!user) {
        return (
            <Button variant="ghost" className="relative h-8 w-8 rounded-full" onClick={() => router.push('/login')}>
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">?</AvatarFallback>
                </Avatar>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-avatar.jpg" alt={`${user.firstName} ${user.lastName}`} />
                        <AvatarFallback className="bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{`${user.firstName} ${user.lastName}`}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettingsClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    className="text-destructive focus:text-destructive cursor-pointer" 
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};