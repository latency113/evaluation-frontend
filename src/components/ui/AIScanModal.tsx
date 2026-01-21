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
      title="AI SUBJECT SCAN"
      subtitle="ดึงข้อมูล รหัสวิชา และ ชื่อวิชา จากตารางสอนอัตโนมัติ"
      icon={Scan}
      maxWidth="max-w-5xl"
    >
      {!previewImage ? (
        <div className="flex-1 border-4 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center bg-gray-50/50 relative group hover:border-purple-200 transition-all cursor-pointer min-h-[400px]">
          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,application/pdf" onChange={handleFileChange} />
          <div className="bg-white p-10 rounded-full shadow-2xl group-hover:scale-110 transition-transform mb-8">
            <ImageIcon className="h-20 w-20 text-purple-500" />
          </div>
          <span className="text-3xl font-black text-gray-800 tracking-tight leading-none uppercase">เลือกไฟล์ตารางสอน</span>
          <p className="text-gray-400 mt-4 font-bold text-xs uppercase tracking-widest italic flex items-center"><FileText className="mr-2 h-4 w-4" /> รองรับทั้งไฟล์รูปภาพ และ PDF</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 rounded-xl border-8 border-gray-50 overflow-hidden bg-gray-100 shadow-inner flex items-center justify-center max-h-[600px]">
            <img src={previewImage} alt="Preview" className="max-w-full max-h-full object-contain" />
          </div>

          <div className="lg:col-span-3 flex flex-col overflow-hidden">
            <div className="bg-gray-900 text-white p-6 rounded-xl mb-6 flex items-center justify-between shadow-xl">
              <div>
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">AI Detection Status</p>
                <span className="font-black text-xl flex items-center leading-none">
                  {isScanning ? <Loader2 className="animate-spin mr-3 h-6 w-6 text-purple-400" /> : <Check className="mr-3 text-green-400 h-6 w-6" />}
                  {isScanning ? "กำลังวิเคราะห์..." : `พบวิชาใหม่ ${scanResult.length} รายการ`}
                </span>
              </div>
              {!isScanning && (
                <button onClick={() => setPreviewImage(null)} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-black uppercase transition-all border border-white/10">เปลี่ยนไฟล์</button>
              )}
            </div>

            <div className="flex-1 overflow-auto space-y-4 pr-4 scrollbar-hide max-h-[400px]">
              {scanResult.map((item, idx) => (
                <div key={idx} className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all group relative">
                  <button onClick={() => removeScanItem(idx)} className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg active:scale-90"><X className="h-3 w-3" /></button>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center leading-none"><Type className="h-3 w-3 mr-1" /> รหัสและชื่อวิชา</label>
                    <div className="flex gap-3">
                      <input className="bg-gray-50 border-none rounded-md px-3 py-2 text-xs font-black text-purple-600 w-28 outline-none focus:ring-2 focus:ring-purple-200 transition-all" value={item.code} onChange={(e) => updateScanItem(idx, "code", e.target.value)} />
                      <input className="bg-gray-50 border-none rounded-md px-3 py-2 text-xs font-bold text-gray-900 flex-1 outline-none focus:ring-2 focus:ring-purple-200 transition-all" value={item.name} onChange={(e) => updateScanItem(idx, "name", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              {!isScanning && scanResult.length === 0 && (
                <div className="py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-100">
                  <AlertCircle className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">สแกนไม่พบรายวิชาในหน้านี้</p>
                </div>
              )}
            </div>

            {!isScanning && scanResult.length > 0 && (
              <div className="pt-6">
                <button onClick={handleSave} className="w-full bg-blue-600 text-white py-6 rounded-xl font-black text-xl hover:bg-blue-700 shadow-2xl flex justify-center items-center transition-all active:scale-[0.98] border-b-4 border-blue-800 uppercase">
                  <Save className="mr-3 h-7 w-7" /> บันทึกรายวิชาเข้าสู่ระบบ
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
