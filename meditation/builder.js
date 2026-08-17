(function () {
  'use strict';

  const segmentCopy = {
    arrive: { name: 'Arrive', prompts: { calm: 'Let the day soften around you. Notice the support beneath your body.', focus: 'Let your attention gather here. This moment is the only task.', confidence: 'Take your place in this moment. You do not need to shrink.', recovery: 'Allow yourself to arrive without asking anything more of your body.', sleep: 'Let the day begin to loosen its hold.' } },
    breathe: { name: 'Breathing', prompts: { calm: 'Breathe in gently. Breathe out a little more slowly.', focus: 'Follow one complete breath from beginning to end.', confidence: 'Breathe in steadiness. Breathe out unnecessary tension.', recovery: 'Let each breath create a little more room.', sleep: 'Allow the breath to become quiet, easy, and unforced.' } },
    body: { name: 'Body scan', prompts: { calm: 'Notice where the body is already at ease, then soften around the edges of tension.', focus: 'Move attention slowly through the body, noticing clear physical sensation.', confidence: 'Feel the strength and support present in your body.', recovery: 'Listen to the body with patience, without trying to fix what you find.', sleep: 'Soften the forehead, jaw, shoulders, hands, and belly.' } },
    visualize: { name: 'Visualization', prompts: { calm: 'Picture still water. Let each thought pass across the surface and move on.', focus: 'Picture one clear path in front of you and the next simple step upon it.', confidence: 'Imagine meeting the next challenge with a steady breath and an open posture.', recovery: 'Picture warmth moving toward the places that need care.', sleep: 'Imagine the room becoming quieter and darker with every breath.' } },
    silence: { name: 'Quiet space', prompts: { calm: 'Rest in quiet. Nothing needs to be solved right now.', focus: 'Stay with the breath. When attention wanders, return without judgment.', confidence: 'Sit with your own presence. Let steadiness speak for itself.', recovery: 'Give the body and mind this quiet space to restore.', sleep: 'Rest in the quiet between thoughts.' } },
    close: { name: 'Closing', prompts: { calm: 'Notice what has softened. Carry one small piece of this calm with you.', focus: 'Choose the one thing that deserves your attention next.', confidence: 'Remember this steadiness is available each time you return to your breath.', recovery: 'Thank yourself for making room to pause and listen.', sleep: 'Release the practice and allow rest to continue in its own way.' } }
  };

  const form = document.querySelector('#builder-form');
  const nameInput = document.querySelector('#session-name');
  const intentionInput = document.querySelector('#intention');
  const lengthInput = document.querySelector('#session-length');
  const voiceInput = document.querySelector('#voice-setting');
  const ambienceInput = document.querySelector('#ambience');
  const optionInputs = Array.from(document.querySelectorAll('#segment-options input'));
  const planList = document.querySelector('#session-plan');
  const previewHeading = document.querySelector('#preview-heading');
  const previewSummary = document.querySelector('#preview-summary');
  const formMessage = document.querySelector('#form-message');
  const player = document.querySelector('#player');
  const playerTitle = document.querySelector('#player-title');
  const currentStep = document.querySelector('#current-step');
  const timer = document.querySelector('#timer');
  const progress = document.querySelector('#session-progress');
  const playPause = document.querySelector('#play-pause');
  const restartButton = document.querySelector('#restart-session');
  const closeButton = document.querySelector('#close-player');
  const savedStatus = document.querySelector('#saved-status');
  const loadButton = document.querySelector('#load-session');

  let session = null;
  let elapsed = 0;
  let intervalId = null;
  let activeSegment = -1;
  let audioContext = null;
  let ambienceNodes = [];

  function selectedSegments() {
    return optionInputs.filter(input => input.checked).map(input => input.value);
  }

  function buildSession() {
    const segments = selectedSegments();
    if (!segments.length) return null;
    const totalSeconds = Number(lengthInput.value) * 60;
    const base = Math.floor(totalSeconds / segments.length);
    let used = 0;
    const steps = segments.map((key, index) => {
      const seconds = index === segments.length - 1 ? totalSeconds - used : base;
      used += seconds;
      return { key, seconds, name: segmentCopy[key].name, prompt: segmentCopy[key].prompts[intentionInput.value] };
    });
    return { name: nameInput.value.trim() || 'My meditation', intention: intentionInput.value, minutes: Number(lengthInput.value), voice: voiceInput.value, ambience: ambienceInput.value, steps };
  }

  function durationLabel(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return remainder ? `${minutes}:${String(remainder).padStart(2, '0')}` : `${minutes} min`;
  }

  function renderPreview() {
    const draft = buildSession();
    previewHeading.textContent = nameInput.value.trim() || 'My meditation';
    previewSummary.textContent = `${lengthInput.value} minutes for ${intentionInput.options[intentionInput.selectedIndex].text.toLowerCase()}`;
    planList.innerHTML = '';
    if (!draft) {
      planList.innerHTML = '<li>Select at least one step to build a session.</li>';
      return;
    }
    draft.steps.forEach(step => {
      const item = document.createElement('li');
      item.innerHTML = `<span>${step.name}</span><time>${durationLabel(step.seconds)}</time>`;
      planList.appendChild(item);
    });
  }

  function formatTimer(seconds) {
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function speak(text) {
    if (!session || session.voice !== 'spoken' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const message = new SpeechSynthesisUtterance(text);
    message.rate = 0.82;
    message.pitch = 0.95;
    window.speechSynthesis.speak(message);
  }

  function ensureAudio() {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
  }

  function bell() {
    ensureAudio();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.setValueAtTime(528, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(264, audioContext.currentTime + 2.2);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 2.5);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 2.6);
  }

  function startAmbience() {
    stopAmbience();
    if (!session || session.ambience === 'none') return;
    ensureAudio();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = session.ambience === 'deep' ? 'sine' : 'triangle';
    oscillator.frequency.value = session.ambience === 'deep' ? 72 : 118;
    gain.gain.value = session.ambience === 'deep' ? 0.025 : 0.012;
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    ambienceNodes = [oscillator, gain];
  }

  function stopAmbience() {
    if (ambienceNodes[0]) {
      try { ambienceNodes[0].stop(); } catch (error) { /* already stopped */ }
    }
    ambienceNodes = [];
  }

  function stepAt(second) {
    let boundary = 0;
    for (let index = 0; index < session.steps.length; index += 1) {
      boundary += session.steps[index].seconds;
      if (second < boundary) return index;
    }
    return session.steps.length - 1;
  }

  function updatePlayer() {
    const total = session.minutes * 60;
    const remaining = Math.max(0, total - elapsed);
    timer.textContent = formatTimer(remaining);
    progress.style.width = `${Math.min(100, (elapsed / total) * 100)}%`;
    const index = stepAt(elapsed);
    if (index !== activeSegment) {
      activeSegment = index;
      const step = session.steps[index];
      currentStep.textContent = step.prompt;
      bell();
      window.setTimeout(() => speak(step.prompt), 900);
    }
    if (remaining === 0) finishSession();
  }

  function startSession() {
    if (intervalId) return;
    ensureAudio();
    startAmbience();
    playPause.textContent = 'Pause';
    updatePlayer();
    intervalId = window.setInterval(() => { elapsed += 1; updatePlayer(); }, 1000);
  }

  function pauseSession() {
    window.clearInterval(intervalId);
    intervalId = null;
    stopAmbience();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    playPause.textContent = 'Continue';
  }

  function finishSession() {
    pauseSession();
    bell();
    currentStep.textContent = 'Your session is complete. Take your time returning.';
    playPause.textContent = 'Practice again';
    elapsed = session.minutes * 60;
  }

  function resetPlayer() {
    pauseSession();
    elapsed = 0;
    activeSegment = -1;
    timer.textContent = formatTimer(session.minutes * 60);
    progress.style.width = '0%';
    currentStep.textContent = 'Ready when you are.';
    playPause.textContent = 'Start session';
  }

  function openPlayer() {
    playerTitle.textContent = session.name;
    resetPlayer();
    player.hidden = false;
    document.body.classList.add('session-active');
    playPause.focus();
  }

  function closePlayer() {
    pauseSession();
    player.hidden = true;
    document.body.classList.remove('session-active');
    form.querySelector('button[type="submit"]').focus();
  }

  form.addEventListener('input', renderPreview);
  form.addEventListener('submit', event => {
    event.preventDefault();
    session = buildSession();
    if (!session) {
      formMessage.textContent = 'Choose at least one step for your session.';
      return;
    }
    formMessage.textContent = '';
    openPlayer();
  });

  playPause.addEventListener('click', () => {
    if (elapsed >= session.minutes * 60) resetPlayer();
    intervalId ? pauseSession() : startSession();
  });
  restartButton.addEventListener('click', resetPlayer);
  closeButton.addEventListener('click', closePlayer);

  document.querySelector('#save-session').addEventListener('click', () => {
    const draft = buildSession();
    if (!draft) {
      formMessage.textContent = 'Choose at least one step before saving.';
      return;
    }
    localStorage.setItem('chessjitsuMeditation', JSON.stringify(draft));
    formMessage.textContent = 'Session saved on this device.';
    refreshSavedStatus();
  });

  function refreshSavedStatus() {
    const saved = localStorage.getItem('chessjitsuMeditation');
    if (!saved) return;
    const data = JSON.parse(saved);
    savedStatus.textContent = `${data.name} — ${data.minutes} minutes for ${data.intention}`;
    loadButton.hidden = false;
  }

  loadButton.addEventListener('click', () => {
    const data = JSON.parse(localStorage.getItem('chessjitsuMeditation'));
    nameInput.value = data.name;
    intentionInput.value = data.intention;
    lengthInput.value = String(data.minutes);
    voiceInput.value = data.voice;
    ambienceInput.value = data.ambience;
    const keys = data.steps.map(step => step.key);
    optionInputs.forEach(input => { input.checked = keys.includes(input.value); });
    formMessage.textContent = 'Saved session loaded.';
    renderPreview();
    form.scrollIntoView({ behavior: 'smooth' });
  });

  renderPreview();
  refreshSavedStatus();
}());

