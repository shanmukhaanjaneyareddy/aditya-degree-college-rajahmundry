import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Award,
  Plus,
  Upload,
  Trash2,
  Edit2,
  Check,
  X,
  UserCheck,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useCollegeData } from '../../context/CollegeDataContext';
import { uploadMediaToCloud } from '../../config/cloudinary';

const EXPECTED_HEADERS = [
  'name',
  'company name',
  'package',
  'course/branch',
  'placement year',
  'academic year',
  'photo id',
];

const buildStudentPhotoUrl = (photoId) => {
  const cleaned = String(photoId || '').trim();
  if (!cleaned) return '';
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return `https://analysis.aditya.ac.in/uploads/student_photos/${encodeURIComponent(
    cleaned
  )}.jpg`;
};

const extractPhotoIdFromUrl = (url) => {
  if (!url) return '';
  const match = url.match(/\/student_photos\/([^/]+)\.jpg$/i);
  return match ? decodeURIComponent(match[1]) : '';
};

const normalizeHeader = (val) =>
  String(val || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

export default function ManagePlacements() {
  const {
    data,
    addPlacementYear,
    editPlacementYear,
    deletePlacementYear,
    addPlacementRecord,
    updatePlacementRecord,
    deletePlacementRecord,
    bulkImportPlacements,
  } = useCollegeData();

  // Year management state
  const [newYear, setNewYear] = useState('');
  const [editingYear, setEditingYear] = useState(null);
  const [editYearVal, setEditYearVal] = useState('');

  // Bulk Excel/CSV import state
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null); // { type: 'success' | 'error', message: string }

  // New student form state
  const [studentName, setStudentName] = useState('');
  const [branch, setBranch] = useState('');
  const [company, setCompany] = useState('');
  const [packageLpa, setPackageLpa] = useState('');
  const [placementYear, setPlacementYear] = useState(
    data.placementYears[0] || '2026'
  );
  const [academicYear, setAcademicYear] = useState(
    data.academicYears[0] || '2025-2026'
  );
  const [photoId, setPhotoId] = useState('');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Inline edit existing student
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [uploadingEditPhoto, setUploadingEditPhoto] = useState(false);

  useEffect(() => {
    if (
      data.placementYears.length > 0 &&
      !data.placementYears.includes(placementYear)
    ) {
      setPlacementYear(data.placementYears[0]);
    }
  }, [data.placementYears, placementYear]);

  const handleAddYear = (e) => {
    e.preventDefault();
    if (!newYear.trim()) return;
    addPlacementYear(newYear.trim());
    setNewYear('');
  };

  const handleDeleteYear = (yr) => {
    if (
      !window.confirm(
        `Delete placement year "${yr}"? Existing student records will remain in the table below.`
      )
    ) {
      return;
    }
    deletePlacementYear(yr);
    if (editingYear === yr) {
      setEditingYear(null);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'name,company name,package,course/branch,placement year,academic year,photo id\n' +
      'K. Sai Charan,TCS Digital,12.5,B.Sc Artificial Intelligence,2026,2025-2026,23241A0501\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'placements_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus(null);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      setImportStatus({
        type: 'error',
        message: 'Invalid file format. Please upload only .xlsx or .csv files.',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Read as 2D array so we can strictly verify exact column order & names
      const rows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false,
      });

      if (!rows || rows.length === 0) {
        setImportStatus({
          type: 'error',
          message: 'The uploaded file is empty.',
        });
        return;
      }

      const fileHeaders = rows[0]
        .slice(0, EXPECTED_HEADERS.length)
        .map(normalizeHeader);

      const isValidStructure =
        EXPECTED_HEADERS.every((expected, i) => fileHeaders[i] === expected) &&
        rows[0].slice(EXPECTED_HEADERS.length).every((extra) => String(extra || '').trim() === '');

      if (!isValidStructure) {
        setImportStatus({
          type: 'error',
          message:
            'Invalid column structure. File columns must be in this exact order: name, company name, package, course/branch, placement year, academic year, photo id',
        });
        return;
      }

      const dataRows = rows.slice(1).filter((row) =>
        row.some((cell) => String(cell ?? '').trim() !== '')
      );

      if (dataRows.length === 0) {
        setImportStatus({
          type: 'error',
          message: 'No student rows found below the header row.',
        });
        return;
      }

      const parsedRecords = dataRows.map((row) => {
        const rawName = String(row[0] ?? '').trim();
        const rawCompany = String(row[1] ?? '').trim();
        const rawPkg = String(row[2] ?? '').trim();
        const rawBranch = String(row[3] ?? '').trim();
        const rawPlacementYear = String(row[4] ?? '').trim();
        const rawAcademicYear = String(row[5] ?? '').trim();
        const rawPhotoId = String(row[6] ?? '').trim();

        const numericPkg =
          rawPkg !== '' && !Number.isNaN(Number(rawPkg)) ? Number(rawPkg) : rawPkg;

        return {
          studentName: rawName,
          company: rawCompany,
          packageLpa: numericPkg,
          branch: rawBranch,
          placementYear: rawPlacementYear,
          academicYear: rawAcademicYear,
          photoId: rawPhotoId,
          photo: buildStudentPhotoUrl(rawPhotoId),
        };
      });

      await bulkImportPlacements(parsedRecords);

      setImportStatus({
        type: 'success',
        message: `Successfully imported ${parsedRecords.length} placement record(s)! Any new placement/academic years were automatically created.`,
      });
    } catch (err) {
      setImportStatus({
        type: 'error',
        message: 'Failed to read file: ' + (err.message || 'Unknown error'),
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleStudentPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadMediaToCloud(file, 'image');
      setUploadedPhotoUrl(url);
      setPhotoId('');
    } catch (err) {
      alert('Photo upload failed: ' + err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleEditStudentPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingEditPhoto(true);
    try {
      const url = await uploadMediaToCloud(file, 'image');
      setEditForm((prev) => ({
        ...prev,
        photoId: '',
        photo: url,
      }));
    } catch (err) {
      alert('Photo upload failed: ' + err.message);
    } finally {
      setUploadingEditPhoto(false);
    }
  };

  const resolvedPhotoUrl = uploadedPhotoUrl || buildStudentPhotoUrl(photoId);

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!studentName.trim() || !company.trim() || !packageLpa) return;
    addPlacementRecord({
      studentName: studentName.trim(),
      branch: branch.trim(),
      company: company.trim(),
      packageLpa: Number(packageLpa),
      placementYear,
      academicYear,
      photoId: photoId.trim(),
      photo: resolvedPhotoUrl,
    });
    setStudentName('');
    setBranch('');
    setCompany('');
    setPackageLpa('');
    setPhotoId('');
    setUploadedPhotoUrl('');
  };

  return (
    <div className="space-y-8">
      {/* 1. Manage Placement Years (Starts 2026) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-extrabold text-aditya-navy">
          Placement Years (Starts from 2026)
        </h2>

        <form onSubmit={handleAddYear} className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            placeholder="e.g. 2027"
            className="px-4 py-2 rounded-xl border border-slate-300 text-sm w-48"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-aditya-navy text-amber-400 font-bold text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Year</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          {data.placementYears.map((yr) => (
            <div
              key={yr}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50"
            >
              {editingYear === yr ? (
                <>
                  <input
                    type="text"
                    value={editYearVal}
                    onChange={(e) => setEditYearVal(e.target.value)}
                    className="w-20 px-2 py-1 rounded border border-slate-300 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editYearVal.trim()) {
                        editPlacementYear(yr, editYearVal.trim());
                      }
                      setEditingYear(null);
                    }}
                    className="text-emerald-600"
                    title="Save Year"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingYear(null)}
                    className="text-slate-500"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="font-bold text-sm text-slate-800">{yr}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingYear(yr);
                      setEditYearVal(yr);
                    }}
                    className="text-aditya-blue hover:text-amber-600"
                    title="Edit Year"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteYear(yr)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete Year"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Bulk Upload Placements Data (.xlsx / .csv) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-extrabold text-aditya-navy">
              Add Placements Data (Excel / CSV)
            </h2>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-aditya-blue" />
            <span>Download Sample CSV</span>
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Upload an <strong>.xlsx</strong> or <strong>.csv</strong> file with columns in this exact structure:{' '}
          <code className="px-2 py-0.5 rounded bg-slate-100 text-aditya-navy font-semibold">
            name, company name, package, course/branch, placement year, academic year, photo id
          </code>
          . New placement years or academic years in the file will be created automatically, and any blank cells will remain blank.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow transition-colors">
            <Upload className="w-4 h-4" />
            <span>Choose .xlsx / .csv File</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              onChange={handleBulkFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {importStatus && (
          <div
            className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-xs font-semibold ${
              importStatus.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {importStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}
      </div>

      {/* 3. Add Placed Student Record (Single Entry) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Award className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-extrabold text-aditya-navy">
            Add Placed Student & Package
          </h2>
        </div>

        <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Student Full Name *
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. K. Sai Charan"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. TCS Digital / Infosys / Accenture"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Package (in LPA) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={packageLpa}
              onChange={(e) => setPackageLpa(e.target.value)}
              placeholder="e.g. 12.5"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Course / Branch
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g. B.Sc Artificial Intelligence"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Placement Year
            </label>
            <select
              value={placementYear}
              onChange={(e) => setPlacementYear(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
            >
              {data.placementYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
            >
              {data.academicYears.map((ay) => (
                <option key={ay} value={ay}>
                  {ay}
                </option>
              ))}
            </select>
          </div>

          {/* Both Photo Options: Enter Photo ID OR Upload Photo */}
          <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Student Photo ID
              </label>
              <input
                type="text"
                value={photoId}
                onChange={(e) => {
                  setPhotoId(e.target.value);
                  if (e.target.value.trim()) {
                    setUploadedPhotoUrl('');
                  }
                }}
                placeholder="Enter Photo ID (e.g. 23241A0501)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <span className="text-xs font-bold text-slate-400 pb-2.5 text-center">
              OR
            </span>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-bold text-slate-700 shrink-0">
                <Upload className="w-4 h-4 text-aditya-blue" />
                <span>
                  {uploadingPhoto
                    ? 'Uploading...'
                    : uploadedPhotoUrl
                    ? 'Photo Uploaded ✓'
                    : 'Upload Student Photo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleStudentPhotoUpload}
                  disabled={uploadingPhoto}
                  className="hidden"
                />
              </label>

              {resolvedPhotoUrl && (
                <img
                  src={resolvedPhotoUrl}
                  alt="Preview"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.display = 'block';
                  }}
                  className="w-11 h-11 rounded-full object-cover border border-slate-300 shrink-0"
                />
              )}
            </div>
          </div>

          <div className="flex items-end justify-end">
            <button
              type="submit"
              disabled={uploadingPhoto}
              className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-aditya-navy font-bold text-sm shadow disabled:opacity-50"
            >
              + Add Student Record
            </button>
          </div>
        </form>
      </div>

      {/* 4. All Placed Students Table (Editable) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <h3 className="text-base font-extrabold text-aditya-navy mb-4">
          All Placement Records ({data.placements.length})
        </h3>

        {data.placements.length === 0 ? (
          <p className="text-sm text-slate-500">No placement records added yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 px-3">Student</th>
                <th className="py-3 px-3">Company</th>
                <th className="py-3 px-3">Package (LPA)</th>
                <th className="py-3 px-3">Year / AY</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.placements.map((rec) => {
                const isEditing = editingStudentId === rec.id;
                return (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        {(isEditing ? editForm.photo : rec.photo) ? (
                          <img
                            src={isEditing ? editForm.photo : rec.photo}
                            alt={rec.studentName}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <UserCheck className="w-8 h-8 text-slate-300 shrink-0" />
                        )}
                        {isEditing ? (
                          <div className="flex flex-col gap-1.5">
                            <input
                              type="text"
                              value={editForm.studentName}
                              onChange={(e) =>
                                setEditForm({ ...editForm, studentName: e.target.value })
                              }
                              placeholder="Name"
                              className="px-2 py-1 border rounded text-xs"
                            />
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={editForm.photoId ?? extractPhotoIdFromUrl(rec.photo)}
                                onChange={(e) => {
                                  const nextId = e.target.value;
                                  setEditForm({
                                    ...editForm,
                                    photoId: nextId,
                                    photo: buildStudentPhotoUrl(nextId),
                                  });
                                }}
                                placeholder="Photo ID"
                                className="w-28 px-2 py-1 border rounded text-xs"
                              />
                              <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-300 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700">
                                <Upload className="w-3 h-3 text-aditya-blue" />
                                <span>{uploadingEditPhoto ? '...' : 'Upload'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleEditStudentPhotoUpload}
                                  disabled={uploadingEditPhoto}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {rec.studentName || '—'}
                            </span>
                            {rec.branch && (
                              <span className="text-xs text-slate-500">
                                {rec.branch}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.company}
                          onChange={(e) =>
                            setEditForm({ ...editForm, company: e.target.value })
                          }
                          className="px-2 py-1 border rounded text-xs"
                        />
                      ) : (
                        rec.company || '—'
                      )}
                    </td>

                    <td className="py-3 px-3 font-bold text-emerald-600">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.packageLpa}
                          onChange={(e) =>
                            setEditForm({ ...editForm, packageLpa: e.target.value })
                          }
                          className="w-20 px-2 py-1 border rounded text-xs"
                        />
                      ) : rec.packageLpa !== '' && rec.packageLpa != null ? (
                        `₹${rec.packageLpa} LPA`
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3 px-3 text-xs text-slate-600">
                      {rec.placementYear || '—'} • AY {rec.academicYear || '—'}
                    </td>

                    <td className="py-3 px-3 text-right space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              updatePlacementRecord(rec.id, {
                                ...editForm,
                                packageLpa:
                                  editForm.packageLpa !== '' &&
                                  !Number.isNaN(Number(editForm.packageLpa))
                                    ? Number(editForm.packageLpa)
                                    : editForm.packageLpa,
                              });
                              setEditingStudentId(null);
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-bold"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingStudentId(null)}
                            className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 text-xs font-bold"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStudentId(rec.id);
                              setEditForm({
                                ...rec,
                                photoId: rec.photoId ?? extractPhotoIdFromUrl(rec.photo),
                              });
                            }}
                            className="p-1.5 rounded-lg bg-blue-50 text-aditya-blue hover:bg-blue-100"
                            title="Edit Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deletePlacementRecord(rec.id)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}