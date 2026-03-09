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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/ui/PageHeader";
import { Modal } from "@/src/components/ui/Modal";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    assignments: 0,
    evaluations: 0,
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
        const [studentsRes, teachersRes, assignmentsRes, evaluationsRes] =
          await Promise.all([
            studentService.getAllStudents(1, 1),
            teacherService.getAllTeachers(1, 1),
            courseAssignmentService.getAllAssignments(1, 1),
            evaluationService.getAllEvaluations(1, 10),
          ]);

        setStats({
          students: studentsRes.meta.total,
          teachers: teachersRes.meta.total,
          assignments: assignmentsRes.meta.total,
          evaluations: evaluationsRes.meta.total,
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
        title="Dashboard Overview"
        description="Teacher Evaluation Management System Dashboard"
        icon={LayoutDashboard}
      />

      <div className="grid gap-6 mb-10 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                <card.icon className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {card.name}
                </p>
                <p className="text-2xl font-bold text-slate-900 leading-tight mt-1">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              Recent Evaluations
            </h2>
            <button
              onClick={() => router.push("/admin/evaluations")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              View All
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentEvaluations.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-xs font-medium">
                No evaluation records found
              </div>
            ) : (
              recentEvaluations.map((evaluation) => (
                <div
                  key={evaluation.id}
                  onClick={() => setSelectedEval(evaluation)}
                  className="p-5 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {evaluation.student?.first_name}{" "}
                          {evaluation.student?.last_name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {evaluation.assignment?.subject?.subject_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center px-2 py-1 rounded border border-slate-200 bg-white text-xs font-bold text-slate-700">
                        <Star className="h-3 w-3 mr-1.5 text-amber-500 fill-amber-500" />
                        {calculateAverage(evaluation.answers)}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                        {new Date(evaluation.eval_date).toLocaleDateString(
                          "th-TH",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xs font-bold text-slate-900 mb-5 uppercase tracking-wider border-b border-slate-100 pb-4">
              Quick Navigation
            </h2>
            <div className="space-y-1">
              {[
                { label: "Manage Students", path: "/admin/students", icon: Users },
                { label: "Manage Teachers", path: "/admin/teachers", icon: GraduationCap },
                { label: "Manage Assignments", path: "/admin/assignments", icon: ClipboardList },
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

          <div className="bg-slate-900 rounded-lg p-6 shadow-md">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white mb-2">
              Technical Support
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-5 font-medium">
              Please contact the IT department for any technical issues or
              system inquiries.
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md text-xs font-bold transition-colors uppercase tracking-wider">
              Open Support Ticket
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedEval}
        onClose={() => setSelectedEval(null)}
        title="Evaluation Details"
        subtitle="Review individual metrics and student feedback"
        icon={Star}
      >
        {selectedEval && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Student Record
                </p>
                <p className="text-slate-900 font-bold text-sm">
                  {selectedEval.student?.first_name}{" "}
                  {selectedEval.student?.last_name}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  ID: {selectedEval.student?.student_code}
                </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Instructor Info
                </p>
                <p className="text-slate-900 font-bold text-sm">
                  {selectedEval.assignment?.teacher?.first_name}{" "}
                  {selectedEval.assignment?.teacher?.last_name}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {selectedEval.assignment?.subject?.subject_name}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                Assessment Metrics
              </h3>
              <div className="space-y-2">
                {selectedEval.answers?.map((answer: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-4 bg-white rounded-lg border border-slate-100"
                  >
                    <p className="text-xs font-bold text-slate-700 flex-1 pr-6">
                      {answer.question?.question_text || `Metric ${idx + 1}`}
                    </p>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div
                          key={s}
                          className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors ${s <= answer.score ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-200"}`}
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
                <p className="text-[10px] font-bold text-blue-600/70 uppercase mb-2.5 flex items-center gap-2 tracking-wider">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Additional Comments
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
