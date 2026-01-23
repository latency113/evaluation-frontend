"use client";

import { useState, useEffect } from "react";
import { departmentService } from "@/src/services/departmentService";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check,
  Building2,
  Layers
} from "lucide-react";
import Swal from "sweetalert2";
import { PageHeader } from "@/src/components/ui/PageHeader";
import { SearchFilters } from "@/src/components/ui/SearchFilters";
import { DataTable } from "@/src/components/ui/DataTable";
import { Pagination } from "@/src/components/ui/Pagination";
import { Modal } from "@/src/components/ui/Modal";

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [formData, setFormData] = useState({ dept_name: "" });

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchDepartments();
  }, [page, limit]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchDepartments();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await departmentService.getAllDepartments(page, limit);
      setDepartments(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalItems(response.meta?.total || 0);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (dept: any = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({ dept_name: dept.dept_name });
    } else {
      setEditingDept(null);
      setFormData({ dept_name: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await departmentService.updateDepartment(editingDept.id, formData);
      } else {
        await departmentService.createDepartment(formData);
      }
      setIsModalOpen(false);
      fetchDepartments();
      Swal.fire({
        title: "สำเร็จ",
        text: "บันทึกข้อมูลแผนกเรียบร้อยแล้ว",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลได้",
        icon: "error",
      });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณต้องการลบแผนกวิชานี้ใช่หรือไม่? ข้อมูลระดับชั้นที่เกี่ยวข้องอาจได้รับผลกระทบ",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        await departmentService.deleteDepartment(id);
        fetchDepartments();
        Swal.fire("ลบสำเร็จ!", "ข้อมูลแผนกวิชาถูกลบแล้ว", "success");
      } catch (err) {
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบข้อมูลได้เนื่องจากมีการใช้งานอยู่ในระดับชั้น", "error");
      }
    }
  };

  const filteredDepartments = departments.filter((d) =>
    d.dept_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 font-sans bg-[#f8fafc] min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="จัดการแผนกวิชา"
          description={`จัดการข้อมูลแผนกวิชาและสาขาทั้งหมด (${totalItems} แผนก)`}
          icon={Building2}
          actions={
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 group"
            >
              <Plus className="mr-2 h-6 w-6 transition-transform group-hover:rotate-90" />
              เพิ่มแผนกวิชาใหม่
            </button>
          }
        />

        <SearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          limit={limit}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
          onRefresh={fetchDepartments}
          loading={loading}
          placeholder="ค้นหาชื่อแผนกวิชา..."
        />

        <DataTable
          columns={[
            { header: "ชื่อแผนกวิชา" },
            { header: "การจัดการ", align: "right" },
          ]}
          loading={loading}
        >
          {filteredDepartments.map((dept) => (
            <tr key={dept.id} className="hover:bg-blue-50/30 transition-all group">
              <td className="px-10 py-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Layers className="h-5 w-5 text-slate-500 group-hover:text-blue-600" />
                  </div>
                  <div className="text-slate-900 text-lg leading-tight group-hover:text-blue-700 transition-colors font-semibold">
                    {dept.dept_name}
                  </div>
                </div>
              </td>
              <td className="px-10 py-6 text-right">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleOpenModal(dept)}
                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100 active:scale-90"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="p-3 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100 active:scale-90"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
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
        title={editingDept ? "แก้ไขข้อมูลแผนก" : "เพิ่มแผนกวิชาใหม่"}
        maxWidth="max-w-md"
        icon={Building2}
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest ml-1 leading-none">
              ชื่อแผนกวิชา
            </label>
            <input
              required
              type="text"
              placeholder="ระบุชื่อแผนกวิชา..."
              className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-lg focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 font-bold outline-none transition-all text-slate-900"
              value={formData.dept_name}
              onChange={(e) => setFormData({ ...formData, dept_name: e.target.value })}
            />
          </div>
          <div className="flex gap-4 pt-6 border-t border-slate-50">
            <button
              type="submit"
              className="flex-[2] bg-blue-600 text-white py-5 rounded-lg text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-[0.98] flex justify-center items-center group"
            >
              <Check className="mr-2 h-6 w-6 transition-transform group-hover:scale-125" />
              {editingDept ? "อัปเดตข้อมูล" : "บันทึกข้อมูล"}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-lg hover:bg-slate-200 transition-all active:scale-[0.98]"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
