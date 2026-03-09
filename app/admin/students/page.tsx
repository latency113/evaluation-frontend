"use client";

import { useState, useEffect } from "react";
import { studentService } from "@/src/services/studentService";
import api from "@/src/lib/api";
import {
  Plus,
  FileUp,
  Trash2,
  Edit2,
  Download,
  Check,
  RefreshCw,
  FileSpreadsheet,
  Users,
} from "lucide-react";
import Swal from "sweetalert2";
import { PageHeader } from "@/src/components/ui/PageHeader";
import { SearchFilters } from "@/src/components/ui/SearchFilters";
import { DataTable } from "@/src/components/ui/DataTable";
import { Pagination } from "@/src/components/ui/Pagination";
import { Modal } from "@/src/components/ui/Modal";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    student_code: "",
    first_name: "",
    last_name: "",
    classroom_id: "",
  });

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
    fetchClassrooms();
  }, [page, limit]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentService.getAllStudents(
        page,
        limit,
        searchTerm,
      );
      setStudents(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalStudents(response.meta.total);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassrooms = async () => {
    try {
      const response = await api.get("/classrooms?limit=1000");
      setClassrooms(response.data.data || []);
    } catch (err) {
      console.error("Error fetching classrooms:", err);
    }
  };

  const handleOpenModal = (student: any = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        student_code: student.student_code,
        first_name: student.first_name,
        last_name: student.last_name,
        classroom_id: student.classroom_id?.toString() || "",
      });
    } else {
      setEditingStudent(null);
      setFormData({
        student_code: "",
        first_name: "",
        last_name: "",
        classroom_id: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        classroom_id: formData.classroom_id
          ? parseInt(formData.classroom_id)
          : null,
      };

      if (editingStudent) {
        await studentService.updateStudent(editingStudent.id, dataToSubmit);
      } else {
        await studentService.createStudent(dataToSubmit);
      }

      setIsModalOpen(false);
      fetchStudents();
      Swal.fire({
        title: "สำเร็จ",
        text: "บันทึกข้อมูลนักเรียนเรียบร้อยแล้ว",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้", "error");
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
    formData.append("file", selectedFile);

    try {
      const response = await api.post("/classrooms/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("สำเร็จ", response.data.message, "success");
      setIsImportModalOpen(false);
      setSelectedFile(null);
      setPage(1);
      fetchStudents();
    } catch (err: any) {
      console.error(err);
      Swal.fire(
        "เกิดข้อผิดพลาด",
        err.response?.data?.message || "เกิดข้อผิดพลาดในการนำเข้าข้อมูล",
        "error",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "ยืนยันการลบข้อมูลนักเรียน?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        await studentService.deleteStudent(id);
        fetchStudents();
        Swal.fire("ลบสำเร็จ!", "ข้อมูลนักเรียนถูกลบแล้ว", "success");
      } catch (err) {
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบข้อมูลได้", "error");
      }
    }
  };

    return (

      <div className="p-8 font-sans bg-gray-50 min-h-screen">

        <div className="max-w-7xl mx-auto">

          <PageHeader 

            title="ฐานข้อมูลนักเรียน"

            description={`ทะเบียนนักเรียนทั้งหมด (${totalStudents} คน)`}

  
          icon={Users}
          actions={
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center px-6 py-3 bg-white text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-all font-semibold shadow-sm"
              >
                <FileUp className="mr-2 h-5 w-5" />
                Smart Import
              </button>
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold shadow-lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                เพิ่มนักเรียนใหม่
              </button>
            </>
          }
        />

        <SearchFilters
          searchTerm={searchTerm}
          onSearchChange={(s) => {
            setSearchTerm(s);
            setPage(1);
          }}
          limit={limit}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
          onRefresh={fetchStudents}
          loading={loading}
          placeholder="ค้นหาจากรหัส หรือชื่อ (ค้นหาทั้งฐานข้อมูล)..."
        />

        <DataTable
          columns={[
            { header: "รหัสประจำตัว" },
            { header: "ชื่อ-นามสกุล" },
            { header: "ห้องเรียน" },
            { header: "การจัดการ", align: "right" },
          ]}
          loading={loading}
        >
          {students.map((student) => (
            <tr
              key={student.id}
              className="hover:bg-blue-50/50 transition-colors group"
            >
              <td className="px-8 py-5 font-mono font-semibold text-gray-600 text-sm">
                {student.student_code}
              </td>
              <td className="px-8 py-5 text-gray-900">
                {student.first_name} {student.last_name}
              </td>
              <td className="px-8 py-5">
                <div className="flex flex-col gap-1">
                  <span className="text-md text-blue-500 uppercase tracking-wider ml-1 leading-none">
                    {student.classroom?.level?.department?.dept_name ||
                    student.classroom?.level?.level_name
                      ? `${student.classroom?.level?.department?.dept_name || ""} (${student.classroom?.level?.level_name || "ไม่ระบุชั้นปี"})`
                      : "ยังไม่ระบุแผนก/ชั้นปี"}
                  </span>
                  <span className="px-3 py-1 rounded-md text-md font-semibold bg-blue-50 text-blue-700 border border-blue-100 w-fit">
                    ห้อง {student.classroom?.room_name || "ไม่ได้ระบุ"}
                  </span>
                </div>
              </td>
              <td className="px-8 py-5 text-right space-x-2">
                <button
                  onClick={() => handleOpenModal(student)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-md shadow-sm transition-all border border-transparent hover:border-gray-100"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(student.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-md shadow-sm transition-all border border-transparent hover:border-gray-100"
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
          totalItems={totalStudents}
          limit={limit}
          onPageChange={setPage}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? "แก้ไขข้อมูลนักเรียน" : "เพิ่มนักเรียนใหม่"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-md text-gray-400 uppercase tracking-widest ml-1">
              รหัสประจำตัวนักเรียน
            </label>
            <input
              required
              type="text"
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold outline-none"
              value={formData.student_code}
              onChange={(e) =>
                setFormData({ ...formData, student_code: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-md text-gray-400 uppercase tracking-widest ml-1">
                ชื่อ
              </label>
              <input
                required
                type="text"
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold outline-none"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="block text-md text-gray-400 uppercase tracking-widest ml-1">
                นามสกุล
              </label>
              <input
                required
                type="text"
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold outline-none"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-md text-gray-400 uppercase tracking-widest ml-1">
              ห้องเรียน
            </label>
            <select
              required
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold outline-none cursor-pointer appearance-none"
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

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="flex-[2] bg-blue-600 text-white py-5 rounded-xl text-lg hover:bg-blue-700 shadow-xl transition-all active:scale-[0.98] flex justify-center items-center group"
            >
              <Check className="mr-2 h-6 w-6 transition-transform group-hover:scale-125" />
              {editingStudent ? "อัปเดตข้อมูล" : "บันทึกข้อมูล"}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98]"
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
        }}
        title="Smart Import"
        subtitle="ประมวลผลข้อมูลจากทุก Sheet อัตโนมัติ"
        icon={FileSpreadsheet}
      >
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
              <span className="text-lg text-gray-800">{selectedFile.name}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Download className="h-12 w-12 text-blue-400 mb-4" />
              <span className="text-xl text-gray-700 tracking-tight uppercase">
                เลือกไฟล์ Excel (.xlsx)
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            disabled={!selectedFile || isProcessing}
            onClick={handleImportSubmit}
            className="flex-[2] bg-blue-600 text-white py-5 rounded-lg text-lg hover:bg-blue-700 disabled:bg-blue-200 shadow-xl transition-all flex justify-center items-center active:scale-95"
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
