import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  round: { type: Number, required: true },
  answers: [{
    questionId: { type: String, required: true },
    selectedAnswer: { type: String },
    isCorrect: { type: Boolean, required: true }
  }],
  score: { type: Number, required: true },
  violationsCount: { type: Number, default: 0 },
  timeTakenMinutes: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});

// 🚀 FIX: Create a named export for Submission
export const Submission = mongoose.model('Submission', submissionSchema);