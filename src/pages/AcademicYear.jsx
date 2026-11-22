import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FolderKanban,
  Award,
  Building2,
  UserCheck,
} from 'lucide-react';
import { useCollegeData } from '../context/CollegeDataContext';
import FolderExplorer from '../components/FolderExplorer';

const parsePackageNumber = (val) => {
  if (val === '' || val === null || val === undefined) return 0;
  const num = Number(String(val).replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? num : 0;
};

export default function AcademicYear() {
  const { data } = useCollegeData();
  const years = data.academicYears;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('activities'); // 'activities' | 'project_expos' | 'placements'

  useEffect(() => {
    if (selectedIndex >= years.length) {
      setSelectedIndex(0);
    }
  }, [years.length, selectedIndex]);

  const currentYear = years[selectedIndex] || '2025-26';

  const yearPlacements = useMemo(() => {
    return data.placements
      .filter((p) => p.academicYear === currentYear)
      .sort((a, b) => parsePackageNumber(b.packageLpa) - parsePackageNumber(a.packageLpa));
  }, [data.placements, currentYear]);

  const activityFolderCount = useMemo(
    () =>
      data.folders.filter(
        (f) =>
          f.section === 'activities' &&
          f.academicYear === currentYear &&
          !f.parentId
      ).length,
    [data.folders, currentYear]
  );

  const expoFolderCount = useMemo(
    () =>
      data.folders.filter(
        (f) =>
          f.section === 'project_expos' &&
          f.academicYear === currentYear &&
          !f.parentId
      ).length,
    [data.folders, currentYear]
  );

  const handlePrevYear = () => {
    if (years.length === 0) return;
    setSelectedIndex((prev) => (prev - 1 + years.length) % years.length);
  };

  const handleNextYear = () => {
    if (years.length === 0) return;
    setSelectedIndex((prev) => (prev + 1) % years.length);
  };

  return (
    <div className="pb-12">
      {/* Top Academic Year Shuffler Banner */}
      <section className="bg-aditya-navy text-white py-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                Academic Year Archive (Starting 2025-26)
              </span>
              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">
                Academic Year: <span className="text-amber-400">{currentYear}</span>
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Shuffle across academic years to inspect all Activities, Project Expo, and Placements from that session.
              </p>
            </div>

            {/* Interactive Year Shuffler Controls */}
            {years.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevYear}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Previous Academic Year"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  {years.map((yr, idx) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        idx === selectedIndex
                          ? 'bg-amber-500 text-aditya-navy shadow-lg'
                          : 'bg-white/10 text-slate-200 hover:bg-white/20'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNextYear}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Next Academic Year"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Section Switcher Tabs inside Selected Academic Year */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('activities')}
              className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                activeTab === 'activities'
                  ? 'bg-white text-aditya-navy border-white shadow-lg'
                  : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles
                  className={`w-5 h-5 ${
                    activeTab === 'activities' ? 'text-amber-600' : 'text-amber-400'
                  }`}
                />
                <span className="font-bold">Activities</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                  activeTab === 'activities'
                    ? 'bg-aditya-navy text-amber-400'
                    : 'bg-white/10 text-white'
                }`}
              >
                {activityFolderCount} {activityFolderCount === 1 ? 'Folder' : 'Folders'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('project_expos')}
              className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                activeTab === 'project_expos'
                  ? 'bg-white text-aditya-navy border-white shadow-lg'
                  : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderKanban
                  className={`w-5 h-5 ${
                    activeTab === 'project_expos' ? 'text-amber-600' : 'text-amber-400'
                  }`}
                />
                <span className="font-bold">Project Expo</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                  activeTab === 'project_expos'
                    ? 'bg-aditya-navy text-amber-400'
                    : 'bg-white/10 text-white'
                }`}
              >
                {expoFolderCount} {expoFolderCount === 1 ? 'Folder' : 'Folders'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('placements')}
              className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                activeTab === 'placements'
                  ? 'bg-white text-aditya-navy border-white shadow-lg'
                  : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <Award
                  className={`w-5 h-5 ${
                    activeTab === 'placements' ? 'text-amber-600' : 'text-amber-400'
                  }`}
                />
                <span className="font-bold">Placements</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                  activeTab === 'placements'
                    ? 'bg-aditya-navy text-amber-400'
                    : 'bg-white/10 text-white'
                }`}
              >
                {yearPlacements.length} {yearPlacements.length === 1 ? 'Student' : 'Students'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Active Tab Content */}
      {activeTab === 'activities' && (
        <FolderExplorer
          key={`act_${currentYear}`}
          section="activities"
          title={`Activities (${currentYear})`}
          subtitle={`All campus activities and sub-events recorded under Academic Year ${currentYear}.`}
          filterAcademicYear={currentYear}
        />
      )}

      {activeTab === 'project_expos' && (
        <FolderExplorer
          key={`expo_${currentYear}`}
          section="project_expos"
          title={`Project Expo (${currentYear})`}
          subtitle={`All technical exhibitions and student Project Expo held during Academic Year ${currentYear}.`}
          filterAcademicYear={currentYear}
        />
      )}

      {activeTab === 'placements' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-aditya-navy mb-6">
            Placements in Academic Year {currentYear}
          </h2>

          {yearPlacements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700">
                No placement records tagged with Academic Year {currentYear} yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {yearPlacements.map((student) => {
                const pkgVal = parsePackageNumber(student.packageLpa);
                return (
                  <div
                    key={student.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
                  >
                    <div className="relative h-52 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                      {student.photo ? (
                        <img
                          src={student.photo}
                          alt={student.studentName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCheck className="w-16 h-16 text-slate-300" />
                      )}
                      {pkgVal > 0 && (
                        <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-extrabold shadow">
                          ₹{pkgVal} LPA
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-slate-900">{student.studentName}</h3>
                      {student.fatherName && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          Son/Daughter of: {student.fatherName}
                        </p>
                      )}
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-aditya-blue">
                        <Building2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>{student.company}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}