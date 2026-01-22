"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { studentService } from "@/src/services/studentService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  LogIn,
  User,
  Hash,
  RefreshCw,
  ShieldCheck,
  IdCard,
} from "lucide-react";

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
      // ฟังก์ชันสำหรับล้างคำนำหน้าและช่องว่าง
      const cleanName = (name: string) => {
        return name
          .replace(/^(นาย|นางสาว|นาง|เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\.)/g, "")
          .replace(/\s+/g, "")
          .trim()
          .toLowerCase();
      };

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
    } catch (err) {
      console.error("Login error:", err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fafc]">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -left-20 h-96 w-96 rounded-md bg-blue-100/50 blur-3xl"></div>
      <div className="absolute -bottom-24 -right-20 h-96 w-96 rounded-md bg-indigo-100/50 blur-3xl"></div>

      <div className="relative w-full max-w-[440px] px-4">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-200">
            <img src="https://nc.ac.th/img/logo.png" className="h-14 w-14" />
          </div>
          <h1 className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-4xl tracking-tight text-transparent">
            ระบบประเมินครู
          </h1>
          <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-gray-400">
            Teacher Evaluation System
          </p>
        </div>

        <div className=" border border-white bg-white/80 p-8 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] backdrop-blur-xl md:p-10">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-sm bg-red-50 p-4 border border-red-100">
              <div className="mt-0.5 rounded-md bg-red-500 p-1">
                <XIcon className="h-3 w-3 text-white" />
              </div>
              <p className="text-sm font-bold leading-tight text-red-600">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="ml-1 text-sm uppercase tracking-widest text-gray-400">
                รหัสนักเรียน
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <IdCard className="h-5 w-5" />
                </div>
                <input
                  {...register("student_code")}
                  type="text"
                  className="block w-full rounded-sm border-2 border-gray-100 bg-gray-50/50 py-4 pl-14 pr-4 text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  placeholder="รหัสประจำตัวนักเรียน นักศึกษา..."
                />
              </div>
              {errors.student_code && (
                <p className="ml-1 text-sm font-bold text-red-500">
                  {errors.student_code.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-sm uppercase tracking-widest text-gray-400">
                ชื่อ - นามสกุล
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  {...register("full_name")}
                  type="text"
                  className="block w-full rounded-sm border-2 border-gray-100 bg-gray-50/50 py-4 pl-14 pr-4 text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  placeholder="ชื่อ และนามสกุล..."
                />
              </div>
              {errors.full_name && (
                <p className="ml-1 text-sm font-bold text-red-500">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-sm bg-blue-600 py-5 text-lg text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:bg-blue-300"
            >
              <div className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <LogIn className="mr-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
                    เข้าสู่ระบบเพื่อเริ่มประเมิน
                  </>
                )}
              </div>
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
            </button>
          </form>

          <div className="mt-10 border-t border-gray-100 pt-8 text-center">
            <button
              onClick={() => router.push("/admin/login")}
              className="flex items-center justify-center gap-2 mx-auto text-md uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              สำหรับผู้ดูแลระบบ (Admin)
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-300">
          &copy; 2026 Educational Evaluation System
        </p>
      </div>
    </div>
  );
}

function XIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
