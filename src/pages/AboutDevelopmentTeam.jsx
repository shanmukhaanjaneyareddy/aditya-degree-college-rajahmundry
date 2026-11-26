import React, { useState, useEffect } from 'react';
import {
  Code2,
  GraduationCap,
  Award,
  Building2,
  X,
  ExternalLink,
} from 'lucide-react';
import { useCollegeData } from '../context/CollegeDataContext';

function CircleAvatar({ src, alt, initials, sizeClass = 'w-36 h-36 sm:w-40 sm:h-40' }) {
  return (
    <div
      className={`relative ${sizeClass} mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-slate-100 via-blue-50 to-amber-50 flex items-center justify-center`}
    >
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

const normalizeUrl = (url) => {
  const trimmed = String(url || '').trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const formatMentorDisplay = (mentor) => {
  if (!mentor) return mentor;
  const isSaroja =
    mentor.id === 'fac-saroja' ||
    /p\.?\s*saroja/i.test(mentor.name || '');
  if (isSaroja) {
    return {
      ...mentor,
      name: 'P. LAKSHMI SAROJA',
      initials: 'PLS',
    };
  }
  return mentor;
};

export default function AboutDevelopmentTeam() {
  const { data } = useCollegeData();
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const facultyMentors = (data?.developmentTeam?.faculty || []).map(formatMentorDisplay);
  const teamMembers = data?.developmentTeam?.students || [];

  const openMentorPopup = (mentor) => {
    setSelectedMentor(mentor);
    requestAnimationFrame(() => {
      setIsModalOpen(true);
    });
  };

  const closeMentorPopup = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedMentor(null);
    }, 250);
  };

  useEffect(() => {
    if (!selectedMentor) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeMentorPopup();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMentor]);

  const selectedMentorName = selectedMentor?.name?.trim() || '';
  const selectedMentorRole = selectedMentor?.role?.trim() || '';
  const selectedMentorQualification =
    selectedMentor?.qualification?.trim() || selectedMentor?.department?.trim() || '';
  const selectedMentorMessage = selectedMentor?.message?.trim() || '';

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
            under the guidance of our faculty mentorship and Computer Science team.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Project Advisor and Guide */}
        <div>
          <div className="text-center mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600">
              Faculty Mentorship
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-aditya-navy">
              Project Advisor and Guide
            </h2>
          </div>

          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {facultyMentors.map((mentor) => (
              <button
                type="button"
                key={mentor.id || mentor.name}
                onClick={() => openMentorPopup(mentor)}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-7 text-center flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <div className="w-full">
                  <div className="group-hover:scale-105 transition-transform duration-300">
                    <CircleAvatar
                      src={mentor.photo}
                      alt={mentor.name}
                      initials={mentor.initials}
                    />
                  </div>

                  <div className="mt-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      {mentor.role}
                    </span>

                    <h3 className="mt-3 text-xl font-extrabold text-slate-900">
                      {mentor.name}
                    </h3>
                  </div>
                </div>

                <div className="w-full mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs">
                  {mentor.department && (
                    <p className="inline-flex items-center justify-center gap-1.5 font-bold text-aditya-blue">
                      <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{mentor.department}</span>
                    </p>
                  )}
                  <p className="flex items-center justify-center gap-1.5 text-slate-600 font-semibold">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{mentor.college}</span>
                  </p>
                </div>
              </button>
            ))}
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
            {teamMembers.map((member) => {
              const href = normalizeUrl(member.portfolioUrl);
              const CardTag = href ? 'a' : 'article';
              const linkProps = href
                ? {
                    href,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    title: `Open ${member.name}'s Portfolio`,
                  }
                : {};

              return (
                <CardTag
                  key={member.id || member.name}
                  {...linkProps}
                  className={`group bg-white rounded-2xl border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between text-center ${
                    href ? 'hover:-translate-y-1 cursor-pointer' : ''
                  }`}
                >
                  <div>
                    <div className={href ? 'group-hover:scale-105 transition-transform duration-300' : ''}>
                      <CircleAvatar
                        src={member.photo}
                        alt={member.name}
                        initials={member.initials}
                      />
                    </div>

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
                    {href && (
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 group-hover:text-aditya-navy transition-colors">
                          <span>View Portfolio</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    )}
                  </div>
                </CardTag>
              );
            })}
          </div>
        </div>
      </div>

      {/* Faculty Popup with Smooth Transition */}
      {selectedMentor && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
            isModalOpen
              ? 'bg-slate-950/75 backdrop-blur-xs opacity-100'
              : 'bg-slate-950/0 backdrop-blur-none opacity-0'
          }`}
          role="dialog"
          aria-modal="true"
          onClick={closeMentorPopup}
        >
          <div
            className={`relative z-[101] w-full max-w-lg rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ease-out ${
              isModalOpen
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-4'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Header Bar with Close (X) Button */}
            <div className="flex items-center justify-end bg-aditya-navy px-6 py-4 text-white">
              <button
                type="button"
                onClick={closeMentorPopup}
                aria-label="Close popup"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-amber-500 text-white hover:text-aditya-navy transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Name, Designation, Qualification & Optional Message */}
            <div className="p-6 sm:p-8 text-center max-h-[82vh] overflow-y-auto">
              <div className="relative w-28 h-28 mx-auto rounded-full p-1 bg-gradient-to-tr from-amber-500 via-amber-300 to-aditya-navy shadow-md mb-4">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                  {selectedMentor.photo ? (
                    <img
                      src={selectedMentor.photo}
                      alt={selectedMentorName}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <span className="text-2xl font-extrabold text-aditya-navy">
                      {selectedMentor.initials}
                    </span>
                  )}
                </div>
              </div>

              {selectedMentorName && (
                <h3 className="text-2xl font-extrabold text-slate-900">
                  {selectedMentorName}
                </h3>
              )}

              {selectedMentorRole && (
                <div className="mt-2">
                  <span className="inline-block px-4 py-1 rounded-full bg-aditya-navy text-amber-400 text-xs font-extrabold uppercase tracking-wider">
                    {selectedMentorRole}
                  </span>
                </div>
              )}

              {selectedMentorQualification && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-aditya-blue bg-blue-50 px-3 py-1 rounded-full">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>{selectedMentorQualification}</span>
                </div>
              )}

              {selectedMentorMessage && (
                <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-5 text-left">
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedMentorMessage}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}