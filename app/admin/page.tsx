"use client";

import { useState, useEffect } from "react";
import { studentService } from "@/src/services/studentService";
import { teacherService } from "@/src/services/teacherService";
import { courseAssignmentService } from "@/src/services/courseAssignmentService";
import { evaluationService } from "@/src/services/evaluationService";
import {
  Users,
  GraduationCap,
  ClipboardList,
  Star,
  Clock,
  ChevronRight,
  MessageSquare,
  LayoutDashboard,
  BookOpen,
  ShieldCheck,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/ui/PageHeader";
import { Modal } from "@/src/components/ui/Modal";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

function StatsCard({ title, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    sky: "bg-sky-50 text-sky-600 border-sky-100",
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest mb-1 truncate">
            {title}
          </p>
          <p className="text-xl md:text-2xl text-slate-900 tabular-nums">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`p-2.5 md:p-3 rounded-lg border transition-all group-hover:scale-110 ${colors[color]}`}>
          <Icon className="h-5 w-5 md:h-6 md:w-6" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    assignments: 0,
    evaluations: 0,
    evaluatedStudents: 0,
  });
  const [recentEvaluations, setRecentEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEval, setSelectedEval] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    const admin = localStorage.getItem("admin");
    if (!token || !admin) {
      router.push("/admin/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const [studentsRes, teachersRes, assignmentsRes, evaluationsRes, allEvals] =
          await Promise.all([
            studentService.getAllStudents(1, 1),
            teacherService.getAllTeachers(1, 1),
            courseAssignmentService.getAllAssignments(1, 1),
            evaluationService.getAllEvaluations(1, 10),
            evaluationService.getAllEvaluationsWithoutPagination(),
          ]);

        const uniqueEvaluatedStudents = new Set(allEvals.map((e: any) => e.student_id)).size;

        setStats({
          students: studentsRes.meta.total,
          teachers: teachersRes.meta.total,
          assignments: assignmentsRes.meta.total,
          evaluations: evaluationsRes.meta.total,
          evaluatedStudents: uniqueEvaluatedStudents,
        });

        setRecentEvaluations(evaluationsRes.data || []);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  const calculateAverage = (answers: any[]) => {
    if (!answers || answers.length === 0) return "0.00";
    const sum = answers.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / answers.length).toFixed(2);
  };

  const statCards = [
    {
      name: "นักเรียนทั้งหมด",
      value: stats.students,
      icon: Users,
    },
    {
      name: "ครูผู้สอน",
      value: stats.teachers,
      icon: GraduationCap,
    },
    {
      name: "รายวิชา",
      value: stats.assignments,
      icon: ClipboardList,
    },
    {
      name: "การประเมินรวม",
      value: stats.evaluations,
      icon: Star,
    },
  ];

  if (loading)
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600"></div>
      </div>
    );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="ภาพรวมระบบ (Dashboard)"
        description="ระบบจัดการข้อมูลผลการประเมินครูผู้สอน"
        icon={LayoutDashboard}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
        <StatsCard
          title="จำนวนนักเรียนทั้งหมด"
          value={stats.students}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="จำนวนครูผู้สอน"
          value={stats.teachers}
          icon={GraduationCap}
          color="indigo"
        />
        <StatsCard
          title="จำนวนรายวิชา"
          value={stats.assignments}
          icon={BookOpen}
          color="violet"
        />
        <StatsCard
          title="จำนวนชุดข้อเสนอแนะ"
          value={stats.evaluatedStudents}
          icon={ShieldCheck}
          color="sky"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Recent Evaluations */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              การประเมินล่าสุด
            </h2>
            <button
              onClick={() => router.push("/admin/evaluations")}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              ดูทั้งหมด
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            {recentEvaluations.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-xs font-medium">
                ไม่พบข้อมูลการประเมินล่าสุด
              </div>
            ) : (
              <div className="min-w-[600px] lg:min-w-0">
                {recentEvaluations.map((evaluation) => (
                  <div
                    key={evaluation.id}
                    onClick={() => setSelectedEval(evaluation)}
                    className="group p-4 md:p-5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-4"
                  >
                    <div className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shrink-0">
                      <User className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                        {evaluation.student?.first_name}{" "}
                        {evaluation.student?.last_name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-2">
                        <span>{evaluation.assignment?.teacher?.first_name}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{evaluation.assignment?.subject?.subject_name}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full border border-blue-100 group-hover:bg-blue-600 group-hover:border-blue-700 group-hover:text-white transition-all">
                        <Star className="h-3 w-3 text-blue-500 group-hover:text-blue-200 fill-current" />
                        <span className="text-sm text-blue-700 group-hover:text-white tracking-tighter">
                          {calculateAverage(evaluation.answers)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">
                        คะแนนเฉลี่ย
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Evaluation Progress & Quick Links */}
        <div className="space-y-6 md:space-y-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xs text-slate-900 mb-5 uppercase tracking-wider border-b border-slate-100 pb-4">
              ความคืบหน้าการประเมิน
            </h2>
            <div className="h-[200px] sm:h-[240px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "ประเมินแล้ว", value: stats.evaluatedStudents },
                      { name: "ยังไม่ประเมิน", value: Math.max(0, stats.students - stats.evaluatedStudents) },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      padding: '8px 12px',
                    }}
                    itemStyle={{ color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-slate-700 text-xs ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 text-center">
              <p className="text-3xl font-extrabold text-slate-900">
                {stats.students > 0 ? ((stats.evaluatedStudents / stats.students) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest mt-1">
                อัตราการเข้าประเมิน
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xs text-slate-900 mb-5 uppercase tracking-wider border-b border-slate-100 pb-4">
              เมนูทางลัด
            </h2>
            <div className="space-y-1">
              {[
                { label: "จัดการข้อมูลนักเรียน", path: "/admin/students", icon: Users },
                { label: "จัดการข้อมูลครูผู้สอน", path: "/admin/teachers", icon: GraduationCap },
                { label: "จัดการข้อมูลการสอน", path: "/admin/assignments", icon: ClipboardList },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-md text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-slate-400" />
                    {item.label}
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedEval}
        onClose={() => setSelectedEval(null)}
        title="รายละเอียดการประเมิน"
        subtitle="ตรวจสอบคะแนนรายข้อและเสนอแนะจากนักเรียน"
        icon={Star}
      >
        {selectedEval && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2.5">
                  ข้อมูลนักเรียน
                </p>
                <p className="text-slate-900 text-sm">
                  {selectedEval.student?.first_name}{" "}
                  {selectedEval.student?.last_name}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  รหัส: {selectedEval.student?.student_code}
                </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2.5">
                  ข้อมูลครูผู้สอน
                </p>
                <p className="text-slate-900 text-sm">
                  {selectedEval.assignment?.teacher?.first_name}{" "}
                  {selectedEval.assignment?.teacher?.last_name}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {selectedEval.assignment?.subject?.subject_name}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[11px] text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                หัวข้อผลการประเมิน
              </h3>
              <div className="space-y-2">
                {selectedEval.answers?.map((answer: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-4 bg-white rounded-lg border border-slate-100"
                  >
                    <p className="text-xs text-slate-700 flex-1 pr-6">
                      {answer.question?.question_text || `Metric ${idx + 1}`}
                    </p>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div
                          key={s}
                          className={`w-6 h-6 rounded flex items-center justify-center text-[10px] transition-colors ${s <= answer.score ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-200"}`}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedEval.suggestion && (
              <div className="p-5 bg-blue-50/30 border border-blue-100 rounded-lg border-l-4 border-l-blue-500">
                <p className="text-[10px] text-blue-600/70 uppercase mb-2.5 flex items-center gap-2 tracking-wider">
                  <MessageSquare className="h-3.5 w-3.5" />
                  ข้อเสนอแนะเพิ่มเติม
                </p>
                <p className="text-slate-700 text-sm italic leading-relaxed font-medium">
                  "{selectedEval.suggestion}"
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
