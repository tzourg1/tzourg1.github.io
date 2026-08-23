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

  const followUpCopy = {
    arrive: [
      'Notice the points where your body meets the surface beneath you.',
      'Let the shoulders lower and allow the jaw to soften.',
      'If the mind is busy, simply notice that and return to this moment.'
    ],
    breathe: [
      'Feel the beginning, middle, and end of the next breath.',
      'There is nothing to force. Let the breath find its own comfortable pace.',
      'When attention wanders, gently return to the feeling of breathing.'
    ],
    body: [
      'Bring attention to the face, neck, and shoulders. Notice what is present.',
      'Move awareness through the chest, belly, back, and hands.',
      'Notice the hips, legs, and feet, allowing the whole body to be included.'
    ],
    visualize: [
      'Make the image a little clearer. Notice its colors, shapes, and atmosphere.',
      'Imagine yourself meeting this moment with the quality you want to develop.',
      'Let the image become a feeling you can carry in the body.'
    ],
    silence: [
      'If you have drifted into thought, return gently to the breath and the quiet around it.'
    ],
    close: [
      'Begin to notice the room around you while keeping some attention inside.',
      'Take one fuller breath and choose what you want to carry forward.'
    ]
  };

  const form = document.querySelector('#builder-form');
  const promptInput = document.querySelector('#meditation-prompt');
  const promptButton = document.querySelector('#create-from-prompt');
  const nameInput = document.querySelector('#session-name');
  const intentionInput = document.querySelector('#intention');
  const lengthInput = document.querySelector('#session-length');
  const voiceInput = document.querySelector('#voice-setting');
  const ambienceInput = document.querySelector('#ambience');
  const voiceChoice = document.querySelector('#voice-choice');
  const voiceStatus = document.querySelector('#voice-status');
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
  let activeCue = -1;
  let audioContext = null;
  let ambienceNodes = [];
  let availableVoices = [];

  const latinVoicePattern = /^es-(MX|US|419|AR|BO|CL|CO|CR|CU|DO|EC|GT|HN|NI|PA|PE|PR|PY|SV|UY|VE)/i;
  const feminineNamePattern = /(dalia|sabina|paulina|paloma|luciana|elena|sofia|maria|monica|rosa|laura|isabela|female|mujer)/i;
  const russianVoicePattern = /^ru(?:-|_)/i;
  const russianFeminineNamePattern = /(alena|alyona|anna|elena|irina|katya|katerina|milena|natalia|svetlana|tatyana|victoria|female|женщина)/i;
  const chineseVoicePattern = /^zh(?:-|_)/i;
  const chineseMasculineNamePattern = /(yunxi|yunyang|kangkang|xiaogang|liang|male|man|男性|男声)/i;

  function preferredLatinVoice() {
    const latinVoices = availableVoices.filter(voice => latinVoicePattern.test(voice.lang));
    return latinVoices.find(voice => feminineNamePattern.test(voice.name)) || latinVoices[0] || null;
  }

  function preferredRussianVoice() {
    const russianVoices = availableVoices.filter(voice => russianVoicePattern.test(voice.lang));
    return russianVoices.find(voice => russianFeminineNamePattern.test(voice.name)) || russianVoices[0] || null;
  }

  function preferredChineseVoice() {
    const chineseVoices = availableVoices.filter(voice => chineseVoicePattern.test(voice.lang));
    return chineseVoices.find(voice => chineseMasculineNamePattern.test(voice.name)) || chineseVoices[0] || null;
  }

  function selectedVoice() {
    if (voiceChoice.value === 'default') return null;
    if (voiceChoice.value === 'russian-grandmother') return preferredRussianVoice();
    if (voiceChoice.value === 'chinese-grandfather') return preferredChineseVoice();
    if (voiceChoice.value !== 'auto') return availableVoices.find(voice => voice.voiceURI === voiceChoice.value) || null;
    return preferredLatinVoice();
  }

  function updateVoiceStatus() {
    if (voiceChoice.value === 'russian-grandmother') {
      const russian = preferredRussianVoice();
      voiceStatus.textContent = russian
        ? `Russian Grandmother will use ${russian.name} (${russian.lang}) with slower, gentler delivery. Voice quality varies by device.`
        : 'No Russian voice was found. The device default voice will use the slower, gentler delivery.';
      return;
    }
    if (voiceChoice.value === 'chinese-grandfather') {
      const chinese = preferredChineseVoice();
      voiceStatus.textContent = chinese
        ? `Chinese grandfather will use ${chinese.name} (${chinese.lang}) with slower, deeper delivery. Voice quality varies by device.`
        : 'No Chinese voice was found. The device default voice will use the slower, deeper delivery.';
      return;
    }
    const preferred = preferredLatinVoice();
    voiceStatus.textContent = preferred
      ? `Preferred device voice: ${preferred.name} (${preferred.lang}). Voice quality varies by device.`
      : 'No Latin American Spanish voice was found. The device default voice will be used.';
  }

  function refreshVoices() {
    if (!('speechSynthesis' in window)) {
      voiceStatus.textContent = 'Spoken narration is not supported by this browser. On-screen prompts will still work.';
      return;
    }
    availableVoices = window.speechSynthesis.getVoices();
    const existing = new Set(Array.from(voiceChoice.options).map(option => option.value));
    availableVoices.filter(voice => latinVoicePattern.test(voice.lang)).forEach(voice => {
      if (existing.has(voice.voiceURI)) return;
      const option = document.createElement('option');
      option.value = voice.voiceURI;
      option.textContent = `${voice.name} — ${voice.lang}`;
      voiceChoice.appendChild(option);
    });
    updateVoiceStatus();
  }

  function interpretPrompt() {
    const text = promptInput.value.trim();
    if (!text) {
      formMessage.textContent = 'Describe the meditation you want first.';
      promptInput.focus();
      return;
    }
    const lower = text.toLowerCase();
    const duration = lower.match(/(\d{1,2})\s*(?:minute|minuto|minutos|min)\b/);
    if (duration) {
      const requested = Number(duration[1]);
      const allowed = [5, 10, 15, 20];
      lengthInput.value = String(allowed.reduce((best, value) => Math.abs(value - requested) < Math.abs(best - requested) ? value : best));
    }
    const intentionRules = [
      ['sleep', /(sleep|bedtime|rest|insomnia|dormir|sueño|descanso)/],
      ['confidence', /(confidence|courage|brave|competition|tournament|confianza|valor|torneo)/],
      ['focus', /(focus|concentrat|study|work|chess|enfoque|concentración|ajedrez)/],
      ['recovery', /(recover|healing|pain|training|workout|recuper|sanar|dolor)/],
      ['calm', /(calm|anxiety|stress|relax|peace|tranquil|ansiedad|estrés|paz)/]
    ];
    const matchedIntention = intentionRules.find(rule => rule[1].test(lower));
    if (matchedIntention) intentionInput.value = matchedIntention[0];

    const segmentRules = {
      arrive: /(arrive|ground|settle|present|llegar|presente)/,
      breathe: /(breath|breathing|respira|respiración)/,
      body: /(body|scan|muscle|cuerpo|escaneo)/,
      visualize: /(visual|imagine|picture|visualiza|imagina)/,
      silence: /(silence|quiet|pause|silencio|tranquil)/,
      close: /(close|closing|ending|finish|cierre|final)/
    };
    const explicitSegments = Object.keys(segmentRules).filter(key => segmentRules[key].test(lower));
    if (explicitSegments.length) optionInputs.forEach(input => { input.checked = explicitSegments.includes(input.value); });
    if (/(no voice|silent guidance|text only|sin voz|solo texto)/.test(lower)) voiceInput.value = 'text';
    else voiceInput.value = 'spoken';
    if (/(no ambience|no background|sin ambiente|silence only)/.test(lower)) ambienceInput.value = 'none';
    else if (/(deep|hum|grounding|grave|zumbido)/.test(lower)) ambienceInput.value = 'deep';
    else if (/(ambience|background|soft|air|suave|ambiente)/.test(lower)) ambienceInput.value = 'soft';

    nameInput.value = `${intentionInput.options[intentionInput.selectedIndex].text} meditation`;
    formMessage.textContent = 'Your prompt has been turned into a session. Review or adjust the choices below.';
    renderPreview();
  }

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
    return { name: nameInput.value.trim() || 'My meditation', intention: intentionInput.value, minutes: Number(lengthInput.value), voice: voiceInput.value, voiceId: voiceChoice.value, ambience: ambienceInput.value, steps };
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
    const russianGrandmother = voiceChoice.value === 'russian-grandmother';
    const chineseGrandfather = voiceChoice.value === 'chinese-grandfather';
    message.rate = russianGrandmother ? 0.72 : chineseGrandfather ? 0.7 : 0.82;
    message.pitch = russianGrandmother ? 0.82 : chineseGrandfather ? 0.72 : 0.95;
    const narrator = selectedVoice();
    if (narrator) {
      message.voice = narrator;
      message.lang = narrator.lang;
    }
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

  function segmentStartAt(index) {
    return session.steps.slice(0, index).reduce((total, step) => total + step.seconds, 0);
  }

  function updatePlayer() {
    const total = session.minutes * 60;
    const remaining = Math.max(0, total - elapsed);
    timer.textContent = formatTimer(remaining);
    progress.style.width = `${Math.min(100, (elapsed / total) * 100)}%`;
    const index = stepAt(elapsed);
    if (index !== activeSegment) {
      activeSegment = index;
      activeCue = -1;
      const step = session.steps[index];
      currentStep.textContent = step.prompt;
      bell();
      window.setTimeout(() => speak(step.prompt), 900);
    } else {
      const step = session.steps[index];
      const cues = followUpCopy[step.key] || [];
      const segmentElapsed = elapsed - segmentStartAt(index);
      const cueSpacing = step.seconds / (cues.length + 1);
      const cueIndex = cues.length ? Math.floor(segmentElapsed / cueSpacing) - 1 : -1;
      if (cueIndex >= 0 && cueIndex < cues.length && cueIndex !== activeCue) {
        activeCue = cueIndex;
        currentStep.textContent = cues[cueIndex];
        speak(cues[cueIndex]);
      }
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
    activeCue = -1;
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
  voiceChoice.addEventListener('change', updateVoiceStatus);
  promptButton.addEventListener('click', interpretPrompt);
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
    voiceChoice.value = data.voiceId || 'auto';
    ambienceInput.value = data.ambience;
    const keys = data.steps.map(step => step.key);
    optionInputs.forEach(input => { input.checked = keys.includes(input.value); });
    formMessage.textContent = 'Saved session loaded.';
    renderPreview();
    form.scrollIntoView({ behavior: 'smooth' });
  });

  renderPreview();
  refreshSavedStatus();
  refreshVoices();
  if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = refreshVoices;
}());

