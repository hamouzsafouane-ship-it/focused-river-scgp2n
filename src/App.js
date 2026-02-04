import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useRef,
} from "react";
import {
  Brain,
  Users,
  ChevronRight,
  GraduationCap,
  Lock,
  ArrowUpCircle,
  Award,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Calculator,
  FileSpreadsheet,
  Languages,
  Minus,
  Plus,
  Trophy,
  LayoutGrid,
  Image as ImageIcon,
  Timer,
  Eye,
  KeyRound,
  Clock,
  History,
  AlertTriangle,
  RotateCcw,
  Save,
  Download,
  Upload,
  Trash2,
  Cloud,
  CloudOff,
  MessageSquare,
  Send,
  Bot,
} from "lucide-react";

// --- CONFIGURATION FIREBASE (À REMPLIR PLUS TARD) ---
// Pour l'instant, laissez vide pour utiliser le mode LocalStorage automatique.
const firebaseConfig = {
    apiKey: "AIzaSyCQy6wWhd5nLdwlIS8uXb6bdut2DdOkzzw", 
  authDomain: "classe-5e7ef.firebaseapp.com",
  projectId: "classe-5e7ef",
  storageBucket: "classe-5e7ef.firebasestorage.app",
  messagingSenderId: "127093990636",
  appId: "1:127093990636:web:289e2e4c5ce2aa11dff1c9",
};

// --- UTILITAIRES & CONTEXTE ---

