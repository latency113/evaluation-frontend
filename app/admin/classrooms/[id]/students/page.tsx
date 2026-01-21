'use client';

import { useState, useEffect, use } from 'react';
import { studentService } from '@/src/services/studentService';
import { classroomService } from '@/src/services/classroomService';
import { 
  ChevronLeft,
  Plus,
  User,
  School,
  Check,
  Hash,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { SearchFilters } from '@/src/components/ui/SearchFilters';
import { DataTable } from '@/src/components/ui/DataTable';
import { Pagination } from '@/src/components/ui/Pagination';
import { Modal } from '@/src/components/ui/Modal';

export default function ClassroomStudentsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const classroomId = parseInt(resolvedParams.id);
  const router = useRouter();

  const [students, setStudents] = useState<any[]>([]);
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    student_code: '',
    first_name: '',
    last_name: '',
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    fetchClassroomInfo();
  }, [classroomId]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    fetchStudents();
  }, [page, limit, classroomId]);

  const fetchClassroomInfo = async () => {
    try {
      const data = await classroomService.getClassroomById(classroomId);
      setClassroom(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentService.getAllStudents(page, limit, searchTerm, classroomId);
      setStudents(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalStudents(response.meta.total);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (student: any = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        student_code: student.student_code,
        first_name: student.first_name,
        last_name: student.last_name,
      });
    } else {
      setEditingStudent(null);
      setFormData({
        student_code: '',
        first_name: '',
        last_name: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        classroom_id: classroomId,
      };

      if (editingStudent) {
        await studentService.updateStudent(editingStudent.id, dataToSubmit);
      } else {
        await studentService.createStudent(dataToSubmit);
      }
      
      setIsModalOpen(false);
      fetchStudents();
      Swal.fire({
        title: 'สำเร็จ',
        text: 'บันทึกข้อมูลนักเรียนเรียบร้อยแล้ว',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: 'คุณต้องการลบนักเรียนคนนี้ออกจากห้องเรียนใช่หรือไม่?',
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
    <div className="p-8 font-sans bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-5 mb-10">
          <button 
            onClick={() => router.push('/admin/classrooms')}
            className="group p-3 bg-white border border-slate-200 rounded-lg hover:bg-blue-600 hover:border-blue-600 transition-all shadow-sm active:scale-95"
          >
            <ChevronLeft className="h-6 w-6 text-slate-600 group-hover:text-white" />
          </button>
          <PageHeader 
            title={`ห้องเรียน ${classroom?.room_name || '...'}`}
            description={`ระดับชั้น: ${classroom?.level?.level_name || 'ทั่วไป'} (${classroom?.level?.department?.dept_name || 'ไม่ระบุแผนก'})`}
            icon={School}
            actions={
              <button 
                onClick={() => handleOpenModal()}
                className="flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-black shadow-xl shadow-blue-200 active:scale-95 group"
              >
                <Plus className="mr-2 h-6 w-6 transition-transform group-hover:rotate-90" />
                เพิ่มนักเรียนในห้อง
              </button>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-8 rounded-xl shadow-xl shadow-slate-200/50 border border-white flex items-center gap-5 transition-transform hover:translate-y-[-4px]">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-lg shadow-lg shadow-blue-200">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">จำนวนนักเรียน</p>
              <div className="flex items-baseline gap-1">
                <p className="text-4xl font-black text-slate-900 leading-none">{totalStudents}</p>
                <p className="text-slate-400 font-bold text-xs">คน</p>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <SearchFilters 
              searchTerm={searchTerm}
              onSearchChange={(s) => { setSearchTerm(s); setPage(1); }}
              limit={limit}
              onLimitChange={(l) => { setLimit(l); setPage(1); }}
              onRefresh={fetchStudents}
              loading={loading}
              placeholder="ค้นหารหัส หรือชื่อนักเรียนในห้องนี้..."
            />
          </div>
        </div>

        <DataTable
          columns={[
            { header: 'รหัสประจำตัว' },
            { header: 'ชื่อ-นามสกุล' },
            { header: 'การจัดการ', align: 'right' }
          ]}
          loading={loading}
        >
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-blue-50/30 transition-all group">
              <td className="px-10 py-6">
                <span className="font-mono font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-md text-sm group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                  {student.student_code}
                </span>
              </td>
              <td className="px-10 py-6">
                <div className="font-black text-slate-900 text-lg leading-tight group-hover:text-blue-700 transition-colors">
                  {student.first_name} {student.last_name}
                </div>
              </td>
              <td className="px-10 py-6 text-right">
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => handleOpenModal(student)}
                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100 active:scale-90"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(student.id)} 
                    className="p-3 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100 active:scale-90"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'}
        subtitle={`ห้องเรียน: ${classroom?.room_name}`}
        icon={User}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">รหัสประจำตัวนักเรียน</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Hash className="h-5 w-5" />
              </div>
              <input 
                required 
                type="text" 
                placeholder="ระบุรหัสประจำตัว 11 หลัก..." 
                className="w-full pl-14 pr-5 py-5 bg-slate-50 border-2 border-transparent rounded-lg focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold transition-all outline-none text-slate-900"
                value={formData.student_code} 
                onChange={(e) => setFormData({ ...formData, student_code: e.target.value })} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อ</label>
              <input 
                required 
                type="text" 
                placeholder="ระบุชื่อจริง..." 
                className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-lg focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold transition-all outline-none text-slate-900"
                value={formData.first_name} 
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">นามสกุล</label>
              <input 
                required 
                type="text" 
                placeholder="ระบุนามสกุล..." 
                className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-lg focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold transition-all outline-none text-slate-900"
                value={formData.last_name} 
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} 
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="submit" 
              className="flex-[2] bg-blue-600 text-white py-5 rounded-lg font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-[0.98] flex justify-center items-center group"
            >
              <Check className="mr-2 h-6 w-6 transition-transform group-hover:scale-125" />
              {editingStudent ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-lg font-black hover:bg-slate-200 transition-all active:scale-[0.98]"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}