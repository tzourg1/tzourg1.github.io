(function () {
  'use strict';

  const API = { daily: 'https://api.chess.com/pub/puzzle', random: 'https://api.chess.com/pub/puzzle/random' };
  const pieceImageBase = 'https://chessboardjs.com/img/chesspieces/wikipedia/';
  const pieces = { wp: 'wP', wn: 'wN', wb: 'wB', wr: 'wR', wq: 'wQ', wk: 'wK', bp: 'bP', bn: 'bN', bb: 'bB', br: 'bR', bq: 'bQ', bk: 'bK' };
  const pieceNames = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
  const board = document.querySelector('#chessboard');
  const title = document.querySelector('#puzzle-title');
  const modeLabel = document.querySelector('#puzzle-mode');
  const sideLabel = document.querySelector('#side-to-move');
  const feedback = document.querySelector('#puzzle-feedback');
  const credit = document.querySelector('#chess-credit');
  const hintButton = document.querySelector('#hint-button');
  const restartButton = document.querySelector('#restart-button');
  const solutionButton = document.querySelector('#solution-button');
  const dailyButton = document.querySelector('#daily-puzzle');
  const randomButton = document.querySelector('#random-puzzle');
  const streakOutput = document.querySelector('#daily-streak');
  const randomOutput = document.querySelector('#random-solved');

  let puzzle = null;
  let game = null;
  let solution = [];
  let solutionIndex = 0;
  let selectedSquare = null;
  let orientation = 'w';
  let mode = 'daily';
  let hintLevel = 0;
  let locked = true;
  let solutionTimer = null;

  function setFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = `puzzle-feedback${type ? ` ${type}` : ''}`;
  }

  function parseSolution(fen, pgn) {
    const replay = new Chess(fen);
    const clean = pgn
      .replace(/\[[^\]]*\]/g, ' ')
      .replace(/\{[^}]*\}/g, ' ')
      .replace(/\([^)]*\)/g, ' ')
      .replace(/\d+\.(?:\.\.)?/g, ' ');
    const tokens = clean.split(/\s+/).filter(token => token && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token));
    const moves = [];
    tokens.forEach(token => {
      const move = replay.move(token, { sloppy: true });
      if (move) moves.push(move);
    });
    return moves;
  }

  function boardSquares() {
    const files = orientation === 'w' ? ['a','b','c','d','e','f','g','h'] : ['h','g','f','e','d','c','b','a'];
    const ranks = orientation === 'w' ? [8,7,6,5,4,3,2,1] : [1,2,3,4,5,6,7,8];
    return ranks.flatMap(rank => files.map(file => `${file}${rank}`));
  }

  function renderBoard() {
    board.innerHTML = '';
    boardSquares().forEach((squareName, index) => {
      const square = document.createElement('button');
      const fileNumber = squareName.charCodeAt(0) - 96;
      const rankNumber = Number(squareName[1]);
      const piece = game.get(squareName);
      square.type = 'button';
      square.className = `square ${(fileNumber + rankNumber) % 2 ? 'light' : 'dark'}`;
      square.dataset.square = squareName;
      square.setAttribute('role', 'gridcell');
      square.setAttribute('aria-label', piece ? `${squareName}, ${piece.color === 'w' ? 'white' : 'black'} ${pieceNames[piece.type]}` : `${squareName}, empty`);
      if (squareName === selectedSquare) square.classList.add('selected');
      if (hintLevel >= 1 && solution[solutionIndex] && squareName === solution[solutionIndex].from) square.classList.add('hint-from');
      if (hintLevel >= 2 && solution[solutionIndex] && squareName === solution[solutionIndex].to) square.classList.add('hint-to');
      if (piece) {
        const image = document.createElement('img');
        image.className = 'piece-image';
        image.src = `${pieceImageBase}${pieces[`${piece.color}${piece.type}`]}.png`;
        image.alt = '';
        image.draggable = false;
        image.setAttribute('aria-hidden', 'true');
        square.appendChild(image);
      }
      if (index % 8 === 0) {
        const rank = document.createElement('span');
        rank.className = 'coordinate rank-coordinate';
        rank.textContent = squareName[1];
        square.appendChild(rank);
      }
      if (index >= 56) {
        const file = document.createElement('span');
        file.className = 'coordinate file-coordinate';
        file.textContent = squareName[0];
        square.appendChild(file);
      }
      square.addEventListener('click', () => chooseSquare(squareName));
      board.appendChild(square);
    });
    board.setAttribute('aria-busy', 'false');
  }

  function chooseSquare(squareName) {
    if (locked || !solution[solutionIndex]) return;
    const piece = game.get(squareName);
    if (!selectedSquare) {
      if (!piece || piece.color !== game.turn()) {
        setFeedback(`Choose a ${game.turn() === 'w' ? 'white' : 'black'} piece to move.`, 'error');
        return;
      }
      selectedSquare = squareName;
      hintLevel = 0;
      renderBoard();
      return;
    }
    if (piece && piece.color === game.turn()) {
      selectedSquare = squareName;
      renderBoard();
      return;
    }
    const expected = solution[solutionIndex];
    const attemptedFrom = selectedSquare;
    selectedSquare = null;
    if (attemptedFrom !== expected.from || squareName !== expected.to) {
      hintLevel = 0;
      setFeedback('That move is not the tactic. Take another look.', 'error');
      renderBoard();
      return;
    }
    game.move({ from: expected.from, to: expected.to, promotion: expected.promotion || 'q' });
    solutionIndex += 1;
    hintLevel = 0;
    renderBoard();
    if (solutionIndex >= solution.length) {
      completePuzzle();
      return;
    }
    locked = true;
    setFeedback('Correct. Watch the reply…', 'success');
    window.setTimeout(playReply, 650);
  }

  function playReply() {
    const reply = solution[solutionIndex];
    if (!reply) { completePuzzle(); return; }
    game.move({ from: reply.from, to: reply.to, promotion: reply.promotion || 'q' });
    solutionIndex += 1;
    renderBoard();
    if (solutionIndex >= solution.length) completePuzzle();
    else { locked = false; setFeedback('Your move. Continue the tactic.'); }
  }

  function dateKey(timestamp) {
    return new Date(timestamp * 1000).toISOString().slice(0, 10);
  }

  function completePuzzle() {
    locked = true;
    setFeedback('Puzzle solved! Excellent calculation.', 'success');
    const progress = JSON.parse(localStorage.getItem('chessjitsuPuzzleProgress') || '{"streak":0,"lastDaily":"","randomSolved":0}');
    if (mode === 'daily') {
      const today = dateKey(puzzle.publish_time);
      if (progress.lastDaily !== today) {
        const previous = new Date(`${today}T00:00:00Z`);
        previous.setUTCDate(previous.getUTCDate() - 1);
        progress.streak = progress.lastDaily === previous.toISOString().slice(0, 10) ? progress.streak + 1 : 1;
        progress.lastDaily = today;
      }
    } else {
      progress.randomSolved += 1;
    }
    localStorage.setItem('chessjitsuPuzzleProgress', JSON.stringify(progress));
    renderProgress();
  }

  function renderProgress() {
    const progress = JSON.parse(localStorage.getItem('chessjitsuPuzzleProgress') || '{"streak":0,"lastDaily":"","randomSolved":0}');
    streakOutput.textContent = progress.streak || 0;
    randomOutput.textContent = progress.randomSolved || 0;
  }

  function restartPuzzle() {
    window.clearTimeout(solutionTimer);
    game = new Chess(puzzle.fen);
    solutionIndex = 0;
    selectedSquare = null;
    hintLevel = 0;
    locked = false;
    renderBoard();
    setFeedback(`${orientation === 'w' ? 'White' : 'Black'} to move. Find the best continuation.`);
  }

  function showSolution() {
    locked = true;
    selectedSquare = null;
    setFeedback('Showing the solution…');
    function next() {
      const move = solution[solutionIndex];
      if (!move) { setFeedback('Solution complete. Restart to try it yourself.', 'success'); return; }
      game.move({ from: move.from, to: move.to, promotion: move.promotion || 'q' });
      solutionIndex += 1;
      renderBoard();
      solutionTimer = window.setTimeout(next, 650);
    }
    next();
  }

  async function loadPuzzle(nextMode) {
    mode = nextMode;
    locked = true;
    board.setAttribute('aria-busy', 'true');
    title.textContent = 'Loading puzzle…';
    modeLabel.textContent = mode === 'daily' ? 'Daily Puzzle' : 'Random Puzzle';
    setFeedback('Loading from Chess.com…');
    [hintButton, restartButton, solutionButton].forEach(button => { button.disabled = true; });
    try {
      const response = await fetch(API[mode]);
      if (!response.ok) throw new Error(`Chess.com returned ${response.status}`);
      puzzle = await response.json();
      solution = parseSolution(puzzle.fen, puzzle.pgn);
      if (!solution.length) throw new Error('No solution moves were available');
      game = new Chess(puzzle.fen);
      orientation = game.turn();
      title.textContent = puzzle.title;
      sideLabel.textContent = `${orientation === 'w' ? 'White' : 'Black'} to move`;
      credit.href = puzzle.url;
      credit.innerHTML = 'Puzzle provided by Chess.com — view original <span class="sr-only">(opens in a new tab)</span>';
      [hintButton, restartButton, solutionButton].forEach(button => { button.disabled = false; });
      restartPuzzle();
    } catch (error) {
      board.innerHTML = '';
      board.setAttribute('aria-busy', 'false');
      title.textContent = 'Puzzle unavailable';
      setFeedback('The Chess.com puzzle could not be loaded right now. Please try again shortly.', 'error');
    }
  }

  hintButton.addEventListener('click', () => {
    if (!solution[solutionIndex] || locked) return;
    hintLevel = Math.min(2, hintLevel + 1);
    renderBoard();
    setFeedback(hintLevel === 1 ? `Consider the piece on ${solution[solutionIndex].from}.` : `Look for a move from ${solution[solutionIndex].from} to ${solution[solutionIndex].to}.`);
  });
  restartButton.addEventListener('click', restartPuzzle);
  solutionButton.addEventListener('click', showSolution);
  dailyButton.addEventListener('click', () => loadPuzzle('daily'));
  randomButton.addEventListener('click', () => loadPuzzle('random'));

  renderProgress();
  if (typeof Chess === 'undefined') setFeedback('The chessboard engine could not be loaded. Please refresh the page.', 'error');
  else loadPuzzle('daily');
}());

