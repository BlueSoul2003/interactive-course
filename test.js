
import { createRoot } from 'react-dom/client';
import React, { useState, useEffect, useRef } from 'react';
import { Wand2, BookOpen, Scroll, Award, Sparkles, XCircle, CheckCircle, RotateCcw, GripHorizontal, Volume2, Globe }
from 'lucide-react';

// --- DATA START ---
const familyData = [
  {
    "zh": "鐖风埛/澶栧叕",
    "en": "Grandfather",
    "uchi": "銇濄伒",
    "soto": "銇娿仒銇勩仌銈?
  },
  {
    "zh": "濂跺ザ/澶栧﹩",
    "en": "Grandmother",
    "uchi": "銇濄伡",
    "soto": "銇娿伆銇傘仌銈?
  },
  {
    "zh": "鐖哥埜",
    "en": "Father",
    "uchi": "銇°仭",
    "soto": "銇娿仺銇嗐仌銈?
  },
  {
    "zh": "濡堝",
    "en": "Mother",
    "uchi": "銇伅",
    "soto": "銇娿亱銇傘仌銈?
  },
  {
    "zh": "鍝ュ摜",
    "en": "Older Brother",
    "uchi": "銇傘伀",
    "soto": "銇娿伀銇勩仌銈?
  },
  {
    "zh": "濮愬",
    "en": "Older Sister",
    "uchi": "銇傘伃",
    "soto": "銇娿伃銇堛仌銈?
  },
  {
    "zh": "寮熷紵",
    "en": "Younger Brother",
    "uchi": "銇娿仺銇嗐仺",
    "soto": "銇娿仺銇嗐仺銇曘倱"
  },
  {
    "zh": "濡瑰",
    "en": "Younger Sister",
    "uchi": "銇勩倐銇嗐仺",
    "soto": "銇勩倐銇嗐仺銇曘倱"
  }
];
const uchiPrompts = [
  {
    "zh": "鍦ㄩ瓟鑽涓婏紝鏂唴鏅暀鎺堟壒璇勪綘鐨勮嵂姘撮鑹蹭笉瀵癸紝浣犲皬澹板槦鍥斾綘鐨勩€恵zh}銆戝钩鏃跺湪瀹跺氨鏄繖涔堢啲鐨?..",
    "en": "In Potions class, Snape criticizes your potion's color. You mutter that your [{en}] always brews it this way at home..."
  },
  {
    "zh": "鏀跺埌鍚煎彨淇★紒鏁翠釜澶у爞閮藉畨闈滀簡锛屼綘灏村艾鍦版崅浣忚劯锛岄偅鏄綘鐨勩€恵zh}銆戝瘎鏉ラ獋浣犱笉鍙婃牸鐨?..",
    "en": "A Howler! The Great Hall goes silent. You cover your face in embarrassment as your [{en}] yells at you for failing..."
  }
];
const sotoPrompts = [
  {
    "zh": "浣犲湪鍥界帇鍗佸瓧杞︾珯9戮绔欏彴閬囧埌鍚屽锛屼綘璧颁笂鍓嶇ぜ璨屽湴鍚戜粬鐨勩€恵zh}銆戦棶濂?..",
    "en": "At Platform 9 3/4, you step forward to politely greet your classmate's [{en}]..."
  },
  {
    "zh": "璧晱姝ｅ湪鍥句功棣嗙炕闃呴夯鐡滃巻鍙蹭功锛屼綘濂藉鍦拌蛋杩囧幓锛岃闂ス鐨勩€恵zh}銆戞槸涓嶆槸涔熸噦杩欎簺...",
    "en": "Hermione is devouring Muggle history books. You ask if her [{en}] also understands this stuff..."
  }
];
const i18n = {
  "zh": {
    "title": "Eastern Charms O.W.L.",
    "subtitle": "Drag and drop the parchments!",
    "uchiBtn": "Uchi Trial",
    "sotoBtn": "Soto Trial",
    "mixedBtn": "Mixed Test",
    "scoreLabel": "Points",
    "progressLabel": "Progress",
    "uchiTag": "Own Family (Uchi)",
    "sotoTag": "Others (Soto)",
    "correct": "Correct!",
    "wrong": "Wrong!",
    "resultTitle": "Results",
    "finalScore": "Score",
    "gradeLabel": "Grade",
    "restart": "Restart",
    "resetNotice": "Reshuffled",
    "grades": {
      "O": {
        "grade": "O",
        "msg": "Outstanding!"
      },
      "E": {
        "grade": "E",
        "msg": "Exceeds Expectations"
      },
      "A": {
        "grade": "A",
        "msg": "Acceptable"
      },
      "P": {
        "grade": "P",
        "msg": "Poor"
      },
      "T": {
        "grade": "T",
        "msg": "Troll"
      }
    }
  },
  "en": {
    "title": "Eastern Charms O.W.L.",
    "subtitle": "Click a button to start.",
    "uchiBtn": "Uchi Trial - Refer to your own family",
    "sotoBtn": "Soto Trial - Refer to others' family",
    "mixedBtn": "Ultimate O.W.L. Test (Mixed)",
    "scoreLabel": "House Points",
    "progressLabel": "Progress",
    "uchiTag": "Own Family (Uchi)",
    "sotoTag": "Others' Family (Soto)",
    "correct": "Correct! +10 pts",
    "wrong": "Spell Rebounded! Correct:",
    "resultTitle": "O.W.L. Results",
    "finalScore": "Final Score",
    "gradeLabel": "Overall Grade",
    "restart": "Retake Exam",
    "resetNotice": "Question pool reshuffled!",
    "grades": {
      "O": {
        "grade": "O (Outstanding)",
        "msg": "Merlin's beard! A perfect display of Charms!"
      },
      "E": {
        "grade": "E (Exceeds Expectations)",
        "msg": "Well done! You won't embarrass yourself at the Ministry."
      },
      "A": {
        "grade": "A (Acceptable)",
        "msg": "Barely passed! A bit stumbling, but at least nothing exploded."
      },
      "P": {
        "grade": "P (Poor)",
        "msg": "You need more time in the library reviewing Uchi/Soto!"
      },
      "T": {
        "grade": "T (Troll)",
        "msg": "Blimey! You called someone else's father your own! Go revise!"
      }
    }
  }
};

