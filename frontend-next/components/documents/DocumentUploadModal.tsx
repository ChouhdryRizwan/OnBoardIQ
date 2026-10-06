'use client';

import React, { useState } from 'react';
import { uploadDocument } from '@/lib/services/documentManagement';
import { Upload, X, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DocumentUploadModal({ isOpen, onClose, onSuccess }: DocumentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('information_security_policy');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [version, setVersion] = useState(1);
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [precedenceRank, setPrecedenceRank] = useState(3);
  const [supersedesDocId, setSupersedesDocId] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      // Local check max size 25MB
      if (selected.size > 25 * 1024 * 1024) {
        setErrorMsg('File size exceeds maximum threshold of 25 MB.');
        return;
      }
      setFile(selected);
      setErrorMsg(null);

      // Auto-suggest document_id and title if empty
      if (!documentId) {
        const baseName = selected.name.split('.')[0].toUpperCase().replace(/\s+/g, '-');
        setDocumentId(baseName.slice(0, 15));
      }
      if (!title) {
        setTitle(selected.name.split('.')[0].replace(/[-_]/g, ' '));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.size > 25 * 1024 * 1024) {
        setErrorMsg('File size exceeds maximum threshold of 25 MB.');
        return;
      }
      setFile(dropped);
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a file to upload.');
      return;
    }
    if (!documentId.trim() || !title.trim()) {
      setErrorMsg('Document ID and Title are required fields.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_id', documentId.trim().toUpperCase());
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('effective_date', effectiveDate);
      formData.append('version', version.toString());
      if (department.trim()) formData.append('department', department.trim());
      if (description.trim()) formData.append('description', description.trim());
      if (expiryDate.trim()) formData.append('expiry_date', expiryDate.trim());
      formData.append('precedence_rank', precedenceRank.toString());
      if (supersedesDocId.trim()) formData.append('supersedes_document_id', supersedesDocId.trim().toUpperCase());

      const resp = await uploadDocument(formData);
      setSuccessMsg(resp.message || 'Document uploaded successfully. Processing has started.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed. Check file type or duplicate version.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">Upload Company Document</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Drag & Drop File Picker */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              file ? 'border-indigo-500 bg-indigo-950/40' : 'border-slate-800 hover:border-indigo-500 bg-slate-950'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.docx,.txt,.md,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <FileText className="w-10 h-10 text-indigo-400 mb-2" />
              {file ? (
                <div>
                  <span className="font-semibold text-slate-100">{file.name}</span>
                  <span className="text-xs text-slate-400 block">
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-sm font-semibold text-indigo-400 hover:underline">
                    Click to browse file
                  </span>{' '}
                  <span className="text-sm text-slate-400">or drag and drop here</span>
                  <p className="text-xs text-slate-400 mt-1">
                    Supported: PDF, DOCX, TXT, Markdown (.md), CSV (Max 25 MB)
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Document ID <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. SOP-07 or POL-01"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                required
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Version <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={version}
                onChange={(e) => setVersion(parseInt(e.target.value) || 1)}
                required
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Document Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Information Security & Data Protection Policy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="information_security_policy">InfoSec Policy</option>
                <option value="hr_policy">HR Policy</option>
                <option value="leave_policy">Leave Policy</option>
                <option value="company_handbook">Company Handbook</option>
                <option value="workplace_conduct_policy">Workplace Conduct</option>
                <option value="data_privacy_policy">Data Privacy</option>
                <option value="department_sop">Department SOP</option>
                <option value="role_description">Role Description</option>
                <option value="process_document">Process Document</option>
                <option value="compliance_instruction">Compliance Instruction</option>
                <option value="escalation_procedure">Escalation Procedure</option>
                <option value="safety_instruction">Safety Instruction</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
              <input
                type="text"
                placeholder="e.g. Engineering or HR"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Effective Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                required
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry Date (Optional)</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Precedence Rank</label>
              <input
                type="number"
                min="1"
                max="10"
                value={precedenceRank}
                onChange={(e) => setPrecedenceRank(parseInt(e.target.value) || 3)}
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Supersedes Doc ID (Optional)</label>
              <input
                type="text"
                placeholder="e.g. SOP-06"
                value={supersedesDocId}
                onChange={(e) => setSupersedesDocId(e.target.value)}
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
              <textarea
                placeholder="Brief summary of document scope and purpose..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUploading || !file}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload & Process Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
