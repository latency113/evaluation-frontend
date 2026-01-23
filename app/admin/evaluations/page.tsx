"use client";

import { useState, useEffect } from "react";
import { evaluationService } from "@/src/services/evaluationService";
import { classroomService } from "@/src/services/classroomService";
import {
  Star,
  Eye,
  Download,
  LayoutList,
  BarChart3,
  School,
  Users,
  BookOpen,
  ArrowRight,
  TrendingUp,
  X,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PageHeader } from "@/src/components/ui/PageHeader";
import { SearchFilters } from "@/src/components/ui/SearchFilters";
import { DataTable } from "@/src/components/ui/DataTable";
import { Pagination } from "@/src/components/ui/Pagination";
import { Modal } from "@/src/components/ui/Modal";

export default function AdminEvaluationsPage() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [allEvaluations, setAllEvaluations] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEval, setSelectedEval] = useState<any>(null);
  const [selectedSummary, setSelectedSummary] = useState<any>(null);
  const [viewMode, setViewMode] = useState<
    "individual" | "summary" | "teacher"
  >("individual");

  const [filterClassroom, setFilterClassroom] = useState<string>("");

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvaluations, setTotalEvaluations] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, [page, limit]);

  useEffect(() => {
    if (viewMode !== "individual") {
      fetchAllEvaluations();
    }
  }, [viewMode]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [evalRes, roomRes] = await Promise.all([
        evaluationService.getAllEvaluations(page, limit),
        classroomService.getAllClassrooms(1, 1000),
      ]);
      setEvaluations(evalRes.data || []);
      setTotalPages(evalRes.meta.totalPages);
      setTotalEvaluations(evalRes.meta.total);
      setClassrooms(roomRes.data || []);
    } catch (err) {
      console.error("Error fetching evaluations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEvaluations = async () => {
    try {
      const data = await evaluationService.getAllEvaluationsWithoutPagination();
      setAllEvaluations(data || []);
    } catch (err) {
      console.error("Error fetching all evaluations:", err);
    }
  };

  const calculateAverage = (answers: any[]) => {
    if (!answers || answers.length === 0) return "0.00";
    const sum = answers.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / answers.length).toFixed(2);
  };

  const filteredEvaluations = (evaluations || []).filter((e) => {
    const sName =
      `${e.student?.first_name} ${e.student?.last_name}`.toLowerCase();
    const subName = e.assignment?.subject?.subject_name?.toLowerCase() || "";
    const tName = e.assignment?.teacher?.first_name?.toLowerCase() || "";
    const cId = e.assignment?.classroom_id?.toString() || "";
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      sName.includes(search) ||
      subName.includes(search) ||
      tName.includes(search);
    const matchesClassroom = !filterClassroom || cId === filterClassroom;

    return matchesSearch && matchesClassroom;
  });

  const getSummaryData = () => {
    const summaryMap = new Map();
    const sourceData = allEvaluations.length > 0 ? allEvaluations : evaluations;

    sourceData.forEach((e) => {
      const key = `${e.assignment_id}`;
      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          assignment: e.assignment,
          count: 0,
          totalScore: 0,
          evals: [],
        });
      }

      const item = summaryMap.get(key);
      const avg = parseFloat(calculateAverage(e.answers));
      item.count += 1;
      item.totalScore += avg;
      item.evals.push(e);
    });

    return Array.from(summaryMap.values()).map((item) => ({
      ...item,
      finalAvg: (item.totalScore / item.count).toFixed(2),
    }));
  };

  const getTeacherSummaryData = () => {
    const teacherMap = new Map();
    const sourceData = allEvaluations.length > 0 ? allEvaluations : evaluations;

    sourceData.forEach((e) => {
      const teacherId = e.assignment?.teacher_id;
      if (!teacherId) return;

      if (!teacherMap.has(teacherId)) {
        teacherMap.set(teacherId, {
          teacher: e.assignment.teacher,
          assignments: new Set(),
          classrooms: new Set(),
          students: new Set(),
          evalCount: 0,
          totalScore: 0,
          evals: [],
        });
      }

      const item = teacherMap.get(teacherId);
      const avg = parseFloat(calculateAverage(e.answers));
      item.evalCount += 1;
      item.totalScore += avg;
      item.evals.push(e);
      item.assignments.add(e.assignment_id);
      if (e.student_id) {
        item.students.add(e.student_id);
      }
      if (e.assignment?.classroom_id) {
        item.classrooms.add(e.assignment.classroom_id);
      }
    });

    return Array.from(teacherMap.values()).map((item) => ({
      ...item,
      finalAvg: (item.totalScore / item.evalCount).toFixed(2),
      assignmentCount: item.assignments.size,
      classroomCount: item.classrooms.size,
      studentCount: item.students.size,
    }));
  };

  const summaryData = getSummaryData();
  const teacherSummaryData = getTeacherSummaryData();

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

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("รายงานผลการประเมินครูผู้สอน", 14, 22);
    const tableData = filteredEvaluations.map((e, index) => [
      index + 1,
      new Date(e.eval_date).toLocaleDateString("th-TH"),
      `${e.student?.first_name} ${e.student?.last_name}`,
      e.assignment?.subject?.subject_name,
      e.assignment?.classroom?.room_name || "N/A",
      calculateAverage(e.answers),
    ]);
    autoTable(doc, {
      startY: 45,
      head: [["#", "วันที่", "นักเรียน", "วิชา", "ห้องเรียน", "คะแนนเฉลี่ย"]],
      body: tableData,
    });
    doc.save(`รายงานการประเมิน_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="p-8 font-sans bg-[#f8fafc] min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="EVALUATIONS"
          description="ระบบบันทึกและสรุปผลการประเมินครูผู้สอน"
          actions={
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-xl border border-slate-200 flex shadow-sm">
                <button
                  onClick={() => setViewMode("individual")}
                  className={`flex items-center px-5 py-2.5 rounded-lg text-xs  transition-all active:scale-95 ${viewMode === "individual" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <LayoutList className="mr-2 h-4 w-4" /> รายบุคคล
                </button>
                <button
                  onClick={() => setViewMode("summary")}
                  className={`flex items-center px-5 py-2.5 rounded-lg text-xs  transition-all active:scale-95 ${viewMode === "summary" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <BarChart3 className="mr-2 h-4 w-4" /> สรุปรายห้อง
                </button>
                <button
                  onClick={() => setViewMode("teacher")}
                  className={`flex items-center px-5 py-2.5 rounded-lg text-xs  transition-all active:scale-95 ${viewMode === "teacher" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <TrendingUp className="mr-2 h-4 w-4" /> สรุปรายครู
                </button>
              </div>
              {/* <button
                onClick={exportToPDF}
                className="flex items-center px-6 py-3.5 bg-white text-red-600 border border-red-100 rounded-xl hover:bg-red-50 transition-all  text-xs shadow-sm active:scale-95"
              >
                <Download className="mr-2 h-4 w-4" /> EXPORT PDF
              </button> */}
            </div>
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
          onRefresh={fetchInitialData}
          loading={loading}
          placeholder="ค้นหาชื่อ student, ครู, หรือรายวิชา..."
          extraFilters={
            <div className="relative group min-w-[240px]">
              <School className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
              <select
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-xl text-md font-semibold focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                value={filterClassroom}
                onChange={(e) => {
                  setFilterClassroom(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">ทุกห้องเรียน / กลุ่มเรียน</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    ห้อง {c.room_name} - {c.level?.level_name} (
                    {c.level?.department?.dept_name})
                  </option>
                ))}
              </select>
            </div>
          }
        />

        {viewMode === "individual" ? (
          <DataTable
            columns={[
              { header: "วันที่ประเมิน" },
              { header: "นักเรียน" },
              { header: "วิชา / ครูผู้สอน" },
              { header: "คะแนนเฉลี่ย", align: "center" },
              { header: "จัดการ", align: "right" },
            ]}
            loading={loading}
          >
            {filteredEvaluations.map((e) => (
              <tr
                key={e.id}
                className="hover:bg-blue-50/30 transition-all group"
              >
                <td className="px-10 py-6 font-semibold text-slate-400 text-xs uppercase">
                  {new Date(e.eval_date).toLocaleDateString("th-TH")}
                </td>
                <td className="px-10 py-6">
                  <div className=" text-slate-900 text-lg leading-tight group-hover:text-blue-700 transition-colors truncate">
                    {e.student?.first_name} {e.student?.last_name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-md  bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase truncate">
                      ห้อง{" "}
                      {e.assignment?.classroom?.room_name ||
                        e.student?.classroom?.room_name ||
                        "N/A"}
                    </span>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <div className=" text-slate-700 text-md">
                    {e.assignment?.subject?.subject_name}
                  </div>
                  <div className="text-md font-semibold text-slate-400 uppercase mt-1">
                    {e.assignment?.teacher?.first_name}{" "}
                    {e.assignment?.teacher?.last_name}
                  </div>
                </td>
                <td className="px-10 py-6 text-center">
                  <div className="inline-flex items-center px-4 py-1.5 rounded-full text-md  bg-yellow-100 text-yellow-700 border border-yellow-200">
                    <Star className="h-3.5 w-3.5 mr-1.5 fill-current" />{" "}
                    {calculateAverage(e.answers)}
                  </div>
                </td>
                <td className="px-10 py-6 text-right">
                  <button
                    onClick={() => setSelectedEval(e)}
                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all active:scale-90 shadow-sm border border-transparent hover:border-slate-100"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>
        ) : viewMode === "summary" ? (
          <DataTable
            columns={[
              { header: "ห้องเรียน / กลุ่ม" },
              { header: "รายวิชา" },
              { header: "ครูผู้สอน" },
              { header: "คนประเมิน", align: "center" },
              { header: "คะแนนเฉลี่ยรวม", align: "center" },
              { header: "Action", align: "right" },
            ]}
            loading={loading}
          >
            {summaryData.map((item, idx) => {
              const classroom =
                item.assignment?.classroom || item.evals[0]?.student?.classroom;
              const roomName = classroom?.room_name || "N/A";
              const levelName = classroom?.level?.level_name || "";
              const deptName = classroom?.level?.department?.dept_name || "";
              return (
                <tr
                  key={idx}
                  className="hover:bg-blue-50/30 transition-all group"
                >
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className=" text-slate-900 text-md leading-none">
                          ห้อง {roomName}
                        </div>
                        {(levelName || deptName) && (
                          <div className="text-sm font-semibold text-slate-400 uppercase mt-2 tracking-widest truncate">
                            {levelName} {deptName ? `(${deptName})` : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className=" text-slate-700 text-md truncate">
                      {item.assignment?.subject?.subject_name}
                    </div>
                    <div className="text-md font-semibold text-blue-500 font-mono mt-1 uppercase tracking-tighter">
                      {item.assignment?.subject?.subject_code}
                    </div>
                  </td>
                  <td className="px-10 py-7 font-semibold text-slate-500 text-md uppercase truncate">
                    {item.assignment?.teacher?.first_name}{" "}
                    {item.assignment?.teacher?.last_name}
                  </td>
                  <td className="px-10 py-7 text-center">
                    <div className="inline-flex items-center px-4 py-1.5 bg-slate-100 rounded-full  text-slate-600 text-md shadow-inner truncate">
                      <Users className="h-3 w-3 mr-2" /> {item.count} คน
                    </div>
                  </td>
                  <td className="px-10 py-7 text-center">
                    <div
                      className={`inline-flex items-center px-5 py-2.5 rounded-xl  text-xl shadow-md border ${parseFloat(item.finalAvg) >= 4.5 ? "bg-green-50 text-green-700 border-green-100" : parseFloat(item.finalAvg) >= 3.5 ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-orange-50 text-orange-700 border-orange-100"}`}
                    >
                      <Star className="h-3 w-3 mr-2 fill-current" />{" "}
                      <p className="text-sm">{item.finalAvg}</p>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <button
                      onClick={() => setSelectedSummary(item)}
                      className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100 transition-all active:scale-90"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </DataTable>
        ) : (
          <DataTable
            columns={[
              { header: "ครูผู้สอน" },
              { header: "วิชาที่สอน", align: "center" },
              { header: "ห้องที่สอน", align: "center" },
              { header: "คนประเมินรวม", align: "center" },
              { header: "คะแนนเฉลี่ยรวมทุกห้อง", align: "center" },
              { header: "Action", align: "right" },
            ]}
            loading={loading}
          >
            {teacherSummaryData.map((item, idx) => (
              <tr
                key={idx}
                className="hover:bg-blue-50/30 transition-all group"
              >
                <td className="px-10 py-7">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className=" text-slate-900 text-lg leading-none truncate">
                        {item.teacher?.first_name} {item.teacher?.last_name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-7 text-center">
                  <div className="inline-flex items-center px-4 py-1.5 bg-slate-100 rounded-full  text-slate-600 text-md shadow-inner">
                    <BookOpen className="h-3 w-3 mr-2" /> {item.assignmentCount}{" "}
                    วิชา
                  </div>
                </td>
                <td className="px-10 py-7 text-center">
                  <div className="inline-flex items-center px-4 py-1.5 bg-slate-100 rounded-full  text-slate-600 text-md shadow-inner">
                    <School className="h-3 w-3 mr-2" /> {item.classroomCount}{" "}
                    ห้อง
                  </div>
                </td>
                <td className="px-10 py-7 text-center">
                  <div className="inline-flex items-center px-4 py-1.5 bg-slate-100 rounded-full  text-slate-600 text-md shadow-inner">
                    <Users className="h-3 w-3 mr-2" /> {item.studentCount} คน
                  </div>
                </td>
                <td className="px-10 py-7 text-center">
                  <div
                    className={`inline-flex items-center px-5 py-2.5 rounded-xl  text-xl shadow-md border ${parseFloat(item.finalAvg) >= 4.5 ? "bg-green-50 text-green-700 border-green-100" : parseFloat(item.finalAvg) >= 3.5 ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-orange-50 text-orange-700 border-orange-100"}`}
                  >
                    <Star className="h-3 w-3 mr-2 fill-current" />{" "}
                    <p className="text-sm">{item.finalAvg}</p>
                  </div>
                </td>
                <td className="px-10 py-7 text-right">
                  <button
                    onClick={() => setSelectedSummary(item)}
                    className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100 transition-all active:scale-90"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalEvaluations}
          limit={limit}
          onPageChange={setPage}
        />
      </div>

      {/* Individual Detail Modal */}
      <Modal
        isOpen={!!selectedEval}
        onClose={() => setSelectedEval(null)}
        title="รายละเอียดการประเมิน"
        subtitle="รายละเอียดผลการประเมินรายบุคคล"
      >
        <div className="space-y-10 font-sans">
          {selectedEval && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100">
                  <p className="text-md  text-blue-600 uppercase tracking-widest mb-3 leading-none">
                    นักเรียน / ผู้ประเมิน
                  </p>
                  <p className=" text-slate-900 text-xl leading-tight">
                    {selectedEval.student?.first_name}{" "}
                    {selectedEval.student?.last_name}
                  </p>
                  <p className="text-md font-semibold text-slate-400 mt-3 uppercase tracking-widest">
                    {selectedEval.student?.student_code} ห้อง{" "}
                    {selectedEval.assignment?.classroom?.room_name ||
                      selectedEval.student?.classroom?.room_name ||
                      "N/A"}
                  </p>
                </div>
                <div className="p-6 bg-purple-50/50 rounded-xl border border-purple-100">
                  <p className="text-md  text-purple-600 uppercase tracking-widest mb-3 leading-none">
                    รายวิชา / ครูผู้สอน
                  </p>
                  <p className=" text-slate-900 text-xl leading-tight uppercase tracking-tight">
                    {selectedEval.assignment?.subject?.subject_name}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 mt-3">
                    อ. {selectedEval.assignment?.teacher?.first_name}{" "}
                    {selectedEval.assignment?.teacher?.last_name}
                  </p>
                </div>
              </div>
              <div className="space-y-5">
                <h3 className=" text-slate-900 text-xl flex items-center px-2 uppercase tracking-tight">
                  <Star className="h-6 w-6 mr-3 text-yellow-500 fill-current" />{" "}
                  คะแนนรายข้อ
                </h3>
                <div className="space-y-3">
                  {selectedEval.answers?.map((answer: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-6 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white transition-all hover:shadow-md group"
                    >
                      <div className="flex-1 mr-6">
                        <span className="text-[9px]  text-slate-400 uppercase tracking-widest block mb-2">
                          ข้อที่ {idx + 1}
                        </span>
                        <p className="text-md font-semibold text-slate-700 leading-relaxed">
                          {answer.question?.question_text ||
                            `หัวข้อที่ ${answer.question_id}`}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <div
                            key={s}
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs  transition-all ${s <= answer.score ? "bg-yellow-400 text-white shadow-lg shadow-yellow-100 scale-110" : "bg-slate-200 text-slate-400 opacity-30"}`}
                          >
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedSummary}
        onClose={() => setSelectedSummary(null)}
        title={
          selectedSummary?.teacher && !selectedSummary?.assignment
            ? "สรุปรายครู"
            : "สรุปรายห้อง"
        }
        subtitle={
          selectedSummary?.teacher && !selectedSummary?.assignment
            ? "รายละเอียดผลการประเมินรวมทุกวิชาและห้องเรียน"
            : "รายละเอียดผลการประเมินรายกลุ่มห้องเรียน"
        }
        maxWidth="max-w-3xl"
      >
        <div className="space-y-10 font-sans">
          {selectedSummary && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedSummary.assignment ? (
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <School className="h-5 w-5" />
                      </div>
                      <p className="text-md  text-blue-600 uppercase tracking-widest leading-none">
                        ห้องเรียน / แผนก
                      </p>
                    </div>
                    <p className=" text-slate-900 text-2xl leading-none">
                      ห้อง{" "}
                      {selectedSummary.assignment?.classroom?.room_name ||
                        selectedSummary.evals[0]?.student?.classroom
                          ?.room_name ||
                        "N/A"}
                    </p>
                    <p className="text-xs font-semibold text-slate-400 mt-3 uppercase tracking-widest">
                      {selectedSummary.assignment?.classroom?.level
                        ?.level_name ||
                        selectedSummary.evals[0]?.student?.classroom?.level
                          ?.level_name}{" "}
                      (
                      {selectedSummary.assignment?.classroom?.level?.department
                        ?.dept_name ||
                        selectedSummary.evals[0]?.student?.classroom?.level
                          ?.department?.dept_name}
                      )
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-md  text-slate-400 uppercase tracking-widest">
                        ประเมินแล้ว
                      </span>
                      <span className=" text-blue-600">
                        {selectedSummary.count} คน
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-indigo-600 p-2 rounded-lg text-white">
                        <Users className="h-5 w-5" />
                      </div>
                      <p className="text-md text-indigo-600 uppercase tracking-widest leading-none">
                        ครูผู้สอน / ข้อมูลรวม
                      </p>
                    </div>
                    <p className=" text-slate-900 text-xl leading-none">
                      {selectedSummary.teacher?.first_name}{" "}
                      {selectedSummary.teacher?.last_name}
                    </p>
                    <p className="text-sm font-semibold text-slate-400 mt-3 uppercase tracking-widest">
                      {selectedSummary.assignmentCount} วิชา |{" "}
                      {selectedSummary.classroomCount} ห้องเรียน
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-md  text-slate-400 uppercase tracking-widest">
                        จำนวนคนประเมินทั้งหมด
                      </span>
                      <span className=" text-indigo-600">
                        {selectedSummary.studentCount} คน
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-500 p-2 rounded-lg text-white">
                      {selectedSummary.assignment ? (
                        <BookOpen className="h-5 w-5" />
                      ) : (
                        <TrendingUp className="h-5 w-5" />
                      )}
                    </div>
                    <p className="text-md  text-blue-400 uppercase tracking-widest leading-none">
                      {selectedSummary.assignment
                        ? "รายวิชา / ครูผู้สอน"
                        : "คะแนนเฉลี่ยรวม"}
                    </p>
                  </div>
                  {selectedSummary.assignment ? (
                    <>
                      <p className=" text-xl leading-tight uppercase tracking-tight">
                        {selectedSummary.assignment?.subject?.subject_name}
                      </p>
                      <p className="text-xs font-semibold text-slate-400 mt-3">
                        อ. {selectedSummary.assignment?.teacher?.first_name}{" "}
                        {selectedSummary.assignment?.teacher?.last_name}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xl leading-tight uppercase tracking-tight">
                        คะแนนเฉลี่ยรวม
                      </p>
                      <p className="text-sm font-semibold text-slate-400 mt-3">
                        คะแนนเฉลี่ยจากทุกวิชาและทุกห้องเรียน
                      </p>
                    </>
                  )}
                  <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-md  text-slate-500 uppercase tracking-widest">
                      คะแนนเฉลี่ย
                    </span>
                    <div className="flex items-center text-yellow-400  text-xl">
                      <Star className="h-5 w-5 mr-1.5 fill-current" />{" "}
                      {selectedSummary.finalAvg}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className=" text-slate-900 text-xl flex items-center px-2 uppercase tracking-tight">
                  <TrendingUp className="h-6 w-6 mr-3 text-blue-600" /> คะแนนเฉลี่ยรายหัวข้อ
                </h3>
                <div className="space-y-4">
                  {getCriteriaAverages(selectedSummary.evals).map(
                    (criteria, idx) => (
                      <div
                        key={idx}
                        className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 mr-4">
                            <span className="text-sm  text-slate-400 uppercase tracking-widest block mb-2">
                              ข้อที่ {idx + 1}
                            </span>
                            <p className="text-lg font-semibold text-slate-700 leading-relaxed">
                              {criteria.text}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl  text-slate-900 leading-none">
                              {criteria.avg}
                            </div>
                            <p className="text-sm  text-slate-400 uppercase tracking-widest mt-1">
                              คะแนนเฉลี่ย
                            </p>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${parseFloat(criteria.avg) >= 4.5 ? "bg-green-500" : parseFloat(criteria.avg) >= 3.5 ? "bg-blue-500" : "bg-orange-500"}`}
                            style={{
                              width: `${(parseFloat(criteria.avg) / 5) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
