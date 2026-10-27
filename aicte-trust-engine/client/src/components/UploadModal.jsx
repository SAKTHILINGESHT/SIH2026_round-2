import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import SearchableTypedDropdown from './SearchableTypedDropdown';

const DOCUMENT_CATEGORY_OPTIONS = [
  { value: "No Objection Certificate", label: "No Objection Certificate (State DTE)", badge: "State NOC" },
  { value: "Infrastructure Photo Evidence", label: "Infrastructure Photo Evidence (Computer Lab / Building)", badge: "AI CV Scan" },
  { value: "Affiliation Certificate", label: "University Affiliation Order", badge: "University Order" },
  { value: "Land Ownership Title & Lease Deed", label: "Land Deed & 30-Year Lease Registry", badge: "Revenue Deed" },
  { value: "Statutory Affidavit (Rs 100 Non-Judicial)", label: "Statutory Undertaking Affidavit", badge: "Notarized Stamp" },
  { value: "Fire Safety Certificate", label: "Fire Safety & Disaster NOC", badge: "Safety NOC" },
  { value: "Building Master Plan & Completion Certificate", label: "Building Master Plan & Municipal Sanction", badge: "Approved Plan" },
  { value: "AICTE NBA Accreditation Certificate", label: "AICTE NBA Tier-1 / Tier-2 Accreditation", badge: "NBA Quality" }
];

const INSTITUTION_PRESET_OPTIONS = [
  { value: "Tech Engineering College", label: "Tech Engineering College (Chennai)", badge: "APP-1081" },
  { value: "Apex Institute of Technology & Management", label: "Apex Institute of Technology & Management (Kanpur)", badge: "APP-1082" },
  { value: "National Institute of Science & Polytechnic", label: "National Institute of Science & Polytechnic (Mumbai)", badge: "APP-1083" },
  { value: "R.M.K. Engineering College", label: "R.M.K. Engineering College (Thiruvallur)", badge: "APP-1084" },
  { value: "Greenfield Technical Academy", label: "Greenfield Technical Academy (Bhopal)", badge: "APP-1085" },
  { value: "Government Polytechnic Diglipur", label: "Government Polytechnic Diglipur (Andamans)", badge: "Govt Poly" },
  { value: "Vivekananda Institute of Technology", label: "Vivekananda Institute of Technology", badge: "Private-Self Financed" }
];

/**
 * Upload & Live Pipeline Simulation Modal
 * Allows uploading custom documents or selecting presets to trigger the AI validation pipeline.
 */
export const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('No Objection Certificate');
  const [institutionName, setInstitutionName] = useState('Vivekananda Institute of Technology');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);

  if (!isOpen) return null;

  const handleSimulateAnalysis = async () => {
    setIsProcessing(true);
    setPipelineStep(1); // OCR & NLP

    setTimeout(() => {
      setPipelineStep(2); // ELA Forensics
    }, 800);

    setTimeout(() => {
      setPipelineStep(3); // API Registry Ping
    }, 1600);

    setTimeout(async () => {
      setPipelineStep(4); // APH Regulatory Check

      try {
        const response = await fetch('/api/analyze-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: selectedFile?.name || `${docType.replace(/\s+/g, '_')}_2026.pdf`,
            docType,
            institutionName
          })
        });
        const data = await response.json();
        if (data.success) {
          onUploadSuccess(data.application);
          onClose();
        }
      } catch (err) {
        console.error("Upload analysis failed:", err);
        // Fallback local creation
        const mockNew = {
          appId: `APP-2026-AICTE-${Math.floor(1000 + Math.random() * 9000)}`,
          institutionName,
          region: "Southern Region",
          submissionDate: new Date().toISOString().split('T')[0],
          category: "Extension of Approval (EoA)",
          intakeApplied: 300,
          overallStatus: "anomaly_detected",
          primaryDocId: `DOC-2026-${Math.floor(100 + Math.random() * 900)}`,
          documents: [
            {
              docId: `DOC-2026-${Math.floor(100 + Math.random() * 900)}`,
              type: docType,
              status: "anomaly_detected",
              extractedData: {
                institutionName,
                expiryDate: "2029-06-30"
              },
              flags: [
                {
                  type: "ELA_Mismatch",
                  message: "Possible date tampering detected: Inconsistent compression layer in expiry date",
                  box: [120, 45, 180, 60]
                }
              ]
            }
          ],
          auditTimeline: []
        };
        onUploadSuccess(mockNew);
        onClose();
      } finally {
        setIsProcessing(false);
      }
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm">Ingest Document for AI Preliminary Scrutiny</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <SearchableTypedDropdown
              label="Institution Name"
              required
              value={institutionName}
              onChange={(val) => setInstitutionName(val)}
              options={INSTITUTION_PRESET_OPTIONS}
              placeholder="Select institution or type custom name..."
              helperText="Select from active cases or type any institution name."
            />
          </div>

          <div>
            <SearchableTypedDropdown
              label="Document Category"
              required
              value={docType}
              onChange={(val) => setDocType(val)}
              options={DOCUMENT_CATEGORY_OPTIONS}
              placeholder="Select document category or type custom type..."
              helperText="Choose standard APH category or type custom document label."
            />
          </div>

          {/* Drag & Drop Zone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center transition-colors bg-slate-50/50">
            <input
              type="file"
              id="fileInput"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              accept=".pdf,.png,.jpg,.jpeg"
            />
            <label htmlFor="fileInput" className="cursor-pointer">
              <FileText className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <div className="font-semibold text-slate-800">
                {selectedFile ? selectedFile.name : 'Click to select or drop PDF / JPEG document'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Supports institutional PDFs, scanned NOCs, and geotagged lab photos.
              </p>
            </label>
          </div>

          {/* Multi-modal Pipeline Progress Animation */}
          {isProcessing && (
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 font-mono text-[11px]">
              <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Running AI Multi-Modal Validation Pipeline...</span>
              </div>
              <div className={`flex items-center gap-2 ${pipelineStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span>{pipelineStep >= 1 ? '✓' : '○'} Step 1: LayoutLM OCR & Key-Value Extraction</span>
              </div>
              <div className={`flex items-center gap-2 ${pipelineStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span>{pipelineStep >= 2 ? '✓' : '○'} Step 2: OpenCV Error Level Analysis (ELA) Splicing Scan</span>
              </div>
              <div className={`flex items-center gap-2 ${pipelineStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span>{pipelineStep >= 3 ? '✓' : '○'} Step 3: Simulated DigiLocker Authority Registry API Ping</span>
              </div>
              <div className={`flex items-center gap-2 ${pipelineStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span>{pipelineStep >= 4 ? '✓' : '○'} Step 4: AICTE APH Regulatory Rule Compliance Check</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 font-medium text-xs"
          >
            Cancel
          </button>

          <button
            onClick={handleSimulateAnalysis}
            disabled={isProcessing}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isProcessing ? 'Analyzing Pipeline...' : 'Run Trust Engine'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
