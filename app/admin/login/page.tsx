"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/src/services/userService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Lock,
  User,
  ShieldAlert,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

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

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const admin = await userService.login(data);
      localStorage.setItem("admin", JSON.stringify(admin));
      router.push("/admin");
    } catch (err) {
      setError("ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0f172a]">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -left-20 h-96 w-96 bg-indigo-900/20 blur-3xl"></div>
      <div className="absolute -bottom-24 -right-20 h-96 w-96 bg-blue-900/20 blur-3xl"></div>

      <div className="relative w-full max-w-[440px] px-4">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-slate-700 to-slate-900 text-red-500 shadow-xl shadow-black/50 border border-slate-700">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h1 className="bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-3xl font-black tracking-tight text-transparent">
            ระบบจัดการผู้ดูแลระบบ
          </h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Admin Control Panel
          </p>
        </div>

        <div className="border border-slate-800 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-xl md:p-10">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-sm bg-red-500/10 p-4 border border-red-500/20">
              <div className="mt-0.5 bg-red-500 p-1">
                <XIcon className="h-3 w-3 text-white" />
              </div>
              <p className="text-sm font-bold leading-tight text-red-400">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                ชื่อผู้ใช้งาน
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  {...register("username")}
                  type="text"
                  className="block w-full rounded-sm border-2 border-slate-800 bg-slate-950/50 py-4 pl-14 pr-4 font-bold text-slate-200 outline-none transition-all focus:border-blue-500 focus:bg-slate-950 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="ชื่อผู้ใช้งาน..."
                />
              </div>
              {errors.username && (
                <p className="ml-1 text-[11px] font-bold text-red-400">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                รหัสผ่าน
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  {...register("password")}
                  type="password"
                  className="block w-full rounded-sm border-2 border-slate-800 bg-slate-950/50 py-4 pl-14 pr-4 font-bold text-slate-200 outline-none transition-all focus:border-blue-500 focus:bg-slate-950 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="ml-1 text-[11px] font-bold text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-sm bg-slate-100 py-5 font-black text-lg text-slate-900 shadow-xl transition-all hover:bg-white active:scale-[0.98] disabled:bg-slate-700 disabled:text-slate-500"
            >
              <div className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="mr-3 h-6 w-6" />
                    เข้าสู่ระบบแอดมิน
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-10 border-t border-slate-800 pt-8 text-center">
            <button
              onClick={() => router.push("/login")}
              className="flex items-center justify-center gap-2 mx-auto text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              กลับหน้าล็อกอินนักเรียน
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600">
          &copy; 2026 Admin Control System
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
