import { useEffect, useState } from 'react';

const API_URL = '/api/students';

async function readResponse(response) {
  const body = await response.text();
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    return { error: body };
  }
}

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ studentId: '', name: '', email: '' });
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState('');

  const loadStudents = async () => {
    const response = await fetch(API_URL);
    const data = await readResponse(response);
    if (!response.ok) throw new Error(data.error || 'Không thể tải danh sách sinh viên');
    if (!Array.isArray(data)) throw new Error('API trả về dữ liệu không hợp lệ');
    setStudents(data);
  };

  useEffect(() => {
    loadStudents().catch((error) => setMessage(error.message));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const response = await fetch(editingId ? `${API_URL}/${editingId}` : API_URL, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await readResponse(response);
      if (!response.ok) {
        setMessage(data.error || (editingId ? 'Không thể cập nhật sinh viên' : 'Không thể thêm sinh viên'));
        return;
      }
      setForm({ studentId: '', name: '', email: '' });
      setEditingId('');
      setStudents((current) => (
        editingId
          ? current.map((student) => (student._id === editingId ? data : student))
          : [data, ...current]
      ));
      setMessage(editingId ? 'Đã cập nhật sinh viên' : 'Đã thêm sinh viên');
    } catch (error) {
      setMessage(`Không kết nối được backend: ${error.message}`);
    }
  };

  const handleEdit = (student) => {
    setForm({ studentId: student.studentId, name: student.name, email: student.email });
    setEditingId(student._id);
    setMessage('Đang chỉnh sửa sinh viên');
  };

  const handleDelete = async (studentId) => {
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/${studentId}`, { method: 'DELETE' });
      const data = await readResponse(response);
      if (!response.ok) {
        setMessage(data.error || 'Không thể xóa sinh viên');
        return;
      }
      setStudents((current) => current.filter((student) => student._id !== studentId));
      if (editingId === studentId) {
        setForm({ studentId: '', name: '', email: '' });
        setEditingId('');
      }
      setMessage('Đã xóa sinh viên');
    } catch (error) {
      setMessage(`Không kết nối được backend: ${error.message}`);
    }
  };

  const cancelEdit = () => {
    setForm({ studentId: '', name: '', email: '' });
    setEditingId('');
    setMessage('');
  };

  const updateField = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
  };

  return (
    <main>
      <section className="intro">
        <p className="eyebrow">CLOUD LAB / MERN v2.0</p>
        <h1>Student directory</h1>
        <p>Quản lý danh sách sinh viên từ MongoDB Atlas.</p>
      </section>
      <section className="workspace">
        <form onSubmit={handleSubmit} className="student-form">
          <h2>{editingId ? 'Cập nhật sinh viên' : 'Thêm sinh viên'}</h2>
          <label>MSSV<input required value={form.studentId} onChange={updateField('studentId')} /></label>
          <label>Họ tên<input required value={form.name} onChange={updateField('name')} /></label>
          <label>Email<input required type="email" value={form.email} onChange={updateField('email')} /></label>
          <div className="form-actions">
            <button type="submit">{editingId ? 'Cập nhật sinh viên' : 'Thêm sinh viên'}</button>
            {editingId && <button type="button" className="secondary" onClick={cancelEdit}>Hủy</button>}
          </div>
          {message && <p className="message">{message}</p>}
        </form>
        <section className="list">
          <div className="list-heading"><h2>Danh sách</h2><span>{students.length} sinh viên</span></div>
          {students.length === 0 ? <p className="empty">Chưa có dữ liệu sinh viên.</p> : (
            <div className="students">
              {students.map((student) => (
                <article key={student._id}>
                  <div>
                    <strong>{student.studentId}</strong>
                    <span>{student.name}</span>
                    <a href={`mailto:${student.email}`}>{student.email}</a>
                  </div>
                  <div className="student-actions">
                    <button type="button" className="secondary" onClick={() => handleEdit(student)}>Sửa</button>
                    <button type="button" onClick={() => handleDelete(student._id)}>Xóa</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;