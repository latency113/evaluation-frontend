'use client';

import { useState, useEffect } from 'react';
import { teacherService } from '@/src/services/teacherService';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check,
  GraduationCap
} from 'lucide-react';
import Swal from 'sweetalert2';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { SearchFilters } from '@/src/components/ui/SearchFilters';
import { DataTable } from '@/src/components/ui/DataTable';
import { Pagination } from '@/src/components/ui/Pagination';
import { Modal } from '@/src/components/ui/Modal';

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [formData, setFormData] = useState({ first_name: '', last_name: '' });

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTeachers, setTotalTeachers] = useState(0);

  useEffect(() => {
    fetchTeachers();
  }, [page, limit]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await teacherService.getAllTeachers(page, limit);
      setTeachers(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalTeachers(response.meta.total);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (teacher: any = null) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({ first_name: teacher.first_name, last_name: teacher.last_name });
    } else {
      setEditingTeacher(null);
      setFormData({ first_name: '', last_name: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await teacherService.updateTeacher(editingTeacher.id, formData);
      } else {
        await teacherService.createTeacher(formData);
      }
      setIsModalOpen(false);
      fetchTeachers();
      Swal.fire({
        title: 'สำเร็จ',
        text: 'บันทึกข้อมูลครูเรียบร้อยแล้ว',
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
      text: 'Are you sure you want to delete this teacher?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await teacherService.deleteTeacher(id);
        fetchTeachers();
        Swal.fire('ลบสำเร็จ!', 'ข้อมูลครูถูกลบแล้ว', 'success');
      } catch (err) {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
      }
    }
  };

  const filteredTeachers = teachers.filter(t => 
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 font-sans bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="จัดการข้อมูลครู"
          description={`จัดการข้อมูลบุคลากรครูทั้งหมด (${totalTeachers} คน)`}
          icon={GraduationCap}
          actions={
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all  shadow-xl shadow-blue-200 active:scale-95 group"
            >
              <Plus className="mr-2 h-6 w-6 transition-transform group-hover:rotate-90" />
              เพิ่มครูใหม่
            </button>
          }
        />

        <SearchFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          limit={limit}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
          onRefresh={fetchTeachers}
          loading={loading}
          placeholder="ค้นหาชื่อครู..."
        />

        <DataTable
          columns={[
            { header: 'ID', className: 'w-24' },
            { header: 'ชื่อ-นามสกุล' },
            { header: 'การจัดการ', align: 'right' }
          ]}
          loading={loading}
        >
          {filteredTeachers.map((teacher) => (
            <tr key={teacher.id} className="hover:bg-blue-50/30 transition-all group">
              <td className="px-10 py-6">
                <span className=" text-slate-400 group-hover:text-blue-600 transition-colors ">{teacher.id}</span>
              </td>
              <td className="px-10 py-6">
                <div className=" text-slate-900 text-lg leading-tight group-hover:text-blue-700 transition-colors ">{teacher.first_name} {teacher.last_name}</div>
              </td>
              <td className="px-10 py-6 text-right">
                <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(teacher)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100 active:scale-90"><Edit2 className="h-5 w-5" /></button>
                  <button onClick={() => handleDelete(teacher.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100 active:scale-90"><Trash2 className="h-5 w-5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>

        <Pagination 
          page={page}
          totalPages={totalPages}
          totalItems={totalTeachers}
          limit={limit}
          onPageChange={setPage}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? 'แก้ไขข้อมูลครู' : 'เพิ่มครูใหม่'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="block text-[10px]  text-slate-400 uppercase tracking-widest ml-1 leading-none">ชื่อจริง</label>
            <input required type="text" className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-lg focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold outline-none transition-all text-slate-900" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px]  text-slate-400 uppercase tracking-widest ml-1 leading-none">นามสกุล</label>
            <input required type="text" className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-lg focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold outline-none transition-all text-slate-900" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
          </div>
          <div className="flex gap-4 pt-6 border-t border-slate-50">
            <button type="submit" className="flex-[2] bg-blue-600 text-white py-5 rounded-lg  text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-[0.98] flex justify-center items-center group">
              <Check className="mr-2 h-6 w-6 transition-transform group-hover:scale-125" />
              {editingTeacher ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-lg  hover:bg-slate-200 transition-all active:scale-[0.98]">ยกเลิก</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