function HogwartsJapaneseExam() {
const [lang, setLang] = useState('zh'); // 鏂帮細鐘?
const [currentScreen, setCurrentScreen] = useState('start');
const [mode, setMode] = useState(null);
const [questions, setQuestions] = useState([]);
const [currentQIndex, setCurrentQIndex] = useState(0);
const [score, setScore] = useState(0);
const [feedback, setFeedback] = useState(null);
const [selectedAns, setSelectedAns] = useState(null);
const [isTransitioning, setIsTransitioning] = useState(false);
const [activeWindowId, setActiveWindowId] = useState('start');

// 鏂帮細搴崇当鐙€?
const [showRefreshNotice, setShowRefreshNotice] = useState(false);
const remainingPools = useRef({ uchi: [], soto: [], mixed: [] });
const ROUND_SIZE = 15;

// 鏂帮細寤虹珛瀹?40 椤岀殑椤屽韩閭忚集
const buildPool = (type) => {
const pool = [];
const prompts = type === 'uchi' ? uchiPrompts : sotoPrompts;
familyData.forEach(member => {
prompts.forEach(prompt => {
const situationZh = prompt.zh.replace('{zh}', member.zh);
const situationEn = prompt.en.replace('{en}', member.en);
const correctAnswer = type === 'uchi' ? member.uchi : member.soto;
const trapAnswer = type === 'uchi' ? member.soto : member.uchi;

let otherOptions = familyData
.filter(d => d.zh !== member.zh)
.map(d => type === 'uchi' ? d.uchi : d.soto);
otherOptions = shuffleArray(otherOptions).slice(0, 2);

const options = shuffleArray([correctAnswer, trapAnswer, ...otherOptions]);
pool.push({ type, targetZh: member.zh, targetEn: member.en, situationZh, situationEn, correctAnswer, options });
});
});
return shuffleArray(pool);
};

// 鍒?CSS
useEffect(() => {
const style = document.createElement('style');
style.innerHTML = `
@keyframes shake {
0%, 100% { transform: translateX(0); }
20%, 60% { transform: translateX(-10px); }
40%, 80% { transform: translateX(10px); }
}
.animate-shake { animation: shake 0.4s ease-in-out; }

@keyframes magic-flash {
0% { box-shadow: 0 0 0px #D3A625; background-color: rgba(211, 166, 37, 0.1); }
50% { box-shadow: 0 0 40px #D3A625; background-color: rgba(211, 166, 37, 0.4); }
100% { box-shadow: 0 0 0px #D3A625; background-color: rgba(211, 166, 37, 0.1); }
}
.magic-flash { animation: magic-flash 0.8s ease-out; }

.bg-desk {
background-color: #1a0f0f;
background-image: radial-gradient(circle at 50% 50%, #3a1c1c 0%, #110808 100%);
}

.bg-parchment {
background-color: #f4e4bc;
background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100'
xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8'
numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)'
opacity='0.08'/%3E%3C/svg%3E");
}
`;
document.head.appendChild(style);
return () => document.head.removeChild(style);
}, []);

const startGame = (selectedMode) => {
playClick();

let isRefreshed = false;

// 濡傛灉瑭叉ā寮忓墿涓嬬殑椤岀洰灏戞柤杓滆鐨勬暩閲忥紝灏遍噸鏂扮敓鎴愬』椤屽韩
if (remainingPools.current[selectedMode].length < ROUND_SIZE) { isRefreshed=true; if (selectedMode==='mixed' ) {
    remainingPools.current.mixed=shuffleArray([...buildPool('uchi'), ...buildPool('soto')]); } else {
    remainingPools.current[selectedMode]=buildPool(selectedMode); } } // 寰炲焊鎶藉嚭 15 ?const
    nextQuestions=remainingPools.current[selectedMode].slice(0, ROUND_SIZE); // 鏇存柊鍓╀笅鐨?
    remainingPools.current[selectedMode]=remainingPools.current[selectedMode].slice(ROUND_SIZE);
    setQuestions(nextQuestions); setCurrentQIndex(0); setScore(0); setMode(selectedMode); setCurrentScreen('playing');
    setActiveWindowId('question'); // Bring question to front // 椤ら搴埛鏂版彁绀?if (isRefreshed) { setShowRefreshNotice(true);
    setTimeout(()=> setShowRefreshNotice(false), 3000);
    }
    };

    const handleAnswer = (option) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSelectedAns(option);

    const isCorrect = option === questions[currentQIndex].correctAnswer;

    if (isCorrect) {
    playCorrect();
    setFeedback('correct');
    setScore(s => s + 10);
    } else {
    playWrong();
    setFeedback('wrong');
    }

    setTimeout(() => {
    setFeedback(null);
    setSelectedAns(null);
    setIsTransitioning(false);

    if (currentQIndex < questions.length - 1) { setCurrentQIndex(prev=> prev + 1);
        } else {
        setCurrentScreen('result');
        }
        }, 1500);
        };

        // 1. 濮嬬晫?
        const renderStartScreen = () => {
        const t = i18n[lang];
        return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div
                className="bg-parchment border-4 border-[#740001] rounded-2xl p-8 max-w-md w-full shadow-2xl relative z-10 animate-fade-in text-center">
                <h1
                    className="text-4xl font-serif font-bold text-[#740001] drop-shadow-sm flex items-center justify-center gap-3 mb-4">
                    <Wand2 size={40} className="text-[#D3A625]" />
                    {t.title}
                </h1>
                <p className="text-gray-800 mb-6 text-sm font-medium whitespace-pre-line">
                    {t.subtitle}
                    <Volume2 size={16} className="inline text-[#D3A625]" />)
                </p>

                <div className="grid grid-cols-1 gap-4">
                    <button onClick={()=> startGame('uchi')} className="bg-[#740001] text-[#D3A625] font-bold p-3
                        rounded-lg hover:scale-105 transition-transform shadow-md border border-[#D3A625]">
                        {t.uchiBtn}
                    </button>
                    <button onClick={()=> startGame('soto')} className="bg-[#740001] text-[#D3A625] font-bold p-3
                        rounded-lg hover:scale-105 transition-transform shadow-md border border-[#D3A625]">
                        {t.sotoBtn}
                    </button>
                    <button onClick={()=> startGame('mixed')} className="bg-gradient-to-r from-[#D3A625] to-[#B8860B]
                        text-[#740001] font-bold p-3 rounded-lg hover:scale-105 transition-transform shadow-md border
                        border-[#740001]">
                        {t.mixedBtn}
                    </button>
                </div>
            </div>
        </div>
        )};

        // 2. 娓哥帺鐣岄潰 (鑷旀嫋鎷?
        const renderPlayingScreen = () => {
        const t = i18n[lang];
        const currentQ = questions[currentQIndex];
        // 鏍规嵁灞忓箷瀹藉害缁欎釜澶х殑鍒濆浣嶇郊閬垮厤鎵嬫満涓婅窇鍒板睆骞?
        const isMobile = window.innerWidth < 768; return ( <>
            {/* 椤屽韩閲嶇疆閫氱煡 */}
            {showRefreshNotice && (
            <div
                className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#D3A625] text-[#740001] px-6 py-2 rounded-full font-bold shadow-lg z-[100] transition-opacity flex items-center gap-2">
                <Sparkles size={18} /> {t.resetNotice}
            </div>
            )}

            {/* 妯″潡1锛氬垎鏉?*/}
            <DraggableParchment id="score" activeId={activeWindowId} setActiveId={setActiveWindowId} initialPos={{ x:
                isMobile ? 10 : window.innerWidth - 250, y: 20 }} className="w-48">
                <div className="text-center font-serif text-[#740001]">
                    <h3
                        className="font-bold border-b border-[#c19a6b] pb-2 mb-2 flex justify-center items-center gap-1">
                        <Award size={18} /> {t.scoreLabel}
                    </h3>
                    <p className="text-4xl font-bold">{score}</p>
                    <p className="text-xs text-gray-600 mt-2">{t.progressLabel}: {currentQIndex + 1}/{ROUND_SIZE}</p>
                </div>
            </DraggableParchment>

            {/* 妯″潡2锛氱洕 */}
            <DraggableParchment id="question" activeId={activeWindowId} setActiveId={setActiveWindowId} initialPos={{ x:
                isMobile ? 10 : window.innerWidth/2 - 200, y: isMobile ? 150 : 100 }} className={`w-[90vw] max-w-[400px]
                ${feedback==='wrong' ? 'animate-shake' : '' } ${feedback==='correct' ? 'magic-flash' : '' }`}>
                <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#740001] text-[#D3A625] px-4 py-1 rounded-full text-xs font-bold border border-[#D3A625] shadow-md whitespace-nowrap">
                    {currentQ.type === 'uchi' ? t.uchiTag : t.sotoTag}
                </div>
                <p
                    className="text-gray-900 font-serif text-xl leading-relaxed text-center mt-4 font-medium min-h-[100px] flex items-center justify-center">
                    {lang === 'zh' ? currentQ.situationZh : currentQ.situationEn}
                </p>

                {/* 鍙嶅姩鐢?*/}
                {feedback && (
                <div className={`absolute inset-0 flex items-center justify-center rounded-lg bg-opacity-95
                    backdrop-blur-sm ${feedback==='correct' ? 'bg-[#D3A625]/30 text-green-800'
                    : 'bg-red-900/90 text-red-100' } `}>
                    <div className="text-center font-bold text-2xl flex flex-col items-center drop-shadow-md">
                        {feedback === 'correct' ? (
                        <>
                            <CheckCircle size={50} className="mb-2 text-green-700" /> {t.correct}
                        </>
                        ) : (
                        <>
                            <XCircle size={50} className="mb-2 text-red-300" /> <span
                                className="text-xl mb-1">{t.wrong}</span><span
                                className="text-3xl">{currentQ.correctAnswer}</span>
                        </>
                        )}
                    </div>
                </div>
                )}
            </DraggableParchment>

            {/* 妯″潡3锛氶」?*/}
            <DraggableParchment id="options" activeId={activeWindowId} setActiveId={setActiveWindowId} initialPos={{ x:
                isMobile ? 10 : window.innerWidth/2 - 180, y: isMobile ? 380 : 350 }}
                className="w-[90vw] max-w-[360px]">
                <div className="grid grid-cols-2 gap-3">
                    {currentQ.options.map((option, idx) => (
                    <button key={idx} disabled={isTransitioning} onClick={()=> handleAnswer(option)}
                        className={`
                        py-4 px-2 rounded-lg text-2xl font-bold transition-all duration-200 border-2 shadow-sm
                        ${isTransitioning && option === currentQ.correctAnswer
                        ? 'bg-green-600 border-green-400 text-white shadow-[0_0_15px_#4ade80]'
                        : isTransitioning && option === selectedAns && feedback === 'wrong'
                        ? 'bg-red-800 border-red-500 text-gray-300'
                        : 'bg-[#faf0d9] border-[#c19a6b] text-[#740001] hover:bg-[#D3A625] hover:text-white
                        hover:-translate-y-1'
                        }
                        `}
                        >
                        {option}
                    </button>
                    ))}
                </div>
            </DraggableParchment>
        </>
        );
        };

        // 3. 缁撶畻鐣岄潰
        const renderResultScreen = () => {
        const t = i18n[lang];
        let gradeData = t.grades.T;

        if (score >= 135) gradeData = t.grades.O;
        else if (score >= 105) gradeData = t.grades.E;
        else if (score >= 75) gradeData = t.grades.A;
        else if (score >= 45) gradeData = t.grades.P;

        return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
                className="bg-parchment text-gray-900 w-full max-w-md p-8 rounded-lg shadow-2xl border-4 border-[#D3A625] relative pointer-events-auto animate-fade-in text-center">
                <h2 className="text-3xl font-serif font-bold border-b-2 border-gray-400 pb-4 mb-4 text-[#740001]">
                    {t.resultTitle}</h2>
                <p className="text-lg">{t.finalScore}</p>
                <p className="text-7xl font-bold text-[#D3A625] drop-shadow-md my-2">{score}</p>

                <div className="bg-white/50 p-4 rounded-md mt-4 border border-[#c19a6b]">
                    <p className="text-sm text-gray-600 mb-1">{t.gradeLabel}</p>
                    <p className="text-2xl font-bold text-[#740001]">{gradeData.grade}</p>
                </div>

                <p className="font-serif italic mt-4 text-gray-800">"{gradeData.msg}"</p>

                <button onClick={()=> { playClick(); setCurrentScreen('start'); }}
                    className="w-full flex justify-center items-center gap-2 bg-[#740001] text-[#D3A625] font-bold px-8
                    py-3 rounded-lg transition-transform hover:scale-105 mt-8 shadow-md border border-[#D3A625]"
                    >
                    <RotateCcw size={20} /> {t.restart}
                </button>
            </div>
        </div>
        );
        };

        return (
        <div
            className="min-h-screen bg-desk text-gray-100 overflow-hidden relative selection:bg-[#D3A625] selection:text-[#740001]">
            <button onClick={()=> setLang(l => l === 'zh' ? 'en' : 'zh')}
                className="absolute top-4 right-4 z-[100] bg-[#D3A625] text-[#740001] px-4 py-2 rounded-full font-bold
                shadow-lg hover:scale-105 transition-transform flex items-center gap-2 border-2 border-[#740001]"
                >
                <Globe size={18} /> {lang === 'zh' ? 'English' : '涓?}
            </button>

            {currentScreen === 'start' && renderStartScreen()}
            {currentScreen === 'playing' && renderPlayingScreen()}
            {currentScreen === 'result' && renderResultScreen()}
        </div>
        );
        }

const root = createRoot(document.getElementById('root'));
root.render(<HogwartsJapaneseExam />);
