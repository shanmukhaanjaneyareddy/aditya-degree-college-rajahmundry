import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Video,
  Users,
  Calendar,
  Sparkles,
  FolderKanban,
  Award,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ManageDroneAndHome from './ManageDroneAndHome';
import ManageManagement from './ManageManagement';
import ManageAcademicYears from './ManageAcademicYears';
import ManageFoldersAndMedia from './ManageFoldersAndMedia';
import ManagePlacements from './ManagePlacements';

const TABS = [
  { id: 'home', label: 'Home & Drone Video', icon: Video },
  { id: 'management', label: 'Management Team', icon: Users },
  { id: 'academic_years', label: 'Academic Years', icon: Calendar },
  { id: 'activities', label: 'Activities Folders', icon: Sparkles },
  { id: 'project_expos', label: 'Project Expos', icon: FolderKanban },
  { id: 'placements', label: 'Placements & Top 10', icon: Award },
];

export default function AdminDashboard() {
  const { logoutAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Admin Header */}
      <header className="bg-aditya-navy text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <span className="font-extrabold text-amber-400 tracking-wide">
              ADITYA ADMIN PORTAL
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold"
            >
              <span>View Public Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={logoutAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-aditya-navy text-amber-400 shadow'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Panel Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && <ManageDroneAndHome />}
        {activeTab === 'management' && <ManageManagement />}
        {activeTab === 'academic_years' && <ManageAcademicYears />}
        {activeTab === 'activities' && (
          <ManageFoldersAndMedia
            key="admin_activities"
            section="activities"
            sectionLabel="Activities"
          />
        )}
        {activeTab === 'project_expos' && (
          <ManageFoldersAndMedia
            key="admin_expos"
            section="project_expos"
            sectionLabel="Project Expos"
          />
        )}
        {activeTab === 'placements' && <ManagePlacements />}
      </main>
    </div>
  );
}