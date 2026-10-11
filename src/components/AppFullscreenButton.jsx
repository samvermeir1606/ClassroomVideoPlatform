import React, { useEffect, useRef, useState } from 'react';

// Small multiplication a teacher knows instantly, but a 5-year-old doesn't
function makeQuestion() {
  const a = 3 + Math.floor(Math.random() * 7); // 3..9
  const b = 3 + Math.floor(Math.random() * 7);
  return { a, b };
}

function getFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement;
}

export default function AppFullscreenButton() {
  const [isAppFullscreen, setIsAppFullscreen] = useState(false);
  const [question, setQuestion] = useState(null); // non-null while the unlock popup is open
  const [answer, setAnswer] = useState('');
  const [isWrong, setIsWrong] = useState(false);
  const inputRef = useRef(null);

  const root = typeof document !== 'undefined' ? document.documentElement : null;
  const canFullscreen = !!(root && (root.requestFullscreen || root.webkitRequestFullscreen));

  useEffect(() => {
    const onFullscreenChange = () => {
      const appFs = getFullscreenElement() === document.documentElement;
      setIsAppFullscreen(appFs);
      if (!appFs) {
        setQuestion(null);
        if (navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock();
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (question && inputRef.current) inputRef.current.focus();
  }, [question]);

  const enterFullscreen = async () => {
    const request = root.requestFullscreen || root.webkitRequestFullscreen;
    try {
      await request.call(root);
      // Chrome/Edge: capture the Escape key, so it has to be held down to leave fullscreen
      if (navigator.keyboard && navigator.keyboard.lock) {
        navigator.keyboard.lock(['Escape']).catch(() => {});
      }
    } catch (e) {
      console.error("Fullscreen failed:", e);
    }
  };

  const openUnlock = () => {
    setQuestion(makeQuestion());
    setAnswer('');
    setIsWrong(false);
  };

  const closeUnlock = () => setQuestion(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseInt(answer, 10) === question.a * question.b) {
      setQuestion(null);
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else {
      setIsWrong(true);
      setAnswer('');
      if (inputRef.current) inputRef.current.focus();
    }
  };

  if (!canFullscreen) return null;

  return (
    <>
      <button
        onClick={isAppFullscreen ? openUnlock : enterFullscreen}
        className="px-4 py-2.5 bg-purple-500 text-white font-black rounded-2xl shadow-kid-sm btn-bounce text-lg border-2 border-purple-300"
        title={isAppFullscreen ? "Volledig scherm sluiten" : "Volledig scherm"}
      >
        {isAppFullscreen ? '🔒' : '⛶'}
      </button>

      {/* Unlock popup: only a grown-up knows the answer */}
      {question && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
          onClick={closeUnlock}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-4 border-purple-300 rounded-3xl shadow-kid-xl p-6 md:p-8 w-full max-w-sm flex flex-col items-center space-y-5"
          >
            <div className="text-4xl">🔒</div>
            <div className="text-4xl font-black text-slate-800 tracking-wide select-none">
              {question.a} × {question.b} = ?
            </div>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={answer}
              onChange={(e) => { setAnswer(e.target.value.replace(/\D/g, '')); setIsWrong(false); }}
              className={`w-32 text-center text-3xl font-black rounded-2xl border-4 p-2 focus:outline-none ${
                isWrong ? 'border-brand-pink bg-red-50' : 'border-amber-300 focus:border-purple-400'
              }`}
            />
            {isWrong && (
              <div className="text-brand-pink font-black">Fout, probeer opnieuw</div>
            )}
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={closeUnlock}
                className="flex-1 px-4 py-3 rounded-2xl font-black border-2 btn-bounce bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              >
                Annuleren
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-2xl font-black text-white border-2 btn-bounce bg-purple-500 border-purple-300"
              >
                OK
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
