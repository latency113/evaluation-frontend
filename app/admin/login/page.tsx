"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/src/services/userService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RefreshCw, ArrowLeft, ShieldCheck, User, Lock } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "กรุณาระบุชื่อผู้ใช้งาน"),
  password: z.string().min(1, "กรุณาระบุรหัสผ่าน"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const admin = localStorage.getItem("admin");
    if (token && admin) {
      router.push("/admin");
    }
  }, [router]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const admin = await userService.login(data);
      localStorage.setItem("admin", JSON.stringify(admin));
      localStorage.setItem("token", "dummy-admin-token");
      router.push("/admin");
    } catch {
      setError("ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center"
      style={{
        background:
          "linear-gradient(135deg, #3b5bdb 0%, #4c6ef5 50%, #748ffc 100%)",
      }}
    >
      <div className="flex flex-col lg:flex-row justify-center items-center w-full max-w-7xl">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-center px-12 xl:px-20 flex-1 text-white">
          <div className="max-w-md">
            <div className="mb-8">
              <img
                src="https://nc.ac.th/img/logo.png"
                className="h-20 w-20"
                alt="Logo"
              />
            </div>
            <h1 className="text-4xl xl:text-5xl leading-tight mb-5 tracking-tight text-white">
              ระบบประเมิน
              <br />
              ครูผู้สอน
            </h1>
            <p className="text-blue-100 text-base leading-relaxed max-w-sm opacity-90">
              แผงควบคุมสำหรับผู้ดูแลระบบ จัดการข้อมูลนักเรียน ครูผู้สอน
              และผลการประเมินทั้งหมดในระบบ
            </p>
            <div className="mt-12 flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full bg-white transition-all ${i === 0 ? "w-8 opacity-90" : "w-2 opacity-30"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex items-center justify-center w-full lg:w-[520px] px-4 py-8 md:p-12">
          <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl shadow-blue-900/30 p-6 md:p-10">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <img
                src="https://nc.ac.th/img/logo.png"
                className="h-16 w-16"
                alt="Logo"
              />
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 mb-4 shadow-inner">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl text-gray-900 tracking-tight">ผู้ดูแลระบบ</h2>
              <p className="text-sm text-gray-400 mt-1">
                กรอกข้อมูลเพื่อเข้าสู่ระบบ
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-xs text-red-600 leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-wider">
                  <User className="h-3.5 w-3.5" />
                  ชื่อผู้ใช้งาน
                </label>
                <input
                  {...register("username")}
                  type="text"
                  placeholder="ชื่อผู้ใช้งาน"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                />
                {errors.username && (
                  <p className="text-[11px] text-red-500 ml-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-wider">
                  <Lock className="h-3.5 w-3.5" />
                  รหัสผ่าน
                </label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                />
                {errors.password && (
                  <p className="text-[11px] text-red-500 ml-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-blue-600 py-4 text-sm text-white hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-200 disabled:bg-blue-300 flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  "เข้าสู่ระบบ"
                )}
              </button>
            </form>

            {/* Back link */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <button
                onClick={() => router.push("/login")}
                className="flex items-center justify-center gap-2 mx-auto text-[10px] font-extrabold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-[0.15em]"
              >
                <ArrowLeft className="h-4 w-4" />
                กลับหน้าล็อกอินนักเรียน
              </button>
            </div>

            <p className="mt-6 text-center text-[10px] uppercase tracking-widest text-gray-300">
              &copy; 2026 Teacher Evaluation System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
