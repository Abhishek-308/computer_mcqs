(() => {
  // Chapter-wise questions dataset with additional computer questions
  const chapters = {
    "Basics": [
      {
        question: "What does CPU stand for?",
        options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Central Processor Unit"],
        answer: 1
      },
      {
        question: "Which of these is NOT an operating system?",
        options: ["Windows", "Linux", "Oracle", "macOS"],
        answer: 2
      },
      {
        question: "Which device is used as a pointing device?",
        options: ["Keyboard", "Monitor", "Mouse", "CPU"],
        answer: 2
      },
      {
        question: "What is the full form of URL?",
        options: ["Uniform Resource Locator", "Universal Resource Link", "Unique Resource Locator", "Uniform Reference Link"],
        answer: 0
      }
    ],
    "Hardware": [
      {
        question: "What is the main function of the ALU in a computer?",
        options: ["Perform arithmetic and logic operations", "Manage memory", "Control input devices", "Store data"],
        answer: 0
      },
      {
        question: "What does RAM stand for?",
        options: ["Random Access Memory", "Read Access Memory", "Run Access Memory", "Real-time Access Memory"],
        answer: 0
      },
      {
        question: "Which of the following is a permanent storage device?",
        options: ["RAM", "Hard Disk Drive", "Cache", "Register"],
        answer: 1
      },
      {
        question: "What component connects the computer to a network?",
        options: ["Modem", "Graphics Card", "Power Supply", "Motherboard"],
        answer: 0
      }
    ],
    "Programming": [
      {
        question: "Which language is primarily used for web development?",
        options: ["Python", "JavaScript", "C#", "Ruby"],
        answer: 1
      },
      {
        question: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Tool Multi Language"],
        answer: 0
      },
      {
        question: "Which of these is a backend programming language?",
        options: ["HTML", "CSS", "PHP", "Bootstrap"],
        answer: 2
      },
      {
        question: "What symbol is used to start a comment in JavaScript?",
        options: ["//", "/*", "#", "--"],
        answer: 0
      }
    ]
  };

  // Flatten all questions for "all" selection
  function getAllQuestions() {
    return Object.values(chapters).flat();
  }

  const chapterSelect = document.getElementById('chapter-select');
  const questionNumElem = document.getElementById('question-num');
  const questionElem = document.getElementById('question');
  const optionsElem = document.getElementById('options');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');
  const resultElem = document.getElementById('result');
  const scoreDetailElem = document.getElementById('score-detail');
  const summaryElem = document.getElementById('summary');

  // Populate chapter dropdown dynamically
  function populateChapters() {
    const keys = Object.keys(chapters);
    keys.forEach(chap => {
      const option = document.createElement('option');
      option.value = chap;
      option.textContent = chap;
      chapterSelect.appendChild(option);
    });
  }

  // Store current questions for the quiz (randomized)
  let quizQuestions = [];
  let currentQuestionIndex = 0;
  let selectedAnswers = [];
  let quizSubmitted = false;

  // Fisher-Yates shuffle to randomize array
  function shuffleArray(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Initialize quiz with chosen chapter questions
  function initQuiz(chapterKey) {
    quizSubmitted = false;
    resultElem.textContent = '';
    scoreDetailElem.textContent = '';
    summaryElem.innerHTML = '';
    currentQuestionIndex = 0;
    selectedAnswers = [];

    if (chapterKey === 'all') {
      quizQuestions = shuffleArray(getAllQuestions());
    } else {
      quizQuestions = shuffleArray(chapters[chapterKey] || []);
    }

    selectedAnswers = new Array(quizQuestions.length).fill(null);
    renderQuestion();
  }

  function renderQuestion() {
    if(quizSubmitted) {
      questionNumElem.style.display = 'none';
      questionElem.style.display = 'none';
      optionsElem.style.display = 'none';
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'none';
      return;
    }
    questionNumElem.style.display = '';
    questionElem.style.display = '';
    optionsElem.style.display = '';
    nextBtn.style.display = '';
    submitBtn.style.display = '';

    if (quizQuestions.length === 0) {
      questionNumElem.textContent = '';
      questionElem.textContent = 'No questions available for selected chapter.';
      optionsElem.innerHTML = '';
      nextBtn.disabled = true;
      submitBtn.disabled = true;
      return;
    }

    const q = quizQuestions[currentQuestionIndex];
    questionNumElem.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
    questionElem.textContent = q.question;
    optionsElem.innerHTML = '';

    q.options.forEach((option, idx) => {
      const optDiv = document.createElement('div');
      optDiv.classList.add('option');
      optDiv.setAttribute('role', 'listitem');
      optDiv.setAttribute('tabindex', '0');
      optDiv.dataset.index = idx;
      optDiv.textContent = option;

      if (selectedAnswers[currentQuestionIndex] === idx) {
        optDiv.classList.add('selected');
      }

      optDiv.addEventListener('click', () => {
        if (quizSubmitted) return;
        // No going back or changing answers once moved on
        if (currentQuestionIndex < maxAnsweredIndex()) return;
        selectedAnswers[currentQuestionIndex] = idx;
        renderQuestion();
      });

      optDiv.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !optDiv.classList.contains('disabled')) {
          e.preventDefault();
          optDiv.click();
        }
      });

      // Disable clicking options for previous questions - user can't change answers of earlier questions
      if(selectedAnswers[currentQuestionIndex] !== null && currentQuestionIndex < maxAnsweredIndex()) {
        if(selectedAnswers[currentQuestionIndex] !== idx){
          optDiv.classList.add('disabled');
          optDiv.style.cursor = 'default';
        }
      }

      optionsElem.appendChild(optDiv);
    });

    nextBtn.disabled = selectedAnswers[currentQuestionIndex] === null || currentQuestionIndex === quizQuestions.length - 1 || quizSubmitted;
    submitBtn.disabled = selectedAnswers.includes(null) || quizSubmitted;
  }

  // Maximum question index answered to prevent going back and changing answers
  function maxAnsweredIndex() {
    return selectedAnswers.reduce((maxIdx, ans, idx) => {
      if(ans !== null && idx > maxIdx) return idx;
      return maxIdx;
    }, -1);
  }

  nextBtn.addEventListener('click', () => {
    if (selectedAnswers[currentQuestionIndex] === null) return;
    if(currentQuestionIndex < quizQuestions.length - 1) {
      currentQuestionIndex++;
      renderQuestion();
    }
  });

  submitBtn.addEventListener('click', () => {
    if (submitBtn.disabled) return;
    quizSubmitted = true;

    const score = selectedAnswers.reduce((acc, ans, idx) => acc + (ans === quizQuestions[idx].answer ? 1 : 0), 0);
    resultElem.textContent = `Your score: ${score} / ${quizQuestions.length}`;
    scoreDetailElem.textContent = '';

    summaryElem.innerHTML = '';
    quizQuestions.forEach((q, idx) => {
      const item = document.createElement('div');
      item.classList.add('summary-item');
      const correct = selectedAnswers[idx] === q.answer;
      item.classList.add(correct ? 'summary-correct' : 'summary-incorrect');

      item.innerHTML = `<strong>Q${idx+1}:</strong> ${q.question}<br>`;
      if(correct){
        item.innerHTML += `<span>✅ Your answer: <em>${q.options[selectedAnswers[idx]]}</em></span>`;
      } else {
        item.innerHTML += `<span>❌ Your answer: <em>${q.options[selectedAnswers[idx]] || 'No answer'}</em></span><br>`;
        item.innerHTML += `<span class="correct-answer">Correct answer: <em>${q.options[q.answer]}</em></span>`;
      }
      summaryElem.appendChild(item);
    });

    renderQuestion();
  });

  // Restart quiz with selected chapter questions on chapter change
  chapterSelect.addEventListener('change', (e) => {
    initQuiz(e.target.value);
    resultElem.textContent = '';
    scoreDetailElem.textContent = '';
    summaryElem.innerHTML = '';
  });

  populateChapters();
  initQuiz('all');
})();
