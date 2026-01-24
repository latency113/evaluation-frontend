'use client';

import { useState, useEffect } from 'react';
import { classroomService } from '@/src/services/classroomService';
import { levelService } from '@/src/services/levelService';
import { departmentService } from '@/src/services/departmentService';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check,
  School,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { SearchFilters } from '@/src/components/ui/SearchFilters';
import { DataTable } from '@/src/components/ui/DataTable';
import { Pagination } from '@/src/components/ui/Pagination';
import { Modal } from '@/src/components/ui/Modal';

export default function AdminClassroomsPage() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<any>(null);
  const [formData, setFormData] = useState({ room_name: '', level_id: '' });

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchClassrooms();
  }, [page, limit, filterDept]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchClassrooms();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const [roomRes, levelRes, deptRes] = await Promise.all([
        classroomService.getAllClassrooms(page, limit, searchTerm, filterDept),
        levelService.getAllLevelsWithoutPagination(),
        departmentService.getAllDepartmentsWithoutPagination()
      ]);
      setClassrooms(roomRes.data || []);
      setTotalPages(roomRes.meta.totalPages);
      setTotalItems(roomRes.meta.total);
      setLevels(levelRes || []);
      setDepartments(deptRes || []);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
      setClassrooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (classroom: any = null) => {
    if (classroom) {
      setEditingClassroom(classroom);
      setFormData({ 
        room_name: classroom.room_name,
        level_id: classroom.level_id?.toString() || ''
      });
    } else {
      setEditingClassroom(null);
      setFormData({ room_name: '', level_id: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        level_id: formData.level_id ? parseInt(formData.level_id) : null
      };

      if (editingClassroom) {
        await classroomService.updateClassroom(editingClassroom.id, dataToSubmit);
      } else {
        await classroomService.createClassroom(dataToSubmit);
      }
      setIsModalOpen(false);
      fetchClassrooms();
      Swal.fire({
        title: 'สำเร็จ',
        text: 'บันทึกข้อมูลห้องเรียนเรียบร้อยแล้ว',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกข้อมูลได้',
        icon: 'error'
      });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: 'คุณต้องการลบห้องเรียนนี้ใช่หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await classroomService.deleteClassroom(id);
        fetchClassrooms();
        Swal.fire('ลบสำเร็จ!', 'ข้อมูลห้องเรียนถูกลบแล้ว', 'success');
      } catch (err) {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
      }
    }
  };

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="จัดการห้องเรียน"
          description="จัดการห้องเรียนและกลุ่มเรียนทั้งหมดในระบบ"
          icon={School}
          actions={
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              เพิ่มห้องเรียน
            </button>
          }
        />

        <SearchFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          limit={limit}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
          onRefresh={fetchClassrooms}
          loading={loading}
          placeholder="ค้นหาห้อง, แผนก หรือระดับชั้น..."
          extraFilters={
            <div className="relative group min-w-[200px]">
              <select
                className="w-full px-4 py-4 bg-slate-50 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                value={filterDept}
                onChange={(e) => {
                  setFilterDept(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">ทุกแผนกวิชา</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.dept_name}
                  </option>
                ))}
              </select>
            </div>
          }
        />

        <DataTable
          columns={[
            { header: 'ชื่อห้องเรียน' },
            { header: 'แผนกวิชา' },
            { header: 'ระดับชั้น' },
            { header: 'นักเรียน', align: 'center' },
            { header: 'การจัดการ', align: 'right' }
          ]}
          loading={loading}
        >
          {classrooms.map((classroom) => (
            <tr key={classroom.id} className="hover:bg-blue-50/30 transition-colors group">
              <td className="px-8 py-5">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-900 text-lg">ห้อง {classroom.room_name}</span>
                </div>
              </td>
              <td className="px-8 py-5">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  {classroom.level?.department?.dept_name || 'ไม่ระบุแผนก'}
                </span>
              </td>
              <td className="px-8 py-5">
                <span className="text-gray-600 font-semibold text-sm">
                  {classroom.level?.level_name || 'ทั่วไป'}
                </span>
              </td>
              <td className="px-8 py-5 text-center">
                <button 
                  onClick={() => router.push(`/admin/classrooms/${classroom.id}/students`)}
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold text-xs shadow-md"
                >
                  <Users className="h-3.5 w-3.5 mr-2" />
                  ดูรายชื่อ {classroom._count?.students !== undefined ? `(${classroom._count.students} คน)` : ''}
                </button>
              </td>
              <td className="px-8 py-5 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => handleOpenModal(classroom)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-100"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(classroom.id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-100"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>

        <Pagination 
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={limit}
          onPageChange={setPage}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClassroom ? 'แก้ไขห้องเรียน' : 'เพิ่มห้องเรียนใหม่'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2 ml-1">ชื่อห้องเรียน (เช่น 1/1)</label>
            <input required type="text" placeholder="ระบุชื่อห้องเรียน..." className="w-full px-5 py-4 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold" value={formData.room_name} onChange={(e) => setFormData({ ...formData, room_name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2 ml-1">ระดับชั้น / แผนกวิชา</label>
            <select
              required
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
              value={formData.level_id}
              onChange={(e) => setFormData({ ...formData, level_id: e.target.value })}
            >
              <option value="">เลือกระดับชั้นและแผนก</option>
              {levels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.department?.dept_name} - {lvl.level_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-[2] bg-blue-600 text-white py-5 rounded-lg text-lg hover:bg-blue-700 shadow-xl transition-all active:scale-95 flex justify-center items-center"><Check className="mr-2" />{editingClassroom ? 'อัปเดต' : 'บันทึก'}</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-lg hover:bg-gray-200">ยกเลิก</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}