import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api';

function PrepNotesModal({ application, onClose, onUpdate }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/applications/${application._id}/prep`, { question, answer });
      onUpdate(res.data);
      setQuestion('');
      setAnswer('');
      toast.success('Note added');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      const res = await api.delete(`/applications/${application._id}/prep/${noteId}`);
      onUpdate(res.data);
      toast.success('Note deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box prep-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Prep Notes — {application.role} @ {application.company}</h3>

        <form className="app-form prep-add-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Question (e.g. 'Tell me about yourself')"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
          <textarea
            placeholder="Your answer / notes (optional)"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={2}
          />
          <button type="submit" className="btn-save" disabled={submitting}>
            {submitting ? 'Adding...' : '+ Add Note'}
          </button>
        </form>

        <div className="prep-notes-list">
          {application.prepNotes?.length === 0 && (
            <p className="no-apps">No prep notes yet. Add your first question above.</p>
          )}
          {application.prepNotes?.slice().reverse().map((note) => (
            <div key={note._id} className="prep-note-card">
              <div className="prep-note-header">
                <strong>{note.question}</strong>
                <button className="icon-btn delete" onClick={() => handleDelete(note._id)}>Del</button>
              </div>
              {note.answer && <p className="prep-note-answer">{note.answer}</p>}
              <p className="prep-note-date">{new Date(note.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>

        <div className="app-form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default PrepNotesModal;