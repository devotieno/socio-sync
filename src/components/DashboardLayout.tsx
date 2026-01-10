'use client';

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  DocumentPlusIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Create Post', href: '/dashboard/posts/create', icon: DocumentPlusIcon },
    { name: 'X Posts', href: '/dashboard/posts', icon: CalendarIcon },
    { name: 'Schedule Manager', href: '/dashboard/schedule-manager', icon: ClockIcon },
    { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
    { name: 'Accounts', href: '/dashboard/accounts', icon: UsersIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col backdrop-blur-xl bg-slate-900/95 border-r border-slate-700/50">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-2">
              <img
                src="/icon-512.png"
                alt="Xync Logo"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-xl font-outfit font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">Xync</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col backdrop-blur-xl bg-slate-900/95 border-r border-slate-700/50">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center space-x-2">
              <img
                src="/icon-512.png"
                alt="Xync Logo"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-xl font-outfit font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">Xync</span>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User profile section */}
          <div className="border-t border-slate-700/50 p-4">
            <div className="flex items-center space-x-3">
              <img
                className="h-8 w-8 rounded-full ring-2 ring-slate-700"
                src={session?.user?.image || '/default-avatar.png'}
                alt="User avatar"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session?.user?.name || session?.user?.email}
                </p>
                <p className="text-sm text-slate-400 truncate">
                  {session?.user?.email}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-slate-400 hover:text-white transition-colors"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="flex h-16 items-center justify-between backdrop-blur-xl bg-slate-900/50 border-b border-slate-700/50 px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-white lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-300">
              Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}!
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
