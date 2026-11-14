import React from 'react';
import { Award, User } from 'lucide-react';
import { useCollegeData } from '../context/CollegeDataContext';

export default function Management() {
  const { data } = useCollegeData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-block px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
          Leadership & Governance
        </span>
        <h1 className="mt-2 text-3xl sm:text-5xl font-extrabold text-aditya-navy">
          College Management
        </h1>
        <p className="mt-3 text-slate-600 text-sm sm:text-base">
          Guided by visionary leaders committed to academic excellence, student empowerment,
          and institutional integrity.
        </p>
      </div>

      {/* 6 Leadership Cards with Circular-Cropped Portraits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.management.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all p-8 flex flex-col items-center text-center"
          >
            {/* Designation Pill */}
            <span className="px-4 py-1 rounded-full bg-aditya-navy text-amber-400 text-xs font-extrabold uppercase tracking-wider mb-6">
              {member.role}
            </span>

            {/* Circular Cropped Photo */}
            <div className="relative w-40 h-40 rounded-full p-1.5 bg-gradient-to-tr from-amber-500 via-amber-300 to-aditya-navy shadow-lg mb-5">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }}
                    className="w-full h-full object-cover object-top"
                  />
                ) : null}
                <div
                  style={{ display: member.photo ? 'none' : 'flex' }}
                  className="w-full h-full items-center justify-center bg-slate-100 text-slate-400"
                >
                  <User className="w-16 h-16" />
                </div>
              </div>
            </div>

            {/* Name & Qualification */}
            <h2 className="text-xl font-extrabold text-slate-900">
              {member.name}
            </h2>

            <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-aditya-blue bg-blue-50 px-3 py-1 rounded-full">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>{member.qualification}</span>
            </div>

            {/* Short Bio Line */}
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              {member.about}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}