import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  ArrowLeft,
  Users,
  FileText,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { TestSession, StudentRecord } from '../../types';
import { getOmrTemplate } from '../../utils/omrTemplate';
import { OmrQrPayload } from '../../types/omr';

interface OmrSheetGeneratorProps {
  session: TestSession;
  onClose: () => void;
}

export const OmrSheetGenerator: React.FC<OmrSheetGeneratorProps> = ({
  session,
  onClose,
}) => {
  const [printMode, setPrintMode] = useState<'blank' | 'all' | 'single'>('blank');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    session.students[0]?.id || ''
  );
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});

  const template = getOmrTemplate(session.questions);

  // QR kodlarni generatsiya qilish
  useEffect(() => {
    const generateQrs = async () => {
      const urls: Record<string, string> = {};

      // 1. Ismsiz blank uchun QR
      const blankPayload: OmrQrPayload = {
        app: 'zehnora_omr',
        v: template.version,
        sid: session.id,
        qc: session.questionCount,
      };
      urls['blank'] = await QRCode.toDataURL(JSON.stringify(blankPayload), {
        margin: 1,
        width: 150,
        errorCorrectionLevel: 'M',
      });

      // 2. Har bir o'quvchi uchun QR
      for (const st of session.students) {
        const studentPayload: OmrQrPayload = {
          app: 'zehnora_omr',
          v: template.version,
          sid: session.id,
          qc: session.questionCount,
          stId: st.id,
          stName: st.name,
          stClass: st.className || session.groupName,
        };
        urls[st.id] = await QRCode.toDataURL(JSON.stringify(studentPayload), {
          margin: 1,
          width: 150,
          errorCorrectionLevel: 'M',
        });
      }

      setQrCodeUrls(urls);
    };

    generateQrs();
  }, [session, template.version]);

  // Chop etiladigan o'quvchilar ro'yxati
  let targetStudents: (StudentRecord | null)[] = [null]; // null = ismsiz blank
  if (printMode === 'all') {
    targetStudents = session.students.length > 0 ? session.students : [null];
  } else if (printMode === 'single') {
    const found = session.students.find((s) => s.id === selectedStudentId);
    targetStudents = found ? [found] : [null];
  }

  return (
    <div className="bg-slate-100 min-h-screen text-slate-900 pb-16">
      {/* Yuqori boshqaruv paneli (faqat ekranda ko'rinadi) */}
      <div className="no-print bg-slate-900 text-white p-4 sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Orqaga</span>
            </button>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Titul chiqarish (A4 OMR javoblar varaqasi)
              </h2>
              <p className="text-xs text-slate-400">
                {session.title} • {session.questionCount} ta savol
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Rejim tanlash */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setPrintMode('blank')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  printMode === 'blank'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Ismsiz blank
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('all')}
                disabled={session.students.length === 0}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  printMode === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:text-white disabled:opacity-50'
                }`}
              >
                Butun sinf ({session.students.length} ta)
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('single')}
                disabled={session.students.length === 0}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  printMode === 'single'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:text-white disabled:opacity-50'
                }`}
              >
                Bitta o‘quvchi
              </button>
            </div>

            {printMode === 'single' && session.students.length > 0 && (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white px-2 py-1 rounded-lg text-xs"
              >
                {session.students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => window.print()}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish (Print / PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* A4 Varaqlari ro'yxati */}
      <div className="max-w-[850px] mx-auto mt-6 space-y-8 print:m-0 print:p-0 print:space-y-0">
        {targetStudents.map((student, sIdx) => {
          const qrKey = student ? student.id : 'blank';
          const qrDataUrl = qrCodeUrls[qrKey] || '';

          return (
            <div
              key={student ? student.id : `blank_${sIdx}`}
              className="bg-white shadow-xl mx-auto border border-slate-300 print:border-0 print:shadow-none print:m-0 overflow-hidden relative page-break-after"
              style={{
                width: '100%',
                maxWidth: '210mm',
                minHeight: '297mm',
                boxSizing: 'border-box',
              }}
            >
              <svg
                viewBox={`0 0 ${template.canvasWidth} ${template.canvasHeight}`}
                className="w-full h-auto block select-none"
                style={{ width: '100%', height: 'auto' }}
              >
                {/* 1. TO'RTTA BURCHAK TAYANCH BELGILARI (Fiducial Corner Markers) */}
                {/* Top-Left */}
                <rect
                  x={template.cornerMarkers.topLeft.x - 25}
                  y={template.cornerMarkers.topLeft.y - 25}
                  width={50}
                  height={50}
                  fill="#000000"
                />
                <rect
                  x={template.cornerMarkers.topLeft.x - 12}
                  y={template.cornerMarkers.topLeft.y - 12}
                  width={24}
                  height={24}
                  fill="#ffffff"
                />
                <rect
                  x={template.cornerMarkers.topLeft.x - 6}
                  y={template.cornerMarkers.topLeft.y - 6}
                  width={12}
                  height={12}
                  fill="#000000"
                />

                {/* Top-Right */}
                <rect
                  x={template.cornerMarkers.topRight.x - 25}
                  y={template.cornerMarkers.topRight.y - 25}
                  width={50}
                  height={50}
                  fill="#000000"
                />
                <rect
                  x={template.cornerMarkers.topRight.x - 12}
                  y={template.cornerMarkers.topRight.y - 12}
                  width={24}
                  height={24}
                  fill="#ffffff"
                />
                <rect
                  x={template.cornerMarkers.topRight.x - 6}
                  y={template.cornerMarkers.topRight.y - 6}
                  width={12}
                  height={12}
                  fill="#000000"
                />

                {/* Bottom-Right */}
                <rect
                  x={template.cornerMarkers.bottomRight.x - 25}
                  y={template.cornerMarkers.bottomRight.y - 25}
                  width={50}
                  height={50}
                  fill="#000000"
                />
                <rect
                  x={template.cornerMarkers.bottomRight.x - 12}
                  y={template.cornerMarkers.bottomRight.y - 12}
                  width={24}
                  height={24}
                  fill="#ffffff"
                />
                <rect
                  x={template.cornerMarkers.bottomRight.x - 6}
                  y={template.cornerMarkers.bottomRight.y - 6}
                  width={12}
                  height={12}
                  fill="#000000"
                />

                {/* Bottom-Left */}
                <rect
                  x={template.cornerMarkers.bottomLeft.x - 25}
                  y={template.cornerMarkers.bottomLeft.y - 25}
                  width={50}
                  height={50}
                  fill="#000000"
                />
                <rect
                  x={template.cornerMarkers.bottomLeft.x - 12}
                  y={template.cornerMarkers.bottomLeft.y - 12}
                  width={24}
                  height={24}
                  fill="#ffffff"
                />
                <rect
                  x={template.cornerMarkers.bottomLeft.x - 6}
                  y={template.cornerMarkers.bottomLeft.y - 6}
                  width={12}
                  height={12}
                  fill="#000000"
                />

                {/* 2. YO'NALISHNI AJRATISH BELGISI (Orientation Marker) */}
                <circle
                  cx={template.orientationMarker.center.x}
                  cy={template.orientationMarker.center.y}
                  r={template.orientationMarker.radius}
                  fill="#000000"
                />
                <circle
                  cx={template.orientationMarker.center.x}
                  cy={template.orientationMarker.center.y}
                  r={template.orientationMarker.radius - 6}
                  fill="#ffffff"
                />
                <circle
                  cx={template.orientationMarker.center.x}
                  cy={template.orientationMarker.center.y}
                  r={4}
                  fill="#000000"
                />

                {/* 3. SARLAVHA VA MAKTAB MA'LUMOTLARI */}
                <text
                  x="200"
                  y="75"
                  fontSize="16"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="bold"
                  letterSpacing="2"
                  fill="#333333"
                >
                  FARG‘ONIY MAKTABI • TEST JAVOBLAR VARAQASI (OMR)
                </text>
                <text
                  x="200"
                  y="105"
                  fontSize="24"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="900"
                  fill="#000000"
                >
                  {session.title}
                </text>

                {/* O'quvchi ma'lumotlari qutisi */}
                <rect
                  x="130"
                  y="140"
                  width="780"
                  height="130"
                  fill="#ffffff"
                  stroke="#000000"
                  strokeWidth="1.5"
                />

                <text x="150" y="175" fontSize="18" fontWeight="bold" fill="#000000">
                  O‘quvchi F.I.Sh:
                </text>
                <text
                  x="300"
                  y="175"
                  fontSize="20"
                  fontWeight="bold"
                  fontFamily="monospace"
                  fill="#000000"
                >
                  {student ? student.name : '____________________________________'}
                </text>

                <text x="150" y="215" fontSize="16" fontWeight="bold" fill="#000000">
                  Sinf / Guruh:
                </text>
                <text x="270" y="215" fontSize="18" fontFamily="monospace" fill="#000000">
                  {student?.className || session.groupName || '__________'}
                </text>

                <text x="500" y="215" fontSize="16" fontWeight="bold" fill="#000000">
                  Sana:
                </text>
                <text x="560" y="215" fontSize="18" fontFamily="monospace" fill="#000000">
                  {session.date}
                </text>

                <text x="700" y="215" fontSize="16" fontWeight="bold" fill="#000000">
                  Savollar:
                </text>
                <text x="790" y="215" fontSize="18" fontWeight="bold" fill="#000000">
                  {session.questionCount} ta
                </text>

                <text x="150" y="250" fontSize="13" fill="#555555">
                  ID: {student ? student.id : 'Umumiy ismsiz titul'} • Shablon v{template.version}
                </text>

                {/* QR KOD JOYI */}
                {qrDataUrl && (
                  <image
                    href={qrDataUrl}
                    x={template.qrBox.x}
                    y={template.qrBox.y}
                    width={template.qrBox.size}
                    height={template.qrBox.size}
                  />
                )}
                <rect
                  x={template.qrBox.x}
                  y={template.qrBox.y}
                  width={template.qrBox.size}
                  height={template.qrBox.size}
                  fill="none"
                  stroke="#000000"
                  strokeWidth="1"
                />

                {/* 4. KO'RSATMA VA TO'G'RI BO'YASH NAMUNASI */}
                <rect
                  x="130"
                  y="290"
                  width="960"
                  height="120"
                  fill="#fbfbfb"
                  stroke="#333333"
                  strokeWidth="1"
                />

                <text
                  x="150"
                  y="320"
                  fontSize="16"
                  fontWeight="bold"
                  fill="#000000"
                >
                  DIQQAT: Har bir savolda bitta doirani to‘liq bo‘yang!
                </text>
                <text x="150" y="345" fontSize="13" fill="#444444">
                  Doira ichini qora yoki to‘q ko‘k ruchka bilan to‘liq qoraytiring.
                  Tashqariga chiqmang va bir nechta variantni bo‘yamang.
                </text>

                {/* Belgilash namunalari */}
                <g transform="translate(150, 365)">
                  {/* To'g'ri */}
                  <text x="0" y="22" fontSize="13" fontWeight="bold" fill="#000000">
                    To‘g‘ri:
                  </text>
                  <text x="65" y="22" fontSize="14" fontWeight="bold" fill="#000000">
                    A
                  </text>
                  <circle cx="95" cy="18" r="12" fill="#000000" />
                  <text x="115" y="22" fontSize="12" fill="#000000">
                    (to‘liq bo‘yalgan)
                  </text>

                  {/* Noto'g'ri namunalari */}
                  <text x="320" y="22" fontSize="13" fontWeight="bold" fill="#777777">
                    Noto‘g‘ri:
                  </text>
                  <g transform="translate(390, 6)">
                    <circle cx="12" cy="12" r="12" fill="none" stroke="#000000" strokeWidth="1.5" />
                    <line x1="5" y1="5" x2="19" y2="19" stroke="#000000" strokeWidth="2" />
                    <line x1="19" y1="5" x2="5" y2="19" stroke="#000000" strokeWidth="2" />
                  </g>
                  <g transform="translate(430, 6)">
                    <circle cx="12" cy="12" r="12" fill="none" stroke="#000000" strokeWidth="1.5" />
                    <path d="M5 12 L10 18 L20 6" fill="none" stroke="#000000" strokeWidth="2" />
                  </g>
                  <g transform="translate(470, 6)">
                    <circle cx="12" cy="12" r="12" fill="none" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="4" fill="#000000" />
                  </g>
                  <text x="500" y="22" fontSize="12" fill="#666666">
                    (chiziq, pichka yoki nuqta hisobga olinmaydi)
                  </text>
                </g>

                {/* 5. SAVOLLAR VA BUBBLE DOIRALARI */}
                {/* 1-ustun va 2-ustun ajratuvchi vertikal chiziq */}
                <line
                  x1="620"
                  y1="440"
                  x2="620"
                  y2="1570"
                  stroke="#dddddd"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {template.questionRows.map((row) => {
                  return (
                    <g key={row.questionNumber}>
                      {/* Savol raqami */}
                      <text
                        x={row.boundingBox.x + 15}
                        y={row.options[0].center.y + 6}
                        fontSize="17"
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill="#000000"
                        textAnchor="start"
                      >
                        {row.questionLabel}.
                      </text>

                      {/* Variantlar */}
                      {row.options.map((opt) => (
                        <g key={opt.optionIndex}>
                          {/* Harf/Raqam yorlig'i doira TASHQARISIDA (chapida) */}
                          <text
                            x={opt.center.x - 22}
                            y={opt.center.y + 6}
                            fontSize="16"
                            fontFamily="system-ui, sans-serif"
                            fontWeight="bold"
                            fill="#000000"
                            textAnchor="middle"
                          >
                            {opt.optionLabel}
                          </text>

                          {/* Belgilash doirasi: Ichi MUTLAQO BO'SH va toza! */}
                          <circle
                            cx={opt.center.x}
                            cy={opt.center.y}
                            r={opt.radius}
                            fill="#ffffff"
                            stroke="#000000"
                            strokeWidth="1.8"
                          />
                        </g>
                      ))}
                    </g>
                  );
                })}

                {/* Pastki eslatma */}
                <text
                  x="600"
                  y="1610"
                  fontSize="12"
                  fill="#777777"
                  textAnchor="middle"
                >
                  Farg‘oniy Maktabi • Zehnora OMR Tizimi • Varaqni buklamang va qoraytirmang
                </text>
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
};
