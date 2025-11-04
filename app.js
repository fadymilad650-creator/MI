// أسئلة عينة (ممكن تغيرها أو تجيبها من API لاحقًا)
const questions = [
  {
    q: "ما هي عاصمة مصر؟",
    choices: ["الإسكندرية","القاهرة","الأقصر","أسوان"],
    answer: 1
  },
  {
    q: "ما هو أكبر كوكب في المجموعة الشمسية؟",
    choices: ["الأرض","المريخ","المشتري","زحل"],
    answer: 2
  },
  {
    q: "ما لغة البرمجة الشائعة لتطوير واجهات الويب؟",
    choices: ["بايثون","جافا","جافاسكربت","روبي"],
    answer: 2
  }
];

let currentIndex = 0;
let score = 0;
let timer = null;
const timePerQuestion = 15;
let timeLeft = timePerQuestion;

const elems = {
  question: document.getElementById('question'),
  choices: document.getElementById('choices'),
  nextBtn: document.getElementById('nextBtn'),
  time: document.getElementById('time'),
  timerEl: document.getElementById('timer'),
  questionNumber: document.getElementById('question-number'),
  score: document.getElementById('score'),
  result: document.getElementById('result'),
  resultText: document.getElementById('result-text'),
  restartBtn: document.getElementById('restartBtn'),
  quiz: document.getElementById('quiz')
};

function startQuiz() {
  currentIndex = 0;
  score = 0;
  elems.quiz.classList.remove('hidden');
  elems.result.classList.add('hidden');
  elems.score.classList.remove('hidden');
  elems.score.textContent = `${score} من ${questions.length}`;
  showQuestion();
}

function showQuestion() {
  clearInterval(timer);
  timeLeft = timePerQuestion;
  elems.time.textContent = timeLeft;
  const q = questions[currentIndex];
  elems.questionNumber.textContent = `سؤال ${currentIndex + 1} / ${questions.length}`;
  elems.question.textContent = q.q;
  elems.choices.innerHTML = '';
  q.choices.forEach((c, i) => {
    const btn = document.createElement('div');
    btn.className = 'choice';
    btn.textContent = c;
    btn.dataset.index = i;
    btn.addEventListener('click', onChoiceClick);
    elems.choices.appendChild(btn);
  });
  elems.nextBtn.disabled = true;
  timer = setInterval(() => {
    timeLeft--;
    elems.time.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      revealAnswer(null); // انتهى الوقت
    }
  }, 1000);
}

function onChoiceClick(e) {
  const idx = Number(e.currentTarget.dataset.index);
  revealAnswer(idx);
}

function revealAnswer(selectedIdx) {
  clearInterval(timer);
  const q = questions[currentIndex];
  const choiceEls = Array.from(elems.choices.children);
  choiceEls.forEach((el) => {
    const i = Number(el.dataset.index);
    if (i === q.answer) el.classList.add('correct');
    if (selectedIdx === i && i !== q.answer) el.classList.add('wrong');
    // منع المزيد من الاختيارات
    el.removeEventListener('click', onChoiceClick);
  });

  if (selectedIdx === q.answer) score++;
  elems.score.textContent = `${score} من ${questions.length}`;
  elems.nextBtn.disabled = false;
}

elems.nextBtn.addEventListener('click', () => {
  currentIndex++;
  if (currentIndex >= questions.length) {
    showResult();
  } else {
    showQuestion();
  }
});

function showResult() {
  elems.quiz.classList.add('hidden');
  elems.result.classList.remove('hidden');
  elems.resultText.textContent = `حصلت على ${score} من ${questions.length}.`;
}

elems.restartBtn.addEventListener('click', startQuiz);

// ابدأ اللعبة مباشرة عند التحميل
startQuiz();