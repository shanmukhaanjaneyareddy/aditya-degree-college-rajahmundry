import React from 'react';
import { Code2, GraduationCap, Award, Building2 } from 'lucide-react';

const FACULTY_MENTOR = {
  name: 'P. MANIKANTA',
  role: 'Project Guide and Advisor',
  department: 'Computer Science Faculty',
  college: 'Aditya Degree College, Rajahmundry Autonomous',
  initials: 'PM',
  photo: '/faculty-manikanta.png',
};

const TEAM_MEMBERS = [
  {
    name: 'SHANMUKH NALLAMILLI',
    role: 'Team Lead & Database/Deployment',
    section: 'B.Sc-AIR-A',
    college: 'Aditya Degree College, Rajahmundry Autonomous',
    initials: 'SN',
    photo: '/shanmukh.jpg',
  },
  {
    name: 'K.S.V. HARIRAM',
    role: 'Admin Dashboard & Folder Controls',
    section: 'B.Sc-AIR-A',
    college: 'Aditya Degree College, Rajahmundry Autonomous',
    initials: 'KH',
    photo: '/hariram.jpg',
  },
  {
    name: 'V.S.G. KARTHIKEYA',
    role: 'Public Website & UI Design',
    section: 'B.Sc-CS-A',
    college: 'Aditya Degree College, Rajahmundry Autonomous',
    initials: 'VK',
    photo: '/karthikeya.jpg',
  },
  {
    name: 'P. NANDINI',
    role: 'Gallery & YouTube Integration',
    section: 'B.Sc-CS-A',
    college: 'Aditya Degree College, Rajahmundry Autonomous',
    initials: 'PN',
    photo: '/nandini.jpg',
  },
  {
    name: 'Sd. JAINULABDIN',
    role: 'Placements & Bulk Data Upload',
    section: 'B.Sc-CS-A',
    college: 'Aditya Degree College, Rajahmundry Autonomous',
    initials: 'SJ',
    photo: '/jainulabdin.jpg',
  },
];

function CircleAvatar({ src, alt, initials }) {
  return (
    <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-slate-100 via-blue-50 to-amber-50 flex items-center justify-center">
      <img
        src={src}
        alt={alt}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const fallback = e.currentTarget.nextElementSibling;
          if (fallback) fallback.style.display = 'flex';
        }}
        className="w-full h-full object-cover object-top rounded-full"
      />
      <span
        aria-hidden="true"
        className="hidden absolute inset-0 items-center justify-center bg-aditya-navy text-amber-400 text-3xl font-extrabold tracking-tight"
      >
        {initials}
      </span>
    </div>
  );
}

export default function AboutDevelopmentTeam() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <section className="bg-aditya-navy text-white py-12 sm:py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Code2 className="w-3.5 h-3.5" />
            Portal Engineering &amp; Design
          </span>
          <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">
            About <span className="text-amber-400">Development Team</span>
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
            Designed, engineered, and maintained for Aditya Degree College Rajahmundry Autonomous
            under the guidance of our Computer Science faculty.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Project Guide & Advisor */}
        <div>
          <div className="text-center mb-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600">
              Faculty Mentorship
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-aditya-navy">
              Project Guide and Advisor
            </h2>
          </div>

          <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all p-7 text-center">
            <CircleAvatar
              src={FACULTY_MENTOR.photo}
              alt={FACULTY_MENTOR.name}
              initials={FACULTY_MENTOR.initials}
            />

            <div className="mt-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                {FACULTY_MENTOR.role}
              </span>

              <h3 className="mt-3 text-xl font-extrabold text-slate-900">
                {FACULTY_MENTOR.name}
              </h3>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs">
                <p className="inline-flex items-center justify-center gap-1.5 font-bold text-aditya-blue">
                  <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{FACULTY_MENTOR.department}</span>
                </p>
                <p className="flex items-center justify-center gap-1.5 text-slate-600 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{FACULTY_MENTOR.college}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Student Developers Grid */}
        <div>
          <div className="text-center mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600">
              Student Developers
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-aditya-navy">
              Meet Our Development Team
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <article
                key={member.name}
                className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all p-6 flex flex-col justify-between text-center"
              >
                <div>
                  <CircleAvatar
                    src={member.photo}
                    alt={member.name}
                    initials={member.initials}
                  />

                  <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                    {member.name}
                  </h3>

                  <p className="mt-1.5 text-sm font-bold text-aditya-blue">
                    {member.role}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{member.section}</span>
                  </div>
                  <p className="flex items-center justify-center gap-1.5 text-slate-600 font-semibold pt-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{member.college}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}