const mongoose = require('mongoose');

const prepNoteSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Offer', 'Rejected'],
    default: 'Applied',
  },
  dateApplied: { type: Date, default: Date.now },
  followUpDate: { type: Date },
  jobLink: { type: String },
  notes: { type: String },
  resumeUrl: { type: String },
  resumeName: { type: String },
  prepNotes: [prepNoteSchema],
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);