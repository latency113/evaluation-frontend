"use client";

import { useState, useEffect } from "react";
import { subjectService } from "@/src/services/subjectService";
import { teacherService } from "@/src/services/teacherService";
import { classroomService } from "@/src/services/classroomService";
import { courseAssignmentService } from "@/src/services/courseAssignmentService";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  BookOpen,
  Scan,
  MapPin,
  Search
} from "lucide-react";
import Swal from 'sweetalert2';
import { PageHeader } from "@/src/components/ui/PageHeader";
import { SearchFilters } from "@/src/components/ui/SearchFilters";
import { DataTable } from "@/src/components/ui/DataTable";
import { Pagination } from "@/src/components/ui/Pagination";
import { Modal } from "@/src/components/ui/Modal";
import { AIScanModal } from "@/src/components/ui/AIScanModal";

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    subject_code: "",
    subject_name: "",
    teacher_id: "",
    classroom_id: "",
    term: "",
  });

  // Searchable Teacher States
  const [teacherSearch, setTeacherSearch] = useState("");
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);

  // AI Scan States
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubjects, setTotalSubjects] = useState(0);

  useEffect(() => {
    fetchSubjects();
  }, [page, limit]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const [subjectRes, teacherRes, classroomRes] = await Promise.all([
        subjectService.getAllSubjects(page, limit),
        teacherService.getAllTeachers(1, 1000),
        classroomService.getAllClassrooms(1, 1000)
      ]);
      
      setSubjects(subjectRes.data);
      setTotalPages(subjectRes.meta.totalPages);
      setTotalSubjects(subjectRes.meta.total);
      
      setTeachers(teacherRes.data || []);
      setClassrooms(classroomRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScanResults = async (scanResult: { code: string; name: string }[]) => {
    const result = await Swal.fire({
      title: 'ยืนยันการบันทึก?',
      text: `ยืนยันการบันทึกรายวิชา ${scanResult.length} รายการ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    });

    if (!result.isConfirmed) return;

    try {
      let count = 0;
      for (const item of scanResult) {
        const exists = subjects.find((s) => s.subject_code === item.code);
        if (!exists) {
          await subjectService.createSubject({
            subject_code: item.code,
            subject_name: item.name,
          });
          count++;
        }
      }
      Swal.fire('สำเร็จ!', `บันทึกรายวิชาใหม่สำเร็จ ${count} รายการ!`, 'success');
      setIsScanModalOpen(false);
      fetchSubjects();
    } catch (err) {
      Swal.fire('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    }
  };

  const handleOpenModal = (subject: any = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        subject_code: subject.subject_code,
        subject_name: subject.subject_name,
        teacher_id: "",
        classroom_id: "",
        term: "",
      });
      setTeacherSearch("");
    } else {
      setEditingSubject(null);
      setFormData({
        subject_code: "",
        subject_name: "",
        teacher_id: "",
        classroom_id: "",
        term: "",
      });
      setTeacherSearch("");
    }
    setIsModalOpen(true);
  };

  const filteredTeachers = teachers.filter((t) =>
    `${t.first_name} ${t.last_name}`
      .toLowerCase()
      .includes(teacherSearch.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let subject;
      if (editingSubject) {
        subject = await subjectService.updateSubject(editingSubject.id, {
          subject_code: formData.subject_code,
          subject_name: formData.subject_name
        });
      } else {
        subject = await subjectService.createSubject({
          subject_code: formData.subject_code,
          subject_name: formData.subject_name
        });
      }

      if (formData.teacher_id && formData.classroom_id && formData.term) {
        await courseAssignmentService.createAssignment({
          subject_id: subject.id,
          teacher_id: parseInt(formData.teacher_id),
          classroom_id: parseInt(formData.classroom_id),
          term: formData.term
        });
      }

      setIsModalOpen(false);
      fetchSubjects();
      Swal.fire({
        title: 'สำเร็จ',
        text: 'บันทึกข้อมูลรายวิชาเรียบร้อยแล้ว',
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
      text: 'ยืนยันการลบรายวิชานี้?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await subjectService.deleteSubject(id);
        fetchSubjects();
        Swal.fire('ลบสำเร็จ!', 'ข้อมูลรายวิชาถูกลบแล้ว', 'success');
      } catch (err) {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
      }
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.subject_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subject_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="SUBJECTS"
          description={`จัดการฐานข้อมูลรายวิชา (${totalSubjects} วิชา)`}
          icon={BookOpen}
          actions={
            <>
              <button
                onClick={() => setIsScanModalOpen(true)}
                className="flex items-center px-6 py-3 bg-white text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-all font-bold shadow-sm"
              >
                <Scan className="mr-2 h-5 w-5" />
                AI Scan Subjects
              </button>
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-100"
              >
                <Plus className="mr-2 h-5 w-5" />
                เพิ่มรายวิชา
              </button>
            </>
          }
        />

        <SearchFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          limit={limit}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
          onRefresh={fetchSubjects}
          loading={loading}
          placeholder="ค้นหารหัสหรือชื่อวิชา..."
        />

        <DataTable
          columns={[
            { header: 'รหัสวิชา' },
            { header: 'ชื่อวิชา' },
            { header: 'การจัดการ', align: 'right' }
          ]}
          loading={loading}
        >
          {filteredSubjects.map((subject) => (
            <tr key={subject.id} className="hover:bg-blue-50/50 transition-colors group">
              <td className="px-8 py-5 font-mono font-bold text-blue-600 text-sm">{subject.subject_code}</td>
              <td className="px-8 py-5 font-black text-gray-900">{subject.subject_name}</td>
              <td className="px-8 py-5 text-right space-x-2">
                <button onClick={() => handleOpenModal(subject)} className="p-2 text-gray-400 hover:text-blue-600 active:scale-90 transition-transform"><Edit2 className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(subject.id)} className="p-2 text-gray-400 hover:text-red-600 active:scale-90 transition-transform"><Trash2 className="h-4 w-4" /></button>
              </td>
            </tr>
          ))}
        </DataTable>

        <Pagination 
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <AIScanModal 
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onSave={handleSaveScanResults}
      />

      {/* Manual Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? "แก้ไขรายวิชา" : "เพิ่มรายวิชาใหม่"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">รหัสวิชา</label>
              <input required type="text" className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold outline-none" value={formData.subject_code} onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ชื่อวิชา</label>
              <input required type="text" className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold outline-none" value={formData.subject_name} onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })} />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 leading-none">ข้อมูลการจัดการสอน (เลือกหรือไม่ก็ได้)</p>
            
            <div className="space-y-4">
              <div className="relative space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ครูผู้สอน</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="พิมพ์ชื่อครูเพื่อค้นหา..."
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-900 outline-none transition-all"
                    value={teacherSearch}
                    onChange={(e) => {
                      setTeacherSearch(e.target.value);
                      setIsTeacherDropdownOpen(true);
                    }}
                    onFocus={() => setIsTeacherDropdownOpen(true)}
                  />
                </div>
                {isTeacherDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-60 overflow-auto scrollbar-hide">
                    {filteredTeachers.length > 0 ? (
                      filteredTeachers.map((t) => (
                        <div
                          key={t.id}
                          className="px-5 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              teacher_id: t.id.toString(),
                            });
                            setTeacherSearch(`${t.first_name} ${t.last_name}`);
                            setIsTeacherDropdownOpen(false);
                          }}
                        >
                          <span className="font-bold text-gray-700">
                            {t.first_name} {t.last_name}
                          </span>
                          {formData.teacher_id === t.id.toString() && (
                            <Check className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-5 py-4 text-center text-gray-400 font-medium">
                        ไม่พบชื่อครูที่ระบุ
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ห้องเรียน</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                    <select
                      className="w-full pl-11 pr-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold outline-none cursor-pointer appearance-none"
                      value={formData.classroom_id}
                      onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value })}
                    >
                      <option value="">เลือกห้องเรียน</option>
                      {classrooms.map((c) => (
                        <option key={c.id} value={c.id}>
                          ห้อง {c.room_name} - {c.level?.department?.dept_name || 'ไม่ระบุแผนก'} ({c.level?.level_name || 'ทั่วไป'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ภาคเรียน</label>
                  <input 
                    type="text" 
                    placeholder="เช่น 1/2567"
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold outline-none transition-all" 
                    value={formData.term} 
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="submit" className="flex-[2] bg-blue-600 text-white py-5 rounded-xl font-black text-lg hover:bg-blue-700 shadow-xl transition-all active:scale-[0.98] flex justify-center items-center group">
              <Check className="mr-2 h-6 w-6 transition-transform group-hover:scale-125" />
              {editingSubject ? "อัปเดตรายวิชา" : "บันทึกรายวิชา"}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-xl font-black hover:bg-gray-200 transition-all active:scale-[0.98]">ยกเลิก</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