const TailwindInjector = () => {
  useEffect(() => {
    if (!document.querySelector('script[src*="tailwindcss"]')) {
      const script = document.createElement("script");
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);
  return null;
};

const AppContext = createContext(null);

// --- DONNÉES ET CONFIGURATION ---

const levelsMath = [
  {
    id: 0,
    title: "الجمع (L'Addition)",
    keywords: ["جمع", "رقمان"],
    color: "bg-blue-100 text-blue-800",
    icon: "➕",
  },
  {
    id: 1,
    title: "الطرح (La Soustraction)",
    keywords: ["طرح"],
    color: "bg-green-100 text-green-800",
    icon: "➖",
  },
  {
    id: 2,
    title: "الضرب (La Multiplication)",
    keywords: ["ضرب"],
    color: "bg-yellow-100 text-yellow-800",
    icon: "✖️",
  },
  {
    id: 3,
    title: "القسمة (La Division)",
    keywords: ["قسمة"],
    color: "bg-orange-100 text-orange-800",
    icon: "➗",
  },
  {
    id: 4,
    title: "المسألة (Problèmes)",
    keywords: ["مسألة"],
    color: "bg-purple-100 text-purple-800",
    icon: "🧩",
  },
];

const levelsFr = [
  {
    id: 0,
    title: "Débutant (Lettres)",
    keywords: ["debutant", "lettre", "alphabet"],
    color: "bg-slate-100 text-slate-800",
    icon: "🌱",
  },
  {
    id: 1,
    title: "Sons & Syllabes",
    keywords: ["son", "syllabe"],
    color: "bg-red-100 text-red-800",
    icon: "🔤",
  },
  {
    id: 2,
    title: "Mot Simple",
    keywords: ["mot simple"],
    color: "bg-orange-100 text-orange-800",
    icon: "🐈",
  },
  {
    id: 3,
    title: "Mot Avancé",
    keywords: ["mot avancé", "mot avance"],
    color: "bg-yellow-100 text-yellow-800",
    icon: "📚",
  },
  {
    id: 4,
    title: "Graphèmes Complexes",
    keywords: ["grapheme", "complexe"],
    color: "bg-emerald-100 text-emerald-800",
    icon: "🧩",
  },
  {
    id: 5,
    title: "Phrase",
    keywords: ["phrase"],
    color: "bg-cyan-100 text-cyan-800",
    icon: "🗣️",
  },
  {
    id: 6,
    title: "Production Écrite",
    keywords: ["text", "production", "écrite"],
    color: "bg-violet-100 text-violet-800",
    icon: "✍️",
  },
];

// --- LOGIQUE IA SIMULÉE (COACH) ---
const getAIResponse = (query, students, logs) => {
  const q = query.toLowerCase();

  // 1. Analyse spécifique d'un élève
  const student = students.find((s) => q.includes(s.name.toLowerCase()));
  if (student) {
    const mat = student.group.startsWith("math") ? "Maths" : "Français";
    let advice = "";
    if (student.score < 20)
      advice =
        "Il est en difficulté. Je recommande des exercices de niveau inférieur ou du tutorat.";
    else if (student.score > 100)
      advice = "Excellent parcours ! Il est prêt pour le niveau suivant.";
    else advice = "Progression stable.";

    return `📊 **Analyse de ${student.name}** :\n- Matière : ${mat}\n- Niveau actuel : ${student.level}\n- Score : ${student.score} points.\n\n💡 **Conseil IA** : ${advice}`;
  }

  // 2. Analyse globale
  if (q.includes("classe") || q.includes("tous") || q.includes("général")) {
    const avg =
      students.reduce((acc, curr) => acc + curr.score, 0) /
      (students.length || 1);
    const low = students.filter((s) => s.score < 20).length;
    return `📈 **État de la Classe** :\n- Moyenne générale : ${Math.floor(
      avg
    )} points.\n- Élèves en difficulté (<20pts) : ${low}.\n\nL'activité est bonne aujourd'hui.`;
  }

  // 3. Aide technique
  if (q.includes("import") || q.includes("excel")) {
    return "Pour importer, allez dans l'onglet 'Gestion Élèves', copiez vos colonnes Excel (ID, Nom, Niveau) et collez-les dans la zone de texte. Je détecterai automatiquement les niveaux.";
  }

  return "Je suis votre Assistant Pédagogique. Demandez-moi des nouvelles d'un élève (ex: 'Comment va Amine ?') ou une vue d'ensemble de la classe.";
};

// --- COMPOSANTS ---

const CoachIA = () => {
  const { studentData, activityLogs } = useContext(AppContext);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Bonjour Professeur ! Je surveille la classe. Une question sur un élève ou sur la progression globale ?",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Ajouter message utilisateur
    const newMsgs = [...messages, { role: "user", text: input }];
    setMessages(newMsgs);
    setInput("");

    // Simuler réflexion IA
    setTimeout(() => {
      const response = getAIResponse(input, studentData, activityLogs);
      setMessages((prev) => [...prev, { role: "ai", text: response }]);
    }, 800);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 h-[600px] flex flex-col overflow-hidden">
      <div className="p-4 border-b bg-indigo-50 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl text-white">
          <Bot size={24} />
        </div>
        <div>
          <h3 className="font-bold text-indigo-900">Assistant Pédagogique</h3>
          <p className="text-xs text-indigo-600">Analyse en temps réel</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez une question sur la classe..."
          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

// ... (Autres composants Landing, Login etc. restent structurellement identiques,
// je les inclus pour que le fichier soit COMPLET et prêt à l'emploi)

const LandingPage = () => {
  const { setView, isCloudMode } = useContext(AppContext);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-4xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute top-0 right-0">
            {isCloudMode ? (
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <Cloud size={12} /> En ligne
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                <CloudOff size={12} /> Local
              </div>
            )}
          </div>
          <h1 className="text-5xl font-black text-slate-800 mb-2 tracking-tight">
            École Numérique
          </h1>
          <p className="text-slate-500 font-medium">
            Plateforme d'entraînement intelligent
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => setView("student-login")}
            className="group bg-white border-4 border-indigo-50 hover:border-indigo-500 p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <GraduationCap size={32} />
            </div>
            <div>
              <span className="block text-xl font-bold text-slate-800">
                Élève
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Commencer
              </span>
            </div>
          </button>

          <button
            onClick={() => setView("check-score")}
            className="group bg-white border-4 border-orange-50 hover:border-orange-500 p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
              <Trophy size={32} />
            </div>
            <div>
              <span className="block text-xl font-bold text-slate-800">
                Score
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Voir mes points
              </span>
            </div>
          </button>

          <button
            onClick={() => setView("teacher-auth")}
            className="group bg-white border-4 border-emerald-50 hover:border-emerald-500 p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <Users size={32} />
            </div>
            <div>
              <span className="block text-xl font-bold text-slate-800">
                Prof
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Gestion & IA
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentLogin = () => {
  const { handleLoginSubmit, setView } = useContext(AppContext);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-300">
        <div className="inline-flex p-5 bg-indigo-50 rounded-full text-indigo-600 mb-2">
          <Lock size={40} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Connexion</h2>
          <p className="text-slate-500">
            Entre ton code personnel (ex: F189...)
          </p>
        </div>
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <input
            type="text"
            name="code"
            className="w-full text-center text-2xl font-black p-5 bg-slate-50 border-4 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all uppercase placeholder:text-slate-300"
            placeholder="CODE..."
            autoFocus
          />
          <button className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-indigo-200">
            SUIVANT
          </button>
        </form>
        <button
          onClick={() => setView("landing")}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
        >
          Retour Accueil
        </button>
      </div>
    </div>
  );
};

const StudentSubjectSelect = () => {
  const { loginName, startSession, setView } = useContext(AppContext);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="text-center mb-8 animate-in slide-in-from-bottom-4">
        <h2 className="text-3xl font-black text-slate-800 mb-2">
          Bonjour, {loginName}
        </h2>
        <p className="text-slate-500">Que veux-tu travailler aujourd'hui ?</p>
      </div>
      <div className="grid grid-cols-2 gap-6 max-w-2xl w-full">
        <button
          onClick={() => startSession("math")}
          className="group bg-white p-8 rounded-[2rem] border-4 border-blue-50 hover:border-blue-500 transition-all hover:-translate-y-2 shadow-sm hover:shadow-xl flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Calculator size={40} />
          </div>
          <span className="text-xl font-bold text-slate-800">
            Mathématiques
          </span>
        </button>
        <button
          onClick={() => startSession("fr")}
          className="group bg-white p-8 rounded-[2rem] border-4 border-pink-50 hover:border-pink-500 transition-all hover:-translate-y-2 shadow-sm hover:shadow-xl flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 group-hover:scale-110 transition-transform">
            <Languages size={40} />
          </div>
          <span className="text-xl font-bold text-slate-800">Français</span>
        </button>
      </div>
      <button
        onClick={() => setView("student-login")}
        className="mt-10 text-slate-400 font-bold hover:text-slate-600"
      >
        Changer d'utilisateur
      </button>
    </div>
  );
};

const StudentExercise = () => {
  const {
    currentUser,
    currentProblem,
    userAnswer,
    setUserAnswer,
    feedback,
    exercisesDoneCount,
    timeLeft,
    handleCheckAnswer,
  } = useContext(AppContext);

  // Fallback si pas de problème
  if (!currentProblem)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-indigo-600" size={40} />
          <p className="text-slate-500 font-medium">Chargement...</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm underline text-indigo-500"
          >
            Recharger si bloqué
          </button>
        </div>
      </div>
    );

  const isMath = currentUser.group.startsWith("math");
  const lvls = isMath ? levelsMath : levelsFr;
  const lvlInfo = lvls[currentUser.level] || lvls[lvls.length - 1];

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isLowTime = timeLeft < 30;

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-50 p-6">
      <div className="w-full max-w-md flex items-center justify-between mb-8 bg-white p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-xl ${
              isMath ? "bg-blue-500" : "bg-pink-500"
            }`}
          >
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{currentUser.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase tracking-wide">
                {isMath ? "Maths" : "Français"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div
            className={`flex items-center gap-1 font-mono font-bold text-xl ${
              isLowTime ? "text-red-500 animate-pulse" : "text-slate-800"
            }`}
          >
            <Timer size={18} />
            {mins}:{secs < 10 ? `0${secs}` : secs}
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            Temps restant
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col min-h-[550px]">
        {feedback && (
          <div
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center text-white animate-in zoom-in duration-300 ${
              feedback === "correct" ? "bg-emerald-500" : "bg-rose-500"
            }`}
          >
            {feedback === "correct" ? (
              <CheckCircle2
                size={100}
                className="mb-6 drop-shadow-md animate-bounce"
              />
            ) : (
              <XCircle size={100} className="mb-6 drop-shadow-md" />
            )}
            <span className="text-4xl font-black tracking-tight">
              {feedback === "correct" ? "BRAVO !" : "OUPS..."}
            </span>
            <span className="font-medium mt-2 text-lg bg-white/20 px-4 py-1 rounded-full">
              {feedback === "correct" ? "+1 Point" : "On continue !"}
            </span>
          </div>
        )}

        <div className="flex justify-center gap-2 pt-8 pb-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${
                i < exercisesDoneCount
                  ? "w-8 bg-indigo-500"
                  : "w-2 bg-slate-200"
              }`}
            />
          ))}
        </div>

        <div className="text-center px-6">
          <span
            className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${lvlInfo.color
              .replace("text-", "bg-opacity-20 bg-")
              .replace("bg-", "text-")}`}
          >
            Niveau {currentUser.level}
          </span>
          <h2 className="text-xl font-bold text-slate-800">{lvlInfo.title}</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
          {currentProblem.image && (
            <img
              src={currentProblem.image}
              alt="Illustration"
              className="rounded-2xl shadow-lg w-full max-h-48 object-cover border-4 border-slate-50"
            />
          )}

          <div className="text-3xl font-black text-center text-slate-800 leading-snug">
            {currentProblem.questionText}
          </div>

          <div className="w-full mt-4">
            {currentProblem.type === "number" ||
            currentProblem.type === "text_input" ? (
              <>
                {currentProblem.type === "text_input" ? (
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full p-4 bg-slate-50 border-4 border-slate-100 rounded-3xl text-lg font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none"
                    placeholder="Écris ta réponse..."
                    rows={3}
                  />
                ) : (
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full text-center text-5xl font-black p-6 bg-slate-50 border-4 border-slate-100 rounded-3xl focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-200"
                    placeholder="?"
                    autoFocus
                  />
                )}
                <button
                  onClick={() => handleCheckAnswer(userAnswer)}
                  className="w-full mt-6 bg-slate-900 text-white py-5 rounded-2xl font-bold text-xl hover:bg-slate-800 active:scale-95 transition-all shadow-xl"
                >
                  VALIDER
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {currentProblem.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCheckAnswer(opt)}
                    className="bg-white border-4 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 py-6 rounded-2xl font-bold text-xl transition-all text-slate-700 hover:text-indigo-700 active:scale-95"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Finished = () => {
  const { sessionCorrectCount, currentUser, setView } = useContext(AppContext);
  // On re-calcule ici juste pour l'affichage, la logique de montée est dans handleSessionEnd
  const canLevelUp = sessionCorrectCount >= 3;
  const isLevelUp =
    canLevelUp &&
    currentUser.level < (currentUser.group.startsWith("math") ? 4 : 6);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center animate-in zoom-in duration-500 relative overflow-hidden">
        {isLevelUp && (
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" />
        )}

        <div className="mb-8 relative inline-block mt-4">
          {isLevelUp ? (
            <div className="relative animate-bounce">
              <ArrowUpCircle
                size={100}
                className="text-emerald-500 drop-shadow-xl"
              />
              <div className="absolute -top-2 -right-4 bg-yellow-400 text-white text-sm font-black px-3 py-1 rounded-full rotate-12 shadow-sm">
                LEVEL UP!
              </div>
            </div>
          ) : (
            <Trophy size={100} className="text-yellow-400 drop-shadow-xl" />
          )}
        </div>

        <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">
          {isLevelUp ? "Niveau Supérieur !" : "Session Terminée"}
        </h2>

        <p className="text-slate-500 font-medium text-lg mb-8 leading-relaxed">
          {isLevelUp
            ? "Incroyable ! 3/3 Juste. Tu passes au niveau suivant."
            : `Tu as réussi ${sessionCorrectCount} questions sur 3. Reviens demain pour progresser !`}
        </p>

        <div className="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100">
          <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">
            Score Total Actuel
          </span>
          <span className="text-6xl font-black text-indigo-600 tracking-tighter">
            {currentUser.score}
          </span>
        </div>

        <button
          onClick={() => setView("landing")}
          className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
        >
          Retourner à l'accueil
        </button>
      </div>
    </div>
  );
};

const TeacherAuth = () => {
  const { teacherPassword, setTeacherPassword, setShowTeacherAuth, setView } =
    useContext(AppContext);
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center">
        <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
          <KeyRound size={32} />
        </div>
        <h2 className="text-xl font-bold mb-4">Accès Professeur</h2>
        <input
          type="password"
          className="w-full p-3 border-2 border-slate-200 rounded-xl mb-4 text-center"
          placeholder="Mot de passe"
          value={teacherPassword}
          onChange={(e) => setTeacherPassword(e.target.value)}
        />
        <button
          onClick={() => {
            if (teacherPassword === "oustadsana") {
              setShowTeacherAuth(true);
              setView("teacher-dashboard");
            } else {
              alert("Mot de passe incorrect");
            }
          }}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700"
        >
          Entrer
        </button>
        <button
          onClick={() => setView("landing")}
          className="mt-4 text-sm text-slate-400"
        >
          Annuler
        </button>
      </div>
    </div>
  );
};

