// src/components/admin/AdminSidebar.tsx  

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  ChartBarIcon, 
  UsersIcon, 
  QuestionMarkCircleIcon,
  LightBulbIcon,
  TagIcon,
  Cog6ToothIcon,
  HomeIcon,
  ChartPieIcon,
  ShieldCheckIcon,
  AcademicCapIcon, // Added for Courses
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { ADMIN_ROUTES, ROUTES } from '@/constants';
import { Maximize, Minimize } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { roleUtils } from '@/lib/utils/auth';
import { dateUtils } from '@/lib/utils/common';
import { stringUtils } from '@/lib/utils/common';

// Extended document interface for fullscreen APIs
interface ExtendedDocument extends Document {
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

// Extended HTMLElement interface for fullscreen APIs
interface ExtendedHTMLElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

interface AdminSidebarProps {
  isSuperAdmin: boolean;
}

export default function AdminSidebar({ isSuperAdmin }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen detection and management
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as ExtendedDocument;
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Check initial fullscreen state
    handleFullscreenChange();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Fullscreen toggle function
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        // Enter fullscreen
        const docEl = document.documentElement as ExtendedHTMLElement;
        
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          await docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        }
      } else {
        // Exit fullscreen
        const doc = document as ExtendedDocument;
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  const navigation: SidebarItem[] = [
    { name: 'Overview', href: ADMIN_ROUTES.ME, icon: HomeIcon },
    { name: 'Analytics', href: ADMIN_ROUTES.ANALYTICS, icon: ChartPieIcon },
    { name: 'Questions', href: ADMIN_ROUTES.QUESTIONS, icon: QuestionMarkCircleIcon },
    { name: 'Solutions', href: ADMIN_ROUTES.SOLUTIONS, icon: LightBulbIcon },
    { name: 'Categories', href: ADMIN_ROUTES.CATEGORIES, icon: TagIcon },
    { name: 'Courses', href: ADMIN_ROUTES.COURSES || '/admin/courses', icon: AcademicCapIcon }, // Added Courses
    { name: 'Users', href: ADMIN_ROUTES.USERS, icon: UsersIcon },
    ...(isSuperAdmin ? [
      { name: 'Settings', href: ADMIN_ROUTES.SETTINGS, icon: Cog6ToothIcon },
    ] : []),
  ];

  if (!user) return null;

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 overflow-y-auto">
        {/* Header with Logo and Fullscreen Button */}
        <div className="flex items-center justify-between px-4 mb-8">
          <Link href={ROUTES.HOME} className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              AlgoArena
            </span>
          </Link>
          
          {/* Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5 text-gray-600" />
            ) : (
              <Maximize className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-6 w-6',
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="flex-shrink-0 border-t border-gray-200 py-4 px-4">
          <div className="flex items-center space-x-3 mb-3">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={40}
                height={40}
                className="rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                {stringUtils.getInitials(user.name)}
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 truncate">
                {user.name}
              </div>
              <div className="text-sm text-gray-500">
                {roleUtils.formatRole(user.role)}
              </div>
              <div className="text-xs text-gray-400">
                Member since {dateUtils.formatDate(user.createdAt)}
              </div>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>

        {/* Back to Home Link */}
        <div className="flex-shrink-0 px-2 pb-4">
          <Link
            href={ROUTES.ME}
            className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <ChartBarIcon className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}