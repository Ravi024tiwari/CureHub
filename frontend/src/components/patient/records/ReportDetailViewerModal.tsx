import { useState, type FC } from 'react'
import {
  ArrowLeft,
  Download,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Printer,
  Maximize2,
  Minimize2,
  FileText,
  Activity,
  CheckCircle2,
  X,
  Contrast,
  Stethoscope,
  Heart,
  ShieldCheck,
} from 'lucide-react'
import { useMedicalRecordsStore } from '@/store/medicalRecordsStore'
import { useAuthStore } from '@/store/authStore'

export const ReportDetailViewerModal: FC = () => {
  const { selectedRecord, isViewerOpen, closeViewer, openDeleteModal } = useMedicalRecordsStore()
  const { user } = useAuthStore()

  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isInverted, setIsInverted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!isViewerOpen || !selectedRecord) return null

  const patientName = user?.name || 'Ravi Tiwari'

  const cat = selectedRecord.category.toLowerCase()
  const title = selectedRecord.title.toLowerCase()

  const isImaging =
    cat.includes('imaging') ||
    title.includes('x-ray') ||
    title.includes('mri') ||
    title.includes('scan') ||
    title.includes('ultrasound') ||
    title.includes('ct')

  const isPrescription =
    cat.includes('prescription') ||
    title.includes('prescription') ||
    title.includes('rx')

  const isDiabetes =
    title.includes('diabetes') ||
    title.includes('glucose') ||
    title.includes('sugar') ||
    title.includes('hba1c')

  const isThyroid =
    title.includes('thyroid') ||
    title.includes('tsh') ||
    title.includes('t3') ||
    title.includes('t4')

  const isECG =
    title.includes('ecg') ||
    title.includes('ekg') ||
    title.includes('cardio') ||
    title.includes('heart')

  const formattedDate = new Date(selectedRecord.uploadedAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const formattedTime = new Date(selectedRecord.uploadedAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 15, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 15, 60))
  const handleResetZoom = () => {
    setZoom(100)
    setRotation(0)
    setIsInverted(false)
  }
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = selectedRecord.fileUrl
    link.download = `${selectedRecord.title.replace(/\s+/g, '_')}.${selectedRecord.fileType.toLowerCase() || 'pdf'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col w-full transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-2 z-50 rounded-2xl max-w-none h-[calc(100vh-16px)]'
            : 'max-w-5xl my-auto max-h-[92vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200/80 flex items-center justify-between gap-3 bg-white rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={closeViewer}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0"
              title="Close and return"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back to Medical Records</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-extrabold text-slate-900 leading-tight truncate">
                {selectedRecord.title}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                Uploaded on {formattedDate} • {selectedRecord.category} • {selectedRecord.fileType} • {selectedRecord.fileSize || '1.2 MB'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="py-1.5 sm:py-2 px-3 sm:px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-600/20 active:scale-95"
            >
              <Download className="size-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={() => {
                closeViewer()
                openDeleteModal(selectedRecord)
              }}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Delete Report"
            >
              <Trash2 className="size-4" />
            </button>

            <button
              onClick={closeViewer}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Document Viewer Workspace */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-100/90 overflow-hidden relative">
          {/* Viewer Floating Control Toolbar */}
          <div className="bg-slate-900/95 backdrop-blur-md text-white py-2 px-3 sm:px-4 flex items-center justify-between text-xs font-medium z-10 border-b border-slate-800 shadow-md shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-slate-400 font-bold tracking-wider text-[10px] sm:text-[11px] uppercase hidden sm:inline">
                {isImaging ? 'Radiology PACS Canvas' : isPrescription ? 'Clinical Rx Pad' : 'Pathology Report'}
              </span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300 font-mono">
                {zoom}%
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="size-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-2 py-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors text-[11px] cursor-pointer"
                title="Reset Zoom"
              >
                Reset
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="size-4" />
              </button>
              <div className="h-3.5 w-px bg-slate-800 mx-1" />
              <button
                onClick={handleRotate}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Rotate 90deg"
              >
                <RotateCw className="size-4" />
              </button>
              {isImaging && (
                <button
                  onClick={() => setIsInverted(!isInverted)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isInverted ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                  title="Invert Contrast (Radiograph mode)"
                >
                  <Contrast className="size-4" />
                </button>
              )}
              <div className="h-3.5 w-px bg-slate-800 mx-1" />
              <button
                onClick={handlePrint}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Print Report"
              >
                <Printer className="size-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </button>
            </div>
          </div>

          {/* Canvas Scroll Area */}
          <div className="flex-1 overflow-auto p-3 sm:p-6 lg:p-8 flex justify-center items-start">
            <div
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
                filter: isInverted ? 'invert(1) hue-rotate(180deg)' : 'none',
              }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-5 sm:p-8 lg:p-10 w-full max-w-3xl select-none"
            >
              {/* =========================================================================
                  CASE 1: IMAGING (X-RAY, MRI, SCAN, ULTRASOUND, CT)
                  ========================================================================= */}
              {isImaging ? (
                <div>
                  {/* Radiology Header */}
                  <div className="border-b-2 border-slate-900 pb-4 mb-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                          <Activity className="size-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                            CityCare Diagnostics
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Advanced Radiology & Imaging Center • NABH & ISO 15189 Certified
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 hidden sm:block">
                        <p className="font-bold text-slate-800">NABH Accredited</p>
                        <p>Lic: CG-RAD-2026/18</p>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <span className="inline-block px-4 py-1 bg-slate-900 text-white text-xs font-bold tracking-widest uppercase rounded-md shadow-xs">
                        IMAGING • {selectedRecord.title.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Patient Info Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200/80 mb-6">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Patient Name
                      </span>
                      <span className="font-bold text-slate-900">{patientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Age / Gender
                      </span>
                      <span className="font-bold text-slate-900">28 Years / Male</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Patient ID
                      </span>
                      <span className="font-mono font-bold text-slate-900">CC-2026-9812</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Study Date
                      </span>
                      <span className="font-semibold text-slate-800">{formattedDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Modality / View
                      </span>
                      <span className="font-semibold text-slate-800">Digital PA Erect (DR)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Ref. Radiologist / Doctor
                      </span>
                      <span className="font-semibold text-blue-700">
                        {selectedRecord.doctorName || 'Dr. Vikram Malhotra'}
                      </span>
                    </div>
                  </div>

                  {/* Authentic Digital Radiograph Lightbox Viewport */}
                  <div className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-black rounded-2xl p-5 mb-6 border border-slate-800 shadow-2xl overflow-hidden flex flex-col items-center justify-center">
                    {/* PACS HUD Overlays */}
                    <div className="absolute top-3 left-4 flex flex-col text-[10px] font-mono text-slate-400 leading-tight select-none">
                      <span className="text-amber-400 font-bold text-sm">R</span>
                      <span>CHEST PA ERECT</span>
                      <span>kVp: 125 • mAs: 4.2</span>
                    </div>

                    <div className="absolute top-3 right-4 flex flex-col items-end text-[10px] font-mono text-slate-400 leading-tight select-none">
                      <span className="text-amber-400 font-bold text-sm">L</span>
                      <span>EXP: 0.04s</span>
                      <span>SID: 180cm</span>
                    </div>

                    <div className="absolute bottom-3 left-4 text-[10px] font-mono text-slate-500 select-none">
                      <span>W: 1500  L: -500</span>
                    </div>

                    <div className="absolute bottom-3 right-4 text-[10px] font-mono text-emerald-400 flex items-center gap-1 select-none">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>DIAGNOSTIC QUALITY</span>
                    </div>

                    {/* Detailed Vector Chest Radiography Visual */}
                    <div className="my-4 py-2 w-full max-w-sm flex items-center justify-center">
                      <svg
                        viewBox="0 0 320 380"
                        className="w-64 sm:w-72 h-auto filter drop-shadow-[0_0_15px_rgba(255,255,255,0.06)]"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Background Thorax Glow */}
                        <radialGradient id="lungGlow" cx="50%" cy="45%" r="45%">
                          <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                          <stop offset="60%" stopColor="#0f172a" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                        </radialGradient>
                        <ellipse cx="160" cy="190" rx="130" ry="150" fill="url(#lungGlow)" />

                        {/* Midline Vertebral Column */}
                        <g stroke="rgba(255,255,255,0.22)" strokeWidth="1.5">
                          <rect x="153" y="40" width="14" height="260" rx="3" fill="rgba(255,255,255,0.08)" />
                          {[60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280].map((y) => (
                            <line key={y} x1="150" y1={y} x2="170" y2={y} />
                          ))}
                        </g>

                        {/* Trachea Midline Column (Air Lucency) */}
                        <line x1="160" y1="40" x2="160" y2="135" stroke="rgba(0,0,0,0.85)" strokeWidth="6" strokeLinecap="round" />

                        {/* Bilateral Clavicles */}
                        <path
                          d="M155 75 Q100 68 45 78 Q35 80 40 85 Q95 78 152 82"
                          fill="rgba(255,255,255,0.3)"
                          stroke="rgba(255,255,255,0.4)"
                          strokeWidth="1"
                        />
                        <path
                          d="M165 75 Q220 68 275 78 Q285 80 280 85 Q225 78 168 82"
                          fill="rgba(255,255,255,0.3)"
                          stroke="rgba(255,255,255,0.4)"
                          strokeWidth="1"
                        />

                        {/* Bilateral Ribs Arches */}
                        {[
                          { y1: 100, rx: 75, ry: 20 },
                          { y1: 125, rx: 88, ry: 24 },
                          { y1: 155, rx: 100, ry: 28 },
                          { y1: 190, rx: 108, ry: 32 },
                          { y1: 225, rx: 112, ry: 34 },
                          { y1: 260, rx: 110, ry: 36 },
                        ].map((rib, idx) => (
                          <g key={idx} stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" fill="none">
                            <path d={`M154 ${rib.y1} C120 ${rib.y1 - 10} 70 ${rib.y1 + 10} ${160 - rib.rx} ${rib.y1 + rib.ry}`} />
                            <path d={`M166 ${rib.y1} C200 ${rib.y1 - 10} 250 ${rib.y1 + 10} ${160 + rib.rx} ${rib.y1 + rib.ry}`} />
                          </g>
                        ))}

                        {/* Cardiac Silhouette (Radio-opaque heart shadow occupying left hemithorax) */}
                        <path
                          d="M156 145 C156 125 178 120 184 135 C190 150 182 170 178 185 C174 200 215 240 210 268 C205 288 175 292 152 290 Z"
                          fill="rgba(255,255,255,0.42)"
                          stroke="rgba(255,255,255,0.5)"
                          strokeWidth="1.5"
                        />

                        {/* Aortic Knob */}
                        <path
                          d="M164 125 C176 120 184 128 182 140"
                          stroke="rgba(255,255,255,0.6)"
                          strokeWidth="3"
                          fill="none"
                        />

                        {/* Left & Right Hemidiaphragms (Domes with sharp CP angles) */}
                        <path
                          d="M38 295 Q100 255 152 278"
                          stroke="rgba(255,255,255,0.6)"
                          strokeWidth="2.5"
                          fill="none"
                        />
                        <path
                          d="M152 288 Q210 265 282 298"
                          stroke="rgba(255,255,255,0.6)"
                          strokeWidth="2.5"
                          fill="none"
                        />

                        {/* Bilateral Sharp Costophrenic Angles Markers */}
                        <circle cx="42" cy="292" r="3" fill="#38bdf8" opacity="0.6" />
                        <circle cx="278" cy="295" r="3" fill="#38bdf8" opacity="0.6" />

                        {/* Delicate Bronchovascular Tree Markings */}
                        <g stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeLinecap="round">
                          <path d="M145 155 Q115 160 90 175 M125 163 Q105 185 85 210" />
                          <path d="M175 155 Q205 160 230 175 M195 163 Q215 185 235 210" />
                        </g>
                      </svg>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono text-center">
                      Digital Radiograph PA Projection • High Resolution Radiopaque Matrix
                    </div>
                  </div>

                  {/* Technical Radiologist Findings Breakdown */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="size-4 text-blue-600" />
                        <span>Technical Investigation Findings</span>
                      </h4>
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" /> No Abnormality Detected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1">
                        <span className="font-bold text-slate-900 block">Trachea & Airways:</span>
                        <p className="text-slate-600 leading-relaxed">
                          Trachea is strictly central and patent in the midline. No evidence of luminal narrowing, displacement, or extrinsic compression.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1">
                        <span className="font-bold text-slate-900 block">Pulmonary Parenchyma:</span>
                        <p className="text-slate-600 leading-relaxed">
                          Both lung fields appear completely radiolucent and clear. No focal consolidation, airspace opacity, cavitation, or active Koch's infiltration.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1">
                        <span className="font-bold text-slate-900 block">Pleura & CP Angles:</span>
                        <p className="text-slate-600 leading-relaxed">
                          Bilateral costophrenic (CP) and cardiophrenic angles are well-defined, acute, and sharp. No pleural effusion or pneumothorax detected.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1">
                        <span className="font-bold text-slate-900 block">Cardiovascular & Mediastinum:</span>
                        <p className="text-slate-600 leading-relaxed">
                          Cardiac silhouette is normal in shape and contour. Cardiothoracic ratio (CTR) is 0.43 (Normal &lt; 0.50). Normal mediastinal vascularity.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Impression Banner */}
                  <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 mb-6 text-xs">
                    <span className="font-extrabold text-emerald-950 block mb-1 text-xs sm:text-sm">
                      RADIOLOGICAL IMPRESSION:
                    </span>
                    <p className="text-emerald-900 font-medium leading-relaxed">
                      NORMAL DIGITAL CHEST RADIOGRAPH (PA VIEW). No evidence of acute cardiopulmonary pathology, consolidation, or pleural collection.
                    </p>
                  </div>

                  {/* Radiologist Signature */}
                  <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">
                        {selectedRecord.doctorName || 'Dr. Vikram Malhotra, MD (Radiodiagnosis)'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Senior Consultant Radiologist • Lic: CG-RAD-4491
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 border border-emerald-300 bg-emerald-50 px-2.5 py-1 rounded-md text-[10px] font-bold text-emerald-700">
                        <ShieldCheck className="size-3.5" />
                        <span>PACS VERIFIED</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Digitally authenticated via CureHealth</p>
                    </div>
                  </div>
                </div>
              ) : isPrescription ? (
                /* =========================================================================
                   CASE 2: PRESCRIPTION (DOCTOR CONSULTATION & RX MEDS)
                   ========================================================================= */
                <div>
                  {/* Prescription Header */}
                  <div className="border-b-2 border-slate-900 pb-4 mb-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                          <Stethoscope className="size-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                            CarePlus Clinic & OPD Center
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Multi-Speciality Health Network • Outpatient Consultation Pad
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 hidden sm:block">
                        <p className="font-bold text-slate-800">
                          {selectedRecord.doctorName || 'Dr. Rajesh Gupta, MD'}
                        </p>
                        <p>Reg No: MCI-2018-78294</p>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <span className="inline-block px-4 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold tracking-widest uppercase rounded-md">
                        OFFICIAL MEDICAL PRESCRIPTION
                      </span>
                    </div>
                  </div>

                  {/* Patient Info & Vitals Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200/80 mb-5">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Patient Name
                      </span>
                      <span className="font-bold text-slate-900">{patientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Age / Gender
                      </span>
                      <span className="font-bold text-slate-900">28 Y / Male</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Consult Date
                      </span>
                      <span className="font-semibold text-slate-800">{formattedDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Blood Pressure
                      </span>
                      <span className="font-mono font-bold text-blue-700">118 / 76 mmHg</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Pulse Rate
                      </span>
                      <span className="font-mono font-bold text-slate-800">74 bpm</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Oxygen Saturation
                      </span>
                      <span className="font-mono font-bold text-emerald-700">99% SpO2</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Body Temp
                      </span>
                      <span className="font-mono font-bold text-slate-800">98.4 °F</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Weight
                      </span>
                      <span className="font-mono font-bold text-slate-800">68 kg</span>
                    </div>
                  </div>

                  {/* Clinical Diagnosis / Chief Complaints */}
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs mb-5">
                    <span className="font-bold text-blue-950 block mb-0.5">Clinical Diagnosis:</span>
                    <p className="text-blue-900 font-medium">
                      Acute Upper Respiratory Tract Infection (Seasonal Rhinitis) with spasmodic dry cough and mild pharyngeal hyperemia.
                    </p>
                  </div>

                  {/* Rx Section Title with Classic Rx Symbol */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-serif font-black text-blue-600 italic">℞</span>
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Prescribed Medications & Schedule
                    </h4>
                  </div>

                  {/* Prescribed Medications Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl mb-5">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Medicine Name & Formulation</th>
                          <th className="py-2.5 px-3">Dosage & Timing</th>
                          <th className="py-2.5 px-3">Relation to Meals</th>
                          <th className="py-2.5 px-3">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                        <tr>
                          <td className="py-3 px-3 font-mono text-slate-400">1</td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">Tab. Augmentin 625mg</span>
                            <span className="text-[11px] text-slate-500">Amoxicillin + Clavulanic Acid</span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-blue-700">1 - 0 - 1</td>
                          <td className="py-3 px-3 text-slate-600">After food</td>
                          <td className="py-3 px-3 font-semibold text-slate-900">5 Days</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-mono text-slate-400">2</td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">Tab. Montair-LC</span>
                            <span className="text-[11px] text-slate-500">Montelukast 10mg + Levocetirizine 5mg</span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-blue-700">0 - 0 - 1</td>
                          <td className="py-3 px-3 text-slate-600">Night at bedtime</td>
                          <td className="py-3 px-3 font-semibold text-slate-900">7 Days</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-mono text-slate-400">3</td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">Syp. Ascoril D Plus</span>
                            <span className="text-[11px] text-slate-500">Dextromethorphan + Chlorpheniramine</span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-blue-700">10 ml (TDS)</td>
                          <td className="py-3 px-3 text-slate-600">After food</td>
                          <td className="py-3 px-3 font-semibold text-slate-900">5 Days</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-mono text-slate-400">4</td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">Cap. Pan-D</span>
                            <span className="text-[11px] text-slate-500">Pantoprazole 40mg + Domperidone 30mg</span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-blue-700">1 - 0 - 0</td>
                          <td className="py-3 px-3 text-slate-600">30m before breakfast</td>
                          <td className="py-3 px-3 font-semibold text-slate-900">5 Days</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Lifestyle & Followup Advice */}
                  <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 text-xs mb-5 space-y-1">
                    <span className="font-bold text-slate-900 block">Doctor's Advice & Precautions:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-600 leading-relaxed">
                      <li>Maintain good hydration with lukewarm water. Avoid cold drinks and chilled food.</li>
                      <li>Perform steam inhalation twice daily for soothing nasal air passages.</li>
                      <li>Review in OPD after 5 days or SOS if high fever (&gt; 101°F) or breathlessness develops.</li>
                    </ul>
                  </div>

                  {/* Doctor Signature & Stamp */}
                  <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">
                        {selectedRecord.doctorName || 'Dr. Rajesh Gupta, MD (Internal Medicine)'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Senior Consultant Physician • Reg: MCI-2018-78294
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 border border-blue-300 bg-blue-50 px-2.5 py-1 rounded-md text-[10px] font-bold text-blue-700">
                        <ShieldCheck className="size-3.5" />
                        <span>DIGITALLY SIGNED</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Verified CureHealth Tele-Prescription</p>
                    </div>
                  </div>
                </div>
              ) : isDiabetes ? (
                /* =========================================================================
                   CASE 3: DIABETES / GLYCEMIC PROFILE
                   ========================================================================= */
                <div>
                  {/* Lab Header */}
                  <div className="border-b-2 border-slate-900 pb-4 mb-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                          <Activity className="size-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                            CityCare Diagnostics
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Clinical Biochemistry & Endocrine Laboratory
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 hidden sm:block">
                        <p className="font-bold text-slate-800">NABH Accredited</p>
                        <p>Lic: CG-DIAG-2026/09</p>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <span className="inline-block px-4 py-1 bg-slate-900 text-white text-xs font-bold tracking-widest uppercase rounded-md">
                        LAB REPORT • DIABETES & GLYCEMIC EVALUATION
                      </span>
                    </div>
                  </div>

                  {/* Patient Info Header */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200/80 mb-6">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Patient Name
                      </span>
                      <span className="font-bold text-slate-900">{patientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Age / Gender
                      </span>
                      <span className="font-bold text-slate-900">28 Years / Male</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Patient ID
                      </span>
                      <span className="font-mono font-bold text-slate-900">CC-2026-9812</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Report Date
                      </span>
                      <span className="font-semibold text-slate-800">{formattedDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Sample Type
                      </span>
                      <span className="font-semibold text-slate-800">Fluoride / EDTA Blood</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Ref. Doctor
                      </span>
                      <span className="font-semibold text-blue-700">
                        {selectedRecord.doctorName || 'Dr. Priya Sharma'}
                      </span>
                    </div>
                  </div>

                  {/* Diabetes Test Table */}
                  <div className="mb-6">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                      <span>Glycemic Investigation Findings</span>
                      <span className="text-emerald-600 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" /> Optimal Control
                      </span>
                    </h4>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Test Parameter</th>
                            <th className="py-2.5 px-3">Observed Result</th>
                            <th className="py-2.5 px-3">Reference Range</th>
                            <th className="py-2.5 px-3">Unit</th>
                            <th className="py-2.5 px-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              Fasting Blood Sugar (FBS)
                            </td>
                            <td className="py-2.5 px-3 font-bold text-blue-700">92</td>
                            <td className="py-2.5 px-3 text-slate-500">70 - 99</td>
                            <td className="py-2.5 px-3 text-slate-500">mg/dL</td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Normal
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              Post-Prandial Glucose (PPBS - 2h)
                            </td>
                            <td className="py-2.5 px-3 font-bold text-blue-700">124</td>
                            <td className="py-2.5 px-3 text-slate-500">&lt; 140</td>
                            <td className="py-2.5 px-3 text-slate-500">mg/dL</td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Normal
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              HbA1c (Glycated Hemoglobin)
                            </td>
                            <td className="py-2.5 px-3 font-bold text-blue-700">5.4</td>
                            <td className="py-2.5 px-3 text-slate-500">&lt; 5.7 (Non-diabetic)</td>
                            <td className="py-2.5 px-3 text-slate-500">%</td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Normal
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              Estimated Average Glucose (eAG)
                            </td>
                            <td className="py-2.5 px-3 font-bold text-blue-700">108</td>
                            <td className="py-2.5 px-3 text-slate-500">90 - 120</td>
                            <td className="py-2.5 px-3 text-slate-500">mg/dL</td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Normal
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Clinical Interpretation */}
                  <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 mb-6 text-xs text-slate-700">
                    <span className="font-bold text-blue-900 block mb-1">Interpretation:</span>
                    <p className="leading-relaxed">
                      Patient exhibits excellent glycemic equilibrium. Both fasting glucose and glycated hemoglobin levels indicate euglycemia with zero signs of insulin resistance.
                    </p>
                  </div>

                  {/* Signatures */}
                  <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">
                        {selectedRecord.doctorName || 'Dr. Priya Sharma, MD (Pathology)'}
                      </p>
                      <p className="text-[11px] text-slate-400">Head of Clinical Biochemistry</p>
                    </div>
                    <div className="text-right">
                      <div className="inline-block border border-emerald-300 bg-emerald-50 px-2.5 py-1 rounded-md text-[10px] font-bold text-emerald-700">
                        ELECTRONICALLY VERIFIED
                      </div>
                    </div>
                  </div>
                </div>
              ) : isThyroid ? (
                /* =========================================================================
                   CASE 4: THYROID PROFILE (T3, T4, TSH)
                   ========================================================================= */
                <div>
                  {/* Lab Header */}
                  <div className="border-b-2 border-slate-900 pb-4 mb-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                          <Activity className="size-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                            CityCare Diagnostics
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Clinical Endocrinology & Hormone Immunoassay Lab
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 hidden sm:block">
                        <p className="font-bold text-slate-800">NABH Accredited</p>
                        <p>Lic: CG-DIAG-2026/09</p>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <span className="inline-block px-4 py-1 bg-slate-900 text-white text-xs font-bold tracking-widest uppercase rounded-md">
                        LAB REPORT • THYROID FUNCTION PROFILE (TFT)
                      </span>
                    </div>
                  </div>

                  {/* Patient Info Header */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200/80 mb-6">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Patient Name
                      </span>
                      <span className="font-bold text-slate-900">{patientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Age / Gender
                      </span>
                      <span className="font-bold text-slate-900">28 Years / Male</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Patient ID
                      </span>
                      <span className="font-mono font-bold text-slate-900">CC-2026-9812</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Report Date
                      </span>
                      <span className="font-semibold text-slate-800">{formattedDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Assay Method
                      </span>
                      <span className="font-semibold text-slate-800">Chemiluminescence (CLIA)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Ref. Doctor
                      </span>
                      <span className="font-semibold text-blue-700">
                        {selectedRecord.doctorName || 'Dr. Priya Sharma'}
                      </span>
                    </div>
                  </div>

                  {/* Thyroid Table */}
                  <div className="mb-6">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                      <span>Thyroid Hormone Findings</span>
                      <span className="text-emerald-600 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" /> Euthyroid (Normal)
                      </span>
                    </h4>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Hormone Parameter</th>
                            <th className="py-2.5 px-3">Observed Result</th>
                            <th className="py-2.5 px-3">Reference Range</th>
                            <th className="py-2.5 px-3">Unit</th>
                            <th className="py-2.5 px-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              Total Triiodothyronine (T3)
                            </td>
                            <td className="py-2.5 px-3 font-bold text-blue-700">1.28</td>
                            <td className="py-2.5 px-3 text-slate-500">0.80 - 2.00</td>
                            <td className="py-2.5 px-3 text-slate-500">ng/mL</td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Normal
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              Total Thyroxine (T4)
                            </td>
                            <td className="py-2.5 px-3 font-bold text-blue-700">7.6</td>
                            <td className="py-2.5 px-3 text-slate-500">5.1 - 14.1</td>
                            <td className="py-2.5 px-3 text-slate-500">ug/dL</td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Normal
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              Thyroid Stimulating Hormone (TSH)
                            </td>
                            <td className="py-2.5 px-3 font-bold text-blue-700">2.14</td>
                            <td className="py-2.5 px-3 text-slate-500">0.35 - 4.94</td>
                            <td className="py-2.5 px-3 text-slate-500">uIU/mL</td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Normal
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Clinical Interpretation */}
                  <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 mb-6 text-xs text-slate-700">
                    <span className="font-bold text-blue-900 block mb-1">Clinical Interpretation:</span>
                    <p className="leading-relaxed">
                      Thyroid Stimulating Hormone (TSH) and peripheral hormones (T3, T4) are within canonical physiological parameters. Consistent with a healthy euthyroid profile.
                    </p>
                  </div>

                  {/* Signatures */}
                  <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">
                        {selectedRecord.doctorName || 'Dr. Priya Sharma, MD (Pathology)'}
                      </p>
                      <p className="text-[11px] text-slate-400">Head of Endocrine Diagnostics</p>
                    </div>
                    <div className="text-right">
                      <div className="inline-block border border-emerald-300 bg-emerald-50 px-2.5 py-1 rounded-md text-[10px] font-bold text-emerald-700">
                        ELECTRONICALLY VERIFIED
                      </div>
                    </div>
                  </div>
                </div>
              ) : isECG ? (
                /* =========================================================================
                   CASE 5: CARDIOLOGY / ECG REPORT
                   ========================================================================= */
                <div>
                  {/* Cardiology Header */}
                  <div className="border-b-2 border-slate-900 pb-4 mb-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-11 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                          <Heart className="size-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                            CityCare Cardiology Institute
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Electrophysiology & Non-Invasive Cardiac Diagnostics
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 hidden sm:block">
                        <p className="font-bold text-slate-800">NABH Accredited</p>
                        <p>Lic: CG-CARDIO-2026</p>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <span className="inline-block px-4 py-1 bg-slate-900 text-white text-xs font-bold tracking-widest uppercase rounded-md">
                        12-LEAD RESTING ELECTROCARDIOGRAM (ECG)
                      </span>
                    </div>
                  </div>

                  {/* Patient Info Header */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200/80 mb-5">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Patient Name
                      </span>
                      <span className="font-bold text-slate-900">{patientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Age / Gender
                      </span>
                      <span className="font-bold text-slate-900">28 Years / Male</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Heart Rate
                      </span>
                      <span className="font-mono font-bold text-blue-700">72 bpm</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        PR Interval
                      </span>
                      <span className="font-mono font-bold text-slate-800">146 ms</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        QRS Duration
                      </span>
                      <span className="font-mono font-bold text-slate-800">84 ms</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        QT / QTc Interval
                      </span>
                      <span className="font-mono font-bold text-slate-800">388 / 418 ms</span>
                    </div>
                  </div>

                  {/* Realistic Pink Millimetric Grid ECG Rhythm Strip */}
                  <div className="relative bg-rose-50/50 border border-rose-200/90 rounded-2xl p-4 mb-5 overflow-hidden">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2">
                      <span className="font-bold text-slate-800">LEAD II RHYTHM STRIP (25 mm/s, 10 mm/mV)</span>
                      <span>FILTER: 0.05 - 150 Hz</span>
                    </div>

                    <div className="w-full bg-white rounded-xl border border-rose-200/80 p-2 overflow-x-auto">
                      <svg viewBox="0 0 600 100" className="w-full h-24 stroke-rose-600 fill-none">
                        {/* Pink Millimetric ECG Grid Lines */}
                        <defs>
                          <pattern id="ecgGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#fecdd3" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="600" height="100" fill="url(#ecgGrid)" />

                        {/* Continuous Repeating P-Q-R-S-T Cardiac Waveform */}
                        <path
                          d="
                            M 10,50 L 30,50 
                            C 35,46 45,46 50,50 
                            L 65,50 L 68,56 L 75,10 L 82,65 L 85,50 
                            L 95,50 
                            C 105,38 120,38 130,50 
                            L 160,50
                            C 165,46 175,46 180,50 
                            L 195,50 L 198,56 L 205,10 L 212,65 L 215,50 
                            L 225,50 
                            C 235,38 250,38 260,50 
                            L 290,50
                            C 295,46 305,46 310,50 
                            L 325,50 L 328,56 L 335,10 L 342,65 L 345,50 
                            L 355,50 
                            C 365,38 380,38 390,50 
                            L 420,50
                            C 425,46 435,46 440,50 
                            L 455,50 L 458,56 L 465,10 L 472,65 L 475,50 
                            L 485,50 
                            C 495,38 510,38 520,50 
                            L 590,50
                          "
                          stroke="#e11d48"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Impression */}
                  <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 mb-6 text-xs">
                    <span className="font-extrabold text-emerald-950 block mb-1">
                      CARDIOLOGIST IMPRESSION:
                    </span>
                    <p className="text-emerald-900 font-medium leading-relaxed">
                      NORMAL SINUS RHYTHM. Normal axis. No ischemic ST-segment elevation or depression, no pathologic Q waves, and no intraventricular conduction defect detected.
                    </p>
                  </div>

                  {/* Signatures */}
                  <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">
                        {selectedRecord.doctorName || 'Dr. Sanjeev Nair, MD, DM (Cardiology)'}
                      </p>
                      <p className="text-[11px] text-slate-400">Consultant Interventional Cardiologist</p>
                    </div>
                    <div className="text-right">
                      <div className="inline-block border border-emerald-300 bg-emerald-50 px-2.5 py-1 rounded-md text-[10px] font-bold text-emerald-700">
                        TELE-CARDIOLOGY VERIFIED
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* =========================================================================
                   CASE 6: COMPLETE BLOOD COUNT (CBC) / DEFAULT LAB REPORT
                   ========================================================================= */
                <div>
                  {/* Lab Header */}
                  <div className="border-b-2 border-slate-900 pb-4 mb-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                          <Activity className="size-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                            CityCare Diagnostics
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Central Accreditation Lab • ISO 15189 Certified • Bilaspur & Delhi NCR
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-slate-500 hidden sm:block">
                        <p className="font-bold text-slate-800">NABH Accredited</p>
                        <p>Lic: CG-DIAG-2026/09</p>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <span className="inline-block px-4 py-1 bg-slate-900 text-white text-xs font-bold tracking-widest uppercase rounded-md">
                        {selectedRecord.category.toUpperCase()} • {selectedRecord.title.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Patient Info Header Table */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200/80 mb-6">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Patient Name
                      </span>
                      <span className="font-bold text-slate-900">{patientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Age / Gender
                      </span>
                      <span className="font-bold text-slate-900">28 Years / Male</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Patient ID
                      </span>
                      <span className="font-mono font-bold text-slate-900">CC-2026-9812</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Report Date
                      </span>
                      <span className="font-semibold text-slate-800">{formattedDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Sample Date
                      </span>
                      <span className="font-semibold text-slate-800">{formattedDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Ref. Doctor
                      </span>
                      <span className="font-semibold text-blue-700">
                        {selectedRecord.doctorName || 'Dr. Priya Sharma'}
                      </span>
                    </div>
                  </div>

                  {/* Diagnostic Test Table */}
                  <div className="mb-6">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                      <span>Complete Investigation Findings</span>
                      <span className="text-emerald-600 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" /> All Normative
                      </span>
                    </h4>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Test Parameter</th>
                            <th className="py-2.5 px-3">Observed Result</th>
                            <th className="py-2.5 px-3">Reference Range</th>
                            <th className="py-2.5 px-3">Unit</th>
                            <th className="py-2.5 px-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">Hemoglobin (Hb)</td>
                            <td className="py-2.5 px-3 font-bold text-blue-700">14.2</td>
                            <td className="py-2.5 px-3 text-slate-500">13.0 - 17.0</td>
                            <td className="py-2.5 px-3 text-slate-500">g/dL</td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Normal
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">Total WBC Count</td>
                            <td className="py-2.5 px-3 font-bold text-blue-700">6,800</td>
                            <td className="py-2.5 px-3 text-slate-500">4,000 - 11,000</td>
                            <td className="py-2.5 px-3 text-slate-500">/uL</td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Normal
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">Platelet Count</td>
                            <td className="py-2.5 px-3 font-bold text-blue-700">2,50,000</td>
                            <td className="py-2.5 px-3 text-slate-500">1,50,000 - 4,50,000</td>
                            <td className="py-2.5 px-3 text-slate-500">/uL</td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Normal
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">RBC Count</td>
                            <td className="py-2.5 px-3 font-bold text-blue-700">5.1</td>
                            <td className="py-2.5 px-3 text-slate-500">4.5 - 5.9</td>
                            <td className="py-2.5 px-3 text-slate-500">million/uL</td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Normal
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">Hematocrit (PCV)</td>
                            <td className="py-2.5 px-3 font-bold text-blue-700">43.5</td>
                            <td className="py-2.5 px-3 text-slate-500">39.0 - 50.0</td>
                            <td className="py-2.5 px-3 text-slate-500">%</td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Normal
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">ESR (Westergren)</td>
                            <td className="py-2.5 px-3 font-bold text-blue-700">9</td>
                            <td className="py-2.5 px-3 text-slate-500">0 - 15</td>
                            <td className="py-2.5 px-3 text-slate-500">mm/hr</td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Normal
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Clinical Interpretation */}
                  <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 mb-6 text-xs text-slate-700">
                    <span className="font-bold text-blue-900 block mb-1">Clinical Impression & Notes:</span>
                    <p className="leading-relaxed">
                      {selectedRecord.notes ||
                        'All physiological markers evaluated are well within standard reference intervals. No clinical indication of acute bacterial infection, anemia, or coagulopathy observed.'}
                    </p>
                  </div>

                  {/* Signatures & Stamp */}
                  <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">
                        {selectedRecord.doctorName || 'Dr. Priya Sharma, MD (Pathology)'}
                      </p>
                      <p className="text-[11px] text-slate-400">Head of Clinical Biochemistry</p>
                    </div>
                    <div className="text-right">
                      <div className="inline-block border border-emerald-300 bg-emerald-50 px-2.5 py-1 rounded-md text-[10px] font-bold text-emerald-700">
                        ELECTRONICALLY VERIFIED
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Digitally signed via CureHealth Vault</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Report Details Footer Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-white border-t border-slate-200/90 rounded-b-3xl shrink-0">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="size-3.5 text-blue-600" />
            <span>Report Details</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Title:</span>
              <span className="font-bold text-slate-900 truncate block">{selectedRecord.title}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Category:</span>
              <span className="font-bold text-slate-900">{selectedRecord.category}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Uploaded At:</span>
              <span className="font-semibold text-slate-800">
                {formattedDate}, {formattedTime}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">File Type:</span>
              <span className="font-bold text-slate-900">{selectedRecord.fileType}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">File Size:</span>
              <span className="font-semibold text-slate-800">{selectedRecord.fileSize || '1.2 MB'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Uploaded By:</span>
              <span className="font-bold text-blue-700">{selectedRecord.uploadedBy || 'You'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
