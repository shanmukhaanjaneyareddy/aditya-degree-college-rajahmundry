import React, { useState, useEffect } from 'react';
import { UserPlus, Upload, Trash2, CheckCircle2, User, Award, Save } from 'lucide-react';
import { useCollegeData } from '../../context/CollegeDataContext';
import { uploadMediaToCloud } from '../../config/cloudinary';

function ManagementMemberCard({ member, index, onSave, onDelete, onPhotoUpload, isUploading }) {
  const [role, setRole] = useState(member.role || '');
  const [name, setName] = useState(member.name || '');
  const [qualification, setQualification] = useState(member.qualification || '');
  const [message, setMessage] = useState(member.message || '');
  const [isDirty, setIsDirty] = useState(false);

  // Sync local inputs when remote data updates externally
  useEffect(() => {
    setRole(member.role || '');
    setName(member.name || '');
    setQualification(member.qualification || '');
    setMessage(member.message || '');
    setIsDirty(false);
  }, [member.id, member.role, member.name, member.qualification, member.message]);

  const handleSave = async () => {
    await onSave(member.id, {
      role: role.trim(),
      name: name.trim(),
      qualification: qualification.trim(),
      message: message.trim(),
    });
    setIsDirty(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
      <div>
        {/* Top Row: Card Badge + Delete Button */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            <Award className="w-3.5 h-3.5" />
            Card #{index + 1}
          </span>

          <button
            type="button"
            onClick={() => onDelete(member)}
            title="Remove Member"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Portrait Preview & Upload */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-amber-400 flex items-center justify-center mb-2">
            {member.photo ? (
              <img
                src={member.photo}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-slate-300" />
            )}
          </div>

          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors">
            <Upload className="w-3.5 h-3.5 text-aditya-blue" />
            <span>{isUploading ? 'Uploading...' : 'Change Photo'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploading}
              onChange={(e) => onPhotoUpload(member.id, e.target.files?.[0])}
            />
          </label>
        </div>

        {/* Editable Fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Title / Designation (e.g., Chairman, Secretary)
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setIsDirty(true);
              }}
              placeholder="Designation / Title"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-aditya-navy focus:outline-none focus:ring-2 focus:ring-aditya-blue"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setIsDirty(true);
              }}
              placeholder="Member Name"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-aditya-blue"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Qualification
            </label>
            <input
              type="text"
              value={qualification}
              onChange={(e) => {
                setQualification(e.target.value);
                setIsDirty(true);
              }}
              placeholder="e.g., M.Tech., Ph.D."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-aditya-blue"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Message / Bio
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setIsDirty(true);
              }}
              placeholder="Leadership message..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-aditya-blue"
            />
          </div>
        </div>
      </div>

      {/* Explicit Save Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={!isDirty}
        className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-colors ${
          isDirty
            ? 'bg-aditya-navy hover:bg-aditya-blue text-white shadow-sm'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        <Save className="w-4 h-4" />
        <span>{isDirty ? 'Save Changes' : 'Saved'}</span>
      </button>
    </div>
  );
}

export default function ManageManagement() {
  const {
    data,
    updateManagementMember,
    addManagementMember,
    deleteManagementMember,
  } = useCollegeData();

  const [uploadingId, setUploadingId] = useState(null);
  const [savedMsg, setSavedMsg] = useState('');

  // New member form state
  const [newRole, setNewRole] = useState('');
  const [newName, setNewName] = useState('');
  const [newQualification, setNewQualification] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newPhoto, setNewPhoto] = useState('');
  const [uploadingNewPhoto, setUploadingNewPhoto] = useState(false);

  const showSavedToast = (msg = 'Changes synced live!') => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(''), 2500);
  };

  const handleSaveCard = async (id, updates) => {
    await updateManagementMember(id, updates);
    showSavedToast('Member details updated!');
  };

  const handlePhotoUpload = async (id, file) => {
    if (!file) return;
    setUploadingId(id);
    try {
      const url = await uploadMediaToCloud(file, 'management');
      await updateManagementMember(id, { photo: url });
      showSavedToast('Portrait updated!');
    } catch (err) {
      alert(err.message || 'Failed to upload portrait.');
    } finally {
      setUploadingId(null);
    }
  };

  const handleNewPhotoUpload = async (file) => {
    if (!file) return;
    setUploadingNewPhoto(true);
    try {
      const url = await uploadMediaToCloud(file, 'management');
      setNewPhoto(url);
    } catch (err) {
      alert(err.message || 'Failed to upload photo.');
    } finally {
      setUploadingNewPhoto(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newRole.trim() || !newName.trim()) {
      alert('Please enter both Designation/Title and Name.');
      return;
    }

    await addManagementMember({
      role: newRole,
      name: newName,
      qualification: newQualification,
      message: newMessage,
      photo: newPhoto,
    });

    setNewRole('');
    setNewName('');
    setNewQualification('');
    setNewMessage('');
    setNewPhoto('');
    showSavedToast('New management member added!');
  };

  const handleDeleteMember = async (member) => {
    if (!window.confirm(`Remove ${member.name || member.role} from Management?`)) return;
    await deleteManagementMember(member.id);
    showSavedToast('Member removed.');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Manage Leadership & Management Team
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Edit titles/designations (Chairman, Secretary, Principal, etc.), update names & portraits, or add new team members.
          </p>
        </div>

        {savedMsg && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{savedMsg}</span>
          </div>
        )}
      </div>

      {/* Add New Management Member Form */}
      <form
        onSubmit={handleAddMember}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center gap-2 text-aditya-navy font-bold text-base">
          <UserPlus className="w-5 h-5 text-amber-600" />
          <span>Add New Management Member</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Title / Designation *
            </label>
            <input
              type="text"
              placeholder="e.g., Chairman, Secretary, Dean"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-aditya-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Dr. N. Sesha Reddy"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-aditya-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Qualification (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., M.Sc., Ph.D."
              value={newQualification}
              onChange={(e) => setNewQualification(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-aditya-blue"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Leadership Message / Bio (Optional)
            </label>
            <input
              type="text"
              placeholder="Short message displayed on the Management card..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-aditya-blue"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors">
              <Upload className="w-4 h-4 text-aditya-blue" />
              <span>
                {uploadingNewPhoto
                  ? 'Uploading...'
                  : newPhoto
                  ? 'Photo Ready ✓'
                  : 'Upload Portrait'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingNewPhoto}
                onChange={(e) => handleNewPhotoUpload(e.target.files?.[0])}
              />
            </label>

            <button
              type="submit"
              disabled={uploadingNewPhoto}
              className="px-5 py-2.5 rounded-xl bg-aditya-navy hover:bg-aditya-blue text-white text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
            >
              Add Member
            </button>
          </div>
        </div>
      </form>

      {/* Existing Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.management.map((member, index) => (
          <ManagementMemberCard
            key={member.id}
            member={member}
            index={index}
            onSave={handleSaveCard}
            onDelete={handleDeleteMember}
            onPhotoUpload={handlePhotoUpload}
            isUploading={uploadingId === member.id}
          />
        ))}
      </div>
    </div>
  );
}