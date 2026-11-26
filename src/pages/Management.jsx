import React, { useState, useEffect } from 'react';
import { Award, User, X } from 'lucide-react';
import { useCollegeData } from '../context/CollegeDataContext';

export default function Management() {
  const { data } = useCollegeData();
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openMemberPopup = (member) => {
    setSelectedMember(member);
    requestAnimationFrame(() => {
      setIsModalOpen(true);
    });
  };

  const closeMemberPopup = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedMember(null);
    }, 250);
  };

  useEffect(() => {
    if (!selectedMember) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeMemberPopup();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMember]);

  const getMemberMessage = (member) =>
    (member?.message && member.message.trim()) ||
    (member?.about && member.about.trim()) ||
    '';

  const selectedName = selectedMember?.name?.trim() || '';
  const selectedRole = selectedMember?.role?.trim() || '';
  const selectedQualification = selectedMember?.qualification?.trim() || '';
  const selectedMessage = selectedMember ? getMemberMessage(selectedMember) : '';

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

      {/* Leadership Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.management.map((member) => {
          const qualification = member.qualification?.trim() || '';

          return (
            <button
              type="button"
              key={member.id}
              onClick={() => openMemberPopup(member)}
              className="group bg-white rounded-3xl border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {/* Designation Pill */}
              <span className="px-4 py-1 rounded-full bg-aditya-navy text-amber-400 text-xs font-extrabold uppercase tracking-wider mb-6">
                {member.role}
              </span>

              {/* Circular Cropped Photo */}
              <div className="relative w-40 h-40 rounded-full p-1.5 bg-gradient-to-tr from-amber-500 via-amber-300 to-aditya-navy shadow-lg mb-5 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextSibling) {
                          e.currentTarget.nextSibling.style.display = 'flex';
                        }
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

              {qualification && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-aditya-blue bg-blue-50 px-3 py-1 rounded-full">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>{qualification}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Individual Member Popup with Smooth Transition */}
      {selectedMember && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
            isModalOpen
              ? 'bg-slate-950/75 backdrop-blur-xs opacity-100'
              : 'bg-slate-950/0 backdrop-blur-none opacity-0'
          }`}
          role="dialog"
          aria-modal="true"
          onClick={closeMemberPopup}
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
                onClick={closeMemberPopup}
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
                  {selectedMember.photo ? (
                    <img
                      src={selectedMember.photo}
                      alt={selectedName}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>
              </div>

              {selectedName && (
                <h3 className="text-2xl font-extrabold text-slate-900">
                  {selectedName}
                </h3>
              )}

              {selectedRole && (
                <div className="mt-2">
                  <span className="inline-block px-4 py-1 rounded-full bg-aditya-navy text-amber-400 text-xs font-extrabold uppercase tracking-wider">
                    {selectedRole}
                  </span>
                </div>
              )}

              {selectedQualification && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-aditya-blue bg-blue-50 px-3 py-1 rounded-full">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>{selectedQualification}</span>
                </div>
              )}

              {selectedMessage && (
                <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-5 text-left">
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedMessage}
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