// كويز تفاعلي 5 أسئلة - نسق الاختيارات زاهي و"ghost" - مضاف زر "الانتقال للكويز اللي بعده"
// عند النجاح: تشغيل confetti ثم إظهار زر "الانتقال للكويز اللي بعده" (يأخذ المستخدم إلى nextQuizUrl)
// يمكنك تعديل nextQuizUrl لتوجيه الزر إلى أي رابط آخر.

const QUESTIONS = [
  {
    q: "ما هي عاصمة مصر؟",
    choices: ["الإسكندرية", "القاهرة", "أسوان", "الأقصر"],
    answer: 1
  },
  {
    q: "أيهما يعتبر سنة كبيسة؟",
    choices: ["2021", "2024", "2023", "2019"],
    answer: 1
  },
  {
    q: "ما هو أقرب كوكب للأرض من حيث الحجم؟",
    choices: ["المريخ", "عطارد", "الزهرة", "المشتري"],
    answer: 2
  },
  {
    q: "ما لغة البرمجة التي تُستخدم لبناء صفحات الويب الأساسية؟",
    choices: ["Python", "C++", "HTML", "Java"],
    answer: 2
  },
  {
    q: "أي بنك جينوم البشري انتهى تقريبا في أي عام؟",
    choices: ["2003", "1990", "2010", "1985"],
    answer: 0
  }
];

const STATE = {
  index: 0,
  selected: null,
  timer: null,
  timeLeft: 20,
  total: QUESTIONS.length
};

// تعديل بسيط: الرابط الذي سيؤدي إليه زر "الانتقال للكويز اللي بعده"
const nextQuizUrl = "https://www.google.com";
// إذا أردت فتح الرابط في نافذة جديدة بدل نفس النافذة، عدّل nextQuizOpenInNewTab = true
const nextQuizOpenInNewTab = false;

// DOM
const qIndexEl = document.getElementById('q-index');
const timerEl = document.getElementById('timer');
const progressFill = document.getElementById('progress-fill');
const questionArea = document.getElementById('question-area');
const choicesEl = document.getElementById('choices');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const resultSection = document.getElementById('result');
const resultTitle = document.getElementById('result-title');
const resultMsg = document.getElementById('result-msg');
const retryBtn = document.getElementById('retry-btn');
const nextQuizBtn = document.getElementById('next-quiz-btn');
const confettiCanvas = document.getElementById('confetti-canvas');

function startQuiz(){
  STATE.index = 0;
  STATE.selected = null;
  resultSection.classList.add('hidden');
  document.getElementById('quiz-card').classList.remove('hidden');
  restartBtn.hidden = true;
  // Hide next-quiz button at start
  nextQuizBtn.hidden = true;
  renderQuestion();
}

function renderQuestion(){
  clearTimer();
  STATE.selected = null;
  nextBtn.disabled = true;
  const qObj = QUESTIONS[STATE.index];
  qIndexEl.textContent = `سؤال ${STATE.index + 1} من ${STATE.total}`;
  updateProgress();
  questionArea.innerHTML = `<h2>${escapeHtml(qObj.q)}</h2>`;
  choicesEl.innerHTML = "";

  // نوزّع ألوان زاهية على الاختيارات عبر فهرس دائري
  qObj.choices.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = `choice color-${i % 4}`;
    btn.setAttribute('role','listitem');

    // badge صغير ملون لإضاءة الاختيارات بدون أي ترتيب/أرقام
    const badge = document.createElement('span');
    badge.className = 'badge';
    // النص فقط (بدون تلميح الكيبورد داخل الاختيار)
    const txt = document.createElement('span');
    txt.className = 'choice-text';
    txt.innerHTML = escapeHtml(c);

    btn.appendChild(txt);
    btn.appendChild(badge);
    btn.dataset.index = i;
    btn.addEventListener('click', onChoiceClick);
    choicesEl.appendChild(btn);
  });

  STATE.timeLeft = 20;
  updateTimerDisplay();
  STATE.timer = setInterval(() => {
    STATE.timeLeft--;
    updateTimerDisplay();
    if(STATE.timeLeft <= 0){
      clearTimer();
      // Timeout treated as خطأ -> إعادة من البداية
      showWrongFeedback(null, true);
    }
  }, 1000);
}

function onChoiceClick(e){
  const idx = Number(e.currentTarget.dataset.index);
  STATE.selected = idx;
  Array.from(choicesEl.children).forEach(child => child.classList.remove('selected'));
  e.currentTarget.classList.add('selected');
  nextBtn.disabled = false;
}

nextBtn.addEventListener('click', () => {
  if(STATE.selected === null) return;
  checkAnswer(STATE.selected);
});

restartBtn.addEventListener('click', () => {
  startQuiz();
});

retryBtn.addEventListener('click', () => {
  startQuiz();
});

nextQuizBtn.addEventListener('click', () => {
  if(!nextQuizUrl) return;
  if(nextQuizOpenInNewTab){
    window.open(nextQuizUrl, '_blank', 'noopener');
  } else {
    window.location.href = nextQuizUrl;
  }
});

