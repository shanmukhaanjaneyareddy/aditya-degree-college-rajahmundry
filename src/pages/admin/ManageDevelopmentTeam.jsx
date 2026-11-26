import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Award,
  GraduationCap,
  Save,
  ExternalLink,
  MessageSquareQuote,
  Globe,
} from 'lucide-react';
import { useCollegeData } from '../../context/CollegeDataContext';

function FacultyAdminCard({ mentor, onSave }) {
  const [message, setMessage] = useState(mentor.message || '');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setMessage(mentor.message || '');
    setIsDirty(false);
  }, [mentor.id, mentor.message]);

  const handleSave = async () => {
    await onSave(mentor.id, message);
    setIsDirty(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border-2 border-amber-400 shrink-0 flex items-center justify-center">
            {mentor.photo ? (
              <img
                src={mentor.photo}
                alt={mentor.name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextSibling) {
                    e.currentTarget.nextSibling.style.display = 'flex';
                  }
                }}
                className="w-full h-full object-cover object-top"
              />
            ) : null}
            <span
              style={{ display: mentor.photo ? 'none' : 'flex' }}
              className="w-full h-full items-center justify-center bg-aditya-navy text-amber-400 font-extrabold text-base"
            >
              {mentor.initials}
            </span>
          </div>

          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
              <Award className="w-3 h-3 text-amber-600" />
              {mentor.role}
            </span>
            <h4 className="mt-1 text-base font-extrabold text-slate-900 truncate">
              {mentor.name}
            </h4>
            <p className="text-xs font-semibold text-aditya-blue truncate">
              {mentor.department}
            </p>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            <MessageSquareQuote className="w-3.5 h-3.5 text-amber-600" />
            <span>Faculty Message (Shown in Popup)</span>
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setIsDirty(true);
            }}
            placeholder={`Enter message from ${mentor.name}...`}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-aditya-blue"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!isDirty}
        className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-colors ${
          isDirty
            ? 'bg-aditya-navy hover:bg-aditya-blue text-white shadow-sm cursor-pointer'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        <Save className="w-4 h-4" />
        <span>{isDirty ? 'Save Message' : 'Saved'}</span>
      </button>
    </div>
  );
}

function StudentAdminCard({ student, onSave }) {
  const [portfolioUrl, setPortfolioUrl] = useState(student.portfolioUrl || '');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setPortfolioUrl(student.portfolioUrl || '');
    setIsDirty(false);
  }, [student.id, student.portfolioUrl]);

  const handleSave = async () => {
    await onSave(student.id, portfolioUrl);
    setIsDirty(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0 flex items-center justify-center">
            {student.photo ? (
              <img
                src={student.photo}
                alt={student.name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextSibling) {
                    e.currentTarget.nextSibling.style.display = 'flex';
                  }
                }}
                className="w-full h-full object-cover object-top"
              />
            ) : null}
            <span
              style={{ display: student.photo ? 'none' : 'flex' }}
              className="w-full h-full items-center justify-center bg-aditya-navy text-amber-400 font-extrabold text-base"
            >
              {student.initials}
            </span>
          </div>

          <div className="min-w-0">
            <h4 className="text-base font-extrabold text-slate-900 truncate">
              {student.name}
            </h4>
            <p className="text-xs font-bold text-aditya-blue truncate">
              {student.role}
            </p>
            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold">
              <GraduationCap className="w-3 h-3 text-amber-600" />
              <span>{student.section}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <Globe className="w-3.5 h-3.5 text-aditya-blue" />
              <span>Portfolio Link</span>
            </label>
            {portfolioUrl.trim() && (
              <a
                href={
                  /^https?:\/\//i.test(portfolioUrl.trim())
                    ? portfolioUrl.trim()
                    : `https://${portfolioUrl.trim()}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-aditya-blue hover:underline"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <input
            type="url"
            value={portfolioUrl}
            onChange={(e) => {
              setPortfolioUrl(e.target.value);
              setIsDirty(true);
            }}
            placeholder="https://your-portfolio-link.vercel.app/"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-aditya-blue"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!isDirty}
        className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-colors ${
          isDirty
            ? 'bg-aditya-navy hover:bg-aditya-blue text-white shadow-sm cursor-pointer'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        <Save className="w-4 h-4" />
        <span>{isDirty ? 'Save Portfolio Link' : 'Saved'}</span>
      </button>
    </div>
  );
}

export default function ManageDevelopmentTeam() {
  const {
    data,
    updateFacultyMentorMessage,
    updateStudentPortfolioUrl,
  } = useCollegeData();

  const [savedMsg, setSavedMsg] = useState('');

  const showSavedToast = (msg) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(''), 2500);
  };

  const handleSaveFacultyMessage = async (id, message) => {
    await updateFacultyMentorMessage(id, message);
    showSavedToast('Faculty message updated!');
  };

  const handleSaveStudentPortfolio = async (id, portfolioUrl) => {
    await updateStudentPortfolioUrl(id, portfolioUrl);
    showSavedToast('Student portfolio link updated!');
  };

  const facultyList = data?.developmentTeam?.faculty || [];
  const studentList = data?.developmentTeam?.students || [];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Manage Development Team
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Add or update popup messages for faculty mentors and portfolio links for student developers.
          </p>
        </div>

        {savedMsg && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{savedMsg}</span>
          </div>
        )}
      </div>

      {/* Faculty Mentorship Section (Message Only) */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-extrabold text-aditya-navy">
            Faculty Mentorship (Messages)
          </h3>
          <p className="text-xs text-slate-500">
            Clicking a faculty card on the About Development Team page displays their message in a popup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {facultyList.map((mentor) => (
            <FacultyAdminCard
              key={mentor.id}
              mentor={mentor}
              onSave={handleSaveFacultyMessage}
            />
          ))}
        </div>
      </section>

      {/* Student Developers Section (Portfolio Link Only) */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-extrabold text-aditya-navy">
            Student Developers (Portfolio Links)
          </h3>
          <p className="text-xs text-slate-500">
            Clicking a student card on the About Development Team page redirects to their portfolio URL.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studentList.map((student) => (
            <StudentAdminCard
              key={student.id}
              student={student}
              onSave={handleSaveStudentPortfolio}
            />
          ))}
        </div>
      </section>
    </div>
  );
}