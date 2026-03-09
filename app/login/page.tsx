"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { studentService } from "@/src/services/studentService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RefreshCw, ShieldCheck, IdCard, User } from "lucide-react";

const loginSchema = z.object({
  student_code: z.string().min(1, "กรุณาระบุรหัสนักเรียน"),
  full_name: z.string().min(1, "กรุณาระบุชื่อ-นามสกุล"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function StudentLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const cleanName = (name: string) =>
        name
          .replace(/^(นาย|นางสาว|นาง|เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\.)/g, "")
          .replace(/\s+/g, "")
          .trim()
          .toLowerCase();

      const response = await studentService.getAllStudents(
        1,
        10,
        data.student_code,
      );
      const students = response.data || [];

      const student = students.find(
        (s: any) =>
          s.student_code === data.student_code &&
          cleanName(`${s.first_name}${s.last_name}`) ===
            cleanName(data.full_name),
      );

      if (student) {
        localStorage.setItem("student", JSON.stringify(student));
        router.push("/evaluate");
      } else {
        setError(
          "ไม่พบรหัสนักเรียน หรือชื่อ-นามสกุลไม่ตรงกับในระบบ กรุณาตรวจสอบอีกครั้ง",
        );
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #3b5bdb 0%, #4c6ef5 50%, #748ffc 100%)",
      }}
    >
      <div className="flex justify-center items-center">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-center px-20 flex-1 text-white">
          <div className="max-w-md">
            <div className="mb-8">
              <img
                src="https://nc.ac.th/img/logo.png"
                className="h-20 w-20"
              />
            </div>
            <h1 className="text-5xl font-black leading-tight mb-5 tracking-tight">
              ระบบประเมิน
              <br />
              ครูผู้สอน
            </h1>
            <p className="text-blue-100 text-base leading-relaxed max-w-sm opacity-90">
              ระบบที่ช่วยให้นักศึกษาประเมินผลการสอนของครูผู้สอน
              เพื่อพัฒนาคุณภาพการเรียนการสอนให้ดียิ่งขึ้น
            </p>
            <div className="mt-16 flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full bg-white transition-all ${i === 0 ? "w-8 opacity-90" : "w-2 opacity-30"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex items-center justify-center w-full lg:w-auto lg:min-w-[520px] px-6 py-12">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-blue-900/20 p-8">
            {/* Header */}
            <div className="text-center mb-7">
              <h2 className="text-2xl font-black text-gray-900">
                ยินดีต้อนรับ
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                กรอกข้อมูลเพื่อเข้าสู่ระบบ
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-xs font-semibold text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Student code */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                  <IdCard className="h-3.5 w-3.5" />
                  เลขประจำตัวนักเรียนนักศึกษา
                </label>
                <input
                  {...register("student_code")}
                  type="text"
                  placeholder="68219010001"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-100 transition-all"
                />
                {errors.student_code && (
                  <p className="text-xs font-semibold text-red-500">
                    {errors.student_code.message}
                  </p>
                )}
              </div>

              {/* Full name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                  <User className="h-3.5 w-3.5" />
                  ชื่อ – นามสกุล
                </label>
                <input
                  {...register("full_name")}
                  type="text"
                  placeholder="ชื่อ และนามสกุล"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-100 transition-all"
                />
                {errors.full_name && (
                  <p className="text-xs font-semibold text-red-500">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-700 active:scale-[0.99] transition-all duration-150 disabled:bg-blue-300 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "เข้าสู่ระบบ"
                )}
              </button>
            </form>

            {/* Admin link */}
            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <button
                onClick={() => router.push("/admin/login")}
                className="flex items-center justify-center gap-1.5 mx-auto text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                สำหรับผู้ดูแลระบบ (Admin)
              </button>
            </div>

            <p className="mt-5 text-center text-[10px] font-bold uppercase tracking-widest text-gray-300">
              &copy; 2026 Teacher Evaluation System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
