"use strict";

// ================================================================
//  효과음 모듈 — Web Audio API로 외부 파일 없이 소리를 만들어요
//  브라우저가 지원 안 하면 자동으로 무시됩니다
// ================================================================
const SFX = (() => {
  let ctx = null;

  // AudioContext를 한 번만 만들고 재사용
  function audio() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    // 모바일에서 자동재생 차단 해제
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // notes = [{ f: 주파수Hz, t: 시작시간(초), d: 지속시간(초), w: 파형 }]
  function play(notes, vol = 0.28) {
    try {
      const c = audio();
      notes.forEach(({ f, t, d, w = 'sine' }) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = w;
        osc.frequency.value = f;
        osc.connect(gain);
        gain.connect(c.destination);
        const st = c.currentTime + t;
        gain.gain.setValueAtTime(vol, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + d); // 자연스럽게 페이드아웃
        osc.start(st);
        osc.stop(st + d + 0.02);
      });
    } catch (e) { /* 소리 오류는 무시 */ }
  }

  return {
    // 정답: 밝게 상승하는 두 음
    correct: () => play([
      { f: 880,  t: 0,   d: 0.13 },
      { f: 1100, t: 0.1, d: 0.18 },
    ]),
    // 보너스 정답: 세 음이 빠르게 올라가는 화려한 소리
    bonus: () => play([
      { f: 660,  t: 0,    d: 0.1  },
      { f: 880,  t: 0.09, d: 0.1  },
      { f: 1320, t: 0.18, d: 0.32 },
    ], 0.35),
    // 오답: 낮고 거친 하강음
    wrong: () => play([
      { f: 300, t: 0,    d: 0.09, w: 'sawtooth' },
      { f: 200, t: 0.08, d: 0.14, w: 'sawtooth' },
    ], 0.22),
    // 게임 종료: 짧은 팡파르
    end: () => play([
      { f: 523,  t: 0,    d: 0.15 },
      { f: 659,  t: 0.14, d: 0.15 },
      { f: 784,  t: 0.28, d: 0.15 },
      { f: 1047, t: 0.42, d: 0.45 },
    ], 0.35),
  };
})();

// ================================================================
//  이미지 사전 로드 모듈
//  게임 시작 전에 모든 사진을 브라우저 캐시에 올려놓아
//  게임 중 로딩 없이 바로 표시됩니다
// ================================================================
const imgCache = {};

function preloadImage(src) {
  if (!src || imgCache[src]) return;
  const img = new Image();
  img.src = src;
  imgCache[src] = img;
}

function preloadAllImages() {
  CONFIG.items.forEach(item => preloadImage(item.image));
}

