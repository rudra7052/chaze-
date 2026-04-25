import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, LessonData, QuizQuestion } from './api';
import { useAuth } from './useAuth';
import { ChevronLeft, Brain, HelpCircle, CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, setProfile } = useAuth();
  
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'content' | 'explain' | 'quiz'>('content');
  const [explainContent, setExplainContent] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  
  const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isQuizzing, setIsQuizzing] = useState(false);
  
  const [isCompleting, setIsCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (profile?.completedLessons?.includes(id || '')) {
      setCompleted(true);
    }
  }, [profile, id]);

  useEffect(() => {
    if (id) {
      api.getLesson(id)
        .then(data => {
          setLesson(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  const handleExplain = async () => {
    if (!lesson) return;
    setActiveTab('explain');
    if (explainContent) return; // already loaded
    
    setIsExplaining(true);
    try {
      const res = await api.aiChat(`Explain this like I'm 18: ${lesson.content}`);
      setExplainContent(res.response);
    } catch (e) {
      setExplainContent("Failed to load simplified explanation. Please try again later.");
    } finally {
      setIsExplaining(false);
    }
  };

  const handleQuiz = async () => {
    if (!lesson) return;
    setActiveTab('quiz');
    if (quizData) return; // already loaded
    
    setIsQuizzing(true);
    try {
      const res = await api.generateSummaryQuiz(lesson.content);
      setQuizData(res.quiz);
    } catch (e) {
      setQuizData([]);
    } finally {
      setIsQuizzing(false);
    }
  };

  const submitQuiz = (answers: Record<number, string>) => {
    if (!quizData) return;
    let correct = 0;
    quizData.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });
    setQuizScore(Math.round((correct / quizData.length) * 100));
  };

  const markComplete = async () => {
    if (!user || !lesson) return;
    setIsCompleting(true);
    try {
      console.log("Completing lesson for:", user.uid);
      const updated = await api.completeLesson(user.uid, lesson.id, quizScore || 0);
      setCompleted(true);
      setProfile(prev => prev ? ({
        ...prev,
        xp: updated.xp,
        level: updated.level,
        completedLessons: updated.completedLessons,
        badges: updated.badges
      }) : null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCompleting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!lesson) return <div className="p-8 text-center text-slate-400">Lesson not found.</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft size={20} /> Back to Dashboard
      </button>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-8 border-b border-slate-700/50 bg-gradient-to-r from-blue-900/20 to-transparent">
          <div className="flex items-center gap-3 text-blue-400 font-bold mb-4">
            <span className="px-3 py-1 bg-blue-500/10 rounded-full text-xs uppercase tracking-wider">{lesson.subject}</span>
            <span>Unit {lesson.unitNumber}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">{lesson.title}</h1>
        </div>

        <div className="flex border-b border-slate-700/50 bg-slate-900/50">
          <button 
            onClick={() => setActiveTab('content')}
            className={cn("px-6 py-4 font-bold text-sm transition-colors flex-1", activeTab === 'content' ? "text-blue-400 border-b-2 border-blue-400 bg-slate-800/50" : "text-slate-400 hover:text-white")}
          >
            Original Content
          </button>
          <button 
            onClick={handleExplain}
            className={cn("px-6 py-4 font-bold text-sm transition-colors flex-1 flex items-center justify-center gap-2", activeTab === 'explain' ? "text-purple-400 border-b-2 border-purple-400 bg-slate-800/50" : "text-slate-400 hover:text-white")}
          >
            <HelpCircle size={16} /> Explain Like I'm 18
          </button>
          <button 
            onClick={handleQuiz}
            className={cn("px-6 py-4 font-bold text-sm transition-colors flex-1 flex items-center justify-center gap-2", activeTab === 'quiz' ? "text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/50" : "text-slate-400 hover:text-white")}
          >
            <Brain size={16} /> Take Quiz
          </button>
        </div>

        <div className="p-8 text-slate-300 leading-relaxed min-h-[400px]">
          {activeTab === 'content' && (
            <div className="prose prose-invert prose-blue max-w-none">
              <p className="whitespace-pre-wrap">{lesson.content}</p>
            </div>
          )}

          {activeTab === 'explain' && (
            <div>
              {isExplaining ? (
                <div className="flex flex-col items-center justify-center h-40 text-purple-400 gap-4">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <p>AI is analyzing and simplifying the content...</p>
                </div>
              ) : (
                <div className="bg-purple-900/10 border border-purple-900/20 p-6 rounded-xl text-purple-100 whitespace-pre-wrap">
                  {explainContent}
                </div>
              )}
            </div>
          )}

          {activeTab === 'quiz' && (
            <div>
              {isQuizzing ? (
                <div className="flex flex-col items-center justify-center h-40 text-emerald-400 gap-4">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p>Generating adaptive quiz from content...</p>
                </div>
              ) : (
                <QuizView quizData={quizData || []} onComplete={submitQuiz} score={quizScore} />
              )}
            </div>
          )}
        </div>
        
        <div className="p-6 bg-slate-800/60 border-t border-slate-700/50 flex justify-end">
           <button 
             onClick={markComplete}
             disabled={isCompleting || completed}
             className={cn(
               "px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all",
               completed ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"
             )}
           >
             {completed ? (
               <><CheckCircle2 size={20} /> Lesson Completed</>
             ) : isCompleting ? 'Marking...' : 'Mark as Complete'}
           </button>
        </div>
      </div>
    </div>
  );
}

function QuizView({ quizData, onComplete, score }: { quizData: QuizQuestion[], onComplete: (ans: Record<number, string>) => void, score: number | null }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  if (quizData.length === 0) return <div className="text-slate-400 text-center py-10">Oops, failed to generate quiz!</div>;

  if (score !== null) {
    return (
      <div className="text-center py-10">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-800 border-4 border-emerald-500 mb-6">
          <span className="text-3xl font-black text-white">{score}%</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{score >= 80 ? 'Excellent!' : 'Good Effort!'}</h3>
        <p className="text-slate-400">You've completed the quiz. Proceed to mark the lesson as complete!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {quizData.map((q, i) => (
        <div key={i} className="space-y-4">
          <h4 className="font-bold text-lg text-white">{i + 1}. {q.question}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {q.options.map((opt, j) => (
              <button
                key={j}
                onClick={() => setAnswers(prev => ({ ...prev, [i]: opt }))}
                className={cn(
                  "p-4 rounded-xl text-left border transition-all text-sm",
                  answers[i] === opt 
                    ? "bg-slate-700 border-emerald-500 text-white" 
                    : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800 text-slate-300"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button 
        onClick={() => onComplete(answers)}
        disabled={Object.keys(answers).length < quizData.length}
        className="w-full py-4 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 font-bold rounded-xl disabled:opacity-50 transition-colors"
      >
        Submit Quiz
      </button>
    </div>
  );
}
