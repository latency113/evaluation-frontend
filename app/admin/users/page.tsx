"use client";

import { useState, useEffect } from "react";
import { userService } from "@/src/services/userService";
import { teacherService } from "@/src/services/teacherService";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  User,
  Shield,
  Search,
  Key,
  ToggleLeft as Toggle,
  UserCheck,
} from "lucide-react";
import Swal from "sweetalert2";
import { PageHeader } from "@/src/components/ui/PageHeader";
import { SearchFilters } from "@/src/components/ui/SearchFilters";
import { DataTable } from "@/src/components/ui/DataTable";
import { Pagination } from "@/src/components/ui/Pagination";
import { Modal } from "@/src/components/ui/Modal";
import { useAuth } from "@/src/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const { user } = useAuth(true);
  const router = useRouter();
  
  // Role check
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/admin");
    }
  }, [user, router]);

  const [users, setUsers] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "teacher",
    ref_id: "",
    is_active: true,
  });

  useEffect(() => {
    fetchUsers();
    fetchTeachers();
  }, [page, limit]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers(page, limit, searchTerm);
      setUsers(response.data || []);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.total);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await teacherService.getAllTeachers(1, 1000);
      setTeachers(response.data || []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
    }
  };

  const handleOpenModal = (user: any = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: "", // Don't show password
        role: user.role,
        ref_id: user.ref_id?.toString() || "",
        is_active: user.is_active,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        password: "",
        role: "teacher",
        ref_id: "",
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        ref_id: formData.role === "teacher" && formData.ref_id ? parseInt(formData.ref_id) : null,
      };

      if (!editingUser && !dataToSubmit.password) {
        Swal.fire("ผิดพลาด", "กรุณาระบุรหัสผ่านสำหรับผู้ใช้งานใหม่", "error");
        return;
      }

      if (editingUser) {
        // If password is empty, don't update it
        if (!dataToSubmit.password) {
          delete (dataToSubmit as any).password;
        }
        await userService.updateUser(editingUser.id, dataToSubmit);
      } else {
        await userService.createUser(dataToSubmit);
      }

      setIsModalOpen(false);
      fetchUsers();
      Swal.fire({
        title: "สำเร็จ",
        text: "บันทึกข้อมูลผู้ใช้งานเรียบร้อยแล้ว",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้", "error");
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        await userService.deleteUser(id);
        fetchUsers();
        Swal.fire("ลบสำเร็จ!", "ข้อมูลผู้ใช้งานถูกลบแล้ว", "success");
      } catch (err) {
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบข้อมูลได้", "error");
      }
    }
  };

  const toggleActive = async (user: any) => {
    try {
      await userService.updateUser(user.id, { is_active: !user.is_active });
      fetchUsers();
    } catch (err) {
      Swal.fire("ผิดพลาด", "ไม่สามารถเปลี่ยนสถานะได้", "error");
    }
  };

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="จัดการผู้ใช้งาน"
          description={`จัดการสิทธิ์และบัญชีผู้ใช้งานในระบบ (${totalItems} บัญชี)`}
          icon={Shield}
          actions={
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              เพิ่มผู้ใช้งานใหม่
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
          onRefresh={fetchUsers}
          loading={loading}
          placeholder="ค้นหาชื่อผู้ใช้งาน..."
        />

        <DataTable
          columns={[
            { header: "ชื่อผู้ใช้งาน" },
            { header: "บทบาท" },
            { header: "สถานะ", align: "center" },
            { header: "วันที่สร้าง" },
            { header: "การจัดการ", align: "right" },
          ]}
          loading={loading}
        >
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
              <td className="px-8 py-5">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <span className="font-semibold text-gray-900">{user.username}</span>
                </div>
              </td>
              <td className="px-8 py-5">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                  }`}
                >
                  {user.role === "admin" ? "ผู้ดูแลระบบ" : "ครูผู้สอน"}
                </span>
              </td>
              
              <td className="px-8 py-5 text-center">
                <button
                  onClick={() => toggleActive(user)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    user.is_active ? "bg-green-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      user.is_active ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </td>
              <td className="px-8 py-5 text-gray-500 text-sm">
                {new Date(user.created_at).toLocaleDateString("th-TH")}
              </td>
              <td className="px-8 py-5 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleOpenModal(user)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
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
        title={editingUser ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 ml-1">
              ชื่อผู้ใช้งาน (Username)
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                required
                type="text"
                placeholder="ระบุชื่อผู้ใช้งาน..."
                className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 ml-1">
              {editingUser ? "รหัสผ่านใหม่ (ปล่อยว่างถ้าไม่เปลี่ยน)" : "รหัสผ่าน"}
            </label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                required={!editingUser}
                type="password"
                placeholder="ระบุรหัสผ่าน..."
                className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 ml-1">
              บทบาท (Role)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "admin", ref_id: "" })}
                className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                  formData.role === "admin"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-100 bg-gray-50 text-gray-400"
                }`}
              >
                ผู้ดูแลระบบ
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "teacher" })}
                className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                  formData.role === "teacher"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-100 bg-gray-50 text-gray-400"
                }`}
              >
                หัวหน้างานหลักสูตร
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-[2] bg-blue-600 text-white py-5 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-xl transition-all active:scale-95 flex justify-center items-center"
            >
              <Check className="mr-2" />
              {editingUser ? "อัปเดต" : "บันทึก"}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-xl font-bold hover:bg-gray-200"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
