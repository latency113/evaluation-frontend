'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { evaluationService } from '@/src/services/evaluationService';
import { LogOut, CheckCircle, ChevronRight, Star } from 'lucide-react';
import Swal from 'sweetalert2';

export default function EvaluatePage() {
  const { user, loading, logout } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [completedEvals, setCompletedEvals] = useState<number[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const [assignmentData, questionData, evalData] = await Promise.all([
            evaluationService.getCourseAssignmentsByClassroom(user.classroom_id),
            evaluationService.getEvaluationQuestions(),
            evaluationService.getEvaluationsByStudent(user.id),
          ]);
          setAssignments(assignmentData);
          setQuestions(questionData);
          setCompletedEvals(evalData.map((e: any) => e.assignment_id));
        } catch (err) {
          console.error('Error fetching data:', err);
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
        title: 'คำชี้แจง',
        text: 'กรุณาตอบคำถามให้ครบทุกข้อ',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
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
        setSuggestion('');
      }, 2000);
    } catch (err) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถส่งผลการประเมินได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">ระบบประเมินครู</h1>
            <p className="text-sm text-gray-600">
              ชื่อนักเรียน นักศึกษา: {user?.first_name} {user?.last_name} ({user?.student_code})
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center text-sm font-medium text-red-600 hover:text-red-700"
          >
            <LogOut className="mr-1 h-4 w-4" />
            ออกจากระบบ
          </button>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-5xl px-4">
        {!selectedAssignment ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">รายวิชาที่ต้องการประเมิน</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assignments.map((assignment) => {
                const isCompleted = completedEvals.includes(assignment.id);
                return (
                  <div
                    key={assignment.id}
                    className={`relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all ${
                      isCompleted ? 'opacity-75' : 'hover:border-blue-500 hover:shadow-md cursor-pointer'
                    }`}
                    onClick={() => !isCompleted && setSelectedAssignment(assignment)}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="rounded-lg bg-blue-50 p-2 text-blue-600 font-bold text-xs">
                        {assignment.subject?.subject_code}
                      </div>
                      {isCompleted && (
                        <div className="flex items-center text-green-600 text-xs font-medium">
                          <CheckCircle className="mr-1 h-4 w-4" />
                          ประเมินเรียบร้อย
                        </div>
                      )}
                    </div>
                    <h3 className="mb-1 font-bold text-gray-900">{assignment.subject?.subject_name}</h3>
                    <p className="text-sm text-gray-600">ครูประจำวิชา: {assignment.teacher?.first_name} {assignment.teacher?.last_name}</p>
                    <p className="mt-4 text-xs text-gray-400">เทอม: {assignment.term}</p>
                    {!isCompleted && (
                      <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
                        เริ่มการประเมิน
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {assignments.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                ไม่พบวิชาที่ต้องการประเมิน
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
              <h2 className="text-2xl font-bold text-gray-900">
                ประเมินวิชา: {selectedAssignment.subject?.subject_name}
              </h2>
              <p className="text-gray-600">
                ครูประจำวิชา: {selectedAssignment.teacher?.first_name} {selectedAssignment.teacher?.last_name}
              </p>
            </div>

            {isSuccess ? (
              <div className="py-12 text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h3 className="mt-4 text-xl font-bold text-gray-900">ประเมินเรียบร้อย!</h3>
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
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-gray-200 hover:border-blue-300'
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
                    className="w-full rounded-md bg-blue-600 py-3 text-lg font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {isSubmitting ? 'กำลังส่งการประเมิน' : 'ส่งการประเมิน'}
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
