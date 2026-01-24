"use client";

import { useState, useEffect } from "react";
import { courseAssignmentService } from "@/src/services/courseAssignmentService";
import { teacherService } from "@/src/services/teacherService";
import { subjectService } from "@/src/services/subjectService";
import { classroomService } from "@/src/services/classroomService";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Check,
  ClipboardList,
  FileUp,
  FileSpreadsheet,
  Download,
  RefreshCw
} from "lucide-react";
import Swal from 'sweetalert2';
import { PageHeader } from "@/src/components/ui/PageHeader";
import { SearchFilters } from "@/src/components/ui/SearchFilters";
import { DataTable } from "@/src/components/ui/DataTable";
import { Pagination } from "@/src/components/ui/Pagination";
import { Modal } from "@/src/components/ui/Modal";

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [termForImport, setTermForImport] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);

  // Searchable Teacher States
  const [teacherSearch, setTeacherSearch] = useState("");
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAssignments, setTotalAssignments] = useState(0);

  const [formData, setFormData] = useState({
    teacher_id: "",
    subject_id: "",
    classroom_id: "",
    term: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, [page, limit]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchInitialData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [assignData, teacherData, subjectData, roomData] =
        await Promise.all([
          courseAssignmentService.getAllAssignments(page, limit, searchTerm),
          teacherService.getAllTeachers(1, 1000),
          subjectService.getAllSubjects(1, 1000),
          classroomService.getAllClassrooms(1, 1000),
        ]);
      setAssignments(assignData.data);
      setTotalPages(assignData.meta.totalPages);
      setTotalAssignments(assignData.meta.total);

      setTeachers(teacherData.data);
      setSubjects(subjectData.data);
      setClassrooms(roomData.data);
    } catch (err) {
      console.error("Error fetching data:", err);
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
    if (!termForImport) {
        Swal.fire('คำเตือน', 'กรุณาระบุภาคเรียนก่อนนำเข้าข้อมูล', 'warning');
        return;
    }
    
    setIsProcessing(true);
    try {
      const response = await courseAssignmentService.importAssignments(selectedFile, termForImport);
      Swal.fire('สำเร็จ', response.message, 'success');
      setIsImportModalOpen(false);
      setSelectedFile(null);
      setTermForImport("");
      setPage(1);
      fetchInitialData();
    } catch (err: any) {
      console.error(err);
      Swal.fire('เกิดข้อผิดพลาด', err.response?.data?.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenModal = (assignment: any = null) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        teacher_id: assignment.teacher_id?.toString() || "",
        subject_id: assignment.subject_id?.toString() || "",
        classroom_id: assignment.classroom_id?.toString() || "",
        term: assignment.term || "",
      });
      const teacher = teachers.find((t) => t.id === assignment.teacher_id);
      setTeacherSearch(
        teacher ? `${teacher.first_name} ${teacher.last_name}` : "",
      );
    } else {
      setEditingAssignment(null);
      setFormData({
        teacher_id: "",
        subject_id: "",
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
    const dataToSubmit = {
      teacher_id: formData.teacher_id ? parseInt(formData.teacher_id) : null,
      subject_id: formData.subject_id ? parseInt(formData.subject_id) : null,
      classroom_id: formData.classroom_id
        ? parseInt(formData.classroom_id)
        : null,
      term: formData.term,
    };

    try {
      if (editingAssignment) {
        await courseAssignmentService.updateAssignment(
          editingAssignment.id,
          dataToSubmit,
        );
      } else {
        await courseAssignmentService.createAssignment(dataToSubmit);
      }
      setIsModalOpen(false);
      fetchInitialData();
      Swal.fire({
        title: 'สำเร็จ',
        text: 'บันทึกข้อมูลการจัดการสอนเรียบร้อยแล้ว',
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
      text: 'คุณแน่ใจหรือไม่ว่าต้องการลบการจัดการสอนนี้?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await courseAssignmentService.deleteAssignment(id);
        fetchInitialData();
        Swal.fire('ลบสำเร็จ!', 'ข้อมูลการจัดการสอนถูกลบแล้ว', 'success');
      } catch (err) {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
      }
    }
  };

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="การจัดการการสอน"
          description={`จัดการการสอนรายวิชา (${totalAssignments} รายการ)`}
          icon={ClipboardList}
          actions={
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center px-6 py-3 bg-white text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-all font-semibold shadow-sm"
              >
                <FileUp className="mr-2 h-5 w-5" />
                นำเข้าไฟล์ Excel
              </button>
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                สร้างการจัดการสอนรายวิชา
              </button>
            </>
          }
        />

        <SearchFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          limit={limit}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
          onRefresh={fetchInitialData}
          loading={loading}
          placeholder="ค้นหาตามรายวิชา ครู หรือห้องเรียน..."
        />

        <DataTable
          columns={[
            { header: 'วิชาที่สอน' },
            { header: 'ครูผู้สอน' },
            { header: 'แผนกวิชา' },
            { header: 'ห้องเรียน' },
            { header: 'ภาคเรียน' },
            { header: 'การจัดการ', align: 'right' }
          ]}
          loading={loading}
        >
          {assignments.map((a) => (
            <tr
              key={a.id}
              className="hover:bg-blue-50/50 transition-colors group"
            >
              <td className="px-8 py-5">
                <div className="font-semibold text-blue-600 text-xs mb-1">
                  {a.subject?.subject_code}
                </div>
                <div className="font-semibold text-gray-900">
                  {a.subject?.subject_name}
                </div>
              </td>
              <td className="px-8 py-5 text-gray-700 font-semibold">
                {a.teacher?.first_name} {a.teacher?.last_name}
              </td>
              <td className="px-8 py-5">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  {a.classroom?.department?.dept_name || a.classroom?.level?.department?.dept_name || 'ไม่ระบุแผนก'}
                </span>
              </td>
              <td className="px-8 py-5">
                <div className="flex flex-col gap-1">
                  <span className="text-md text-blue-500 uppercase tracking-wider ml-1">
                    {a.classroom?.level?.level_name || ""}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 w-fit">
                    {a.classroom?.room_name || "N/A"}{" "}
                  </span>
                </div>
              </td>
              <td className="px-8 py-5 text-gray-600 text-sm font-semibold">
                {a.term}
              </td>
              <td className="px-8 py-5 text-right space-x-2">
                <button
                  onClick={() => handleOpenModal(a)}
                  className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAssignment ? "แก้ไขภาระงาน" : "สร้างภาระงานใหม่"}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2 ml-1">
              วิชา
            </label>
            <select
              required
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
              value={formData.subject_id}
              onChange={(e) =>
                setFormData({ ...formData, subject_id: e.target.value })
              }
            >
              <option value="">เลือกวิชา</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subject_code} - {s.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2 ml-1">
              ครูผู้สอน
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="พิมพ์ชื่อครูเพื่อค้นหา..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold text-gray-900"
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
                      <span className="font-semibold text-gray-700">
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
            <input type="hidden" required value={formData.teacher_id} />
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2 ml-1">
              ห้องเรียน
            </label>
            <select
              required
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
              value={formData.classroom_id}
              onChange={(e) =>
                setFormData({ ...formData, classroom_id: e.target.value })
              }
            >
              <option value="">เลือกห้องเรียน</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  ห้อง {c.room_name} -{" "}
                  {c.level?.department?.dept_name || "ไม่ระบุแผนก"} (
                  {c.level?.level_name || "ทั่วไป"})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2 ml-1">
              ภาคเรียน (เช่น 2/2568)
            </label>
            <input
              required
              type="text"
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
              value={formData.term}
              onChange={(e) =>
                setFormData({ ...formData, term: e.target.value })
              }
            />
          </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-[2] bg-blue-600 text-white py-5 rounded-xl text-lg hover:bg-blue-700 shadow-xl transition-all active:scale-95 flex justify-center items-center"
                      >
                        <Check className="mr-2" />
                        {editingAssignment ? "อัปเดต" : "บันทึก"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-xl hover:bg-gray-200"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </form>
                </Modal>
          
                <Modal
                  isOpen={isImportModalOpen}
                  onClose={() => {
                    setIsImportModalOpen(false);
                    setSelectedFile(null);
                    setTermForImport("");
                  }}
                  title="นำเข้าข้อมูลการสอน"
                  subtitle="ไฟล์ Excel หัวตาราง: รหัสวิชา, ชื่อวิชา, ชื่อครู, ห้องเรียน, ภาคเรียน"
                  icon={FileSpreadsheet}
                >
                  <div className="mb-6">
                    <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2 ml-1">
                      ภาคเรียน (เช่น 2/2568)
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="ระบุภาคเรียนที่จะนำเข้า..."
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                      value={termForImport}
                      onChange={(e) => setTermForImport(e.target.value)}
                    />
                  </div>

                  <div className="border-4 border-dashed border-gray-100 rounded-2xl p-12 text-center bg-gray-50/50 mb-8 relative hover:border-blue-200 transition-colors">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".xlsx"
                      onChange={handleFileChange}
                    />
                    {selectedFile ? (
                      <div className="flex flex-col items-center">
                        <div className="bg-green-100 p-4 rounded-full mb-4 text-green-600 shadow-lg shadow-green-100">
                          <Check className="h-10 w-10" />
                        </div>
                        <span className="text-lg  text-gray-800">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Download className="h-12 w-12 text-blue-400 mb-4" />
                        <span className="text-xl  text-gray-700 tracking-tight uppercase">
                          เลือกไฟล์ Excel (.xlsx)
                        </span>
                      </div>
                    )}
                  </div>
          
                  <div className="flex gap-4">
                    <button
                      disabled={!selectedFile || isProcessing}
                      onClick={handleImportSubmit}
                      className="flex-[2] bg-blue-600 text-white py-5 rounded-lg  text-lg hover:bg-blue-700 disabled:bg-blue-200 shadow-xl transition-all flex justify-center items-center active:scale-95"
                    >
                      {isProcessing ? (
                        <RefreshCw className="h-6 w-6 animate-spin mr-3" />
                      ) : (
                        <FileUp className="mr-3 h-6 w-6" />
                      )}
                      เริ่มนำเข้าข้อมูล
                    </button>
                    <button
                      onClick={() => {
                        setIsImportModalOpen(false);
                        setSelectedFile(null);
                      }}
                      className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-lg hover:bg-gray-200 transition-all active:scale-95"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </Modal>
              </div>
            );
          }
          