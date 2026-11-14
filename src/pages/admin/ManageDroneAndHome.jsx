import React, { useState } from 'react';
import { Video, Trophy, Upload, CheckCircle2 } from 'lucide-react';
import { useCollegeData } from '../../context/CollegeDataContext';
import { uploadMediaToCloud } from '../../config/cloudinary';

export default function ManageDroneAndHome() {
  const { data, updateDroneVideo, updateTopPackagesConfig } = useCollegeData();
  const [title, setTitle] = useState(data.droneVideo.title || '');
  const [subtitle, setSubtitle] = useState(data.droneVideo.subtitle || '');
  const [videoUrl, setVideoUrl] = useState(data.droneVideo.url || '');
  const [uploading, setUploading] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const handleVideoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setSavedMsg('');
    try {
      const uploadedUrl = await uploadMediaToCloud(file, 'video');
      setVideoUrl(uploadedUrl);
      updateDroneVideo({ url: uploadedUrl, title, subtitle });
      setSavedMsg('Drone video uploaded and updated on Home page.');
    } catch (err) {
      alert('Video upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDetails = (e) => {
    e.preventDefault();
    updateDroneVideo({ url: videoUrl, title, subtitle });
    setSavedMsg('Home banner & drone settings saved.');
  };

  return (
    <div className="space-y-8">
      {savedMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* 1. Drone Video Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5 mb-5">
          <Video className="w-5 h-5 text-aditya-blue" />
          <h2 className="text-lg font-extrabold text-aditya-navy">
            Campus Drone View Video & Hero Banner
          </h2>
        </div>

        <form onSubmit={handleSaveDetails} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Hero Main Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Hero Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Upload Drone Video File (MP4 / WebM)
              </label>
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-aditya-blue cursor-pointer text-sm font-semibold text-slate-700 bg-slate-50">
                <Upload className="w-4 h-4 text-aditya-blue" />
                <span>{uploading ? 'Uploading Video...' : 'Choose Drone Video File'}</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFile}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Or Direct Video CDN URL
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-aditya-navy hover:bg-aditya-blue text-amber-400 font-bold text-sm"
          >
            Save Home Video Settings
          </button>
        </form>
      </div>

      {/* 2. Top 10 Highest Packages Home Display Mode */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <Trophy className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-extrabold text-aditya-navy">
            Home Page Top 10 Highest Packages Display Mode
          </h2>
        </div>

        <p className="text-xs text-slate-600 mb-4">
          Choose whether the Home page leaderboard shows the All-Time Top 10 highest packages or filters by a specific Academic Year.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <select
            value={data.topPackagesConfig.mode}
            onChange={(e) => {
              updateTopPackagesConfig({ mode: e.target.value });
              setSavedMsg('Top 10 Packages display mode updated.');
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
          >
            <option value="all_time">All-Time Top 10 Highest Packages</option>
            <option value="academic_year">Academic Year-Wise Top 10</option>
          </select>

          {data.topPackagesConfig.mode === 'academic_year' && (
            <select
              value={data.topPackagesConfig.selectedAcademicYear}
              onChange={(e) => {
                updateTopPackagesConfig({ selectedAcademicYear: e.target.value });
                setSavedMsg('Selected Academic Year for Top 10 updated.');
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
            >
              {data.academicYears.map((yr) => (
                <option key={yr} value={yr}>
                  Academic Year {yr}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}