// ================================================================
//  게임 메인 모듈
// ================================================================
const Game = (() => {

  // ── 상태 변수 ──────────────────────────────────
  let gameTimerId  = null;   // setInterval ID (타이머 멈출 때 필요)
  let gameTimeLeft = 0;      // 남은 시간 (초)
  let score          = 0;   // 현재 총점
  let totalAnswered  = 0;   // 시도한 문제 수
  let correctAnswered = 0;  // 맞힌 문제 수
  let answered  = false;    // 현재 문제에 이미 답했는지
  let isBonus   = false;    // 현재 문제가 보너스인지
  let currentQ  = null;     // 현재 문제 객체
  let pool      = [];       // 남은 문제 풀 (비면 다시 채움)
  let results   = [];       // 각 문제 결과 기록

  /* ── 초기화 (페이지 로드 시 1회 실행) ─────────── */
  function init() {
    document.getElementById('game-title').textContent    = CONFIG.title;
    document.getElementById('game-subtitle').textContent = CONFIG.subtitle;
    document.getElementById('bonus-info').textContent    = Math.round(CONFIG.bonusChance * 100);

    // 카테고리 미리보기 칩 생성
    const preview = document.getElementById('category-preview');
    preview.innerHTML = CONFIG.categories
      .map(c => `<span class="cat-chip" style="background:${c.color}">${c.emoji} ${c.name}</span>`)
      .join('');

    // 답변 버튼 4개 생성 (한 번만 만들고 계속 재사용)
    const grid = document.getElementById('btn-grid');
    grid.innerHTML = CONFIG.categories.map((c, i) => `
      <button class="btn-cat" id="btn-${i}" style="--c:${c.color}" onclick="Game.pick(${i})">
        <span class="ico">${c.emoji}</span>
        <span>${c.name}</span>
      </button>`).join('');
  }

  /* ── 게임 시작 / 재시작 ────────────────────────── */
  function start() {
    score           = 0;
    totalAnswered   = 0;
    correctAnswered = 0;
    results         = [];
    pool            = [];
    gameTimeLeft    = CONFIG.gameDuration;

    showEl('score',     0);
    showEl('q-correct', 0);
    showEl('q-total',   0);

    showScreen('screen-game');
    startGameTimer();
    loadQ();
  }

  /* ── 30초 전체 타이머 ──────────────────────────── */
  function startGameTimer() {
    renderTimerBar(true); // 바를 100%로 리셋

    clearInterval(gameTimerId);
    gameTimerId = setInterval(() => {
      gameTimeLeft--;
      renderTimerBar(false);
      if (gameTimeLeft <= 0) {
        clearInterval(gameTimerId);
        endGame();
      }
    }, 1000);
  }

  function renderTimerBar(reset) {
    const bar = document.getElementById('game-timer-bar');
    const num = document.getElementById('game-timer-num');
    if (!bar || !num) return;

    if (reset) {
      // 리셋 시: 트랜지션 없이 즉시 100%로
      bar.style.transition = 'none';
      bar.style.width = '100%';
      bar.classList.remove('warn', 'danger');
      num.classList.remove('warn', 'danger');
      // 다음 프레임부터 부드러운 트랜지션 복구
      requestAnimationFrame(() => {
        bar.style.transition = 'width 0.95s linear, background 0.4s';
      });
    }

    const pct = Math.max(0, gameTimeLeft / CONFIG.gameDuration * 100);
    bar.style.width = pct + '%';
    num.textContent = gameTimeLeft;

    // 색상 단계: 초록 → 주황 → 빨강
    bar.classList.remove('warn', 'danger');
    num.classList.remove('warn', 'danger');
    // 남은 시간이 전체의 1/6 이하면 danger, 1/3 이하면 warn
    const warnAt   = Math.ceil(CONFIG.gameDuration / 3);
    const dangerAt = Math.ceil(CONFIG.gameDuration / 6);
    if (gameTimeLeft <= dangerAt) {
      bar.classList.add('danger');
      num.classList.add('danger');
    } else if (gameTimeLeft <= warnAt) {
      bar.classList.add('warn');
      num.classList.add('warn');
    }
  }

  /* ── 다음 문제 가져오기 ────────────────────────── */
  function getNextQ() {
    // 풀이 비면 전체 문제를 다시 섞어서 채움 (30초 동안 무한 반복)
    if (pool.length === 0) pool = shuffle([...CONFIG.items]);
    return pool.pop();
  }

  /* ── 문제 화면 세팅 ────────────────────────────── */
  function loadQ() {
    if (gameTimeLeft <= 0) return; // 시간 끝났으면 중단

    answered = false;
    currentQ = getNextQ();
    isBonus  = Math.random() < CONFIG.bonusChance; // 15% 확률로 보너스

    // 버튼 즉시 초기화 (transition 없이 색을 바로 비움)
    CONFIG.categories.forEach((_, i) => {
      const b = btn(i);
      b.style.transition = 'none';          // 트랜지션 일시 중단
      b.className = 'btn-cat';              // correct/wrong/dim 클래스 제거
      b.style.setProperty('--c', CONFIG.categories[i].color);
      b.disabled = false;
      requestAnimationFrame(() => {
        b.style.transition = '';            // 다음 프레임부터 hover 효과 복구
      });
    });

    clearFeedback();
    document.getElementById('answer-reveal').textContent = '';
    document.getElementById('trash-img').classList.remove('dimmed');
    document.getElementById('trash-img').src = currentQ.image;

    // 보너스 배지 표시/숨김
    const badge = document.getElementById('bonus-badge');
    if (isBonus) {
      badge.textContent = `⭐ ${CONFIG.bonusPoints}점 보너스!`;
      badge.classList.add('show');
    } else {
      badge.classList.remove('show');
    }
  }

  /* ── 플레이어가 버튼 선택 ──────────────────────── */
  function pick(i) {
    if (answered || gameTimeLeft <= 0) return; // 이중 클릭 방지
    answered = true;

    const q   = currentQ;
    const ok  = (i === q.answer);                              // 정답 여부
    const pts = ok ? (isBonus ? CONFIG.bonusPoints : 1) : 0;  // 점수 계산

    // 버튼 비활성화 + 정답/오답 표시
    disableButtons();
    btn(q.answer).classList.add('correct');
    if (!ok) {
      btn(i).classList.add('wrong');
      CONFIG.categories.forEach((_, j) => {
        if (j !== q.answer && j !== i) btn(j).classList.add('dim');
      });
    }

    // 이미지 어둡게 + 정답 텍스트 표시
    document.getElementById('trash-img').classList.add('dimmed');
    document.getElementById('answer-reveal').textContent =
      `정답: ${CONFIG.categories[q.answer].emoji} ${CONFIG.categories[q.answer].name}` +
      (q.name ? ` (${q.name})` : '');

    // 점수 반영 + 효과음
    totalAnswered++;
    if (ok) {
      score += pts;
      correctAnswered++;
      showEl('score', score);
      showScorePopup(pts);
      SFX[isBonus ? 'bonus' : 'correct'](); // 보너스면 특별 효과음
    } else {
      SFX.wrong();
    }

    showEl('q-correct', correctAnswered);
    showEl('q-total',   totalAnswered);

    showFeedback(
      ok ? (isBonus ? `⭐ +${pts}점!` : '✅ 정답!') : '❌ 오답!',
      ok ? 'ok' : 'bad'
    );

    results.push({ q, userPick: i, ok, pts, bonus: isBonus });

    // 0.4초 후 다음 문제 (시간이 남아 있을 때만)
    setTimeout(() => { if (gameTimeLeft > 0) loadQ(); }, 400);
  }

  /* ── +점수 팝업 애니메이션 ─────────────────────── */
  function showScorePopup(pts) {
    const el = document.getElementById('score-popup');
    el.textContent = `+${pts}`;
    el.className = 'score-popup'; // 클래스 초기화
    void el.offsetWidth;          // 강제 리플로우 (애니메이션 재시작용)
    el.className = `score-popup show${pts >= CONFIG.bonusPoints ? ' big' : ''}`;
  }

  /* ── 30초 종료 처리 ────────────────────────────── */
  function endGame() {
    if (gameTimerId) { clearInterval(gameTimerId); gameTimerId = null; }
    gameTimeLeft = 0;
    answered = true;     // 더 이상 클릭 불가
    disableButtons();
    SFX.end();           // 종료 팡파르
    renderTimerBar(false);
    setTimeout(() => showResult(), 500);
  }

  /* ── 결과 화면 ─────────────────────────────────── */
  function showResult() {
    // 점수 표시
    const bigEl = document.getElementById('r-score-big');
    bigEl.innerHTML = `${score}<span class="pts-label">점</span>`;

    showEl('r-correct', correctAnswered);
    showEl('r-total',   totalAnswered);

    // 점수에 따른 등급 메시지
    let emoji, title, msg;
    if (score >= 14)      { emoji = '🏆'; title = '분리수거 마스터!'; msg = '환경을 지키는 진정한 영웅이에요!'; }
    else if (score >= 10) { emoji = '👍'; title = '잘 했어요!';       msg = '조금만 더 연습하면 완벽해질 거예요!'; }
    else if (score >= 6)  { emoji = '🤔'; title = '아쉬워요!';        msg = '분리수거 방법을 다시 공부해봐요!'; }
    else                  { emoji = '😅'; title = '다시 도전!';       msg = '함께 분리수거 방법을 배워봐요!'; }

    showEl('r-emoji', emoji);
    showEl('r-title', title);
    showEl('r-msg',   msg);

    // 문제별 결과 목록
    const list = document.getElementById('review-list');
    list.innerHTML = results.map((r, n) => {
      const icon = r.ok ? (r.bonus ? '⭐' : '✅') : '❌';
      const cls  = r.ok ? 'ok-row' : 'bad-row';
      const ans  = CONFIG.categories[r.q.answer].name;
      const pts  = r.ok ? `+${r.pts}` : '0';
      return `<div class="review-row ${cls}">
        <span class="r-name">${n + 1}. ${r.q.name || ''}</span>
        <span class="r-icon">${icon}</span>
        <span class="r-pts">${pts}</span>
        <span class="r-ans">${ans}</span>
      </div>`;
    }).join('');

    showScreen('screen-result');
  }

  /* ── 공통 유틸리티 ──────────────────────────────── */
  function btn(i) { return document.getElementById(`btn-${i}`); }

  function disableButtons() {
    CONFIG.categories.forEach((_, i) => { btn(i).disabled = true; });
  }

  function showFeedback(text, type) {
    const el = document.getElementById('feedback');
    el.textContent = text;
    el.className   = `feedback show ${type}`;
  }

  function clearFeedback() {
    const el = document.getElementById('feedback');
    el.textContent = '';
    el.className   = 'feedback';
  }

  function showEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  function shuffle(arr) {
    if (!CONFIG.shuffle) return arr;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // 페이지 로드 시: UI 초기화 + 모든 이미지 사전 로드 시작
  window.addEventListener('DOMContentLoaded', () => {
    init();
    preloadAllImages(); // 시작 화면에 있는 동안 백그라운드로 사진 전부 캐시
  });
  return { start, pick };
})();
