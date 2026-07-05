import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Question } from './models/Question.js';
import { Submission } from './models/Submission.js';

dotenv.config();
const app = express();

// Secure CORS for deployment
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Blocked by Security CORS Layer'));
  }
}));

app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quizdb';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB successfully connected for deployment!'))
  .catch(err => console.error('DB Connection Error:', err));

// --- 🛡️ PRODUCTION ROOT LANDING VIEW ---
// Placing this clearly right after database initialization guarantees it intercepts the root URL
app.get('/', (req, res) => {
  res.status(200).send(`
    <div style="background: #0f172a; color: #fff; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: sans-serif; margin: 0;">
      <h1 style="color: #3b82f6; margin-bottom: 8px;">🛡️ Secure Assessment Core API Active</h1>
      <p style="color: #94a3b8; font-size: 1.1rem;">Cluster Linkage Status: <strong style="color: #10b981;">Online</strong></p>
    </div>
  `);
});

// --- ADMIN API: BULK QUESTION GENERATION ---
app.post('/api/questions/add-bulk', async (req, res) => {
  try {
    const { round, roundDurationSeconds, questions } = req.body;
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: "Payload must be a valid array." });
    }
    await Question.deleteMany({ round: Number(round) });
    const questionDocuments = questions.map(q => ({
      round: Number(round),
      roundDurationSeconds: Number(roundDurationSeconds),
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));
    const insertedDocs = await Question.insertMany(questionDocuments);
    res.status(201).json({ message: "Round updated successfully!", count: insertedDocs.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- LIVE CANDIDATE TESTING API ---
app.get('/api/questions/:round', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const questions = await Question.find({ round: parseInt(req.params.round, 10) }).lean();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SUBMIT ASSESSMENT & LIVE EVALUATION ---
app.post('/api/submit', async (req, res) => {
  try {
    const { name, email, round, responses, violationsCount, timeTakenMinutes } = req.body;
    const officialQuestions = await Question.find({ round: parseInt(round, 10) });
    const totalQuestions = officialQuestions.length || 1; 
    let correctCount = 0;

    const answers = responses.map(resp => {
      const questionItem = officialQuestions.find(item => item._id.toString() === resp.questionId);
      const isCorrect = questionItem ? questionItem.correctAnswer.trim() === resp.selectedAnswer.trim() : false;
      if (isCorrect) correctCount++;
      return { questionId: resp.questionId, selectedAnswer: resp.selectedAnswer, isCorrect };
    });

    const calculatedScore = Math.round((correctCount / totalQuestions) * 100);
    const newSubmission = new Submission({
      name, email, round: parseInt(round, 10), answers, score: calculatedScore,
      violationsCount: Number(violationsCount), timeTakenMinutes
    });
    await newSubmission.save();
    res.status(201).json({ message: 'Saved successfully!', score: calculatedScore });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ADMINISTRATIVE MONITORING LOGS ---
app.get('/api/submissions', async (req, res) => {
  try {
    const logs = await Submission.find().sort({ _id: -1 }).lean();
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SECURED PUBLIC LEADERBOARD VIEW ---
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Submission.find({}, 'name score round timeTakenMinutes violationsCount submittedAt')
      .sort({ score: -1, timeTakenMinutes: 1 }).lean(); 
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Production-ready server executing on port ${PORT}`));