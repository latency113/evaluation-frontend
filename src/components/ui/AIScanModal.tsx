'use client';

import { useState } from 'react';
import { Scan, ImageIcon, FileText, Loader2, Check, X, Type, AlertCircle, Save } from 'lucide-react';
import Tesseract from 'tesseract.js';
import * as pdfjs from 'pdfjs-dist';
import Swal from 'sweetalert2';
import { Modal } from './Modal';

// Setup PDF.js Worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface AIScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (results: { code: string; name: string }[]) => Promise<void>;
}

export function AIScanModal({ isOpen, onClose, onSave }: AIScanModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult([]);
    let scanSource: any = null;

    try {
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const pdfPage = await pdf.getPage(1);
        const viewport = pdfPage.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        if (context) {
          await pdfPage.render({
            canvasContext: context,
            viewport,
            canvas: canvas
          }).promise;
          setPreviewImage(canvas.toDataURL());
          scanSource = canvas;
        }
      } else {
        const url = URL.createObjectURL(file);
        setPreviewImage(url);
        scanSource = url;
      }

      const { data: { text } } = await Tesseract.recognize(scanSource, "tha+eng");

      const cleanText = text.replace(/[|]|[[]|]/g, " ");
      const lines = cleanText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

      const extracted: any[] = [];
      const seenCodes = new Set();

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const codeMatch = line.match(/(\d{5}-\d{4})/);

        if (codeMatch) {
          const code = codeMatch[0];
          if (seenCodes.has(code)) continue;

          let nameCandidate = line.replace(code, "").replace(/\d{4}$/, "").trim();

          if (nameCandidate.length < 2 && lines[i + 1]) {
            if (!lines[i + 1].match(/(\d{5}-\d{4})/)) {
              nameCandidate = lines[i + 1].replace(/\d{4}$/, "").trim();
            }
          }

          extracted.push({
            code: code,
            name: nameCandidate || "วิชาใหม่ (AI ตรวจไม่พบชื่อ)",
          });
          seenCodes.add(code);
        }
      }

      setScanResult(extracted);
    } catch (err) {
      console.error(err);
      Swal.fire('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการสแกน', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const updateScanItem = (index: number, field: string, value: string) => {
    const newResults = [...scanResult];
    newResults[index][field] = value;
    setScanResult(newResults);
  };

  const removeScanItem = (index: number) => {
    setScanResult(scanResult.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    await onSave(scanResult);
    setPreviewImage(null);
    setScanResult([]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { onClose(); setPreviewImage(null); setScanResult([]); }}
      title="AI Subject Scan"
      subtitle="Automatically extract subject codes and names from schedules"
      icon={Scan}
      maxWidth="max-w-5xl"
    >
      {!previewImage ? (
        <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50/30 relative group hover:border-blue-300 transition-all cursor-pointer min-h-[400px]">
          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,application/pdf" onChange={handleFileChange} />
          <div className="bg-white p-8 rounded-full shadow-sm group-hover:shadow-md transition-all mb-6 border border-slate-100">
            <ImageIcon className="h-12 w-12 text-slate-400" />
          </div>
          <span className="text-xl text-slate-800 tracking-tight">Select Schedule File</span>
          <p className="text-slate-400 mt-3 font-medium text-xs flex items-center"><FileText className="mr-2 h-4 w-4" /> Supports Images and PDF</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center max-h-[600px] shadow-inner">
            <img src={previewImage} alt="Preview" className="max-w-full max-h-full object-contain p-2" />
          </div>

          <div className="lg:col-span-3 flex flex-col overflow-hidden">
            <div className="bg-slate-900 text-white p-5 rounded-lg mb-6 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">AI Detection Status</p>
                <div className="text-lg flex items-center leading-none">
                  {isScanning ? <Loader2 className="animate-spin mr-3 h-5 w-5 text-blue-400" /> : <Check className="mr-3 text-emerald-400 h-5 w-5" />}
                  {isScanning ? "Analyzing..." : `Detected ${scanResult.length} new subjects`}
                </div>
              </div>
              {!isScanning && (
                <button onClick={() => setPreviewImage(null)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-[11px] uppercase tracking-wider transition-all border border-white/10">Change File</button>
              )}
            </div>

            <div className="flex-1 overflow-auto space-y-3 pr-2 max-h-[400px]">
              {scanResult.map((item, idx) => (
                <div key={idx} className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-slate-300 transition-all group relative">
                  <button onClick={() => removeScanItem(idx)} className="absolute -top-1.5 -right-1.5 p-1 bg-slate-900 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md"><X className="h-3 w-3" /></button>
                  <div className="space-y-3">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center"><Type className="h-3 w-3 mr-1.5 text-slate-300" /> Code & Subject Name</label>
                    <div className="flex gap-3">
                      <input className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-blue-600 w-28 outline-none focus:border-blue-400 transition-all" value={item.code} onChange={(e) => updateScanItem(idx, "code", e.target.value)} />
                      <input className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-800 flex-1 outline-none focus:border-blue-400 transition-all" value={item.name} onChange={(e) => updateScanItem(idx, "name", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              {!isScanning && scanResult.length === 0 && (
                <div className="py-20 text-center bg-white rounded-lg border border-dashed border-slate-200">
                  <AlertCircle className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 uppercase tracking-wider text-[10px]">No subjects detected in this file</p>
                </div>
              )}
            </div>

            {!isScanning && scanResult.length > 0 && (
              <div className="pt-6">
                <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg text-sm transition-all active:scale-[0.98] shadow-md uppercase tracking-wider flex items-center justify-center">
                  <Save className="mr-2.5 h-4 w-4" /> Save Subjects to System
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
