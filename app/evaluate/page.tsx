"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { evaluationService } from "@/src/services/evaluationService";
import {
  LogOut,
  CheckCircle,
  ChevronRight,
  Star,
  BookOpen,
  Calendar,
  User,
} from "lucide-react";
import Swal from "sweetalert2";

export default function EvaluatePage() {
  const { user, loading, logout } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [completedEvals, setCompletedEvals] = useState<number[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [suggestion, setSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const [assignmentData, questionData, evalData] = await Promise.all([
            evaluationService.getCourseAssignmentsByClassroom(
              user.classroom_id,
            ),
            evaluationService.getEvaluationQuestions(),
            evaluationService.getEvaluationsByStudent(user.id),
          ]);
          setAssignments(assignmentData);
          setQuestions(questionData);
          setCompletedEvals(evalData.map((e: any) => e.assignment_id));
        } catch (err) {
          console.error("Error fetching data:", err);
        }
      };
      fetchData();
    }
  }, [user]);

  const handleScoreChange = (questionId: number, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length < questions.length) {
      Swal.fire({
        title: "คำชี้แจง",
        text: "กรุณาตอบคำถามให้ครบทุกข้อ",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await evaluationService.submitEvaluation({
        assignment_id: selectedAssignment.id,
        student_id: user.id,
        suggestion,
        answers: Object.entries(answers).map(([qId, score]) => ({
          question_id: parseInt(qId),
          score,
        })),
      });
      setCompletedEvals((prev) => [...prev, selectedAssignment.id]);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedAssignment(null);
        setAnswers({});
        setSuggestion("");
      }, 2000);
    } catch (err) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถส่งผลการประเมินได้ กรุณาลองใหม่อีกครั้ง",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            <img
              src="https://nc.ac.th/img/logo.png"
              alt="Logo"
              className="h-13 w-13"
            />
            <div>
              <h1 className="text-xl text-gray-800">ระบบประเมินครู</h1>
              <p className="text-sm text-gray-600">
                ชื่อนักเรียน นักศึกษา: {user?.first_name} {user?.last_name} ({user?.student_code})
                <span className="block mt-1 text-xs text-blue-600 font-semibold uppercase tracking-wider">
                  ห้อง {user?.classroom?.room_name} - {user?.classroom?.level?.department?.dept_name || 'ไม่ระบุแผนก'} ({user?.classroom?.level?.level_name || 'ทั่วไป'})
                </span>
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-3 sm:pt-0">
            <button
              onClick={logout}
              className="flex items-center rounded-md p-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              <LogOut className="mr-1.5 h-7 w-7" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-5xl px-4">
        {!selectedAssignment ? (
          <div className="space-y-8 p-6">
            <h2 className="text-3xl text-gray-800 text-center">
              รายวิชาที่ต้องการประเมิน
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {assignments.map((assignment, index) => {
                const isCompleted = completedEvals.includes(assignment.id);

                return (
                  <div
                    key={assignment.id}
                    className={`relative bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 flex flex-col ${
                      isCompleted
                        ? "opacity-60"
                        : "hover:shadow-xl hover:-translate-y-1 cursor-pointer hover:border-blue-200"
                    }`}
                    onClick={() =>
                      !isCompleted && setSelectedAssignment(assignment)
                    }
                  >
                    {/* Top accent line */}
                    <div
                      className={`h-1.5 ${isCompleted ? "bg-green-400" : "bg-blue-600"}`}
                    ></div>

                    {/* Card content */}
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Icon and number section */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-slate-400 text-md tracking-widest">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        {isCompleted && (
                          <div className="flex items-center text-green-600 text-[10pmd uppercase tracking-wider bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                            ประเมินแล้ว
                          </div>
                        )}
                      </div>

                      {/* Icon */}
                      <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                          <BookOpen
                            className={`w-8 h-8 ${isCompleted ? "text-slate-400" : "text-blue-600"}`}
                          />
                        </div>
                      </div>

                      {/* Subject code */}
                      <div className="text-center mb-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-md text-[10pmd tracking-widest ${isCompleted ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-700"}`}
                        >
                          {assignment.subject?.subject_code}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-md text-slate-900 text-center mb-4 leading-snug">
                        {assignment.subject?.subject_name}
                      </h3>

                      {/* Description */}
                      <div className="text-md text-slate-600 text-center space-y-2 mb-8">
                        <p className="flex items-center justify-center gap-2 bg-slate-50 py-2 rounded-lg">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {assignment.teacher?.first_name}{" "}
                          {assignment.teacher?.last_name}
                        </p>
                        <p className="flex items-center justify-center gap-2">
                          เทอม {assignment.term}
                        </p>
                      </div>

                      {/* Button - mt-auto pushes this to the bottom */}
                      <button
                        className={`w-full py-4 px-4 rounded-md text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 mt-auto shadow-lg ${
                          isCompleted
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-blue-200"
                        }`}
                        disabled={isCompleted}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isCompleted) setSelectedAssignment(assignment);
                        }}
                      >
                        {isCompleted ? "ประเมินเรียบร้อย" : "เริ่มทำการประเมิน"}
                        {!isCompleted && (
                          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {assignments.length === 0 && (
              <div className="py-20 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  ไม่พบวิชาที่ต้องการประเมิน
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border bg-white p-6 shadow-sm md:p-8">
            <button
              onClick={() => setSelectedAssignment(null)}
              className="mb-6 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              &larr; ย้อนกลับ
            </button>

            <div className="mb-8 border-b pb-6">
              <h2 className="text-2xl text-gray-900">
                ประเมินวิชา: {selectedAssignment.subject?.subject_name}
              </h2>
              <p className="text-gray-600">
                ครูประจำวิชา: {selectedAssignment.teacher?.first_name}{" "}
                {selectedAssignment.teacher?.last_name}
              </p>
            </div>

            {isSuccess ? (
              <div className="py-12 text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h3 className="mt-4 text-xl text-gray-900">
                  ประเมินเรียบร้อย!
                </h3>
                <p className="text-gray-600">ขอบคุณสําหรับการประเมิน</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10">
                {questions.map((question, index) => (
                  <div key={question.id} className="space-y-4">
                    <p className="text-lg font-medium text-gray-900">
                      {index + 1}. {question.question_text}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleScoreChange(question.id, score)}
                          className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                            answers[question.id] === score
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="space-y-2">
                  <label className="text-lg font-medium text-gray-900">
                    ข้อเสนอแนะ (Optional)
                  </label>
                  <textarea
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={4}
                    placeholder="พิมพ์ข้อเสนอแนะ..."
                  />
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-md bg-blue-600 py-3 text-lg text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {isSubmitting ? "กำลังส่งการประเมิน" : "ส่งการประเมิน"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
