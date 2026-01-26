"use client";

import { useState, useEffect, use } from "react";
import { evaluationService } from "@/src/services/evaluationService";
import { teacherService } from "@/src/services/teacherService";
import {
  Star,
  ChevronLeft,
  BookOpen,
  School,
  Users,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/ui/PageHeader";

export default function TeacherEvaluationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const teacherId = parseInt(resolvedParams.id);
  const router = useRouter();

  const [teacher, setTeacher] = useState<any>(null);
  const [assignmentsSummary, setAssignmentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [teacherId]);

  const calculateAverage = (answers: any[]) => {
    if (!answers || answers.length === 0) return "0.00";
    const sum = answers.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / answers.length).toFixed(2);
  };

  const getCriteriaAverages = (evals: any[]) => {
    const criteriaMap = new Map();
    evals.forEach((evaluation) => {
      evaluation.answers?.forEach((ans: any) => {
        const qId = ans.question_id;
        if (!criteriaMap.has(qId)) {
          criteriaMap.set(qId, {
            text: ans.question?.question_text || `หัวข้อที่ ${qId}`,
            totalScore: 0,
            count: 0,
          });
        }
        const item = criteriaMap.get(qId);
        item.totalScore += ans.score;
        item.count += 1;
      });
    });
    return Array.from(criteriaMap.values()).map((item) => ({
      text: item.text,
      avg: (item.totalScore / item.count).toFixed(2),
    }));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teacherData, allEvals] = await Promise.all([
        teacherService.getTeacherById(teacherId),
        evaluationService.getAllEvaluationsWithoutPagination(),
      ]);

      setTeacher(teacherData);

      // Filter evals for this teacher
      const teacherEvals = allEvals.filter(
        (e: any) => e.assignment?.teacher_id === teacherId
      );

      // Group by assignment
      const assignmentMap = new Map();
      teacherEvals.forEach((e: any) => {
        const aId = e.assignment_id;
        if (!assignmentMap.has(aId)) {
          assignmentMap.set(aId, {
            assignment: e.assignment,
            evals: [],
            totalScore: 0,
          });
        }
        const item = assignmentMap.get(aId);
        item.evals.push(e);
        item.totalScore += parseFloat(calculateAverage(e.answers));
      });

      const summary = Array.from(assignmentMap.values()).map((item) => ({
        ...item,
        avg: (item.totalScore / item.evals.length).toFixed(2),
        criteriaAverages: getCriteriaAverages(item.evals),
      }));

      setAssignmentsList(summary);
    } catch (err) {
      console.error("Error fetching teacher detail:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="font-semibold text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );

  return (
    <div className="p-8 font-sans bg-[#f8fafc] min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-5 mb-8">
          <button
            onClick={() => router.back()}
            className="group flex items-center justify-center p-3 bg-white border border-slate-200 rounded-xl hover:bg-blue-600 hover:border-blue-600 transition-all shadow-sm active:scale-95 w-fit shrink-0"
          >
            <ChevronLeft className="h-6 w-6 text-slate-600 group-hover:text-white" />
          </button>
          <PageHeader
            title={`สรุปผลการประเมิน: ${teacher?.first_name} ${teacher?.last_name}`}
            description="รายละเอียดผลการประเมินแยกตามรายวิชาและห้องเรียน"
            icon={TrendingUp}
          />
        </div>

        <div className="grid grid-cols-1 gap-10">
          {assignmentsSummary.length === 0 ? (
            <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center">
              <p className="text-slate-400 font-semibold text-lg">ยังไม่มีข้อมูลการประเมินสำหรับครูท่านนี้</p>
            </div>
          ) : (
            assignmentsSummary.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                {/* Assignment Header */}
                <div className="p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="h-16 w-16 bg-blue-600/20 rounded-xl flex items-center justify-center border border-white/10 backdrop-blur-sm">
                        <BookOpen className="h-8 w-8 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl tracking-tight leading-none mb-2">
                          {item.assignment?.subject?.subject_name}
                        </h2>
                        <div className="flex items-center gap-3 text-slate-400 text-sm font-semibold uppercase tracking-wider">
                          <span className="bg-white/10 px-2 py-0.5 rounded text-blue-300">{item.assignment?.subject?.subject_code}</span>
                          <span className="flex items-center gap-1.5">
                            <School className="h-4 w-4" /> 
                            ห้อง {item.assignment?.classroom?.room_name} - {item.assignment?.classroom?.level?.department?.dept_name || 'ไม่ระบุแผนก'} ({item.assignment?.classroom?.level?.level_name || 'ทั่วไป'})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">คนประเมิน</p>
                        <p className="text-2xl flex items-center justify-center gap-2"><Users className="h-5 w-5 text-blue-400" /> {item.evals.length}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-lg border border-white/10 text-center min-w-[140px]">
                        <p className="text-[10px] font-semibold text-blue-300 uppercase tracking-widest mb-1">คะแนนเฉลี่ย</p>
                        <div className="flex items-center justify-center text-yellow-400 text-3xl ">
                          <Star className="h-6 w-6 mr-2 fill-current" /> {item.avg}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Criteria Breakdown */}
                <div className="p-8">
                  <h3 className="text-slate-900 text-xl flex items-center px-2 mb-8 uppercase tracking-tight">
                    <BarChart3 className="h-6 w-6 mr-3 text-blue-600" /> คะแนนเฉลี่ยรายหัวข้อ
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {item.criteriaAverages.map((criteria: any, cIdx: number) => (
                      <div key={cIdx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg hover:border-blue-100 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 mr-6">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1.5 font-semibold">หัวข้อที่ {cIdx + 1}</span>
                            <p className="text-md font-semibold text-slate-700 leading-relaxed">{criteria.text}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl text-slate-900">{criteria.avg}</div>
                            <p className="text-[9px] text-slate-400 uppercase tracking-tighter">คะแนนเฉลี่ย</p>
                          </div>
                        </div>
                        <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${parseFloat(criteria.avg) >= 4.5 ? "bg-green-500" : parseFloat(criteria.avg) >= 3.5 ? "bg-blue-500" : "bg-orange-500"}`} 
                            style={{ width: `${(parseFloat(criteria.avg) / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
