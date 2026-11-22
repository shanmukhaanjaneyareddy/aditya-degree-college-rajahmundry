import React, { useState, useMemo, useEffect } from 'react';
import { Award, Building2, Search, UserCheck, Briefcase, Mail } from 'lucide-react';
import { useCollegeData } from '../context/CollegeDataContext';

const parsePackageNumber = (val) => {
  if (val === '' || val === null || val === undefined) return 0;
  const num = Number(String(val).replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? num : 0;
};

export default function Placements() {
  const { data } = useCollegeData();
  const sortedYears = useMemo(
    () =>
      [...data.placementYears]
        .map((y) => String(y).trim())
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a)),
    [data.placementYears]
  );

  const [selectedYear, setSelectedYear] = useState(sortedYears[0] || '2026');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (sortedYears.length > 0 && !sortedYears.includes(selectedYear)) {
      setSelectedYear(sortedYears[0]);
    }
  }, [sortedYears, selectedYear]);

  const yearPlacements = useMemo(() => {
    return data.placements
      .filter((p) => String(p.placementYear ?? '').trim() === String(selectedYear).trim())
      .filter((p) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          String(p.studentName || '').toLowerCase().includes(q) ||
          String(p.fatherName || '').toLowerCase().includes(q) ||
          String(p.gmail || '').toLowerCase().includes(q) ||
          String(p.company || '').toLowerCase().includes(q) ||
          String(p.branch || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => parsePackageNumber(b.packageLpa) - parsePackageNumber(a.packageLpa));
  }, [data.placements, selectedYear, searchTerm]);

  const highestPackage = useMemo(() => {
    if (yearPlacements.length === 0) return 0;
    return Math.max(...yearPlacements.map((p) => parsePackageNumber(p.packageLpa)));
  }, [yearPlacements]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="inline-block px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
            Career & Training Cell
          </span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-extrabold text-aditya-navy">
            Campus Placements
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Year-wise placement records starting from 2026 showcasing student selections and packages.
          </p>
        </div>

        {/* Year Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {sortedYears.map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => setSelectedYear(yr)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedYear === yr
                  ? 'bg-aditya-navy text-amber-400 shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-400'
              }`}
            >
              Batch {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Stats & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-aditya-blue">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Total Placed ({selectedYear})
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {yearPlacements.length} Students
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Highest Package ({selectedYear})
            </p>
            <p className="text-2xl font-extrabold text-emerald-600">
              {highestPackage > 0 ? `₹${highestPackage} LPA` : '—'}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student or company..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-aditya-blue"
            />
          </div>
        </div>
      </div>

      {/* Placed Students Grid */}
      {yearPlacements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">
            No Placement Records Found for {selectedYear}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Select another year or check back after placement drives are updated.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {yearPlacements.map((student, idx) => {
            const pkgVal = parsePackageNumber(student.packageLpa);
            return (
              <div
                key={student.id || `${student.studentName}-${idx}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col"
              >
                <div className="relative h-56 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt={student.studentName || 'Placed Student'}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
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

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {student.studentName || 'Student'}
                    </h3>
                    {student.fatherName && (
                      <p className="text-xs font-medium text-slate-600 mt-0.5">
                        S/o D/o: {student.fatherName}
                      </p>
                    )}
                    {student.branch && (
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        {student.branch}
                      </p>
                    )}
                    {student.company && (
                      <div className="mt-3 flex items-center gap-2 text-sm font-bold text-aditya-blue">
                        <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{student.company}</span>
                      </div>
                    )}
                    {student.gmail && (
                      <a
                        href={`mailto:${student.gmail}`}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-aditya-blue break-all"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{student.gmail}</span>
                      </a>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Year: {student.placementYear}</span>
                    {student.academicYear && <span>AY {student.academicYear}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}