'use client';

import { useState, useEffect } from 'react';
import { studentService } from '@/src/services/studentService';
import { teacherService } from '@/src/services/teacherService';
import { courseAssignmentService } from '@/src/services/courseAssignmentService';
import { evaluationService } from '@/src/services/evaluationService';
import { 
  Users, 
  GraduationCap, 
  ClipboardList, 
  Star,
  TrendingUp,
  Clock,
  ChevronRight,
  Eye,
  MessageSquare,
  LayoutDashboard
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Modal } from '@/src/components/ui/Modal';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    assignments: 0,
    evaluations: 0
  });
  const [recentEvaluations, setRecentEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEval, setSelectedEval] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, teachersRes, assignmentsRes, evaluationsRes] = await Promise.all([
          studentService.getAllStudents(1, 1),
          teacherService.getAllTeachers(1, 1),
          courseAssignmentService.getAllAssignments(1, 1),
          evaluationService.getAllEvaluations(1, 10)
        ]);

        setStats({
          students: studentsRes.meta.total,
          teachers: teachersRes.meta.total,
          assignments: assignmentsRes.meta.total,
          evaluations: evaluationsRes.meta.total
        });
        
        setRecentEvaluations(evaluationsRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const calculateAverage = (answers: any[]) => {
    if (!answers || answers.length === 0) return "0.00";
    const sum = answers.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / answers.length).toFixed(2);
  };

  const statCards = [
    { name: 'รายชื่อนักเรียนทั้งหมด', value: stats.students, icon: Users, color: 'bg-blue-500' },
    { name: 'รายชื่อครูทั้งหมด', value: stats.teachers, icon: GraduationCap, color: 'bg-purple-500' },
    { name: 'รายชื่อรายวิชาทั้งหมด', value: stats.assignments, icon: ClipboardList, color: 'bg-orange-500' },
    { name: 'การประเมินล่าสุด', value: stats.evaluations, icon: Star, color: 'bg-green-500' },
  ];

  if (loading) return <div className="p-8 flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div></div>;

  return (
    <div className="p-8">
      <PageHeader 
        title="ภาพรวมแดชบอร์ด"
        description="ยินดีต้อนรับกลับ, ผู้ดูแลระบบ"
        icon={LayoutDashboard}
      />

      <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{card.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg text-white shadow-lg shadow-gray-200`}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>ระบบปกติ</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/50">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center tracking-tight">
                <Clock className="h-6 w-6 mr-3 text-blue-500" />
                การประเมินล่าสุด
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">การประเมิน 10 รายการล่าสุด</p>
            </div>
            <button 
              onClick={() => router.push('/admin/evaluations')}
              className="flex items-center px-4 py-2 text-xs  text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all group active:scale-95"
            >
              ดูทั้งหมด
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <div className="divide-y divide-slate-50 overflow-y-auto max-h-[600px] scrollbar-hide">
            {recentEvaluations.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="bg-slate-50 p-6 rounded-full mb-4">
                  <Star className="h-10 w-10 text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">ยังไม่มีข้อมูลการประเมิน</p>
              </div>
            ) : (
              recentEvaluations.map((evaluation) => (
                <div 
                  key={evaluation.id} 
                  onClick={() => setSelectedEval(evaluation)}
                  className="p-6 hover:bg-blue-50/30 transition-all cursor-pointer group relative"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight text-sm">
                          {evaluation.student?.first_name} {evaluation.student?.last_name}
                        </p>
                        <p className="text-[11px] font-bold text-slate-500 mt-1">
                          วิชา: <span className="text-slate-900">{evaluation.assignment?.subject?.subject_name}</span>
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                          ครู: {evaluation.assignment?.teacher?.first_name} {evaluation.assignment?.teacher?.last_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-[10px]  bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-sm mb-2">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {calculateAverage(evaluation.answers)}
                      </div>
                      <div className="text-[10px] font-bold text-slate-300 uppercase">
                        {new Date(evaluation.eval_date).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                  </div>
                  {evaluation.suggestion && (
                    <div className="mt-4 p-4 bg-slate-50/80 rounded-xl text-[11px] text-slate-600 font-bold italic border-l-4 border-blue-500 line-clamp-1 group-hover:line-clamp-none transition-all">
                      "{evaluation.suggestion}"
                    </div>
                  )}
                  <div className="absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-tight border-b pb-4">เมนูลัด</h2>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/admin/students')}
              className="w-full flex items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-bold transition-all border border-gray-100 active:scale-[0.98]"
            >
              <Users className="h-5 w-5 mr-3 text-blue-500" />
              จัดการนักเรียน
            </button>
            <button 
              onClick={() => router.push('/admin/teachers')}
              className="w-full flex items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-bold transition-all border border-gray-100 active:scale-[0.98]"
            >
              <GraduationCap className="h-5 w-5 mr-3 text-purple-500" />
              เพิ่มครูใหม่
            </button>
            <button 
              onClick={() => router.push('/admin/assignments')}
              className="w-full flex items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-bold transition-all border border-gray-100 active:scale-[0.98]"
            >
              <ClipboardList className="h-5 w-5 mr-3 text-orange-500" />
              สร้างภาระงาน
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedEval}
        onClose={() => setSelectedEval(null)}
        title="รายละเอียดการประเมิน"
        subtitle="บันทึกการประเมินรายบุคคล"
      >
        {selectedEval && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-md  text-blue-600 uppercase tracking-widest mb-2 ">นักเรียน / ผู้ประเมิน</p>
                <p className=" text-slate-900 text-lg leading-tight truncate">{selectedEval.student?.first_name} {selectedEval.student?.last_name}</p>
                <p className="text-sm font-bold text-slate-400 mt-1">{selectedEval.student?.student_code}</p>
              </div>
              <div className="p-6 bg-purple-50/50 rounded-xl border border-purple-100">
                <p className="text-md  text-purple-600 uppercase tracking-widest mb-2 ">ครูผู้สอน</p>
                <p className=" text-slate-900 text-lg leading-tight truncate">{selectedEval.assignment?.teacher?.first_name} {selectedEval.assignment?.teacher?.last_name}</p>
                <p className="text-sm font-bold text-slate-400 mt-1 uppercase">{selectedEval.assignment?.subject?.subject_name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className=" text-slate-900 text-xl flex items-center px-2">
                <Star className="h-6 w-6 mr-3 text-yellow-500 fill-current" />
                คะแนนการประเมิน
              </h3>
              <div className="space-y-3">
                {selectedEval.answers?.map((answer: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white transition-all hover:shadow-md group">
                    <div className="flex-1 mr-4">
                      <span className="text-[10px]  text-slate-400 uppercase tracking-widest block mb-1">หัวข้อที่ {idx + 1}</span>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed">{answer.question?.question_text || `คำถามรหัส #${answer.question_id}`}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs  transition-all ${s <= answer.score ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-100 scale-110' : 'bg-slate-200 text-slate-400 opacity-40'}`}>
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedEval.suggestion && (
              <div className="space-y-3 pb-4">
                <h3 className=" text-slate-900 text-xl flex items-center px-2">
                  <MessageSquare className="h-6 w-6 mr-3 text-blue-500" />
                  ข้อเสนอแนะเพิ่มเติม
                </h3>
                <div className="p-8 bg-blue-50/30 border-2 border-dashed border-blue-100 rounded-xl text-slate-700 font-bold italic leading-relaxed text-center relative">
                  <span className="absolute top-4 left-6 text-4xl text-blue-200 font-serif">"</span>
                  {selectedEval.suggestion}
                  <span className="absolute bottom-0 right-6 text-4xl text-blue-200 font-serif">"</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
