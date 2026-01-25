'use client';

import { useState, useEffect } from 'react';
import { evaluationQuestionService } from '@/src/services/evaluationQuestionService';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check,
  HelpCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { SearchFilters } from '@/src/components/ui/SearchFilters';
import { DataTable } from '@/src/components/ui/DataTable';
import { Pagination } from '@/src/components/ui/Pagination';
import { Modal } from '@/src/components/ui/Modal';

export default function AdminEvaluationQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [formData, setFormData] = useState({ question_text: '' });

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchQuestions();
  }, [page, limit]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await evaluationQuestionService.getAllQuestions(page, limit);
      setQuestions(response.data || []);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.total);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (question: any = null) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({ question_text: question.question_text });
    } else {
      setEditingQuestion(null);
      setFormData({ question_text: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await evaluationQuestionService.updateQuestion(editingQuestion.id, formData);
      } else {
        await evaluationQuestionService.createQuestion(formData);
      }
      setIsModalOpen(false);
      fetchQuestions();
      Swal.fire({
        title: 'สำเร็จ',
        text: 'บันทึกข้อมูลเรียบร้อยแล้ว',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกข้อมูลได้',
        icon: 'error'
      });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: 'คุณต้องการลบหัวข้อการประเมินนี้ใช่หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await evaluationQuestionService.deleteQuestion(id);
        fetchQuestions();
        Swal.fire('ลบสำเร็จ!', 'หัวข้อการประเมินถูกลบแล้ว', 'success');
      } catch (err) {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
      }
    }
  };

  const filteredQuestions = (questions || []).filter(q => 
    q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="จัดการหัวข้อการประเมิน"
          description={`จัดการเกณฑ์และหัวข้อสำหรับการประเมินครูผู้สอน (${totalItems} ข้อ)`}
          icon={HelpCircle}
          actions={
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-100"
            >
              <Plus className="mr-2 h-5 w-5" />
              เพิ่มหัวข้อการประเมิน
            </button>
          }
        />

        <SearchFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          limit={limit}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
          onRefresh={fetchQuestions}
          loading={loading}
          placeholder="ค้นหาข้อความในหัวข้อการประเมิน..."
        />

        <DataTable
          columns={[
            { header: 'ลำดับ', className: 'w-20' },
            { header: 'หัวข้อการประเมิน' },
            { header: 'การจัดการ', align: 'right' }
          ]}
          loading={loading}
        >
          {filteredQuestions.map((q, index) => (
            <tr key={q.id} className="hover:bg-blue-50/30 transition-colors group">
              <td className="px-8 py-5 text-gray-400 text-lg">
                {((page - 1) * limit) + index + 1}
              </td>
              <td className="px-8 py-5">
                <span className=" text-gray-900 text-lg leading-relaxed">{q.question_text}</span>
              </td>
              <td className="px-8 py-5 text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => handleOpenModal(q)}
                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-100"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(q.id)}
                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>

        <Pagination 
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={limit}
          onPageChange={setPage}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'แก้ไขหัวข้อการประเมิน' : 'เพิ่มหัวข้อใหม่'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2 ml-1">ข้อความหัวข้อการประเมิน</label>
            <textarea 
              required 
              rows={4}
              placeholder="ระบุข้อความสำหรับเกณฑ์การประเมิน เช่น 'อาจารย์เข้าสอนตรงเวลา'..." 
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold text-gray-900 transition-all" 
              value={formData.question_text} 
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })} 
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-[2] bg-blue-600 text-white py-2 rounded-lg text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 flex justify-center items-center"
            >
              <Check className="inline-block mr-2 h-6 w-6" />
              {editingQuestion ? 'อัปเดตหัวข้อ' : 'บันทึกข้อมูล'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-lg hover:bg-gray-200 transition-all"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}