const TeacherDashboard = () => {
  const {
    studentData,
    setStudentData,
    setActivityLogs,
    selectedClass,
    setSelectedClass,
    teacherTab,
    setTeacherTab,
    inputRaw,
    setInputRaw,
    parseCSVData,
    resetDailyLimit,
    activityLogs,
    previewSubject,
    setPreviewSubject,
    previewLevel,
    setPreviewLevel,
    generateProblem,
    setView,
    setShowTeacherAuth,
    setTeacherPassword,
    isDataSaved,
  } = useContext(AppContext);

  const fileInputRef = useRef(null);
  const filteredStudents = studentData.filter((s) => s.group === selectedClass);

  const handleExportData = () => {
    const dataToSave = {
      students: studentData,
      logs: activityLogs,
      date: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(dataToSave, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backup_ecole_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.students) {
          if (
            window.confirm(
              `Voulez-vous écraser les données actuelles avec ${imported.students.length} élèves ?`
            )
          ) {
            setStudentData(imported.students);
            if (imported.logs) setActivityLogs(imported.logs);
            alert("Restauration réussie !");
          }
        } else {
          alert("Format de fichier invalide.");
        }
      } catch (err) {
        alert("Erreur lors de la lecture du fichier.");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input
  };

  const handleClearData = () => {
    if (
      window.confirm(
        "ATTENTION : Cela va effacer TOUS les élèves et logs. Êtes-vous sûr ?"
      )
    ) {
      setStudentData([]);
      setActivityLogs([]);
      localStorage.removeItem("school_data_students");
      localStorage.removeItem("school_data_logs");
      alert("Données effacées.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
            <LayoutGrid className="text-indigo-600" />
            Espace Professeur
          </h2>
          <div className="flex gap-2">
            {isDataSaved && (
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 rounded-full animate-pulse">
                <Save size={14} /> Sauvegardé
              </div>
            )}
            <button
              onClick={() => {
                setShowTeacherAuth(false);
                setTeacherPassword("");
                setView("landing");
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </header>

        <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setTeacherTab("students")}
            className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
              teacherTab === "students"
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-500"
            }`}
          >
            Gestion Élèves
          </button>
          <button
            onClick={() => setTeacherTab("coach")}
            className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
              teacherTab === "coach"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                : "bg-white text-indigo-600 border border-indigo-200"
            }`}
          >
            Assistant IA
          </button>
          <button
            onClick={() => setTeacherTab("logs")}
            className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
              teacherTab === "logs"
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-500"
            }`}
          >
            Historique
          </button>
          <button
            onClick={() => setTeacherTab("preview")}
            className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
              teacherTab === "preview"
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-500"
            }`}
          >
            Prévisualiser
          </button>
          <button
            onClick={() => setTeacherTab("backup")}
            className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
              teacherTab === "backup"
                ? "bg-emerald-600 text-white"
                : "bg-white text-emerald-600 border border-emerald-200"
            }`}
          >
            Sauvegarde
          </button>
        </div>

        {teacherTab === "students" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: "math1", label: "Maths G1", icon: <Calculator /> },
                { id: "math2", label: "Maths G2", icon: <Calculator /> },
                { id: "fr1", label: "Français G1", icon: <Languages /> },
                { id: "fr2", label: "Français G2", icon: <Languages /> },
              ].map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all shadow-sm ${
                    selectedClass === cls.id
                      ? "bg-indigo-600 text-white shadow-indigo-200 shadow-lg scale-105"
                      : "bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {cls.icon} {cls.label}
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
              <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                  <FileSpreadsheet className="text-green-600" />
                  Importer
                </h3>
                <div className="text-xs text-slate-500 mb-2 bg-slate-50 p-3 rounded-xl border">
                  L'IA détecte le niveau via les mots clés (ex: "grapheme",
                  "texte", "multiplication").
                </div>
                <textarea
                  className="flex-1 w-full p-4 bg-slate-50 rounded-xl text-xs font-mono border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none resize-none transition-all"
                  placeholder="Exemple:&#10;F189...   Nom...   Niveau..."
                  value={inputRaw}
                  onChange={(e) => setInputRaw(e.target.value)}
                />
                <button
                  onClick={parseCSVData}
                  className="mt-4 w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 active:scale-95 transition-all"
                >
                  Importer
                </button>
              </div>

              <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="font-bold text-lg">
                    Liste des Élèves ({filteredStudents.length})
                  </h3>
                </div>
                <div className="overflow-y-auto flex-1 pr-2">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white z-10 shadow-sm">
                      <tr className="text-slate-400 text-xs uppercase tracking-wider">
                        <th className="pb-3 pl-2">Identifiant</th>
                        <th className="pb-3">Nom</th>
                        <th className="pb-3 text-center">Niveau</th>
                        <th className="pb-3 text-center">Score</th>
                        <th className="pb-3 text-right pr-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map((s) => (
                        <tr
                          key={s.id}
                          className="group hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-4 pl-2 font-mono text-xs font-bold text-slate-500">
                            {s.id}
                          </td>
                          <td className="py-4 font-bold text-slate-700">
                            {s.name}
                            {s.lastLogin ===
                              new Date().toLocaleDateString() && (
                              <span className="ml-2 text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                                Fait
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-center">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-600">
                              Niv {s.level}
                            </span>
                          </td>
                          <td className="py-4 text-center font-bold text-indigo-600">
                            {s.score}
                          </td>
                          <td className="py-4 text-right pr-2">
                            <button
                              onClick={() => resetDailyLimit(s.id, s.group)}
                              className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded hover:bg-orange-100"
                              title="Réinitialiser accès jour"
                            >
                              Débloquer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {teacherTab === "coach" && <CoachIA />}

        {teacherTab === "logs" && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-[600px] flex flex-col">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <History size={20} className="text-indigo-600" />
              Journal d'activité
            </h3>
            <div className="overflow-y-auto flex-1">
              {activityLogs.length === 0 ? (
                <div className="text-center text-slate-400 py-10">
                  Aucune activité récente.
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-white border-b">
                    <tr className="text-slate-500">
                      <th className="p-3">Heure</th>
                      <th className="p-3">Élève</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Détails</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {activityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-xs text-slate-500">
                          {log.time}
                        </td>
                        <td className="p-3 font-bold">{log.studentName}</td>
                        <td className="p-3">
                          {log.type === "access" ? (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                              Connexion
                            </span>
                          ) : (
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                log.details.isCorrect
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              Réponse
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600">
                          {log.type === "access" ? (
                            <span>
                              Matière :{" "}
                              {log.details.subject === "math"
                                ? "Maths"
                                : "Français"}
                            </span>
                          ) : (
                            <span>
                              Q: {log.details.question} <br />
                              R: <strong>{log.details.answer}</strong>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {teacherTab === "preview" && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-[600px] flex flex-col items-center">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Eye size={20} className="text-indigo-600" />
              Simulateur d'Exercices
            </h3>

            <div className="flex gap-4 mb-8">
              <select
                value={previewSubject}
                onChange={(e) => setPreviewSubject(e.target.value)}
                className="p-3 border rounded-xl font-bold text-slate-700"
              >
                <option value="math">Mathématiques</option>
                <option value="fr">Français</option>
              </select>

              <select
                value={previewLevel}
                onChange={(e) => setPreviewLevel(parseInt(e.target.value))}
                className="p-3 border rounded-xl font-bold text-slate-700"
              >
                {(previewSubject === "math" ? levelsMath : levelsFr).map(
                  (l) => (
                    <option key={l.id} value={l.id}>
                      Niveau {l.id} - {l.title}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="w-full max-w-md border-4 border-dashed border-slate-200 rounded-3xl p-6 bg-slate-50 flex flex-col items-center justify-center text-center min-h-[300px]">
              {(() => {
                const prob = generateProblem(previewLevel, 1, previewSubject);
                return (
                  <>
                    {prob.image && (
                      <img
                        src={prob.image}
                        className="h-32 rounded-xl mb-4 shadow-sm"
                      />
                    )}
                    <div className="text-2xl font-black text-slate-800 mb-4">
                      {prob.questionText}
                    </div>
                    <div className="text-sm text-slate-400 font-mono">
                      Réponse attendue : {prob.answer}
                    </div>
                  </>
                );
              })()}
            </div>
            <p className="mt-4 text-slate-400 text-sm">
              L'exercice change à chaque rafraîchissement.
            </p>
          </div>
        )}

        {/* NOUVEL ONGLET SAUVEGARDE */}
        {teacherTab === "backup" && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-[600px] flex flex-col items-center justify-center gap-8">
            <div className="text-center max-w-lg">
              <Save size={48} className="text-emerald-500 mx-auto mb-4" />
              <h3 className="font-bold text-2xl mb-2 text-slate-800">
                Sauvegarde & Sécurité
              </h3>
              <p className="text-slate-500">
                Pour ne jamais perdre vos données (élèves, scores, niveaux),
                téléchargez une copie sur votre ordinateur.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
              <button
                onClick={handleExportData}
                className="flex flex-col items-center justify-center gap-3 bg-indigo-50 border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-100 p-8 rounded-2xl transition-all group"
              >
                <Download
                  size={32}
                  className="text-indigo-600 group-hover:scale-110 transition-transform"
                />
                <span className="font-bold text-indigo-900">
                  Télécharger les données
                </span>
                <span className="text-xs text-indigo-400">
                  Sauvegarder un fichier .json
                </span>
              </button>

              <div className="relative flex flex-col items-center justify-center gap-3 bg-slate-50 border-2 border-slate-200 hover:border-slate-400 p-8 rounded-2xl transition-all group cursor-pointer">
                <Upload
                  size={32}
                  className="text-slate-600 group-hover:scale-110 transition-transform"
                />
                <span className="font-bold text-slate-800">
                  Restaurer les données
                </span>
                <span className="text-xs text-slate-400">
                  Charger un fichier .json
                </span>
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleImportData}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleClearData}
              className="mt-8 flex items-center gap-2 text-red-400 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm font-bold"
            >
              <Trash2 size={16} />
              Tout effacer (Reset usine)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CheckScoreView = () => {
  const {
    studentData,
    setView,
    scoreSearchCode,
    setScoreSearchCode,
    scoreResult,
    setScoreResult,
  } = useContext(AppContext);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">
          Voir mon Score
        </h2>
        {!scoreResult ? (
          <>
            <input
              type="text"
              className="w-full text-center p-4 border-2 rounded-xl mb-4 uppercase font-bold"
              placeholder="Ton Code (F...)"
              value={scoreSearchCode}
              onChange={(e) => setScoreSearchCode(e.target.value)}
            />
            <button
              onClick={() => {
                const found = studentData.filter(
                  (s) => s.id === scoreSearchCode.trim().toUpperCase()
                );
                setScoreResult(found.length > 0 ? found : "NOT_FOUND");
              }}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold mb-4"
            >
              Rechercher
            </button>
          </>
        ) : (
          <div className="mb-6 animate-in zoom-in">
            {scoreResult === "NOT_FOUND" ? (
              <div className="text-red-500 font-bold mb-4">
                Code introuvable !
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-700">
                  {scoreResult[0].name}
                </h3>
                {scoreResult.map((res, idx) => (
                  <div
                    key={idx}
                    className="bg-indigo-50 p-4 rounded-2xl flex justify-between items-center"
                  >
                    <div className="text-left">
                      <div className="text-xs font-bold uppercase text-indigo-400">
                        {res.group.startsWith("math") ? "Maths" : "Français"}
                      </div>
                      <div className="text-sm font-bold text-slate-600">
                        Niveau {res.level}
                      </div>
                    </div>
                    <div className="text-3xl font-black text-indigo-600">
                      {res.score}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => {
                setScoreResult(null);
                setScoreSearchCode("");
              }}
              className="mt-6 text-slate-400 text-sm underline"
            >
              Chercher un autre
            </button>
          </div>
        )}
        <button
          onClick={() => setView("landing")}
          className="text-slate-400 font-bold text-sm"
        >
          Retour
        </button>
      </div>
    </div>
  );
};

// --- COMPOSANT PRINCIPAL (CONTROLEUR) ---

const App = () => {
  // --- ÉTATS ---
  const [view, setView] = useState("landing");
  const [currentUser, setCurrentUser] = useState(null);
  const [exercisesDoneCount, setExercisesDoneCount] = useState(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [selectedClass, setSelectedClass] = useState("math1");
  const [teacherTab, setTeacherTab] = useState("students");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [showTeacherAuth, setShowTeacherAuth] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [loginName, setLoginName] = useState("");
  const [isCloudMode, setIsCloudMode] = useState(false); // New state to track if we use firebase

  // États de recherche score
  const [scoreSearchCode, setScoreSearchCode] = useState("");
  const [scoreResult, setScoreResult] = useState(null);
  const [isDataSaved, setIsDataSaved] = useState(false);

  // -- PERSISTANCE DES DONNÉES (LocalStorage) --
  const [studentData, setStudentData] = useState(() => {
    const saved = localStorage.getItem("school_data_students");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "F189044327",
            name: "الدلاجي أميمة",
            level: 0,
            score: 12,
            group: "math1",
            lastLogin: "",
          },
          {
            id: "F187189184",
            name: "بريجي مروان",
            level: 1,
            score: 5,
            group: "math1",
            lastLogin: "",
          },
          {
            id: "TEST1",
            name: "Élève Test",
            level: 4,
            score: 50,
            group: "fr1",
            lastLogin: "",
          },
        ];
  });

  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem("school_data_logs");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("school_data_students", JSON.stringify(studentData));
    // Feedback visuel de sauvegarde
    setIsDataSaved(true);
    const timer = setTimeout(() => setIsDataSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [studentData]);

  useEffect(() => {
    localStorage.setItem("school_data_logs", JSON.stringify(activityLogs));
  }, [activityLogs]);

  const [inputRaw, setInputRaw] = useState("");
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [difficulty, setDifficulty] = useState(1);
  const [previewLevel, setPreviewLevel] = useState(0);
  const [previewSubject, setPreviewSubject] = useState("math");

  useEffect(() => {
    let timer;
    if (view === "student-exercise" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setView("student-finished");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [view, timeLeft]);

  const generateProblem = (levelId, diff, groupOrSubject) => {
    const isMath = groupOrSubject.startsWith("math");

    if (isMath) {
      let num1, num2, answer, questionText;
      const max = diff === 1 ? 10 : diff === 2 ? 50 : 100;

      switch (levelId) {
        case 0:
          num1 = Math.floor(Math.random() * max) + 1;
          num2 = Math.floor(Math.random() * max) + 1;
          answer = num1 + num2;
          questionText = `${num1} + ${num2} = ?`;
          break;
        case 1:
          num1 = Math.floor(Math.random() * max) + 5;
          num2 = Math.floor(Math.random() * num1);
          answer = num1 - num2;
          questionText = `${num1} - ${num2} = ?`;
          break;
        case 2:
          const mMax = diff === 1 ? 5 : 10;
          num1 = Math.floor(Math.random() * mMax) + 1;
          num2 = Math.floor(Math.random() * 9) + 1;
          answer = num1 * num2;
          questionText = `${num1} x ${num2} = ?`;
          break;
        case 3:
          num2 = Math.floor(Math.random() * 9) + 2;
          answer = Math.floor(Math.random() * (diff === 1 ? 5 : 10)) + 1;
          num1 = num2 * answer;
          questionText = `${num1} ÷ ${num2} = ?`;
          break;
        case 4:
          const p1 = Math.floor(Math.random() * 20) + 10;
          const p2 = Math.floor(Math.random() * 5) + 1;
          questionText = `Ali a ${p1} billes. Il en perd ${p2}.\nCombien en reste-t-il ?`;
          answer = p1 - p2;
          break;
        default:
          answer = 2;
          questionText = "1+1=?";
      }
      return { questionText, answer, type: "number" };
    } else {
      switch (levelId) {
        case 0:
          const letters = ["A", "O", "M", "S", "R", "L"];
          const targetL = letters[Math.floor(Math.random() * letters.length)];
          return {
            questionText: "Quelle est cette lettre ?",
            image: `https://placehold.co/300x200/indigo/white?text=${targetL}`,
            answer: targetL,
            type: "mcq",
            options: letters.sort(() => Math.random() - 0.5).slice(0, 4),
          };
        case 4:
          const graphemes = [
            {
              q: "Complète : un châ___ (habitation)",
              a: "teau",
              opts: ["to", "tau", "teau", "tô"],
            },
            {
              q: "Complète : une ___to (souvenir)",
              a: "pho",
              opts: ["fo", "pho", "fau", "fa"],
            },
            {
              q: "Le son [gn] comme dans :",
              a: "Montagne",
              opts: ["Banane", "Montagne", "Genou", "Grand"],
            },
            {
              q: "Complète : La pein___",
              a: "ture",
              opts: ["ture", "tur", "tuir", "tre"],
            },
          ];
          const gItem = graphemes[Math.floor(Math.random() * graphemes.length)];
          return {
            questionText: gItem.q,
            answer: gItem.a,
            type: "mcq",
            options: gItem.opts,
          };
        case 6:
          const scenes = [
            {
              t: "Plage",
              src: "https://placehold.co/400x250/orange/white?text=Plage",
              hint: "soleil, sable, mer",
            },
            {
              t: "École",
              src: "https://placehold.co/400x250/blue/white?text=Ecole",
              hint: "livre, classe, écrire",
            },
          ];
          const scene = scenes[Math.floor(Math.random() * scenes.length)];
          return {
            questionText: "Regarde l'image. Écris une phrase (3 mots minimum).",
            image: scene.src,
            hint: `Mots: ${scene.hint}`,
            answer: "free_text",
            type: "text_input",
          };
        default:
          const qData = [
            { q: "Trouve la majuscule", a: "R", opts: ["r", "e", "R", "a"] },
            {
              q: "Le chat ... (mange/dort)",
              a: "mange",
              opts: ["mange", "table", "mur", "sol"],
            },
            {
              q: "Contraire de 'Grand'",
              a: "Petit",
              opts: ["Gros", "Petit", "Haut", "Long"],
            },
          ];
          const item = qData[Math.floor(Math.random() * qData.length)];
          return {
            questionText: item.q,
            answer: item.a,
            type: "mcq",
            options: item.opts,
          };
      }
    }
  };

  const addLog = (type, details) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setActivityLogs((prev) => [
      {
        id: Date.now(),
        time: timeString,
        studentName: currentUser ? currentUser.name : loginName,
        type,
        details,
      },
      ...prev,
    ]);
  };

  const handleCheckAnswer = (val) => {
    let isCorrect = false;
    if (currentProblem.type === "text_input") {
      const words = val.trim().split(/\s+/);
      if (words.length >= 3) isCorrect = true;
    } else {
      isCorrect =
        val.toString().toLowerCase() ===
        currentProblem.answer.toString().toLowerCase();
    }

    addLog("answer", {
      question: currentProblem.questionText,
      answer: val,
      isCorrect,
    });

    if (isCorrect) {
      setFeedback("correct");
      setSessionCorrectCount((prev) => prev + 1);
      const newScore = currentUser.score + 1;
      const updatedUser = { ...currentUser, score: newScore };
      setCurrentUser(updatedUser);
      setStudentData((prev) =>
        prev.map((s) =>
          s.id === currentUser.id && s.group === currentUser.group
            ? updatedUser
            : s
        )
      );
      setTimeout(() => nextExercise(true), 1500);
    } else {
      setFeedback("incorrect");
      setTimeout(() => nextExercise(false), 2000);
    }
  };

  const nextExercise = (wasCorrect) => {
    if (exercisesDoneCount + 1 >= 3) {
      setFeedback(null);
      setView("student-finished");
      return;
    }
    setExercisesDoneCount((prev) => prev + 1);
    let newDiff = difficulty;
    if (wasCorrect && difficulty < 3) newDiff += 1;
    if (!wasCorrect && difficulty > 1) newDiff -= 1;

    setFeedback(null);
    setUserAnswer("");
    setDifficulty(newDiff);
    setCurrentProblem(
      generateProblem(currentUser.level, newDiff, currentUser.group)
    );
  };

  const handleSessionEnd = () => {
    const canLevelUp = sessionCorrectCount >= 3;
    if (canLevelUp) {
      const maxLevel = currentUser.group.startsWith("math") ? 4 : 6;
      if (currentUser.level < maxLevel) {
        const updatedUser = { ...currentUser, level: currentUser.level + 1 };
        setCurrentUser(updatedUser);
        setStudentData((prev) =>
          prev.map((s) =>
            s.id === currentUser.id && s.group === currentUser.group
              ? updatedUser
              : s
          )
        );
        return "LEVEL_UP";
      }
    }
    return "STAY";
  };

  const parseCSVData = () => {
    try {
      const lines = inputRaw.split(/\r?\n/);
      const newStudents = [];
      let successCount = 0;
      const targetLevels = selectedClass.startsWith("math")
        ? levelsMath
        : levelsFr;

      lines.forEach((line) => {
        if (!line.trim()) return;
        const cols = line
          .split(/[\t;,]|\s{2,}/)
          .map((c) => c.trim().replace(/"/g, ""));
        const cleanCols = cols.filter((c) => c !== "");

        if (cleanCols.length >= 2) {
          const id = cleanCols[0];
          const name = cleanCols[1];
          const restOfLine = cleanCols.slice(2).join(" ").toLowerCase();
          const isStudentRow =
            /^[FfMm]?\d+/.test(id) && name && name.length > 2;

          if (isStudentRow) {
            let detectedLevel = 0;
            const matchedLevel = targetLevels.find(
              (l) =>
                l.keywords &&
                l.keywords.some((k) => restOfLine.includes(k.toLowerCase()))
            );
            if (matchedLevel) detectedLevel = matchedLevel.id;

            newStudents.push({
              id: id.toUpperCase(),
              name,
              level: detectedLevel,
              score: 0,
              group: selectedClass,
              lastLogin: "",
            });
            successCount++;
          }
        }
      });

      if (successCount > 0) {
        setStudentData((prev) => {
          const prevFiltered = prev.filter((s) => {
            return !newStudents.some(
              (ns) => ns.id === s.id && ns.group === s.group
            );
          });
          return [...prevFiltered, ...newStudents];
        });
        alert(`${successCount} élèves importés dans ${selectedClass} !`);
        setInputRaw("");
      } else {
        alert("Aucune donnée valide trouvée.");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur import.");
    }
  };

  const adjustScore = (studentId, group, amount) => {
    setStudentData((prev) =>
      prev.map((s) => {
        if (s.id === studentId && s.group === group) {
          let newS = s.score + amount;
          if (newS < 0) newS = 0;
          return { ...s, score: newS };
        }
        return s;
      })
    );
  };

  const resetDailyLimit = (studentId, group) => {
    setStudentData((prev) =>
      prev.map((s) => {
        if (s.id === studentId && s.group === group) {
          return { ...s, lastLogin: "" };
        }
        return s;
      })
    );
    alert("Accès réinitialisé pour aujourd'hui.");
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const code = e.target.code.value.trim().toUpperCase();
    const foundAny = studentData.filter((s) => s.id === code);
    if (foundAny.length > 0) {
      setLoginId(code);
      setLoginName(foundAny[0].name);
      setView("student-subject-select");
    } else {
      alert("Code incorrect !");
    }
  };

  const startSession = (subjectType) => {
    const today = new Date().toLocaleDateString();
    let userProfile = studentData.find(
      (s) => s.id === loginId && s.group.startsWith(subjectType)
    );

    if (!userProfile) {
      const defaultGroup = subjectType === "math" ? "math1" : "fr1";
      userProfile = {
        id: loginId,
        name: loginName,
        level: 0,
        score: 0,
        group: defaultGroup,
        lastLogin: "",
      };
      setStudentData((prev) => [...prev, userProfile]);
    }

    if (userProfile.lastLogin === today) {
      alert("Tu as déjà fait tes exercices aujourd'hui ! Reviens demain.");
      return;
    }

    const updatedUser = { ...userProfile, lastLogin: today };
    setStudentData((prev) =>
      prev.map((s) =>
        s.id === updatedUser.id && s.group === updatedUser.group
          ? updatedUser
          : s
      )
    );

    const now = new Date();
    const timeString = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setActivityLogs((prev) => [
      {
        id: Date.now(),
        time: timeString,
        studentName: loginName,
        type: "access",
        details: { subject: subjectType },
      },
      ...prev,
    ]);

    setCurrentUser(updatedUser);
    setCurrentProblem(null); // CRUCIAL : Réinitialiser pour déclencher le useEffect
    setExercisesDoneCount(0);
    setSessionCorrectCount(0);
    setTimeLeft(180);
    setView("student-exercise");
  };

  const contextValue = {
    view,
    setView,
    currentUser,
    setCurrentUser,
    exercisesDoneCount,
    setExercisesDoneCount,
    sessionCorrectCount,
    setSessionCorrectCount,
    timeLeft,
    setTimeLeft,
    selectedClass,
    setSelectedClass,
    teacherTab,
    setTeacherTab,
    teacherPassword,
    setTeacherPassword,
    showTeacherAuth,
    setShowTeacherAuth,
    loginId,
    setLoginId,
    loginName,
    setLoginName,
    studentData,
    setStudentData,
    activityLogs,
    setActivityLogs,
    inputRaw,
    setInputRaw,
    scoreSearchCode,
    setScoreSearchCode,
    scoreResult,
    setScoreResult,
    currentProblem,
    setCurrentProblem,
    userAnswer,
    setUserAnswer,
    feedback,
    setFeedback,
    difficulty,
    setDifficulty,
    previewLevel,
    setPreviewLevel,
    previewSubject,
    setPreviewSubject,
    generateProblem,
    addLog,
    handleCheckAnswer,
    nextExercise,
    handleSessionEnd,
    parseCSVData,
    adjustScore,
    resetDailyLimit,
    handleLoginSubmit,
    startSession,
    isDataSaved,
    isCloudMode,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="font-sans text-slate-900 bg-slate-50 min-h-screen selection:bg-indigo-100">
        <TailwindInjector />
        {view === "landing" && <LandingPage />}
        {view === "check-score" && <CheckScoreView />}
        {view === "teacher-auth" && <TeacherAuth />}
        {view === "teacher-dashboard" && <TeacherDashboard />}
        {view === "student-login" && <StudentLogin />}
        {view === "student-subject-select" && <StudentSubjectSelect />}
        {view === "student-exercise" && currentUser && <StudentExercise />}
        {view === "student-finished" && currentUser && <Finished />}
      </div>
    </AppContext.Provider>
  );
};

export default App;
