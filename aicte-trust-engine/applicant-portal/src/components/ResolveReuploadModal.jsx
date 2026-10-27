import React, { useState } from 'react';
import { 
  X, Upload, FileText, CheckCircle2, AlertTriangle, 
  Send, Sparkles, Building, ArrowRight, ShieldCheck, AlertCircle, Trash2 
} from 'lucide-react';

export const ResolveReuploadModal = ({ 
  isOpen, 
  onClose, 
  deficiency, 
  onResolutionSuccess 
}) => {
  const [file, setFile] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !deficiency) return null;

  // Validation: Submit button is enabled ONLY if a replacement file is added OR a statement is provided
  const hasContent = Boolean(file || responseText.trim().length > 0);
  const isSubmitDisabled = isSubmitting || !hasContent;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasContent) return; // Guard clause

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const reuploadedDocId = file 
        ? `DOC-REV-${Date.now().toString().slice(-4)}`
        : `${deficiency.document_id}-REVISED`;

      const finalResponseText = responseText.trim() || 
        `Corrected statutory compliance document re-uploaded by institution for ${deficiency.document_id}.`;

      // 1. Submit to FastAPI deficiency gateway
      const res = await fetch(`/api/deficiencies/resolve/${deficiency.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_response: finalResponseText,
          reuploaded_document_id: reuploadedDocId
        })
      });

      const data = await res.json();

      // 2. Sync compliance re-upload with Express backend
      try {
        await fetch(`/api/documents/${deficiency.document_id}/compliance-reupload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appId: deficiency.application_id,
            documentId: deficiency.document_id,
            reuploadedDocId,
            applicantResponse: finalResponseText,
            fileName: file ? file.name : `${deficiency.document_id}_Certified_Replacement.pdf`
          })
        });
      } catch (syncErr) {
        console.warn("Express backend sync note:", syncErr);
      }

      if (res.ok && data.success) {
        onResolutionSuccess({
          deficiencyId: deficiency.id,
          reuploadedDocId,
          message: data.message
        });
        onClose();
      } else {
        setErrorMsg(data.detail || "Failed to resolve deficiency. Please try again.");
      }
    } catch (err) {
      console.error("Resolution submit error:", err);
      setErrorMsg("Failed to connect to FastAPI deficiency gateway.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Resolve Deficiency & Re-upload Document
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Flagged Document: <strong>{deficiency.document_id}</strong> (Deficiency #{deficiency.id})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* AICTE Discrepancy Note */}
          <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs space-y-1">
            <div className="font-bold text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Official Scrutiny Discrepancy Flag:</span>
            </div>
            <p className="text-rose-900 font-sans leading-relaxed">
              {deficiency.discrepancy_details}
            </p>
          </div>

          {/* File Re-upload Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Corrected / Statutory Replacement Document (PDF, PNG, JPG)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-5 text-center transition-colors bg-slate-50/50 cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center">
                <Upload className="w-7 h-7 text-indigo-500 mb-1.5" />
                {file ? (
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-bold text-indigo-600 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setFile(null);
                      }}
                      className="p-1 text-rose-500 hover:bg-rose-100 rounded-md transition-colors z-10 cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-slate-700">
                      Click to browse or drop certified replacement file
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Accepts digitally signed PDFs or high-resolution statutory scanned copies
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Applicant Explanation / Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Institutional Clarification / Statement to AICTE Scrutiny Committee
            </label>
            <textarea
              rows={3}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="e.g., We have obtained the permanent affiliation order from the Registrar of Anna University (dated 15-Oct-2025). The certified gazette copy is re-uploaded above for verification."
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
            {/* Real-time hint when disabled */}
            <div>
              {!hasContent && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Attach a replacement file or enter clarification to enable</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitDisabled}
                title={!hasContent ? "Attach a replacement file or enter clarification to submit" : "Submit re-upload & resolve"}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  isSubmitDisabled
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Resolution...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Re-upload & Resolve</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
