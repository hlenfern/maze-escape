const screens = {
  start: document.getElementById("startScreen"),
  game: document.getElementById("gameScreen"),
  win: document.getElementById("winScreen"),
  lose: document.getElementById("loseScreen"),
  ranking: document.getElementById("rankingScreen")
};

const playerNameInput = document.getElementById("playerName");
const startBtn = document.getElementById("startBtn");
const hintBtn = document.getElementById("hintBtn");
const submitBtn = document.getElementById("submitBtn");
const restartBtn = document.getElementById("restartBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const openRankingBtn = document.getElementById("openRankingBtn");
const backToStartBtn = document.getElementById("backToStartBtn");

const playerDisplay = document.getElementById("playerDisplay");
const timerEl = document.getElementById("timer");
const questionCounter = document.getElementById("questionCounter");
const rewardText = document.getElementById("rewardText");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const playerMarker = document.getElementById("playerMarker");
const monsterMarker = document.getElementById("monsterMarker");

const roomTag = document.getElementById("roomTag");
const questionTitle = document.getElementById("questionTitle");
const questionText = document.getElementById("questionText");
const answerInput = document.getElementById("answerInput");
const feedback = document.getElementById("feedback");
const questionCard = document.getElementById("questionCard");
const hintText = document.getElementById("hintText");

const finalPlayer = document.getElementById("finalPlayer");
const finalTime = document.getElementById("finalTime");
const finalScore = document.getElementById("finalScore");

const losePlayer = document.getElementById("losePlayer");
const loseTime = document.getElementById("loseTime");
const loseScore = document.getElementById("loseScore");

const rankingList = document.getElementById("rankingList");

const questions = [
  {
    room: "Sala 1",
    title: "Primeira charada",
    question: "Quanto mais você tira de mim, maior eu fico. O que eu sou?",
    answer: "buraco",
    hint: "Pense em algo que cresce quando removemos partes dele.",
    reward: "Lanterna fraca"
  },
  {
    room: "Sala 2",
    title: "Sinal perdido",
    question: "Eu apareço na noite, sigo seus passos, mas desapareço na luz. O que sou?",
    answer: "sombra",
    hint: "Está sempre perto de você em ambientes escuros.",
    reward: "Mapa rasgado"
  },
  {
    room: "Sala 3",
    title: "Eco do corredor",
    question: "Quanto mais você fala, menos eu existo. O que sou?",
    answer: "silencio",
    hint: "É o contrário do som.",
    reward: "Chave antiga"
  },
  {
    room: "Sala 4",
    title: "Tranca enferrujada",
    question: "Tenho dentes mas não mordo. O que sou?",
    answer: "pente",
    hint: "Objeto simples, usado no cabelo.",
    reward: "Símbolo gravado"
  },
  {
    room: "Sala 5",
    title: "Passagem estreita",
    question: "Sou cheio de furos, mas ainda seguro água. O que sou?",
    answer: "esponja",
    hint: "Muito usada na cozinha ou no banho.",
    reward: "Poção de coragem"
  },
  {
    room: "Sala 6",
    title: "Porta sem retorno",
    question: "O pai de Ana tem 4 filhas: Lala, Lele, Lili e...?",
    answer: "ana",
    hint: "A resposta está no começo da frase.",
    reward: "Fragmento do portal"
  },
  {
    room: "Sala 7",
    title: "Olhos na névoa",
    question: "O que anda com os pés na cabeça?",
    answer: "piolho",
    hint: "É pequeno e vive no cabelo.",
    reward: "Amuleto de proteção"
  },
  {
    room: "Sala 8",
    title: "Saída final",
    question: "Digite a palavra final para abrir a saída: liberdade",
    answer: "liberdade",
    hint: "A própria saída sussurra a resposta.",
    reward: "Portão destrancado"
  }
];

let currentQuestion = 0;
let playerName = "";
let score = 0;
let seconds = 0;
let timerInterval = null;
let playerDistance = 12;
let monsterDistance = 4;
let hintUsed = false;

function normalizeText(text) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatTime(totalSeconds) {
  const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const sec = String(totalSeconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function beep(frequency = 700, duration = 0.05, volume = 0.02) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (error) {}
}

function showScreen(screenKey) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[screenKey].classList.add("active");
}

function startTimer() {
  clearInterval(timerInterval);
  seconds = 0;
  timerEl.textContent = formatTime(seconds);

  timerInterval = setInterval(() => {
    seconds++;
    timerEl.textContent = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTrack() {
  playerMarker.style.left = `${playerDistance}%`;
  monsterMarker.style.left = `${monsterDistance}%`;

  const percent = Math.min(Math.max(Math.round((currentQuestion / questions.length) * 100), 0), 100);
  progressFill.style.width = `${Math.max(percent, 8)}%`;
  progressText.textContent = `${Math.round((currentQuestion / questions.length) * 100)}%`;
}

function loadQuestion() {
  const q = questions[currentQuestion];

  roomTag.textContent = q.room;
  questionTitle.textContent = q.title;
  questionText.textContent = q.question;
  questionCounter.textContent = `${currentQuestion + 1} / ${questions.length}`;
  answerInput.value = "";
  answerInput.focus();

  feedback.textContent = "";
  feedback.className = "feedback";

  hintText.textContent = "";
  hintText.classList.add("hidden");
  hintUsed = false;

  questionCard.classList.remove("fade-up");
  void questionCard.offsetWidth;
  questionCard.classList.add("fade-up");

  updateTrack();
}

function startGame() {
  playerName = playerNameInput.value.trim();

  if (!playerName) {
    playerNameInput.focus();
    return;
  }

  currentQuestion = 0;
  score = 0;
  playerDistance = 12;
  monsterDistance = 4;
  rewardText.textContent = "Nenhuma ainda";
  playerDisplay.textContent = playerName;

  startTimer();
  showScreen("game");
  loadQuestion();
}

function showHint() {
  if (hintUsed) {
    feedback.textContent = "Você já usou a pista desta sala.";
    feedback.className = "feedback warning";
    beep(430, 0.07, 0.02);
    return;
  }

  hintText.textContent = questions[currentQuestion].hint;
  hintText.classList.remove("hidden");
  hintUsed = true;
  feedback.textContent = "Pista desbloqueada.";
  feedback.className = "feedback warning";
  beep(540, 0.05, 0.02);
}

function winGame() {
  stopTimer();

  finalPlayer.textContent = playerName;
  finalTime.textContent = formatTime(seconds);
  finalScore.textContent = `${score}/${questions.length}`;

  saveRanking({
    name: playerName,
    time: seconds,
    score: score
  });

  showScreen("win");
}

function loseGame() {
  stopTimer();

  losePlayer.textContent = playerName;
  loseTime.textContent = formatTime(seconds);
  loseScore.textContent = `${score}/${questions.length}`;

  showScreen("lose");
}

function checkCollision() {
  if (monsterDistance >= playerDistance - 2) {
    loseGame();
  }
}

function handleCorrectAnswer() {
  const reward = questions[currentQuestion].reward;
  score++;
  playerDistance += 10;
  rewardText.textContent = reward;

  feedback.textContent = `Correto. Você ganhou: ${reward}.`;
  feedback.className = "feedback success";
  beep(920, 0.07, 0.03);

  currentQuestion++;
  updateTrack();

  setTimeout(() => {
    if (currentQuestion >= questions.length) {
      progressFill.style.width = "100%";
      progressText.textContent = "100%";
      winGame();
    } else {
      loadQuestion();
    }
  }, 900);
}

function handleWrongAnswer() {
  monsterDistance += 10;

  feedback.textContent = "Resposta incorreta. O monstro ficou mais perto.";
  feedback.className = "feedback error";

  questionCard.classList.remove("shake");
  void questionCard.offsetWidth;
  questionCard.classList.add("shake");

  beep(220, 0.1, 0.03);
  updateTrack();
  checkCollision();
}

function submitAnswer() {
  const value = normalizeText(answerInput.value);
  const correct = normalizeText(questions[currentQuestion].answer);

  if (!value) {
    feedback.textContent = "Digite uma resposta para continuar.";
    feedback.className = "feedback warning";
    beep(360, 0.07, 0.02);
    return;
  }

  if (value === correct) {
    handleCorrectAnswer();
  } else {
    handleWrongAnswer();
  }
}

function saveRanking(entry) {
  const ranking = JSON.parse(localStorage.getItem("mazeEscapeRanking")) || [];
  ranking.push(entry);

  ranking.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.time - b.time;
  });

  const top10 = ranking.slice(0, 10);
  localStorage.setItem("mazeEscapeRanking", JSON.stringify(top10));
}

function renderRanking() {
  const ranking = JSON.parse(localStorage.getItem("mazeEscapeRanking")) || [];

  if (ranking.length === 0) {
    rankingList.innerHTML = `
      <div class="ranking-item">
        <div class="pos">-</div>
        <div class="name">Nenhuma fuga registrada ainda.</div>
        <div class="time">--:--</div>
        <div class="score">0</div>
      </div>
    `;
    return;
  }

  rankingList.innerHTML = ranking
    .map((item, index) => {
      return `
        <div class="ranking-item">
          <div class="pos">#${index + 1}</div>
          <div class="name">${item.name}</div>
          <div class="time">${formatTime(item.time)}</div>
          <div class="score">${item.score}/${questions.length}</div>
        </div>
      `;
    })
    .join("");
}

startBtn.addEventListener("click", startGame);
hintBtn.addEventListener("click", showHint);
submitBtn.addEventListener("click", submitAnswer);
restartBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", () => {
  showScreen("start");
});
tryAgainBtn.addEventListener("click", () => {
  showScreen("start");
});
openRankingBtn.addEventListener("click", () => {
  renderRanking();
  showScreen("ranking");
});
backToStartBtn.addEventListener("click", () => {
  showScreen("start");
});

answerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitAnswer();
  }
});