function checkAnswer(selected){
  const correct = QUESTIONS[STATE.index].answer;
  if(selected === correct){
    showCorrectFeedback(selected);
    setTimeout(() => {
      STATE.index++;
      if(STATE.index >= STATE.total){
        showResult(true);
      } else {
        renderQuestion();
      }
    }, 700);
  } else {
    showWrongFeedback(selected, false);
  }
}

function showCorrectFeedback(selectedIdx){
  clearTimer();
  const children = Array.from(choicesEl.children);
  children.forEach((c, i) => {
    c.classList.remove('wrong');
    c.classList.remove('correct');
    if(i === selectedIdx) c.classList.add('correct');
    c.disabled = true;
  });
}

function showWrongFeedback(selectedIdx, timedOut){
  clearTimer();
  const children = Array.from(choicesEl.children);
  if(selectedIdx !== null && children[selectedIdx]) children[selectedIdx].classList.add('wrong');

  setTimeout(() => {
    showResult(false, timedOut ? "انتهى الوقت — أُعيدت المحاولة من البداية." : "إجابة خاطئة — إعادة من البداية.");
    restartBtn.hidden = false;
  }, 700);
}

function updateProgress(){
  const percent = Math.round((STATE.index / STATE.total) * 100);
  progressFill.style.width = `${percent}%`;
}

function updateTimerDisplay(){
  const mm = Math.floor(STATE.timeLeft / 60).toString().padStart(2,'0');
  const ss = (STATE.timeLeft % 60).toString().padStart(2,'0');
  timerEl.textContent = `${mm}:${ss}`;
  timerEl.style.color = STATE.timeLeft <= 5 ? 'var(--danger)' : 'var(--muted)';
}

function clearTimer(){
  if(STATE.timer) { clearInterval(STATE.timer); STATE.timer = null; }
}

function showResult(success, message){
  clearTimer();
  document.getElementById('quiz-card').classList.add('hidden');
  resultSection.classList.remove('hidden');

  // Hide next-quiz button by default then show it only on success
  nextQuizBtn.hidden = true;

  if(success){
    resultTitle.textContent = "مبروك! أنهيت الكويز بنجاح 🎉";
    resultMsg.textContent = "أجبت على جميع الأسئلة بشكل صحيح.";
    resultSection.classList.remove('failure');
    // شغّل الكونفيتي ثم أظهر زر "الانتقال للكويز اللي بعده" بعد انتهاء الكونفيتي
    fireConfetti(() => {
      // بعد الكونفيتي: إظهار زر الانتقال
      nextQuizBtn.hidden = false;
      // optionally يمكنك أيضاً تحويل تلقائياً: 
      // window.location.href = nextQuizUrl;
    });
  } else {
    resultTitle.textContent = "تمت إعادة الكويز";
    resultMsg.textContent = message || "يوجد خطأ، أُعيدت المحاولة من البداية.";
  }
}

// confetti (خفيف) — يستقبل callback يُستدعى عند الانتهاء
function fireConfetti(doneCb){
  if(!confettiCanvas){
    if(typeof doneCb === 'function') doneCb();
    return;
  }
  const ctx = confettiCanvas.getContext('2d');
  const W = confettiCanvas.width = innerWidth;
  const H = confettiCanvas.height = innerHeight;
  const particles = [];
  const colors = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#B388EB'];
  for(let i=0;i<120;i++){
    particles.push({
      x: Math.random()*W,
      y: Math.random()*H - H*0.2,
      vx: (Math.random()-0.5)*6,
      vy: Math.random()*6 + 2,
      r: Math.random()*6 + 4,
      color: colors[Math.floor(Math.random()*colors.length)],
      rot: Math.random()*360,
      vr: (Math.random()-0.5)*8
    });
  }
  let t=0;
  const maxT = 200; // frames
  const raf = () => {
    t++;
    ctx.clearRect(0,0,W,H);
    particles.forEach(p=>{
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot * Math.PI/180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r*0.55);
      ctx.restore();
    });
    if(t < maxT) requestAnimationFrame(raf);
    else {
      ctx.clearRect(0,0,W,H);
      // مهلة صغيرة إضافية لراحة العرض قبل إظهار الزر أو التحويل
      setTimeout(() => {
        if(typeof doneCb === 'function') doneCb();
      }, 400);
    }
  };
  requestAnimationFrame(raf);
}

// هروب HTML
function escapeHtml(unsafe) {
  return unsafe
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}

// دعم مفاتيح لوحة المفاتيح: A,S,D,F للاختيارات الأربعة، Enter -> التالي
window.addEventListener('keydown', (e) => {
  if(document.getElementById('quiz-card').classList.contains('hidden')) return;
  const key = e.key.toLowerCase();
  if(['a','s','d','f'].includes(key)){
    const mapping = {'a':0,'s':1,'d':2,'f':3};
    const idx = mapping[key];
    const child = choicesEl.children[idx];
    if(child) child.click();
  }
  if(key === 'enter'){
    if(!nextBtn.disabled) nextBtn.click();
  }
});

// start
startQuiz();