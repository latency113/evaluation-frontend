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
              แผงควบคุมสำหรับผู้ดูแลระบบ จัดการข้อมูลนักเรียน ครูผู้สอน
              และผลการประเมินทั้งหมดในระบบ
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
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 mb-3">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">ผู้ดูแลระบบ</h2>
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
              {/* Username */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                  <User className="h-3.5 w-3.5" />
                  ชื่อผู้ใช้งาน
                </label>
                <input
                  {...register("username")}
                  type="text"
                  placeholder="username"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-100 transition-all"
                />
                {errors.username && (
                  <p className="text-xs font-semibold text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                  <Lock className="h-3.5 w-3.5" />
                  รหัสผ่าน
                </label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-100 transition-all"
                />
                {errors.password && (
                  <p className="text-xs font-semibold text-red-500">
                    {errors.password.message}
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

            {/* Back link */}
            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <button
                onClick={() => router.push("/login")}
                className="flex items-center justify-center gap-1.5 mx-auto text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                กลับหน้าล็อกอินนักเรียน
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
