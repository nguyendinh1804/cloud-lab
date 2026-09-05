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
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await readResponse(response);
      if (!response.ok) {
        setMessage(data.error || 'Không thể thêm sinh viên');
        return;
      }
      setForm({ studentId: '', name: '', email: '' });
      setStudents((current) => [data, ...current]);
      setMessage('Đã thêm sinh viên');
    } catch (error) {
      setMessage(`Không kết nối được backend: ${error.message}`);
    }
  };

  const updateField = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
  };

  return (
    <main>
      <section className="intro">
        <p className="eyebrow">CLOUD LAB / MERN</p>
        <h1>Student directory</h1>
        <p>Quản lý danh sách sinh viên từ MongoDB Atlas.</p>
      </section>
      <section className="workspace">
        <form onSubmit={handleSubmit} className="student-form">
          <h2>Thêm sinh viên</h2>
          <label>MSSV<input required value={form.studentId} onChange={updateField('studentId')} /></label>
          <label>Họ tên<input required value={form.name} onChange={updateField('name')} /></label>
          <label>Email<input required type="email" value={form.email} onChange={updateField('email')} /></label>
          <button type="submit">Thêm sinh viên</button>
          {message && <p className="message">{message}</p>}
        </form>
        <section className="list">
          <div className="list-heading"><h2>Danh sách</h2><span>{students.length} sinh viên</span></div>
          {students.length === 0 ? <p className="empty">Chưa có dữ liệu sinh viên.</p> : (
            <div className="students">
              {students.map((student) => (
                <article key={student._id}>
                  <strong>{student.studentId}</strong>
                  <span>{student.name}</span>
                  <a href={`mailto:${student.email}`}>{student.email}</a>
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