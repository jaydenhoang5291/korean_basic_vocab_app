import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const emptyForm = {
  korean: '',
  romanization: '',
  vietnamese_meaning: '',
  category: '',
  example_sentence: ''
};

function App() {
  const [config, setConfig] = useState({ environment: 'local', version: 'v1.0.0' });
  const [vocabularies, setVocabularies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [quiz, setQuiz] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = useMemo(
    () => [...new Set(vocabularies.map((item) => item.category))].sort(),
    [vocabularies]
  );

  useEffect(() => {
    loadConfig();
    loadVocabularies();
    loadQuiz();
  }, []);

  async function request(path, options) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  async function loadConfig() {
    try {
      const data = await request('/api/config');
      setConfig(data);
    } catch {
      setMessage('Không tải được cấu hình backend.');
    }
  }

  async function loadVocabularies() {
    try {
      const data = await request('/api/vocabularies');
      setVocabularies(data);
    } catch {
      setMessage('Không tải được danh sách từ vựng.');
    }
  }

  async function loadQuiz() {
    try {
      const data = await request('/api/quiz');
      setQuiz(data);
      setSelectedOption(null);
    } catch {
      setQuiz(null);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const created = await request('/api/vocabularies', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setVocabularies((current) => [created, ...current]);
      setForm(emptyForm);
      setMessage('Đã thêm từ mới.');
      loadQuiz();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await request(`/api/vocabularies/${id}`, { method: 'DELETE' });
      setVocabularies((current) => current.filter((item) => item.id !== id));
      setMessage('Đã xóa từ vựng.');
      loadQuiz();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function handleSelect(option) {
    if (selectedOption) return;
    setSelectedOption(option);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Korean vocabulary for Vietnamese learners</p>
          <h1>HanViet Vocab</h1>
        </div>
        <div className="meta">
          <span>Environment: {config.environment}</span>
          <span>Version: {config.version}</span>
        </div>
      </header>

      {message && <div className="notice">{message}</div>}

      <section className="content-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="section-heading">
            <h2>Thêm từ mới</h2>
            <p>{vocabularies.length} từ trong danh sách</p>
          </div>

          <label>
            Tiếng Hàn
            <input
              value={form.korean}
              onChange={(event) => setForm({ ...form, korean: event.target.value })}
              placeholder="예: 친구"
              required
            />
          </label>

          <label>
            Phiên âm
            <input
              value={form.romanization}
              onChange={(event) => setForm({ ...form, romanization: event.target.value })}
              placeholder="chingu"
              required
            />
          </label>

          <label>
            Nghĩa tiếng Việt
            <input
              value={form.vietnamese_meaning}
              onChange={(event) => setForm({ ...form, vietnamese_meaning: event.target.value })}
              placeholder="bạn bè"
              required
            />
          </label>

          <label>
            Chủ đề
            <input
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              placeholder="chào hỏi, đồ ăn..."
              list="category-options"
              required
            />
          </label>
          <datalist id="category-options">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>

          <label>
            Câu ví dụ
            <textarea
              value={form.example_sentence}
              onChange={(event) => setForm({ ...form, example_sentence: event.target.value })}
              placeholder="친구를 만나요."
              rows="3"
            />
          </label>

          <button disabled={loading} type="submit">
            {loading ? 'Đang thêm...' : 'Thêm từ vựng'}
          </button>
        </form>

        <section className="panel quiz-panel">
          <div className="section-heading">
            <h2>Quiz trắc nghiệm</h2>
            <button className="secondary-button" type="button" onClick={loadQuiz}>
              Câu khác
            </button>
          </div>

          {quiz ? (
            <>
              <div className="question-card">
                <span>{quiz.question.category}</span>
                <strong>{quiz.question.korean}</strong>
                <p>{quiz.question.romanization}</p>
                {quiz.question.example_sentence && <small>{quiz.question.example_sentence}</small>}
              </div>

              <div className="answers">
                {quiz.options.map((option) => {
                  const isSelected = selectedOption?.text === option.text;
                  const className = selectedOption
                    ? option.isCorrect
                      ? 'answer correct'
                      : isSelected
                        ? 'answer wrong'
                        : 'answer muted'
                    : 'answer';

                  return (
                    <button key={option.text} className={className} type="button" onClick={() => handleSelect(option)}>
                      {option.text}
                    </button>
                  );
                })}
              </div>

              {selectedOption && (
                <p className={selectedOption.isCorrect ? 'result correct-text' : 'result wrong-text'}>
                  {selectedOption.isCorrect ? 'Đúng rồi!' : 'Chưa đúng, thử câu khác nhé.'}
                </p>
              )}
            </>
          ) : (
            <p className="empty-state">Cần ít nhất 4 từ vựng để tạo quiz.</p>
          )}
        </section>
      </section>

      <section className="panel list-panel">
        <div className="section-heading">
          <h2>Danh sách từ vựng</h2>
          <p>Backend: {API_BASE_URL}</p>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tiếng Hàn</th>
                <th>Phiên âm</th>
                <th>Nghĩa</th>
                <th>Chủ đề</th>
                <th>Câu ví dụ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vocabularies.map((item) => (
                <tr key={item.id}>
                  <td className="korean-text">{item.korean}</td>
                  <td>{item.romanization}</td>
                  <td>{item.vietnamese_meaning}</td>
                  <td>
                    <span className="tag">{item.category}</span>
                  </td>
                  <td>{item.example_sentence || '-'}</td>
                  <td>
                    <button className="delete-button" type="button" onClick={() => handleDelete(item.id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default App;
