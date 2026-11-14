import React, { useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { useCollegeData } from '../../context/CollegeDataContext';

export default function ManageAcademicYears() {
  const { data, addAcademicYear, editAcademicYear, deleteAcademicYear } =
    useCollegeData();
  const [newYear, setNewYear] = useState('');
  const [editingYear, setEditingYear] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmed = newYear.trim();
    if (!trimmed) return;
    addAcademicYear(trimmed);
    setNewYear('');
  };

  const startEdit = (yr) => {
    setEditingYear(yr);
    setEditValue(yr);
  };

  const saveEdit = (oldYr) => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== oldYr) {
      editAcademicYear(oldYr, trimmed);
    }
    setEditingYear(null);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-2.5">
        <Calendar className="w-5 h-5 text-aditya-blue" />
        <h2 className="text-lg font-extrabold text-aditya-navy">
          Manage Academic Years (Starts 2025-26)
        </h2>
      </div>

      {/* Add New Academic Year */}
      <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={newYear}
          onChange={(e) => setNewYear(e.target.value)}
          placeholder="e.g. 2027-28"
          className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm w-60"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-aditya-navy hover:bg-aditya-blue text-amber-400 font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Academic Year</span>
        </button>
      </form>

      {/* Existing Academic Years List */}
      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
        {data.academicYears.map((yr) => (
          <div
            key={yr}
            className="flex items-center justify-between px-4 py-3.5 bg-white hover:bg-slate-50"
          >
            {editingYear === yr ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-bold"
                />
                <button
                  type="button"
                  onClick={() => saveEdit(yr)}
                  className="p-1.5 rounded-lg bg-emerald-600 text-white"
                  title="Save"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingYear(null)}
                  className="p-1.5 rounded-lg bg-slate-200 text-slate-700"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span className="font-bold text-slate-900">{yr}</span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => startEdit(yr)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-aditya-blue hover:bg-blue-100 text-xs font-bold"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete academic year "${yr}"?`)) {
                    deleteAcademicYear(yr);
                  }
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}