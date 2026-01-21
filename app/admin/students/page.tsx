'use client';

import { useState, useEffect } from 'react';
import { studentService } from '@/src/services/studentService';
import api from '@/src/lib/api';
import { 
  Plus, 
  FileUp, 
  Trash2, 
  Edit2, 
  Download,
  Check,
  RefreshCw,
  FileSpreadsheet,
  Users
} from 'lucide-react';
import Swal from 'sweetalert2';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { SearchFilters } from '@/src/components/ui/SearchFilters';
import { DataTable } from '@/src/components/ui/DataTable';
import { Pagination } from '@/src/components/ui/Pagination';
import { Modal } from '@/src/components/ui/Modal';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    if (searchTerm === "") {
      fetchStudents();
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    fetchStudents();
  }, [page, limit]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentService.getAllStudents(page, limit, searchTerm);
      setStudents(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalStudents(response.meta.total);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImportSubmit = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await api.post('/classrooms/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      Swal.fire('สำเร็จ', response.data.message, 'success');
      setIsImportModalOpen(false);
      setSelectedFile(null);
      setPage(1);
      fetchStudents();
    } catch (err: any) {
      console.error(err);
      Swal.fire('เกิดข้อผิดพลาด', err.response?.data?.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: 'ยืนยันการลบข้อมูลนักเรียน?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await studentService.deleteStudent(id);
        fetchStudents();
        Swal.fire('ลบสำเร็จ!', 'ข้อมูลนักเรียนถูกลบแล้ว', 'success');
      } catch (err) {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
      }
    }
  };

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="STUDENTS DATABASE"
          description={`ทะเบียนนักเรียนทั้งหมด (${totalStudents} คน)`}
          icon={Users}
          actions={
            <>
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center px-6 py-3 bg-white text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-all font-bold shadow-sm"
              >
                <FileUp className="mr-2 h-5 w-5" />
                Smart Import
              </button>
              <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold shadow-lg">
                <Plus className="mr-2 h-5 w-5" />
                เพิ่มรายบุคคล
              </button>
            </>
          }
        />

        <SearchFilters 
          searchTerm={searchTerm}
          onSearchChange={(s) => { setSearchTerm(s); setPage(1); }}
          limit={limit}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
          onRefresh={fetchStudents}
          loading={loading}
          placeholder="ค้นหาจากรหัส หรือชื่อ (ค้นหาทั้งฐานข้อมูล)..."
        />

        <DataTable
          columns={[
            { header: 'รหัสประจำตัว' },
            { header: 'ชื่อ-นามสกุล' },
            { header: 'ห้องเรียน' },
            { header: 'การจัดการ', align: 'right' }
          ]}
          loading={loading}
        >
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-blue-50/50 transition-colors group">
              <td className="px-8 py-5 font-mono font-bold text-gray-600 text-sm">{student.student_code}</td>
              <td className="px-8 py-5 font-black text-gray-900">{student.first_name} {student.last_name}</td>
              <td className="px-8 py-5">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider ml-1 leading-none">
                    {student.classroom?.level?.department?.dept_name || student.classroom?.level?.level_name 
                      ? `${student.classroom?.level?.department?.dept_name || ''} (${student.classroom?.level?.level_name || 'ไม่ระบุชั้นปี'})`
                      : 'ยังไม่ระบุแผนก/ชั้นปี'}
                  </span>
                  <span className="px-3 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100 w-fit">
                    ห้อง {student.classroom?.room_name || 'ไม่ได้ระบุ'}
                  </span>
                </div>
              </td>
              <td className="px-8 py-5 text-right space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-md shadow-sm transition-all border border-transparent hover:border-gray-100"><Edit2 className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(student.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-md shadow-sm transition-all border border-transparent hover:border-gray-100"><Trash2 className="h-4 w-4" /></button>
              </td>
            </tr>
          ))}
        </DataTable>

        <Pagination 
          page={page}
          totalPages={totalPages}
          totalItems={totalStudents}
          limit={limit}
          onPageChange={setPage}
        />
      </div>

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => { setIsImportModalOpen(false); setSelectedFile(null); }}
        title="Smart Import"
        subtitle="ประมวลผลข้อมูลจากทุก Sheet อัตโนมัติ"
        icon={FileSpreadsheet}
      >
        <div className="border-4 border-dashed border-gray-100 rounded-2xl p-12 text-center bg-gray-50/50 mb-8 relative hover:border-blue-200 transition-colors">
          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".xlsx" onChange={handleFileChange} />
          {selectedFile ? (
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full mb-4 text-green-600 shadow-lg shadow-green-100"><Check className="h-10 w-10" /></div>
              <span className="text-lg font-black text-gray-800">{selectedFile.name}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Download className="h-12 w-12 text-blue-400 mb-4" />
              <span className="text-xl font-black text-gray-700 tracking-tight text-sm uppercase">เลือกไฟล์ Excel (.xlsx)</span>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            disabled={!selectedFile || isProcessing}
            onClick={handleImportSubmit}
            className="flex-[2] bg-blue-600 text-white py-5 rounded-lg font-black text-lg hover:bg-blue-700 disabled:bg-blue-200 shadow-xl transition-all flex justify-center items-center active:scale-95"
          >
            {isProcessing ? <RefreshCw className="h-6 w-6 animate-spin mr-3" /> : <FileUp className="mr-3 h-6 w-6" />}
            เริ่มนำเข้าข้อมูล
          </button>
          <button 
            onClick={() => { setIsImportModalOpen(false); setSelectedFile(null); }}
            className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-lg font-black hover:bg-gray-200 transition-all active:scale-95"
          >
            ยกเลิก
          </button>
        </div>
      </Modal>
    </div>
  );
}
