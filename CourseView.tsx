import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { COURSES, XP_PER_UNIT, XP_PER_QUIZ_CORRECT } from '../constants';
import { generateLessonContent, generateQuizQuestions } from '../services/aiService';
import { progressService } from '../lib/mockFirebase';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Brain, BookOpen, CheckCircle2, XCircle, RefreshCw, Star } from 'lucide-react';
import { QuizQuestion } from '../types';

export default function CourseView() {
  const { subjectId, unitId } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState<'intro' | 'lesson' | 'quiz' | 'result'>('intro');
  const [lessonContent, setLessonContent] = useState('');
  const [isELIMode, setIsELIMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const course = COURSES[subjectId || ''];
  const unit = course?.units.find((u: any) => u.id === unitId);

  useEffect(() => {
    if (!unit) navigate('/subjects');
  }, [unit, navigate]);

  const loadLesson = async (eli: boolean = isELIMode) => {
    setLoading(true);
    const content = await generateLessonContent(unit.title, eli);
    setLessonContent(content || '');
    setLoading(false);
    setView('lesson');
  };

  const loadQuiz = async () => {
    setLoading(true);
    const q = await generateQuizQuestions(unit.title);
    setQuestions(q);
    setAnswers([]);
    setCurrentQuestion(0);
    setLoading(false);
    setView('quiz');
  };

  const handleAnswer = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = async () => {
    let score = 0;
    answers.forEach((ans, i) => {
      if (ans === questions[i].correctAnswer) score++;
    });

    const quizXp = score * XP_PER_QUIZ_CORRECT;
    const totalXp = XP_PER_UNIT + quizXp;
    setXpGained(totalXp);
    
    await progressService.completeUnit('user-123', unit.id, XP_PER_UNIT);
    await progressService.saveQuizScore('user-123', unit.id, score, quizXp);
    
    setView('result');
  };

  if (!unit) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="text-center space-y-8 py-12"
          >
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto">
              <BookOpen size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">{unit.title}</h1>
              <p className="text-xl text-neutral-500 mt-4 max-w-lg mx-auto">{unit.description}</p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => { setIsELIMode(false); loadLesson(false); }}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none active:scale-95"
              >
                Start Standard Lesson
              </button>
              <button 
                onClick={() => { setIsELIMode(true); loadLesson(true); }}
                className="px-8 py-4 bg-white dark:bg-neutral-800 border-2 border-indigo-600 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 dark:hover:bg-neutral-700 transition-all active:scale-95 flex items-center gap-2"
              >
                <Brain size={18} />
                Explain Like I'm 18
              </button>
            </div>
          </motion.div>
        )}

        {view === 'lesson' && (
          <motion.div key="lesson" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex items-center justify-between sticky top-20 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md py-4 z-30">
              <div className="flex items-center gap-4">
                <button onClick={() => setView('intro')} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full">
                  <ChevronLeft />
                </button>
                <h2 className="text-xl font-bold">{unit.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-500">Mode:</span>
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
                  {isELIMode ? 'ELI 18' : 'Standard'}
                </span>
                <button onClick={() => loadLesson(!isELIMode)} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors">
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-neutral-500 font-medium animate-pulse">AI is crafting your personalized lesson...</p>
              </div>
            ) : (
              <div className="prose prose-indigo dark:prose-invert max-w-none bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm whitespace-pre-wrap">
                {lessonContent}
                
                <div className="mt-12 pt-8 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                  <button 
                    onClick={loadQuiz}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
                  >
                    Take the Quiz
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {view === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
             {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-neutral-500 font-medium">Preparing your assessment...</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Knowledge Check</h2>
                  <div className="px-4 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm font-bold">
                    Question {currentQuestion + 1} of {questions.length}
                  </div>
                </div>

                <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    className="h-full bg-indigo-600"
                  />
                </div>

                <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <h3 className="text-xl font-bold mb-8">{questions[currentQuestion].question}</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {questions[currentQuestion].options.map((opt, i) => {
                      const isSelected = answers[currentQuestion] === i;
                      const isCorrect = i === questions[currentQuestion].correctAnswer;
                      
                      return (
                        <button
                          key={i}
                          disabled={showExplanation}
                          onClick={() => handleAnswer(i)}
                          className={cn(
                            "p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between group",
                            !showExplanation && "hover:border-indigo-600 border-neutral-100 dark:border-neutral-800",
                            showExplanation && isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
                            showExplanation && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
                            showExplanation && !isSelected && !isCorrect && "border-neutral-100 dark:border-neutral-800 opacity-50"
                          )}
                        >
                          <span className="font-medium">{opt}</span>
                          {showExplanation && isCorrect && <CheckCircle2 className="text-green-500" size={20} />}
                          {showExplanation && isSelected && !isCorrect && <XCircle className="text-red-500" size={20} />}
                        </button>
                      );
                    })}
                  </div>

                  {showExplanation && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800"
                    >
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-2">
                        <Brain size={18} />
                        AI Explanation
                      </div>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {questions[currentQuestion].explanation}
                      </p>
                      
                      <button 
                        onClick={nextQuestion}
                        className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                      >
                        {currentQuestion === questions.length - 1 ? 'Finish Assessment' : 'Next Question'}
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {view === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 space-y-8"
          >
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-20"></div>
              <div className="relative w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center text-white shadow-2xl">
                <Star size={64} fill="white" />
              </div>
            </div>
            
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Lesson Complete!</h1>
              <p className="text-xl text-neutral-500 mt-4">You're one step closer to financial mastery.</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm max-w-sm mx-auto">
              <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-1">XP Gained</p>
              <p className="text-6xl font-black text-indigo-600">+{xpGained}</p>
            </div>

            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <button 
                onClick={() => navigate('/subjects')}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none"
              >
                Back to Subjects
              </button>
              <button 
                onClick={() => navigate('/')}
                className="w-full py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-2xl font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
