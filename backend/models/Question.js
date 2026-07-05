import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  round: { type: Number, required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  roundDurationSeconds: { type: Number, default: 1200 }
});

// 🚀 FIX: Create a named export for Question
export const Question = mongoose.model('Question', questionSchema);