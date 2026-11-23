import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Building2, UserCheck, ArrowRight } from 'lucide-react';
import { useCollegeData } from '../context/CollegeDataContext';

const parsePackageNumber = (val) => {
  if (val === '' || val === null || val === undefined) return 0;
  const num = Number(String(val).replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? num : 0;
};

const normalizeAcademicYear = (yr) => {
  const s = String(yr || '').trim();
  // Normalize "2025-26" -> "2025-2026" so both formats match
  const shortMatch = s.match(/^(\d{4})-(\d{2})$/);
  if (shortMatch) {
    return `${shortMatch[1]}-20${shortMatch[2]}`;
  }
  return s;
};

export default function TopPackagesSection() {
  const { data } = useCollegeData();
  const { placements, topPackagesConfig } = data;

  const topStudents = useMemo(() => {
    let filtered = [...placements];

    if (
      topPackagesConfig.mode === 'academic_year' &&
      topPackagesConfig.selectedAcademicYear
    ) {
      const targetYear = normalizeAcademicYear(topPackagesConfig.selectedAcademicYear);
      filtered = filtered.filter(
        (p) => normalizeAcademicYear(p.academicYear) === targetYear
      );
    }

    const sorted = filtered.sort(
      (a, b) => parsePackageNumber(b.packageLpa) - parsePackageNumber(a.packageLpa)
    );

    if (sorted.length <= 10) return sorted;

    // Include everyone in the top 10 PLUS all students tied with the 10th student's LPA
    const cutoffPackage = parsePackageNumber(sorted[9].packageLpa);
    return sorted.filter(
      (student, idx) => idx < 10 || parsePackageNumber(student.packageLpa) === cutoffPackage
    );
  }, [placements, topPackagesConfig]);

  // Hide #1, #2... rank badges if all displayed students have the same package
  const allSamePackage = useMemo(() => {
    if (topStudents.length <= 1) return true;
    const firstPkg = parsePackageNumber(topStudents[0].packageLpa);
    return topStudents.every((s) => parsePackageNumber(s.packageLpa) === firstPkg);
  }, [topStudents]);

  const headingBadge =
    topPackagesConfig.mode === 'academic_year'
      ? `Academic Year ${topPackagesConfig.selectedAcademicYear} — Highest Package`
      : 'Highest Package';

  return (
    <section className="py-14 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              {headingBadge}
            </span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-aditya-navy">
              Highest Package Achievers
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-600">
              Celebrating our top-placed students securing premier offers across leading organizations.
            </p>
          </div>

          <Link
            to="/placements"
            className="inline-flex items-center gap-2 text-sm font-bold text-aditya-blue hover:text-aditya-navy transition-colors"
          >
            <span>View All Year-Wise Placements</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {topStudents.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center shadow-sm">
            <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">
              No Placement Records Added Yet
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Once placement records are added in the Admin Portal, the highest
              package achievers will automatically be showcased here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {topStudents.map((student, idx) => {
              const pkgVal = parsePackageNumber(student.packageLpa);
              return (
                <div
                  key={student.id || `${student.studentName}-${idx}`}
                  className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col"
                >
                  {/* Rank Badge (shown only when packages differ) */}
                  {!allSamePackage && (
                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-aditya-navy text-amber-400 text-xs font-extrabold shadow">
                      #{idx + 1}
                    </div>
                  )}

                  {/* Package Pill */}
                  {pkgVal > 0 && (
                    <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-extrabold shadow">
                      ₹{pkgVal} LPA
                    </div>
                  )}

                  {/* Student Photo */}
                  <div className="h-52 w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={student.studentName || 'Placed Student'}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <UserCheck className="w-16 h-16 text-slate-300" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                        {student.studentName || 'Student'}
                      </h3>
                      {student.company && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-aditya-blue">
                          <Building2 className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                          <span className="line-clamp-1">{student.company}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Batch {student.placementYear || '—'}</span>
                      {student.academicYear && <span>AY {student.academicYear}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}