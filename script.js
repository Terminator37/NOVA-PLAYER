/* NOVA PLAYER V3.2
   Advanced media manager + folders + multi-selection + playlists + Web Audio EQ + subtitles + audio tracks.
*/

const DB_NAME = "nova-player-db";
const DB_VERSION = 2;
const STORE_NAME = "media";
const PLAYLIST_STORE = "playlists";
const PREFS_KEY = "nova-player-prefs-v2";
const MEDIA_PREFS_KEY = "nova-player-media-options-v2";
const APPEARANCE_PREFS_KEY = "nova-player-appearance-v1";
const DEFAULT_APPEARANCE = {accent:"violet",theme:"dark",density:"standard",visualizer:"orbit",motion:true,rememberSection:true,startup:"home"};
const ACCENTS = {
  violet:{name:"Violet",accent:"#8b7cff",accent2:"#48d7ff"},
  cyan:{name:"Cyan",accent:"#48d7ff",accent2:"#7cecff"},
  emerald:{name:"Emerald",accent:"#4ee7a4",accent2:"#48d7ff"},
  crimson:{name:"Crimson",accent:"#ff6f91",accent2:"#ff9ab2"},
  amber:{name:"Amber",accent:"#ffc857",accent2:"#48d7ff"}
};
let appearancePrefs = {...DEFAULT_APPEARANCE};


const mediaFiles = [];
let currentIndex = -1;
let currentMedia = null;
let objectUrl = null;
let currentThumbUrl = null;
let currentCoverUrl = null;
let isShuffle = false;
let repeatMode = "off";
let activeFilter = "all";
let toastTimer = null;
let dbPromise = null;
let savePositionTimer = null;
let playlists = [];
let activePlaylistId = "";
let activeFolderPath = "";
let selectionMode = false;
const selectedMediaIds = new Set();
let detailsMediaId = "";
let advancedAudioOpen = false;

// V2.7 — Smart metadata
// V2.9.2 — Visual Core Refined: escenario de audio premium y composición móvil
// V2.9 — Personalization Studio, ratings and library filters

// V2.2 — Subtitles & external audio tracks
let subtitleTrackElement = null;
let subtitleObjectUrl = null;
let subtitleFileName = "";
let subtitleEnabled = false;
let externalAudioUrl = null;
let externalAudioSourceNode = null;
let externalAudioActive = false;

// V2.2 — Advanced Audio Engine + Subtitles + Audio Tracks
let audioContext = null;
let mediaSourceNode = null;
let bassFilter = null;
let midFilter = null;
let trebleFilter = null;
let stereoPanner = null;
let analyserNode = null;
let preampGain = null;
let eqFilters = [];
let audioEngineReady = false;
const AUDIO_PREFS_KEY = "nova-player-audio-v2";
const EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const $ = id => document.getElementById(id);
const eqBandInputs = [...document.querySelectorAll("[data-eq-index]")];
const preampBar = $("preampBar");
const preampValue = $("preampValue");
const equalizerPanel = $("equalizerPanel");
const equalizerResetButton = $("equalizerResetButton");
const eqProfileStatus = $("eqProfileStatus");
const eqEngineStatus = $("eqEngineStatus");
const fileInput = $("fileInput");
const folderInput = $("folderInput");
const addFilesButton = $("addFilesButton");
const addFolderButton = $("addFolderButton");
const emptyFolderButton = $("emptyFolderButton");
const playlistSelect = $("playlistSelect");
const createPlaylistButton = $("createPlaylistButton");
const addCurrentToPlaylistButton = $("addCurrentToPlaylistButton");
const deletePlaylistButton = $("deletePlaylistButton");
const collectionSummary = $("collectionSummary");
const folderSelect = $("folderSelect");
const renamePlaylistButton = $("renamePlaylistButton");
const duplicatePlaylistButton = $("duplicatePlaylistButton");
const addVisibleToPlaylistButton = $("addVisibleToPlaylistButton");
const addButton = $("addButton");
const emptyAddButton = $("emptyAddButton");
const emptyMedia = $("emptyMedia");
const mediaContainer = $("mediaContainer");
const videoPlayer = $("videoPlayer");
const audioArtwork = $("audioArtwork");
const trackSubline = $("trackSubline");
const videoThumb = $("videoThumb");
const videoThumbImage = $("videoThumbImage");
const novaAudioCover = $("novaAudioCover");
const novaAudioCoverImage = $("novaAudioCoverImage");
const novaAudioCoverFallback = $("novaAudioCoverFallback");
const novaAudioArtist = $("novaAudioArtist");
const novaAudioAlbum = $("novaAudioAlbum");
const fullscreenButton = $("fullscreenButton");
const lockButton = $("lockButton");
const unlockButton = $("unlockButton");
const gestureHint = $("gestureHint");
const playerCard = document.querySelector(".player-card");
const muteButton = $("muteButton");
const speedButton = $("speedButton");
const sleepTimerButton = $("sleepTimerButton");
const smartPlayback = $("smartPlayback");
const sleepTimerStatus = $("sleepTimerStatus");
const sleepTimerClose = $("sleepTimerClose");
const sleepTimerCancel = $("sleepTimerCancel");
const sleepEndCurrent = $("sleepEndCurrent");
let sleepTimerId = null;
let sleepTimerInterval = null;
let sleepTimerEndsAt = 0;
let sleepAfterCurrent = false;
const audioPanel = $("audioPanel");
const advancedAudioToggle = $("advancedAudioToggle");
const advancedAudioBody = $("advancedAudioBody");
const audioResetButton = $("audioResetButton");
const bassBar = $("bassBar");
const trebleBar = $("trebleBar");
const balanceBar = $("balanceBar");
const bassValue = $("bassValue");
const trebleValue = $("trebleValue");
const balanceValue = $("balanceValue");
const audioEngineStatus = $("audioEngineStatus");
const presetButtons = [...document.querySelectorAll(".preset-button")];
const fullscreenTopbar = $("fullscreenTopbar");
const fsBackButton = $("fsBackButton");
const fsLockButton = $("fsLockButton");
const fsTitle = $("fsTitle");
const subtitleInput = $("subtitleInput");
const audioTrackInput = $("audioTrackInput");
const externalAudio = $("externalAudio");
const mediaOptionsPanel = $("mediaOptionsPanel");
const mediaOptionsStatus = $("mediaOptionsStatus");
const subtitleLoadButton = $("subtitleLoadButton");
const subtitleToggleButton = $("subtitleToggleButton");
const subtitleRemoveButton = $("subtitleRemoveButton");
const subtitleStatus = $("subtitleStatus");
const subtitleSizeSelect = $("subtitleSizeSelect");
const subtitleBackgroundToggle = $("subtitleBackgroundToggle");
const audioTrackLoadButton = $("audioTrackLoadButton");
const audioTrackRemoveButton = $("audioTrackRemoveButton");
const audioTrackStatus = $("audioTrackStatus");
const audioTrackNote = $("audioTrackNote");
const skipIndicator = $("skipIndicator");
const statusPill = $("statusPill");
const mediaTitle = $("mediaTitle");
const mediaType = $("mediaType");
const favoriteButton = $("favoriteButton");
const progressBar = $("progressBar");
const currentTimeEl = $("currentTime");
const durationEl = $("duration");
const previousButton = $("previousButton");
const rewindButton = $("rewindButton");
const playButton = $("playButton");
const forwardButton = $("forwardButton");
const nextButton = $("nextButton");
const shuffleButton = $("shuffleButton");
const repeatButton = $("repeatButton");
const volumeBar = $("volumeBar");
const volumeValue = $("volumeValue");
const playlist = $("playlist");
const playlistCount = $("playlistCount");
const libraryMeta = $("libraryMeta");
const librarySize = $("librarySize");
const clearButton = $("clearButton");
const sortSelect = $("sortSelect");
const searchInput = $("searchInput");
const toast = $("toast");
const selectionModeButton = $("selectionModeButton");
const bulkToolbar = $("bulkToolbar");
const selectedCount = $("selectedCount");
const selectVisibleButton = $("selectVisibleButton");
const clearSelectionButton = $("clearSelectionButton");
const bulkFavoriteButton = $("bulkFavoriteButton");
const bulkPlaylistButton = $("bulkPlaylistButton");
const bulkDeleteButton = $("bulkDeleteButton");
const detailsModal = $("detailsModal");
const detailsBackdrop = $("detailsBackdrop");
const detailsCloseButton = $("detailsCloseButton");
const detailsTitle = $("detailsTitle");
const detailsIcon = $("detailsIcon");
const detailsName = $("detailsName");
const detailsGrid = $("detailsGrid");
const detailsRenameButton = $("detailsRenameButton");
const detailsFavoriteButton = $("detailsFavoriteButton");
const detailsPlayButton = $("detailsPlayButton");
const detailsRatingValue = $("detailsRatingValue");
const detailsRatingStars = $("detailsRatingStars");
const detailsTagsInput = $("detailsTagsInput");
const detailsNoteInput = $("detailsNoteInput");
const detailsTitleInput = $("detailsTitleInput");
const detailsArtistInput = $("detailsArtistInput");
const detailsAlbumInput = $("detailsAlbumInput");
const detailsLyricsInput = $("detailsLyricsInput");
const lyricsButton = $("lyricsButton");
const lyricsPanel = $("lyricsPanel");
const lyricsCloseButton = $("lyricsCloseButton");
const lyricsTitle = $("lyricsTitle");
const lyricsContent = $("lyricsContent");
const lyricsEmpty = $("lyricsEmpty");
const detailsSaveMetadataButton = $("detailsSaveMetadataButton");
const libraryTabs = [...document.querySelectorAll(".library-tab")];
const settingsButton = $("settingsButton");
const settingsModal = $("settingsModal");
const settingsBackdrop = $("settingsBackdrop");
const settingsCloseButton = $("settingsCloseButton");
const settingsDoneButton = $("settingsDoneButton");
const resetAppearanceButton = $("resetAppearanceButton");
const accentName = $("accentName");
const themeName = $("themeName");
const densityName = $("densityName");
const visualizerName = $("visualizerName");
const motionToggle = $("motionToggle");
const rememberSectionToggle = $("rememberSectionToggle");
const startupSelect = $("startupSelect");
const accentChoices = [...document.querySelectorAll(".accent-choice")];
const themeChoices = [...document.querySelectorAll("[data-theme]")];
const densityChoices = [...document.querySelectorAll("[data-density]")];
const visualizerChoices = [...document.querySelectorAll("[data-visualizer]")];


function loadAppearancePrefs(){
  try{ const saved=JSON.parse(localStorage.getItem(APPEARANCE_PREFS_KEY)||"null"); if(saved) appearancePrefs={...DEFAULT_APPEARANCE,...saved}; }catch{}
  applyAppearance(false);
}
function saveAppearancePrefs(){ try{localStorage.setItem(APPEARANCE_PREFS_KEY,JSON.stringify(appearancePrefs));}catch{} }
function applyAppearance(save=true){
  const root=document.documentElement;
  const accent=ACCENTS[appearancePrefs.accent]||ACCENTS.violet;
  root.style.setProperty("--accent",accent.accent);
  root.style.setProperty("--accent-2",accent.accent2);
  document.body.classList.remove("theme-amoled","theme-midnight","density-compact","density-standard","density-spacious","no-motion");
  if(appearancePrefs.theme!=="dark") document.body.classList.add(`theme-${appearancePrefs.theme}`);
  document.body.classList.add(`density-${appearancePrefs.density}`);
  if(!appearancePrefs.motion) document.body.classList.add("no-motion");
  mediaContainer?.classList.remove("viz-orbit","viz-bars","viz-minimal");
  mediaContainer?.classList.add(`viz-${appearancePrefs.visualizer}`);
  accentChoices.forEach(b=>b.classList.toggle("active",b.dataset.accent===appearancePrefs.accent));
  themeChoices.forEach(b=>b.classList.toggle("active",b.dataset.theme===appearancePrefs.theme));
  densityChoices.forEach(b=>b.classList.toggle("active",b.dataset.density===appearancePrefs.density));
  visualizerChoices.forEach(b=>b.classList.toggle("active",b.dataset.visualizer===appearancePrefs.visualizer));
  if(accentName) accentName.textContent=accent.name;
  if(themeName) themeName.textContent=appearancePrefs.theme==="amoled"?"AMOLED":appearancePrefs.theme==="midnight"?"Midnight":"NOVA Dark";
  if(densityName) densityName.textContent=appearancePrefs.density==="compact"?"Compacta":appearancePrefs.density==="spacious"?"Amplia":"Estándar";
  if(visualizerName) visualizerName.textContent=appearancePrefs.visualizer==="bars"?"Barras":appearancePrefs.visualizer==="minimal"?"Minimal":"Órbita";
  if(motionToggle) motionToggle.checked=appearancePrefs.motion;
  if(rememberSectionToggle) rememberSectionToggle.checked=appearancePrefs.rememberSection;
  if(startupSelect) startupSelect.value=appearancePrefs.startup;
  if(save) saveAppearancePrefs();
}
function openSettings(){settingsModal.hidden=false;settingsModal.setAttribute("aria-hidden","false");document.body.classList.add("modal-open");}
function closeSettings(){settingsModal.hidden=true;settingsModal.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open");saveAppearancePrefs();}
function resetAppearance(){appearancePrefs={...DEFAULT_APPEARANCE};applyAppearance(true);showToast("Apariencia restablecida");}
function rememberMobileSection(name){if(!appearancePrefs.rememberSection)return;try{localStorage.setItem("nova-player-last-section",name);}catch{}}
function getStartupSection(){try{return localStorage.getItem("nova-player-last-section")||appearancePrefs.startup||"home";}catch{return appearancePrefs.startup||"home";}}

function ensureAudioEngine() {
  if (audioEngineReady) {
    if (audioContext?.state === "suspended") audioContext.resume().catch(() => {});
    return true;
  }
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error("Web Audio no disponible");
    audioContext = new AudioCtx();
    mediaSourceNode = audioContext.createMediaElementSource(videoPlayer);
    bassFilter = audioContext.createBiquadFilter();
    midFilter = audioContext.createBiquadFilter();
    trebleFilter = audioContext.createBiquadFilter();
    stereoPanner = audioContext.createStereoPanner ? audioContext.createStereoPanner() : null;
    analyserNode = audioContext.createAnalyser();
    preampGain = audioContext.createGain();
    eqFilters = EQ_FREQUENCIES.map((frequency) => {
      const filter = audioContext.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = frequency;
      filter.Q.value = frequency <= 125 ? 0.9 : frequency <= 1000 ? 1.0 : 0.95;
      filter.gain.value = 0;
      return filter;
    });

    bassFilter.type = "lowshelf";
    bassFilter.frequency.value = 140;
    midFilter.type = "peaking";
    midFilter.frequency.value = 1000;
    midFilter.Q.value = 0.85;
    trebleFilter.type = "highshelf";
    trebleFilter.frequency.value = 4200;
    analyserNode.fftSize = 128;
    analyserNode.smoothingTimeConstant = 0.82;

    mediaSourceNode.connect(bassFilter);
    bassFilter.connect(midFilter);
    midFilter.connect(trebleFilter);
    trebleFilter.connect(preampGain);
    let eqTail = preampGain;
    eqFilters.forEach(filter => { eqTail.connect(filter); eqTail = filter; });
    if (stereoPanner) {
      eqTail.connect(stereoPanner);
      stereoPanner.connect(analyserNode);
    } else {
      eqTail.connect(analyserNode);
    }
    analyserNode.connect(audioContext.destination);
    audioEngineReady = true;
    audioEngineStatus.innerHTML = "<i></i> Motor de audio activo";
    eqEngineStatus.innerHTML = "<i></i> Ecualizador activo";
    applyAudioSettings();
    return true;
  } catch (error) {
    audioEngineStatus.innerHTML = "<i></i> Audio avanzado no disponible";
    audioEngineStatus.classList.add("error");
    return false;
  }
}

function connectExternalAudioEngine() {
  if (!audioEngineReady || externalAudioSourceNode) return;
  try {
    externalAudioSourceNode = audioContext.createMediaElementSource(externalAudio);
    externalAudioSourceNode.connect(bassFilter);
  } catch {}
}

function applyAudioSettings() {
  if (!audioEngineReady) return;
  bassFilter.gain.value = Number(bassBar.value);
  trebleFilter.gain.value = Number(trebleBar.value);
  if (preampGain) preampGain.gain.value = Math.pow(10, Number(preampBar.value) / 20);
  eqFilters.forEach((filter, index) => { filter.gain.value = Number(eqBandInputs[index]?.value || 0); });
  if (stereoPanner) stereoPanner.pan.value = Number(balanceBar.value);
  updateEqLabels();
}

function updateAudioLabels() {
  const bass = Number(bassBar.value);
  const treble = Number(trebleBar.value);
  const balance = Number(balanceBar.value);
  bassValue.textContent = `${bass > 0 ? "+" : ""}${bass} dB`;
  trebleValue.textContent = `${treble > 0 ? "+" : ""}${treble} dB`;
  if (Math.abs(balance) < 0.03) balanceValue.textContent = "Centro";
  else balanceValue.textContent = balance < 0 ? `Izquierda ${Math.round(Math.abs(balance)*100)}%` : `Derecha ${Math.round(balance*100)}%`;
}

function updateEqLabels() {
  const pre = Number(preampBar.value);
  preampValue.textContent = `${pre > 0 ? "+" : ""}${pre} dB`;
  eqBandInputs.forEach((input) => {
    const value = Number(input.value);
    const output = input.parentElement.querySelector("b");
    if (output) output.textContent = value > 0 ? `+${value}` : String(value);
  });
}

function setAudioPreset(name, save = true) {
  const presets = {
    flat:   { bass:0, treble:0, preamp:0, bands:[0,0,0,0,0,0,0,0,0,0] },
    bass:   { bass:7, treble:2, preamp:-2, bands:[7,6,5,3,1,0,0,0,0,0] },
    vocal:  { bass:-2, treble:4, preamp:0, bands:[-2,-2,-1,2,5,6,5,3,1,0] },
    treble: { bass:0, treble:7, preamp:-2, bands:[0,0,0,0,1,2,4,6,7,6] },
    night:  { bass:-5, treble:-4, preamp:1, bands:[-4,-3,-2,-1,0,2,1,-1,-3,-5] },
    rock:   { bass:4, treble:4, preamp:-2, bands:[5,4,2,-1,-2,0,2,4,5,4] },
    electronic: { bass:6, treble:6, preamp:-3, bands:[6,5,2,0,-1,1,3,5,6,5] },
    acoustic: { bass:2, treble:3, preamp:-1, bands:[2,2,1,1,2,3,3,2,2,3] }
  };
  const values = presets[name] || presets.flat;
  bassBar.value = String(values.bass);
  trebleBar.value = String(values.treble);
  balanceBar.value = "0";
  preampBar.value = String(values.preamp);
  eqBandInputs.forEach((input, index) => input.value = String(values.bands[index] || 0));
  presetButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.preset === name));
  eqProfileStatus.textContent = `Perfil: ${name.charAt(0).toUpperCase()+name.slice(1)}`;
  updateAudioLabels();
  applyAudioSettings();
  if (save) saveAudioPrefs();
}

function saveAudioPrefs() {
  try {
    localStorage.setItem(AUDIO_PREFS_KEY, JSON.stringify({
      preset: presetButtons.find(btn => btn.classList.contains("active"))?.dataset.preset || "flat",
      bass: Number(bassBar.value),
      treble: Number(trebleBar.value),
      balance: Number(balanceBar.value),
      preamp: Number(preampBar.value),
      bands: eqBandInputs.map(input => Number(input.value))
    }));
  } catch {}
}

function loadAudioPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(AUDIO_PREFS_KEY) || "{}");
    if (Number.isFinite(p.bass)) bassBar.value = String(Math.max(-12, Math.min(12, p.bass)));
    if (Number.isFinite(p.treble)) trebleBar.value = String(Math.max(-12, Math.min(12, p.treble)));
    if (Number.isFinite(p.balance)) balanceBar.value = String(Math.max(-1, Math.min(1, p.balance)));
    if (Number.isFinite(p.preamp)) preampBar.value = String(Math.max(-12, Math.min(12, p.preamp)));
    if (Array.isArray(p.bands)) p.bands.slice(0,10).forEach((value,index)=>{ if(Number.isFinite(value)) eqBandInputs[index].value=String(Math.max(-12,Math.min(12,value))); });
    const preset = ["flat","bass","vocal","treble","night","rock","electronic","acoustic"].includes(p.preset) ? p.preset : "flat";
    presetButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.preset === preset));
    eqProfileStatus.textContent = `Perfil: ${preset.charAt(0).toUpperCase()+preset.slice(1)}`;
  } catch {}
  updateAudioLabels();
  updateEqLabels();
}

function updateAdvancedAudioUI() {
  if (advancedAudioBody) advancedAudioBody.hidden = !advancedAudioOpen;
  if (equalizerPanel) equalizerPanel.hidden = !advancedAudioOpen || !currentMedia || currentMedia.type !== "audio";
  if (advancedAudioToggle) {
    advancedAudioToggle.setAttribute("aria-expanded", String(advancedAudioOpen));
    const label = advancedAudioToggle.querySelector("span");
    const icon = advancedAudioToggle.querySelector("i");
    if (label) label.textContent = advancedAudioOpen ? "Ocultar" : "Mostrar";
    if (icon) icon.textContent = advancedAudioOpen ? "⌃" : "⌄";
  }
}

function showAudioPanel(show) {
  audioPanel.hidden = !show;
  if (!show) advancedAudioOpen = false;
  updateAdvancedAudioUI();
}

if (advancedAudioToggle) {
  advancedAudioToggle.addEventListener("click", () => {
    if (!currentMedia || currentMedia.type !== "audio") return;
    advancedAudioOpen = !advancedAudioOpen;
    updateAdvancedAudioUI();
  });
}


function saveMediaOptionsPrefs() {
  try { localStorage.setItem(MEDIA_PREFS_KEY, JSON.stringify({size: subtitleSizeSelect.value, background: subtitleBackgroundToggle.checked})); } catch {}
}
function loadMediaOptionsPrefs() {
  try {
    const p=JSON.parse(localStorage.getItem(MEDIA_PREFS_KEY)||"{}");
    if (["small","medium","large","xlarge"].includes(p.size)) subtitleSizeSelect.value=p.size;
    if (typeof p.background === "boolean") subtitleBackgroundToggle.checked=p.background;
  } catch {}
  applySubtitleStyle(false);
}
function applySubtitleStyle(save=true) {
  ["subtitle-small","subtitle-medium","subtitle-large","subtitle-xlarge","subtitle-no-bg"].forEach(c=>videoPlayer.classList.remove(c));
  videoPlayer.classList.add(`subtitle-${subtitleSizeSelect.value}`);
  if (!subtitleBackgroundToggle.checked) videoPlayer.classList.add("subtitle-no-bg");
  if (save) saveMediaOptionsPrefs();
}
function clearSubtitles(clearSaved=false) {
  if (subtitleTrackElement) { try { subtitleTrackElement.track.mode="disabled"; } catch {} subtitleTrackElement.remove(); }
  subtitleTrackElement=null;
  if (subtitleObjectUrl) URL.revokeObjectURL(subtitleObjectUrl);
  subtitleObjectUrl=null; subtitleFileName=""; subtitleEnabled=false;
  subtitleStatus.textContent="Sin subtítulos cargados";
  subtitleToggleButton.textContent="Subtítulos: OFF";
  subtitleToggleButton.classList.remove("active");
  subtitleToggleButton.disabled=true; subtitleRemoveButton.disabled=true;
  if(clearSaved && currentMedia){ delete currentMedia.subtitleVtt; delete currentMedia.subtitleName; dbPut(currentMedia).catch(()=>{}); }
}
function cleanSubtitleText(text) { return String(text||"").replace(/^\u0000+/g,"").replace(/\r/g,"").replace(/\uFEFF/g,"").trim(); }
function assTimeToVtt(value) {
  const m=String(value).trim().match(/^(\d+):(\d{1,2}):(\d{1,2})[.](\d{1,3})$/);
  if(!m)return null;
  return `${String(m[1]).padStart(2,"0")}:${String(m[2]).padStart(2,"0")}:${String(m[3]).padStart(2,"0")}.${String(m[4]).padEnd(3,"0")}`;
}
function srtToVtt(text) {
  const blocks=cleanSubtitleText(text).split(/\n\s*\n/).map(b=>b.trim()).filter(Boolean), cues=[];
  for(const block of blocks){
    const lines=block.split("\n"), ti=lines.findIndex(line=>line.includes("-->")); if(ti<0)continue;
    const timing=lines[ti].replace(/,/g,".").trim(), body=lines.slice(ti+1).join("\n").trim(); if(!body)continue;
    cues.push(`${timing}\n${body}`);
  }
  return `WEBVTT\n\n${cues.join("\n\n")}\n`;
}
function assToVtt(text) {
  const cues=[];
  for(const line of cleanSubtitleText(text).split("\n")){
    if(!/^Dialogue\s*:/i.test(line))continue;
    const parts=line.replace(/^Dialogue\s*:\s*/i,"").split(","); if(parts.length<10)continue;
    const start=assTimeToVtt(parts[1]), end=assTimeToVtt(parts[2]); if(!start||!end)continue;
    const body=parts.slice(9).join(",").replace(/\{[^}]*\}/g,"").replace(/\\N/g,"\n").replace(/\\n/g,"\n").trim(); if(!body)continue;
    cues.push(`${start} --> ${end}\n${body}`);
  }
  return `WEBVTT\n\n${cues.join("\n\n")}\n`;
}
function attachSubtitleVtt(vtt, label="Subtítulos", save=true) {
  clearSubtitles();
  subtitleObjectUrl=URL.createObjectURL(new Blob([vtt],{type:"text/vtt;charset=utf-8"}));
  subtitleTrackElement=document.createElement("track"); subtitleTrackElement.kind="subtitles"; subtitleTrackElement.label=label; subtitleTrackElement.srclang="es"; subtitleTrackElement.src=subtitleObjectUrl; subtitleTrackElement.default=true;
  videoPlayer.appendChild(subtitleTrackElement);
  subtitleFileName=label;
  subtitleStatus.textContent=label;
  subtitleToggleButton.disabled=false; subtitleRemoveButton.disabled=false; applySubtitleStyle(false);
  subtitleTrackElement.addEventListener("load",()=>setSubtitleEnabled(true),{once:true});
  setTimeout(()=>setSubtitleEnabled(true),250);
  if(save && currentMedia){ currentMedia.subtitleVtt=vtt; currentMedia.subtitleName=label; dbPut(currentMedia).catch(()=>{}); }
}
async function loadSubtitleFile(file) {
  if(!file||!currentMedia||currentMedia.type!=="video"){showToast("Selecciona un vídeo antes de cargar subtítulos");return;}
  try{
    const text=await file.text(), ext=(file.name.split(".").pop()||"").toLowerCase();
    let vtt=cleanSubtitleText(text);
    if(ext==="srt")vtt=srtToVtt(vtt); else if(ext==="ass")vtt=assToVtt(vtt); else if(!/^WEBVTT/i.test(vtt))vtt=`WEBVTT\n\n${vtt}`;
    if(!/^WEBVTT/i.test(vtt)||!vtt.includes("-->"))throw new Error("invalid subtitles");
    attachSubtitleVtt(vtt,file.name);
    showToast(`Subtítulos cargados: ${file.name}`);
  }catch{showToast("No se pudo cargar el archivo de subtítulos");}
}
function restoreSavedSubtitles() {
  if(currentMedia?.type!=="video" || !currentMedia.subtitleVtt) return;
  try { attachSubtitleVtt(currentMedia.subtitleVtt,currentMedia.subtitleName||"Subtítulos guardados",false); } catch {}
}

function setSubtitleEnabled(enabled){
  subtitleEnabled=!!enabled&&!!subtitleTrackElement;
  if(subtitleTrackElement?.track)subtitleTrackElement.track.mode=subtitleEnabled?"showing":"disabled";
  subtitleToggleButton.textContent=`Subtítulos: ${subtitleEnabled?"ON":"OFF"}`; subtitleToggleButton.classList.toggle("active",subtitleEnabled);
}
function clearExternalAudio(){
  if(externalAudio){externalAudio.pause();externalAudio.removeAttribute("src");externalAudio.load();}
  if(externalAudioUrl)URL.revokeObjectURL(externalAudioUrl);
  externalAudioUrl=null; externalAudioActive=false;
  audioTrackStatus.textContent="Pista original del vídeo"; audioTrackRemoveButton.disabled=true; audioTrackLoadButton.disabled=currentMedia?.type!=="video";
  externalAudio.volume=Number(volumeBar.value); externalAudio.muted=videoPlayer.muted; videoPlayer.volume=Number(volumeBar.value);
  audioTrackNote.textContent="Puedes cargar una pista de audio externa para sustituir el audio original del vídeo y mantenerla sincronizada.";
}
async function loadExternalAudioFile(file){
  if(!file||!currentMedia||currentMedia.type!=="video"){showToast("Selecciona un vídeo antes de cargar una pista de audio");return;}
  if(!isAudio(file)){showToast("Selecciona un archivo de audio compatible");return;}
  clearExternalAudio(); externalAudioUrl=URL.createObjectURL(file); externalAudio.src=externalAudioUrl; externalAudio.volume=Number(volumeBar.value); externalAudio.muted=videoPlayer.muted; externalAudio.playbackRate=videoPlayer.playbackRate;
  ensureAudioEngine(); connectExternalAudioEngine(); externalAudioActive=true; videoPlayer.volume=0;
  audioTrackStatus.textContent=`${file.name} • pista externa`; audioTrackRemoveButton.disabled=false; audioTrackNote.textContent="Pista externa activa. El audio original del vídeo está silenciado.";
  showToast(`Pista cargada: ${file.name}`); if(!videoPlayer.paused)syncExternalAudio(true);
}
function syncExternalAudio(force=false){
  if(!externalAudioActive||!Number.isFinite(videoPlayer.currentTime))return;
  if(force||Math.abs((externalAudio.currentTime||0)-videoPlayer.currentTime)>0.35){try{externalAudio.currentTime=videoPlayer.currentTime;}catch{}}
  externalAudio.playbackRate=videoPlayer.playbackRate;
}
function syncMediaOptionsForCurrent(){
  const isVideoNow=currentMedia?.type==="video"; mediaOptionsPanel.hidden=!isVideoNow; mediaOptionsStatus.textContent=isVideoNow?"VIDEO":"AUDIO"; subtitleLoadButton.disabled=!isVideoNow; audioTrackLoadButton.disabled=!isVideoNow;
}

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB no disponible"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(PLAYLIST_STORE)) {
        db.createObjectStore(PLAYLIST_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function dbGetAll() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function dbPut(item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbDelete(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbClear() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function playlistGetAll() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PLAYLIST_STORE, "readonly");
    const request = tx.objectStore(PLAYLIST_STORE).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}
async function playlistPut(item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PLAYLIST_STORE, "readwrite");
    tx.objectStore(PLAYLIST_STORE).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function playlistDelete(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PLAYLIST_STORE, "readwrite");
    tx.objectStore(PLAYLIST_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
function renderPlaylistSelect() {
  playlistSelect.innerHTML = `<option value="">Todas las canciones</option>` + playlists.map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)} • ${p.items.length}</option>`).join("");
  playlistSelect.value = playlists.some(p => p.id === activePlaylistId) ? activePlaylistId : "";
  activePlaylistId = playlistSelect.value;
  const active = playlists.find(p => p.id === activePlaylistId);
  addCurrentToPlaylistButton.disabled = !active || !currentMedia;
  renamePlaylistButton.disabled = !active;
  duplicatePlaylistButton.disabled = !active;
  deletePlaylistButton.disabled = !active;
  addVisibleToPlaylistButton.disabled = !active;
  if (typeof updateSelectionUI === "function") updateSelectionUI();
  const folderLabel = activeFolderPath ? ` • Carpeta: ${activeFolderPath}` : "";
  collectionSummary.textContent = active ? `${active.items.length} elemento${active.items.length===1?"":"s"} en «${active.name}»${folderLabel}.` : (playlists.length ? `${playlists.length} playlist${playlists.length===1?"":"s"} disponible${playlists.length===1?"":"s"}${folderLabel}.` : `Crea una playlist o selecciona una carpeta para organizar tu biblioteca${folderLabel}.`);
}
async function loadPlaylists() {
  try { playlists = await playlistGetAll(); playlists.sort((a,b)=>(a.createdAt||0)-(b.createdAt||0)); }
  catch { playlists = []; }
  renderPlaylistSelect();
}

function renderFolderSelect() {
  const folders = new Map();
  for (const item of mediaFiles) {
    const raw = item.folder || "";
    if (!raw) continue;
    const parts = raw.split("/").filter(Boolean);
    if (parts.length < 2) continue;
    parts.pop();
    for (let i = 1; i <= parts.length; i++) {
      const path = parts.slice(0, i).join("/");
      folders.set(path, (folders.get(path) || 0) + 1);
    }
  }
  const entries = [...folders.entries()].sort((a,b)=>a[0].localeCompare(b[0],undefined,{numeric:true,sensitivity:"base"}));
  folderSelect.innerHTML = `<option value="">Todas las carpetas</option>` + entries.map(([path,count]) => `<option value="${escapeHtml(path)}">${escapeHtml(path)} • ${count}</option>`).join("");
  folderSelect.value = folders.has(activeFolderPath) ? activeFolderPath : "";
  activeFolderPath = folderSelect.value;
}

async function renameActivePlaylist() {
  const pl = playlists.find(p=>p.id===activePlaylistId);
  if (!pl) return;
  const name = prompt("Nuevo nombre de la playlist:", pl.name);
  if (!name || !name.trim()) return;
  pl.name = name.trim().slice(0,60);
  try { await playlistPut(pl); renderPlaylistSelect(); renderPlaylist(); showToast(`Playlist renombrada: ${pl.name}`); }
  catch { showToast("No se pudo renombrar la playlist"); }
}

async function duplicateActivePlaylist() {
  const pl = playlists.find(p=>p.id===activePlaylistId);
  if (!pl) return;
  const item = { id:`pl-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, name:`${pl.name} (copia)`.slice(0,60), createdAt:Date.now(), items:[...pl.items] };
  try { await playlistPut(item); playlists.push(item); activePlaylistId=item.id; renderPlaylistSelect(); renderPlaylist(); showToast(`Playlist duplicada: ${item.name}`); }
  catch { showToast("No se pudo duplicar la playlist"); }
}

async function addVisibleToPlaylist() {
  const pl = playlists.find(p=>p.id===activePlaylistId);
  if (!pl) return;
  const visible = visibleItems().map(({item})=>item.id);
  const existing = new Set(pl.items);
  const additions = visible.filter(id=>!existing.has(id));
  if (!additions.length) { showToast("No hay archivos nuevos para añadir"); return; }
  pl.items.push(...additions);
  try { await playlistPut(pl); renderPlaylistSelect(); renderPlaylist(); showToast(`${additions.length} archivo${additions.length===1?"":"s"} añadido${additions.length===1?"":"s"}`); }
  catch { showToast("No se pudo actualizar la playlist"); }
}

async function createPlaylist() {
  const name = prompt("Nombre de la nueva playlist:", "Mi playlist");
  if (!name || !name.trim()) return;
  const item = { id:`pl-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, name:name.trim().slice(0,60), createdAt:Date.now(), items:[] };
  try { await playlistPut(item); playlists.push(item); activePlaylistId=item.id; renderPlaylistSelect(); renderPlaylist(); showToast(`Playlist creada: ${item.name}`); }
  catch { showToast("No se pudo crear la playlist"); }
}
async function addCurrentToPlaylist() {
  if (!currentMedia || !activePlaylistId) return;
  const pl = playlists.find(p=>p.id===activePlaylistId); if (!pl) return;
  if (pl.items.includes(currentMedia.id)) { showToast("El archivo ya está en esta playlist"); return; }
  pl.items.push(currentMedia.id);
  try { await playlistPut(pl); renderPlaylistSelect(); renderPlaylist(); showToast(`Añadido a ${pl.name}`); } catch { showToast("No se pudo actualizar la playlist"); }
}
async function removeFromPlaylist(mediaId) {
  const pl=playlists.find(p=>p.id===activePlaylistId); if(!pl)return;
  pl.items=pl.items.filter(id=>id!==mediaId);
  try{await playlistPut(pl);renderPlaylistSelect();renderPlaylist();showToast("Quitado de la playlist");}catch{}
}
async function deleteActivePlaylist() {
  const pl=playlists.find(p=>p.id===activePlaylistId); if(!pl)return;
  if(!confirm(`¿Eliminar la playlist «${pl.name}»? Los archivos no se borrarán.`))return;
  try{await playlistDelete(pl.id);playlists=playlists.filter(x=>x.id!==pl.id);activePlaylistId="";renderPlaylistSelect();renderPlaylist();showToast("Playlist eliminada");}catch{showToast("No se pudo eliminar la playlist");}
}

function stripExtension(name){ return String(name||"").replace(/\.[^/.]+$/," ").trim(); }
function textQuality(text){
  const value=String(text||"").replace(/[\u0000\uFFFD]/g,"").trim();
  if(!value)return 0;
  const letters=(value.match(/[A-Za-zÀ-ÿ]/g)||[]).length;
  const cjk=(value.match(/[\u3400-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/g)||[]).length;
  const replacement=(String(text||"").match(/[\uFFFD]/g)||[]).length;
  return letters*2-cjk*4-replacement*12;
}
function decodeTextFrame(bytes, encoding, fallbackName=""){
  try{
    const candidates=[];
    if(encoding===1){
      candidates.push(new TextDecoder("utf-16").decode(bytes));
      candidates.push(new TextDecoder("utf-16le").decode(bytes));
    } else if(encoding===2){
      const swapped=new Uint8Array(bytes.length); for(let i=0;i+1<bytes.length;i+=2){swapped[i]=bytes[i+1];swapped[i+1]=bytes[i];}
      candidates.push(new TextDecoder("utf-16le").decode(swapped));
    } else {
      candidates.push(new TextDecoder("utf-8",{fatal:false}).decode(bytes));
      candidates.push(new TextDecoder("windows-1252").decode(bytes));
      candidates.push(new TextDecoder("iso-8859-1").decode(bytes));
    }
    const cleaned=candidates.map(v=>String(v||"").replace(/^\uFEFF|\u0000+|\u0000+$/g,"").trim()).filter(Boolean);
    if(!cleaned.length)return "";
    let best=cleaned.sort((a,b)=>textQuality(b)-textQuality(a))[0];
    // If metadata looks like unrelated CJK/mojibake while the filename is a clear Latin title, prefer filename.
    if(fallbackName && /[A-Za-zÀ-ÿ]/.test(fallbackName) && /[\u3400-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/.test(best) && !/[A-Za-zÀ-ÿ]{3,}/.test(best)) return "";
    return best;
  }catch{return "";}
}
function readSyncSafe(bytes, offset){ return ((bytes[offset]&0x7f)<<21)|((bytes[offset+1]&0x7f)<<14)|((bytes[offset+2]&0x7f)<<7)|(bytes[offset+3]&0x7f); }
function findZero(bytes,start){ for(let i=start;i<bytes.length;i++) if(bytes[i]===0) return i; return bytes.length; }
function parseID3v2(buffer, fallbackName=""){
  const bytes=new Uint8Array(buffer); const out={metaTitle:"",artist:"",album:"",coverBlob:null,coverMime:""};
  if(bytes.length<10 || String.fromCharCode(...bytes.slice(0,3))!=="ID3") return out;
  const version=bytes[3], tagSize=readSyncSafe(bytes,6); const end=Math.min(bytes.length,10+tagSize); let pos=10;
  while(pos+10<=end){
    const id=String.fromCharCode(...bytes.slice(pos,pos+4)); if(!/^[A-Z0-9]{4}$/.test(id)) break;
    const size=version>=4?readSyncSafe(bytes,pos+4):((bytes[pos+4]<<24)>>>0)+(bytes[pos+5]<<16)+(bytes[pos+6]<<8)+bytes[pos+7];
    if(!size || pos+10+size>end) break; const data=bytes.slice(pos+10,pos+10+size);
    if(id==="TIT2"||id==="TPE1"||id==="TALB"){ const text=decodeTextFrame(data.slice(1),data[0],fallbackName); if(id==="TIT2")out.metaTitle=text; if(id==="TPE1")out.artist=text; if(id==="TALB")out.album=text; }
    if(id==="APIC" && !out.coverBlob && data.length>5){
      const enc=data[0], mimeEnd=findZero(data,1), mime=decodeTextFrame(data.slice(1,mimeEnd),0)||"image/jpeg"; let p=mimeEnd+1; p++; // picture type
      let descEnd;
      if(enc===1||enc===2){ descEnd=p; while(descEnd+1<data.length && !(data[descEnd]===0&&data[descEnd+1]===0)) descEnd+=2; p=descEnd+2; }
      else { descEnd=findZero(data,p); p=descEnd+1; }
      if(p<data.length){ out.coverMime=mime.startsWith("image/")?mime:"image/jpeg"; out.coverBlob=new Blob([data.slice(p)],{type:out.coverMime}); }
    }
    pos+=10+size;
  }
  return out;
}
async function parseID3v1(file){
  try{ if(file.size<128)return {}; const buf=await file.slice(file.size-128).arrayBuffer(); const b=new Uint8Array(buf); if(String.fromCharCode(...b.slice(0,3))!=="TAG")return {}; const read=(s,n)=>new TextDecoder("iso-8859-1").decode(b.slice(s,s+n)).replace(/\0/g,"").trim(); return {metaTitle:read(3,30),artist:read(33,30),album:read(63,30)}; }catch{return {};}
}
async function extractAudioMetadata(file){
  const base={metaTitle:stripExtension(file.name),artist:"",album:"",coverBlob:null,coverMime:""};
  try{ const head=await file.slice(0,Math.min(file.size,12*1024*1024)).arrayBuffer(); Object.assign(base,parseID3v2(head,file.name)); }catch{}
  if(!base.metaTitle||base.metaTitle===stripExtension(file.name)){ const v1=await parseID3v1(file); if(v1.metaTitle)base.metaTitle=v1.metaTitle; if(v1.artist)base.artist=v1.artist; if(v1.album)base.album=v1.album; }
  const fallback=stripExtension(file.name);
  if(/[A-Za-zÀ-ÿ]/.test(fallback)){
    if(/[㐀-鿿぀-ヿ가-힯]/.test(base.metaTitle) && !/[A-Za-zÀ-ÿ]{3,}/.test(base.metaTitle)) base.metaTitle=fallback;
    if(/[㐀-鿿぀-ヿ가-힯]/.test(base.artist) && !/[A-Za-zÀ-ÿ]{3,}/.test(base.artist)) base.artist="";
    if(/[㐀-鿿぀-ヿ가-힯]/.test(base.album) && !/[A-Za-zÀ-ÿ]{3,}/.test(base.album)) base.album="";
  }
  return base;
}
function updateLyricsUI(){
  const has=!!(currentMedia?.type==="audio" && String(currentMedia.lyrics||"").trim());
  if(lyricsButton){ lyricsButton.hidden=!has; }
  if(lyricsTitle) lyricsTitle.textContent=currentMedia?.metaTitle || currentMedia?.name || "Letras";
  if(lyricsContent) lyricsContent.textContent=String(currentMedia?.lyrics||"").trim();
  if(lyricsEmpty) lyricsEmpty.hidden=has;
}
function toggleLyrics(show){
  if(!lyricsPanel)return;
  if(!currentMedia?.lyrics?.trim()){showToast("Esta canción no tiene letras guardadas");return;}
  lyricsPanel.hidden=!show;
  if(show) lyricsPanel.scrollIntoView({behavior:"smooth",block:"nearest"});
}

function updateNovaAudioIdentity(){
  if(!novaAudioCover||!currentMedia)return;
  const audio=currentMedia.type==="audio";
  novaAudioArtist.textContent=currentMedia.artist || "NOVA PLAYER";
  novaAudioAlbum.textContent=currentMedia.album || "Colección local";
  novaAudioCoverFallback.textContent=currentMedia.artist ? (currentMedia.artist.trim()[0]||"♫").toUpperCase() : "♫";
  novaAudioCover.classList.toggle("has-image",!!currentMedia.coverBlob);
  if(currentCoverUrl){URL.revokeObjectURL(currentCoverUrl);currentCoverUrl=null;}
  if(audio && currentMedia.coverBlob){ currentCoverUrl=URL.createObjectURL(currentMedia.coverBlob); novaAudioCoverImage.src=currentCoverUrl; }
  novaAudioCover.hidden=!audio; novaAudioMeta.hidden=!audio;
}
async function enrichCurrentAudioMetadata(item){
  if(!item||item.type!=="audio"||item.metadataLoaded||!item.blob)return;
  item.metadataLoaded=true;
  try{ const meta=await extractAudioMetadata(item.blob); Object.assign(item,meta); await dbPut(item); if(currentMedia?.id===item.id){ mediaTitle.textContent=item.metaTitle||item.name; trackSubline.textContent=[item.artist,item.album,formatBytes(item.size),"Reproducción continua"].filter(Boolean).join(" • "); updateNovaAudioIdentity(); updateLyricsUI(); } renderPlaylist(); }catch{}
}

function isAudio(file) {
  return file.type?.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac|flac|opus)$/i.test(file.name);
}
function isVideo(file) {
  return file.type?.startsWith("video/") || /\.(mp4|webm|mov|m4v|ogv)$/i.test(file.name);
}
function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const total = Math.floor(seconds), h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
  return h ? `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B","KB","MB","GB"], i = Math.min(Math.floor(Math.log(bytes)/Math.log(1024)), units.length-1);
  return `${(bytes/Math.pow(1024,i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}
function escapeHtml(value) {
  return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}
function fileId(file) {
  return `${file.webkitRelativePath || file.name}|${file.size}|${file.lastModified}`;
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}
function savePrefs() {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({
      volume: Number(volumeBar.value),
      shuffle: isShuffle,
      repeat: repeatMode,
      filter: activeFilter,
      search: searchInput.value,
      sort: sortSelect.value,
      playlist: activePlaylistId,
      folder: activeFolderPath,
      playbackRate: Number(videoPlayer.playbackRate) || 1
    }));
  } catch {}
}
function loadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
    if (Number.isFinite(p.volume)) volumeBar.value = String(Math.max(0, Math.min(1, p.volume)));
    isShuffle = !!p.shuffle;
    repeatMode = ["off","all","one"].includes(p.repeat) ? p.repeat : "off";
    shuffleButton.classList.toggle("active", isShuffle);
    if (p.filter && ["all","audio","video","favorites","history","rated"].includes(p.filter)) activeFilter = p.filter;
    if (typeof p.search === "string") searchInput.value = p.search;
    if (typeof p.playlist === "string") activePlaylistId = p.playlist;
    if (typeof p.folder === "string") activeFolderPath = p.folder;
    if (Number.isFinite(p.playbackRate)) videoPlayer.playbackRate = Math.max(.25, Math.min(2, p.playbackRate));
  } catch {}
  videoPlayer.volume = Number(volumeBar.value);
  volumeValue.textContent = `${Math.round(Number(volumeBar.value)*100)}%`;
  libraryTabs.forEach(tab => tab.classList.toggle("active", tab.dataset.filter === activeFilter));
  updateRepeatUI();
}
function updateRepeatUI() {
  repeatButton.textContent = repeatMode === "one" ? "↻¹" : "↻";
  repeatButton.classList.toggle("active", repeatMode !== "off");
  repeatButton.title = repeatMode === "off" ? "Repetición: desactivada" : repeatMode === "all" ? "Repetición: toda la cola" : "Repetición: archivo actual";
}
function releaseObjectUrl() {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = null;
  if (currentThumbUrl) URL.revokeObjectURL(currentThumbUrl);
  currentThumbUrl = null;
  if (currentCoverUrl) URL.revokeObjectURL(currentCoverUrl);
  currentCoverUrl = null;
  if (novaAudioCoverImage) novaAudioCoverImage.removeAttribute("src");
}
function makeThumbnail(file) {
  if (!file || !isVideo(file)) return;
  const temp = document.createElement("video");
  const url = URL.createObjectURL(file);
  temp.src = url;
  temp.muted = true;
  temp.preload = "metadata";
  temp.addEventListener("loadeddata", () => {
    try {
      temp.currentTime = Math.min(1, temp.duration || 0);
    } catch {}
  }, {once:true});
  temp.addEventListener("seeked", () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 640; canvas.height = 360;
      const ctx = canvas.getContext("2d");
      const scale = Math.min(canvas.width/temp.videoWidth, canvas.height/temp.videoHeight);
      const w = temp.videoWidth*scale, h = temp.videoHeight*scale;
      ctx.drawImage(temp, (canvas.width-w)/2, (canvas.height-h)/2, w, h);
      canvas.toBlob(blob => {
        if (!blob) return;
        if (currentThumbUrl) URL.revokeObjectURL(currentThumbUrl);
        currentThumbUrl = URL.createObjectURL(blob);
        videoThumbImage.src = currentThumbUrl;
        videoThumb.hidden = false;
      }, "image/jpeg", .78);
    } catch {}
    URL.revokeObjectURL(url);
  }, {once:true});
  temp.addEventListener("error", () => URL.revokeObjectURL(url), {once:true});
}
async function persistCurrent() {
  if (!currentMedia) return;
  currentMedia.position = Number(videoPlayer.currentTime) || 0;
  currentMedia.lastPlayed = Date.now();
  try { await dbPut(currentMedia); } catch {}
}
async function loadLibrary() {
  try {
    const records = await dbGetAll();
    records.sort((a,b) => (a.addedAt || 0) - (b.addedAt || 0));
    mediaFiles.push(...records);
    renderFolderSelect();
    renderPlaylist();
    const last = records.filter(x => Number.isFinite(x.lastPlayed)).sort((a,b) => b.lastPlayed-a.lastPlayed)[0];
    if (last) {
      const idx = mediaFiles.findIndex(x => x.id === last.id);
      if (idx >= 0) loadMedia(idx, false, true);
    }
  } catch {
    renderPlaylist();
    showToast("La biblioteca persistente no está disponible en este navegador");
  }
}

function openFilePicker() { fileInput.click(); }
function openFolderPicker() { folderInput.click(); }
addButton.addEventListener("click", openFilePicker);
emptyAddButton.addEventListener("click", openFilePicker);
addFilesButton.addEventListener("click", openFilePicker);
addFolderButton.addEventListener("click", openFolderPicker);
emptyFolderButton.addEventListener("click", openFolderPicker);

async function importFiles(selected) {
  if (!selected.length) return;
  let added = 0, skipped = 0;
  for (const file of selected) {
    if (!isAudio(file) && !isVideo(file)) { skipped++; continue; }
    const id = fileId(file);
    if (mediaFiles.some(item => item.id === id)) { skipped++; continue; }
    const item = {
      id, blob: file, name: file.name, size: file.size, type: isVideo(file) ? "video" : "audio",
      lastModified: file.lastModified, addedAt: Date.now(), favorite: false,
      lastPlayed: 0, position: 0, playCount: 0, duration: 0, rating: 0, tags: [], note: "",
      folder: file.webkitRelativePath || "", metaTitle: "", artist: "", album: "", lyrics: "", coverBlob: null, coverMime: "", metadataLoaded: false
    };
    try {
      if (item.type === "audio") Object.assign(item, await extractAudioMetadata(file));
      item.metadataLoaded = true;
      await dbPut(item); mediaFiles.push(item); added++;
    } catch { skipped++; }
  }
  renderFolderSelect();
  renderPlaylist();
  if (currentIndex === -1 && mediaFiles.length) loadMedia(mediaFiles.length-added, true);
  else if (added) showToast(`${added} archivo${added===1?"":"s"} guardado${added===1?"":"s"} en la biblioteca`);
  else if (skipped) showToast("No se añadieron archivos nuevos");
}
fileInput.addEventListener("change", async event => { await importFiles([...(event.target.files || [])]); fileInput.value=""; });
folderInput.addEventListener("change", async event => { await importFiles([...(event.target.files || [])]); folderInput.value=""; });

function loadMedia(index, autoplay=false, restorePosition=false) {
  ensureAudioEngine();
  if (index < 0 || index >= mediaFiles.length) return;
  if (currentMedia && currentMedia.id !== mediaFiles[index].id) persistCurrent();

  currentIndex = index;
  currentMedia = mediaFiles[index];
  clearSubtitles();
  clearExternalAudio();
  releaseObjectUrl();
  objectUrl = URL.createObjectURL(currentMedia.blob);

  videoPlayer.pause();
  videoPlayer.removeAttribute("src");
  videoPlayer.load();

  emptyMedia.hidden = true;
  videoThumb.hidden = true;
  mediaTitle.textContent = currentMedia.type === "audio" ? (currentMedia.metaTitle || currentMedia.name) : currentMedia.name;
  mediaType.textContent = currentMedia.type === "video" ? "VIDEO" : "AUDIO";
  mediaContainer.classList.toggle("audio-mode", currentMedia.type === "audio");
  mediaContainer.classList.toggle("video-mode", currentMedia.type === "video");
  if (trackSubline) trackSubline.textContent = currentMedia.type === "audio"
    ? [currentMedia.artist, currentMedia.album, formatBytes(currentMedia.size), "Reproducción continua"].filter(Boolean).join(" • ")
    : `${formatBytes(currentMedia.size)} • NOVA PLAYER`;
  updateNovaAudioIdentity();
  if (currentMedia.type === "audio" && !currentMedia.metadataLoaded) enrichCurrentAudioMetadata(currentMedia);
  showAudioPanel(currentMedia.type === "audio");
  favoriteButton.classList.toggle("active", !!currentMedia.favorite);
  favoriteButton.textContent = currentMedia.favorite ? "♥" : "♡";
  renderPlaylistSelect();
  progressBar.value = 0; currentTimeEl.textContent = "00:00"; durationEl.textContent = "00:00";
  statusPill.innerHTML = "<i></i> READY";

  if (currentMedia.type === "video") {
    showAudioPanel(false);
    audioArtwork.hidden = true;
    videoPlayer.hidden = false;
    videoThumb.hidden = true;
    videoThumbImage.removeAttribute("src");
    videoPlayer.src = objectUrl;
  } else {
    videoPlayer.hidden = false;
    audioArtwork.hidden = false;
    videoPlayer.src = objectUrl;
  }

  videoPlayer.load();
  syncMediaOptionsForCurrent();
  restoreSavedSubtitles();
  if (restorePosition && Number.isFinite(currentMedia.position) && currentMedia.position > 0) {
    const restore = () => {
      if (currentMedia.position < (videoPlayer.duration || Infinity)) videoPlayer.currentTime = currentMedia.position;
    };
    videoPlayer.addEventListener("loadedmetadata", restore, {once:true});
  }
  if (autoplay) videoPlayer.play().catch(() => showToast("Pulsa reproducir para iniciar"));
  renderPlaylist();
  updatePlayButton();
}

let novaVizFrame = 0;
let novaVizSmooth = [];
function animateNovaVisualizer() {
  cancelAnimationFrame(novaVizFrame);
  const bars = [...document.querySelectorAll("#audioWaveform span")];
  if (!bars.length) return;
  if (novaVizSmooth.length !== bars.length) novaVizSmooth = bars.map(() => 0.22);
  const data = analyserNode ? new Uint8Array(analyserNode.frequencyBinCount) : null;
  const tick = () => {
    const activeAudio = currentMedia?.type === "audio" && !videoPlayer.paused && !videoPlayer.ended;
    if (!activeAudio) {
      bars.forEach((bar, i) => {
        const idle = 0.24 + ((i % 5) * 0.035);
        novaVizSmooth[i] = idle;
        bar.style.transform = `scaleY(${idle})`;
      });
      novaVizFrame = 0;
      return;
    }
    if (data && analyserNode) {
      analyserNode.getByteFrequencyData(data);
      const usable = Math.max(8, Math.floor(data.length * 0.78));
      bars.forEach((bar, i) => {
        const startBin = Math.floor((i / bars.length) * usable);
        const endBin = Math.max(startBin + 1, Math.floor(((i + 1) / bars.length) * usable));
        let sum = 0;
        for (let b = startBin; b < endBin; b++) sum += data[b];
        const avg = sum / (endBin - startBin) / 255;
        const boost = Math.pow(avg, 0.72);
        const target = 0.28 + boost * 2.15;
        novaVizSmooth[i] += (target - novaVizSmooth[i]) * 0.28;
        bar.style.transform = `scaleY(${novaVizSmooth[i]})`;
      });
    }
    novaVizFrame = requestAnimationFrame(tick);
  };
  tick();
}

function updatePlayButton() {
  const playing = !videoPlayer.paused && !videoPlayer.ended && currentIndex !== -1;
  playButton.textContent = playing ? "❚❚" : "▶";
  playButton.title = playing ? "Pausar" : "Reproducir";
  playButton.setAttribute("aria-label", playing ? "Pausar" : "Reproducir");
  audioArtwork.classList.toggle("playing", playing && currentMedia?.type === "audio");
  if (currentIndex === -1) statusPill.innerHTML = "<i></i> READY";
  else statusPill.innerHTML = playing ? "<i></i> NOW PLAYING" : "<i></i> PAUSED";
  renderPlaylist();
  animateNovaVisualizer();
}
function togglePlay() {
  if (currentIndex === -1) {
    if (mediaFiles.length) loadMedia(0, true); else showToast("Añade un archivo primero");
    return;
  }
  if (videoPlayer.paused || videoPlayer.ended) videoPlayer.play().catch(() => showToast("Este formato no puede reproducirse en el navegador"));
  else videoPlayer.pause();
}
playButton.addEventListener("click", togglePlay);
videoPlayer.addEventListener("loadeddata", () => {
  if (currentMedia?.type === "video") videoThumb.hidden = true;
});
videoPlayer.addEventListener("playing", () => {
  if (currentMedia?.type === "video") videoThumb.hidden = true;
});
videoPlayer.addEventListener("play", async () => {
  if (externalAudioActive) { syncExternalAudio(true); externalAudio.play().catch(() => {}); }
  if (currentMedia) {
    currentMedia.playCount = (Number(currentMedia.playCount) || 0) + 1;
    currentMedia.lastPlayed = Date.now();
    try { await dbPut(currentMedia); } catch {}
  }
  updatePlayButton();
});
videoPlayer.addEventListener("pause", () => { if (externalAudioActive) externalAudio.pause(); updatePlayButton(); persistCurrent(); });
videoPlayer.addEventListener("seeking", () => syncExternalAudio(true));
videoPlayer.addEventListener("ratechange", () => { if (externalAudioActive) externalAudio.playbackRate = videoPlayer.playbackRate; });
videoPlayer.addEventListener("loadedmetadata", async () => {
  durationEl.textContent = formatTime(videoPlayer.duration);
  progressBar.max = Number.isFinite(videoPlayer.duration) ? videoPlayer.duration : 100;
  if (currentMedia && Number.isFinite(videoPlayer.duration) && videoPlayer.duration > 0 && currentMedia.duration !== videoPlayer.duration) {
    currentMedia.duration = videoPlayer.duration;
    try { await dbPut(currentMedia); } catch {}
    renderPlaylist();
  }
});
videoPlayer.addEventListener("timeupdate", () => {
  if (Number.isFinite(videoPlayer.duration)) {
    progressBar.value = videoPlayer.currentTime;
    currentTimeEl.textContent = formatTime(videoPlayer.currentTime);
  }
  if (externalAudioActive && !externalAudio.paused && Math.abs((externalAudio.currentTime||0) - videoPlayer.currentTime) > 0.45) syncExternalAudio(true);
  clearTimeout(savePositionTimer);
  savePositionTimer = setTimeout(persistCurrent, 1000);
});
videoPlayer.addEventListener("ended", () => { if (externalAudioActive) { externalAudio.pause(); try { externalAudio.currentTime = 0; } catch {} } handleMediaEnded(); });
videoPlayer.addEventListener("error", () => showToast("No se pudo reproducir este archivo en el navegador"));
progressBar.addEventListener("input", () => {
  if (Number.isFinite(videoPlayer.duration)) videoPlayer.currentTime = Number(progressBar.value);
});
rewindButton.addEventListener("click", () => { if (currentIndex !== -1) videoPlayer.currentTime = Math.max(0, videoPlayer.currentTime-10); });
forwardButton.addEventListener("click", () => {
  if (currentIndex === -1) return;
  const d = Number.isFinite(videoPlayer.duration) ? videoPlayer.duration : Infinity;
  videoPlayer.currentTime = Math.min(d, videoPlayer.currentTime+10);
});

function getNextIndex() {
  if (!mediaFiles.length) return -1;
  if (isShuffle && mediaFiles.length > 1) {
    let n=currentIndex; while(n===currentIndex) n=Math.floor(Math.random()*mediaFiles.length); return n;
  }
  return (currentIndex+1)%mediaFiles.length;
}
function getPreviousIndex() {
  if (!mediaFiles.length) return -1;
  if (isShuffle && mediaFiles.length > 1) {
    let n=currentIndex; while(n===currentIndex) n=Math.floor(Math.random()*mediaFiles.length); return n;
  }
  return (currentIndex-1+mediaFiles.length)%mediaFiles.length;
}
nextButton.addEventListener("click", () => { if(mediaFiles.length) loadMedia(getNextIndex(),true); });
previousButton.addEventListener("click", () => {
  if(!mediaFiles.length) return;
  if(videoPlayer.currentTime>3){videoPlayer.currentTime=0;return;}
  loadMedia(getPreviousIndex(),true);
});
function handleMediaEnded() {
  persistCurrent();
  if(sleepAfterCurrent){
    stopSleepTimer();
    updatePlayButton();
    showToast("Reproducción detenida al finalizar la pista");
    return;
  }
  if(repeatMode==="one"){videoPlayer.currentTime=0;videoPlayer.play().catch(()=>{});return;}
  if(repeatMode==="all"){loadMedia(getNextIndex(),true);return;}
  if(currentIndex<mediaFiles.length-1) loadMedia(currentIndex+1,true); else updatePlayButton();
}
shuffleButton.addEventListener("click",()=>{isShuffle=!isShuffle;shuffleButton.classList.toggle("active",isShuffle);savePrefs();showToast(isShuffle?"Aleatorio activado":"Aleatorio desactivado");});
repeatButton.addEventListener("click",()=>{repeatMode=repeatMode==="off"?"all":repeatMode==="all"?"one":"off";updateRepeatUI();savePrefs();showToast(repeatMode==="off"?"Repetición desactivada":repeatMode==="all"?"Repetir toda la cola":"Repetir archivo actual");});
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function updateVolumeUI() {
  const percent = Math.round(Number(volumeBar.value) * 100);
  volumeValue.textContent = `${percent}%`;
  muteButton.textContent = videoPlayer.muted ? "×" : percent === 0 ? "×" : "◖";
  muteButton.classList.toggle("active", videoPlayer.muted);
  muteButton.title = videoPlayer.muted ? "Activar sonido" : "Silenciar";
  muteButton.setAttribute("aria-label", muteButton.title);
}

function cycleSpeed() {
  const current = Number(videoPlayer.playbackRate) || 1;
  const next = SPEEDS[(SPEEDS.findIndex(v => Math.abs(v - current) < 0.001) + 1) % SPEEDS.length];
  videoPlayer.playbackRate = next;
  speedButton.textContent = `${next}×`;
  savePrefs();
  showToast(`Velocidad: ${next}×`);
}

volumeBar.addEventListener("input",()=>{
  const value=Number(volumeBar.value);
  if(externalAudioActive){videoPlayer.volume=0;externalAudio.volume=value;}else{videoPlayer.volume=value;}
  if(value>0&&videoPlayer.muted){videoPlayer.muted=false;externalAudio.muted=false;}
  updateVolumeUI(); savePrefs();
});

muteButton.addEventListener("click",()=>{
  videoPlayer.muted=!videoPlayer.muted; externalAudio.muted=videoPlayer.muted; updateVolumeUI();
});


subtitleLoadButton.addEventListener("click",()=>subtitleInput.click());
subtitleInput.addEventListener("change",async e=>{await loadSubtitleFile(e.target.files?.[0]);subtitleInput.value="";});
subtitleToggleButton.addEventListener("click",()=>setSubtitleEnabled(!subtitleEnabled));
subtitleRemoveButton.addEventListener("click",()=>{clearSubtitles(true);showToast("Subtítulos eliminados");});
subtitleSizeSelect.addEventListener("change",()=>applySubtitleStyle());
subtitleBackgroundToggle.addEventListener("change",()=>applySubtitleStyle());
audioTrackLoadButton.addEventListener("click",()=>audioTrackInput.click());
audioTrackInput.addEventListener("change",async e=>{await loadExternalAudioFile(e.target.files?.[0]);audioTrackInput.value="";});
audioTrackRemoveButton.addEventListener("click",()=>{clearExternalAudio();showToast("Pista externa eliminada");});

function formatTimer(seconds){
  const total=Math.max(0,Math.ceil(seconds));
  const h=Math.floor(total/3600);
  const m=Math.floor((total%3600)/60);
  const sec=total%60;
  return h?`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}
function updateSleepTimerUI(){
  const active=!!sleepTimerId;
  sleepTimerButton?.classList.toggle("active",active||sleepAfterCurrent);
  if(sleepAfterCurrent){
    sleepTimerStatus.textContent="Se detendrá al terminar esta pista";
  }else if(active){
    const remaining=Math.max(0,(sleepTimerEndsAt-Date.now())/1000);
    sleepTimerStatus.textContent=`Se detendrá en ${formatTimer(remaining)}`;
  }else{
    sleepTimerStatus.textContent="Temporizador desactivado";
  }
}
function stopSleepTimer(){
  if(sleepTimerId)clearTimeout(sleepTimerId);
  if(sleepTimerInterval)clearInterval(sleepTimerInterval);
  sleepTimerId=null; sleepTimerInterval=null; sleepTimerEndsAt=0; sleepAfterCurrent=false;
  updateSleepTimerUI();
}
function armSleepTimer(minutes){
  stopSleepTimer();
  sleepTimerEndsAt=Date.now()+minutes*60000;
  sleepTimerId=setTimeout(()=>{
    videoPlayer.pause();
    if(externalAudioActive)externalAudio.pause();
    stopSleepTimer();
    showToast("Temporizador: reproducción pausada");
  },minutes*60000);
  sleepTimerInterval=setInterval(updateSleepTimerUI,1000);
  updateSleepTimerUI();
  showToast(`Temporizador activado: ${minutes} min`);
}
function armSleepAfterCurrent(){
  if(sleepTimerId)stopSleepTimer();
  sleepAfterCurrent=true;
  updateSleepTimerUI();
  showToast("Se detendrá al terminar esta pista");
}
function openSmartPlayback(){
  if(smartPlayback)smartPlayback.hidden=false;
  updateSleepTimerUI();
}
sleepTimerButton?.addEventListener("click",openSmartPlayback);
sleepTimerClose?.addEventListener("click",()=>{smartPlayback.hidden=true;});
sleepTimerCancel?.addEventListener("click",()=>{stopSleepTimer();showToast("Temporizador cancelado");});
sleepEndCurrent?.addEventListener("click",armSleepAfterCurrent);
document.querySelectorAll("[data-sleep-min]").forEach(btn=>btn.addEventListener("click",()=>armSleepTimer(Number(btn.dataset.sleepMin))));

speedButton.addEventListener("click", cycleSpeed);
videoPlayer.addEventListener("volumechange", updateVolumeUI);
videoPlayer.volume=1;

favoriteButton.addEventListener("click",async()=>{
  if(!currentMedia)return;
  currentMedia.favorite=!currentMedia.favorite;
  favoriteButton.classList.toggle("active",currentMedia.favorite);
  favoriteButton.textContent=currentMedia.favorite?"♥":"♡";
  try{await dbPut(currentMedia);}catch{}
  renderPlaylist();
  showToast(currentMedia.favorite?"Añadido a favoritos":"Quitado de favoritos");
});

libraryTabs.forEach(tab=>tab.addEventListener("click",()=>{
  activeFilter=tab.dataset.filter;
  libraryTabs.forEach(t=>t.classList.toggle("active",t===tab));
  savePrefs(); renderPlaylist();
}));
searchInput.addEventListener("input",()=>{savePrefs();renderPlaylist();});

// V2.7 — Mobile app navigation
const mobileAppNav = document.getElementById("mobileAppNav");
const appNavItems = mobileAppNav ? [...mobileAppNav.querySelectorAll(".app-nav-item")] : [];
function setMobileNavActive(name){
  appNavItems.forEach(item=>item.classList.toggle("active", item.dataset.nav === name));
}
function navigateFromMobileApp(name){
  const library = document.querySelector(".library-card");
  const player = document.querySelector(".player-card");
  if(name === "home"){
    setMobileNavActive("home");
    window.scrollTo({top:0, behavior:"smooth"});
    return;
  }
  if(name === "library"){
    setMobileNavActive("library");
    library?.scrollIntoView({behavior:"smooth", block:"start"});
    return;
  }
  const filterMap = {audio:"audio", video:"video", favorites:"favorites"};
  if(filterMap[name]){
    const filter = filterMap[name];
    activeFilter = filter;
    libraryTabs.forEach(tab=>tab.classList.toggle("active", tab.dataset.filter === filter));
    savePrefs();
    renderPlaylist();
    setMobileNavActive(name);
    library?.scrollIntoView({behavior:"smooth", block:"start"});
  }
}
appNavItems.forEach(item=>item.addEventListener("click",()=>navigateFromMobileApp(item.dataset.nav)));

// V2.9.9 — Mini reproductor inteligente refinado.
// Regla: aparece únicamente cuando el reproductor principal deja de estar visible.
const novaMiniPlayer=document.getElementById("novaMiniPlayer");
const miniArt=document.getElementById("miniArt");
const miniInfo=document.getElementById("miniInfo");
const miniArtIcon=document.getElementById("miniArtIcon");
const miniType=document.getElementById("miniType");
const miniTitle=document.getElementById("miniTitle");
const miniProgressFill=document.getElementById("miniProgressFill");
const miniPlayButton=document.getElementById("miniPlayButton");
const miniCloseButton=document.getElementById("miniCloseButton");
let miniDismissed=false;
let playerVisible=true;
let miniLastMediaId=null;

function updateMiniPlayer(){
  if(!novaMiniPlayer)return;
  if(!currentMedia){
    novaMiniPlayer.hidden=true;
    miniLastMediaId=null;
    return;
  }

  // Si cambia la pista, el usuario vuelve a tener el mini player disponible.
  if(miniLastMediaId!==currentMedia.id){
    miniLastMediaId=currentMedia.id;
    miniDismissed=false;
  }

  miniType.textContent=currentMedia.type==="video"?"VÍDEO":"AUDIO";
  miniTitle.textContent=currentMedia.name||"Sin título";
  miniArtIcon.textContent=currentMedia.type==="video"?"▣":"♫";

  const mediaEl=currentMedia.type==="video"?videoPlayer:externalAudio;
  const duration=Number(mediaEl?.duration)||Number(currentMedia.duration)||0;
  const current=Number(mediaEl?.currentTime)||0;
  miniProgressFill.style.width=duration?Math.min(100,(current/duration)*100)+"%":"0%";

  const playing=!!mediaEl && !mediaEl.paused && !mediaEl.ended;
  miniPlayButton.textContent=playing?"Ⅱ":"▶";
  miniPlayButton.setAttribute("aria-label",playing?"Pausar":"Reproducir");
  novaMiniPlayer.classList.toggle("is-playing",playing);

  // hidden sigue siendo la fuente de verdad: no se muestra sobre el player principal.
  const shouldShow=!playerVisible&&!miniDismissed;
  novaMiniPlayer.classList.toggle("mini-visible",shouldShow);
  novaMiniPlayer.hidden=!shouldShow;
}

function miniScrollToPlayer(){
  miniDismissed=false;
  document.querySelector(".player-card")?.scrollIntoView({behavior:"smooth",block:"start"});
  updateMiniPlayer();
}

miniArt?.addEventListener("click",miniScrollToPlayer);
miniInfo?.addEventListener("click",miniScrollToPlayer);

miniPlayButton?.addEventListener("click",async()=>{
  const mediaEl=currentMedia?.type==="video"?videoPlayer:externalAudio;
  if(!mediaEl)return;
  try{
    if(mediaEl.paused) await mediaEl.play();
    else mediaEl.pause();
  }catch{}
  setTimeout(updateMiniPlayer,30);
});

miniCloseButton?.addEventListener("click",()=>{
  miniDismissed=true;
  updateMiniPlayer();
});

if("IntersectionObserver" in window){
  // Umbral bajo + rootMargin inferior: consideramos visible al reproductor
  // mientras conserve una presencia útil en pantalla, evitando parpadeos.
  const miniObserver=new IntersectionObserver(entries=>{
    const entry=entries[0];
    const ratio=entry?.intersectionRatio||0;
    playerVisible=!!entry?.isIntersecting && ratio>0.10;
    if(playerVisible)miniDismissed=false;
    updateMiniPlayer();
  },{threshold:[0,.1,.25,.5],rootMargin:"0px 0px -8% 0px"});
  const playerCard=document.querySelector(".player-card");
  if(playerCard)miniObserver.observe(playerCard);
}else{
  // Fallback para navegadores sin IntersectionObserver.
  const syncMiniVisibility=()=>{
    const rect=document.querySelector(".player-card")?.getBoundingClientRect();
    playerVisible=!!rect && rect.bottom>80 && rect.top<window.innerHeight-80;
    updateMiniPlayer();
  };
  window.addEventListener("scroll",syncMiniVisibility,{passive:true});
  window.addEventListener("resize",syncMiniVisibility);
  syncMiniVisibility();
}

["timeupdate","play","pause","loadedmetadata","ended"].forEach(evt=>{
  videoPlayer.addEventListener(evt,updateMiniPlayer);
  externalAudio.addEventListener(evt,updateMiniPlayer);
});

const miniRefresh=setInterval(updateMiniPlayer,800);
window.addEventListener("beforeunload",()=>clearInterval(miniRefresh));

async function removeMedia(index) {
  if(index<0||index>=mediaFiles.length)return;
  const removed=mediaFiles[index].name, wasCurrent=index===currentIndex, removedId=mediaFiles[index].id;
  try{await dbDelete(removedId);}catch{}
  mediaFiles.splice(index,1);

  if(!mediaFiles.length){
    currentIndex=-1;currentMedia=null;clearSubtitles();clearExternalAudio();videoPlayer.pause();releaseObjectUrl();videoPlayer.removeAttribute("src");videoPlayer.load();
    videoPlayer.hidden=true;audioArtwork.hidden=true;videoThumb.hidden=true;emptyMedia.hidden=false;
    mediaTitle.textContent="Selecciona un archivo";mediaType.textContent="SIN ARCHIVO";favoriteButton.classList.remove("active");favoriteButton.textContent="♡";
    progressBar.value=0;currentTimeEl.textContent="00:00";durationEl.textContent="00:00";statusPill.innerHTML="<i></i> READY";
  }else if(wasCurrent){
    loadMedia(Math.min(index,mediaFiles.length-1),false);
  }else if(index<currentIndex){currentIndex--;}
  renderPlaylist();showToast(`Eliminado: ${removed}`);
}

async function clearLibrary(){
  if(!mediaFiles.length){showToast("La biblioteca ya está vacía");return;}
  if(!confirm("¿Eliminar toda la biblioteca de NOVA PLAYER?"))return;
  try{await dbClear();}catch{}
  for(const pl of playlists){pl.items=[];try{await playlistPut(pl);}catch{}}
  mediaFiles.splice(0,mediaFiles.length);currentIndex=-1;currentMedia=null;clearSubtitles();clearExternalAudio();videoPlayer.pause();releaseObjectUrl();
  videoPlayer.removeAttribute("src");videoPlayer.load();videoPlayer.hidden=true;audioArtwork.hidden=true;videoThumb.hidden=true;emptyMedia.hidden=false;
  mediaTitle.textContent="Selecciona un archivo";mediaType.textContent="SIN ARCHIVO";favoriteButton.classList.remove("active");favoriteButton.textContent="♡";
  progressBar.value=0;currentTimeEl.textContent="00:00";durationEl.textContent="00:00";statusPill.innerHTML="<i></i> READY";
  activeFolderPath="";
  renderFolderSelect();
  renderPlaylist();showToast("Biblioteca limpiada");
}
sortSelect.addEventListener("change",()=>{savePrefs();renderPlaylist();});
clearButton.addEventListener("click",clearLibrary);

function visibleItems(){
  const q=searchInput.value.trim().toLowerCase();
  return mediaFiles.map((item,index)=>({item,index})).filter(({item})=>{
    const haystack=[item.name, ...(item.tags||[]), item.note||""].join(" ").toLowerCase();
    const search=haystack.includes(q);
    let filter=true;
    if(activeFilter==="audio")filter=item.type==="audio";
    if(activeFilter==="video")filter=item.type==="video";
    if(activeFilter==="favorites")filter=!!item.favorite;
    if(activeFilter==="history")filter=Number(item.lastPlayed)>0;
    if(activeFilter==="rated")filter=Number(item.rating)>0;
    if(activePlaylistId){ const pl=playlists.find(p=>p.id===activePlaylistId); filter=!!pl && pl.items.includes(item.id); }
    if(activeFolderPath){ const folder=item.folder || ""; filter = filter && (folder === activeFolderPath || folder.startsWith(activeFolderPath + "/")); }
    return search&&filter;
  }).sort((a,b)=>{
    switch(sortSelect.value){
      case "added-asc": return (a.item.addedAt||0)-(b.item.addedAt||0);
      case "name-asc": return a.item.name.localeCompare(b.item.name,undefined,{numeric:true,sensitivity:"base"});
      case "name-desc": return b.item.name.localeCompare(a.item.name,undefined,{numeric:true,sensitivity:"base"});
      case "size-desc": return (b.item.size||0)-(a.item.size||0);
      case "size-asc": return (a.item.size||0)-(b.item.size||0);
      case "played-desc": return (b.item.playCount||0)-(a.item.playCount||0) || (b.item.lastPlayed||0)-(a.item.lastPlayed||0);
      case "duration-desc": return (b.item.duration||0)-(a.item.duration||0);
      case "rating-desc": return (b.item.rating||0)-(a.item.rating||0) || (b.item.playCount||0)-(a.item.playCount||0);
      case "rating-asc": return (a.item.rating||0)-(b.item.rating||0) || a.item.name.localeCompare(b.item.name,undefined,{numeric:true,sensitivity:"base"});
      case "added-desc": default: return (b.item.addedAt||0)-(a.item.addedAt||0);
    }
  });
}
function selectedVisibleItems(){
  const visible = visibleItems();
  return visible.filter(({item}) => selectedMediaIds.has(item.id));
}
function updateSelectionUI(){
  if(!selectionMode) selectedMediaIds.clear();
  const count = selectedMediaIds.size;
  bulkToolbar.hidden = !selectionMode;
  selectionModeButton.classList.toggle("active", selectionMode);
  selectionModeButton.textContent = selectionMode ? "☑ Selección activa" : "☑ Seleccionar";
  selectedCount.textContent = String(count);
  const disabled = count === 0;
  bulkFavoriteButton.disabled = disabled;
  bulkDeleteButton.disabled = disabled;
  bulkPlaylistButton.disabled = disabled || !activePlaylistId;
  clearSelectionButton.disabled = disabled;
}
function toggleSelectionMode(force){
  selectionMode = typeof force === "boolean" ? force : !selectionMode;
  if(!selectionMode) selectedMediaIds.clear();
  updateSelectionUI();
  renderPlaylist();
}
function toggleSelected(id){
  if(!selectionMode) return;
  if(selectedMediaIds.has(id)) selectedMediaIds.delete(id); else selectedMediaIds.add(id);
  updateSelectionUI();
}
function selectAllVisible(){
  if(!selectionMode) toggleSelectionMode(true);
  visibleItems().forEach(({item})=>selectedMediaIds.add(item.id));
  updateSelectionUI(); renderPlaylist();
  showToast(`${selectedMediaIds.size} elemento${selectedMediaIds.size===1?"":"s"} seleccionado${selectedMediaIds.size===1?"":"s"}`);
}
function clearSelection(){ selectedMediaIds.clear(); updateSelectionUI(); renderPlaylist(); }
function formatDate(value){
  if(!value) return "—";
  try{return new Date(value).toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"});}catch{return "—";}
}
function openDetails(id){
  const item=mediaFiles.find(x=>x.id===id); if(!item)return;
  detailsMediaId=id;
  detailsTitle.textContent="Detalles del archivo";
  detailsIcon.textContent=item.type==="video"?"▣":"♫";
  detailsName.textContent=item.name;
  const folder=item.folder||"Raíz / importado como archivo";
  const rows=[
    ["Tipo",item.type==="video"?"Vídeo":"Audio"],
    ["Tamaño",formatBytes(item.size)],
    ["Duración",item.duration?formatTime(item.duration):"No detectada"],
    ["Reproducciones",String(item.playCount||0)],
    ["Carpeta",folder],
    ["Añadido",formatDate(item.addedAt)],
    ["Modificado",formatDate(item.lastModified)],
    ["Valoración",item.rating?`★ ${item.rating}/5`:"Sin valorar"],
    ["Etiquetas",(item.tags||[]).length?(item.tags||[]).join(", "):"Sin etiquetas"],
    ["Estado",item.favorite?"En favoritos":"Normal"]
  ];
  detailsGrid.innerHTML=rows.map(([k,v])=>`<div><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></div>`).join("");
  detailsRatingValue.textContent=item.rating?`★ ${item.rating}/5`:"Sin valorar";
  detailsRatingStars.querySelectorAll("button").forEach(btn=>{const r=Number(btn.dataset.rating);btn.textContent=r<=Number(item.rating)?"★":"☆";btn.classList.toggle("active",r<=Number(item.rating));});
  detailsTitleInput.value=item.metaTitle || (item.type === "audio" ? stripExtension(item.name) : item.name);
  detailsArtistInput.value=item.artist||"";
  detailsAlbumInput.value=item.album||"";
  detailsTagsInput.value=(item.tags||[]).join(", ");
  detailsNoteInput.value=item.note||"";
  if(detailsLyricsInput) detailsLyricsInput.value=item.lyrics||"";
  detailsFavoriteButton.textContent=item.favorite?"♥ Quitar favorito":"♡ Favorito";
  detailsPlayButton.textContent=currentMedia?.id===id?"▶ Volver a reproducir":"▶ Reproducir";
  detailsModal.hidden=false; detailsModal.setAttribute("aria-hidden","false");
}
async function saveDetailsMetadata(){
  const item=mediaFiles.find(x=>x.id===detailsMediaId); if(!item)return;
  const tags=[...new Set(detailsTagsInput.value.split(",").map(t=>t.trim().toLowerCase()).filter(Boolean))].slice(0,12);
  item.metaTitle=detailsTitleInput.value.trim().slice(0,180);
  item.artist=detailsArtistInput.value.trim().slice(0,120);
  item.album=detailsAlbumInput.value.trim().slice(0,120);
  item.tags=tags;
  item.note=detailsNoteInput.value.trim().slice(0,500);
  item.lyrics=detailsLyricsInput ? detailsLyricsInput.value.trim().slice(0,12000) : (item.lyrics||"");
  item.metadataLoaded=true;
  try{await dbPut(item);
    if(currentMedia?.id===item.id){
      mediaTitle.textContent=item.metaTitle || item.name;
      trackSubline.textContent=[item.artist,item.album,formatBytes(item.size),"Reproducción continua"].filter(Boolean).join(" • ");
      updateNovaAudioIdentity();
    }
    renderPlaylist(); openDetails(item.id); showToast("Metadatos guardados");}
  catch{showToast("No se pudieron guardar los metadatos");}
}
function setDetailsRating(rating){
  const item=mediaFiles.find(x=>x.id===detailsMediaId); if(!item)return;
  item.rating=Number(rating)||0;
  detailsRatingValue.textContent=item.rating?`★ ${item.rating}/5`:"Sin valorar";
  detailsRatingStars.querySelectorAll("button").forEach(btn=>{const r=Number(btn.dataset.rating);btn.textContent=r<=item.rating?"★":"☆";btn.classList.toggle("active",r<=item.rating);});
  dbPut(item).then(()=>{renderPlaylist();showToast(`Valoración: ${item.rating}/5`);}).catch(()=>showToast("No se pudo guardar la valoración"));
}

function closeDetails(){detailsModal.hidden=true;detailsModal.setAttribute("aria-hidden","true");detailsMediaId="";}
async function renameMediaById(id){
  const item=mediaFiles.find(x=>x.id===id); if(!item)return;
  const proposed=prompt("Nuevo nombre del archivo:",item.name); if(proposed===null)return;
  const name=proposed.trim(); if(!name){showToast("El nombre no puede estar vacío");return;}
  if(name===item.name)return;
  item.name=name.slice(0,180);
  try{await dbPut(item);}
  catch{showToast("No se pudo guardar el nuevo nombre");return;}
  if(currentMedia?.id===item.id){mediaTitle.textContent=item.name;fsTitle.textContent=item.name;}
  renderPlaylist();
  if(!detailsModal.hidden) openDetails(item.id);
  showToast("Nombre actualizado");
}
async function bulkFavorite(){
  if(!selectedMediaIds.size)return;
  const chosen=mediaFiles.filter(x=>selectedMediaIds.has(x.id));
  const makeFavorite=!chosen.every(x=>x.favorite);
  for(const item of chosen){item.favorite=makeFavorite;try{await dbPut(item);}catch{}}
  renderPlaylist();updateSelectionUI();
  showToast(makeFavorite?`${chosen.length} favoritos guardados`:`${chosen.length} favoritos quitados`);
}
async function bulkAddToPlaylist(){
  const pl=playlists.find(x=>x.id===activePlaylistId);
  if(!pl){showToast("Selecciona una playlist primero");return;}
  const before=pl.items.length;
  for(const id of selectedMediaIds) if(mediaFiles.some(x=>x.id===id)&&!pl.items.includes(id))pl.items.push(id);
  try{await playlistPut(pl);}catch{showToast("No se pudo actualizar la playlist");return;}
  renderPlaylistSelect();renderPlaylist();updateSelectionUI();
  showToast(`${pl.items.length-before} archivo${pl.items.length-before===1?"":"s"} añadido${pl.items.length-before===1?"":"s"} a ${pl.name}`);
}
async function bulkDelete(){
  const chosen=mediaFiles.filter(x=>selectedMediaIds.has(x.id)); if(!chosen.length)return;
  if(!confirm(`¿Eliminar ${chosen.length} archivo${chosen.length===1?"":"s"} de la biblioteca? Los archivos originales del teléfono no se borrarán.`))return;
  const ids=new Set(chosen.map(x=>x.id));
  for(const item of chosen){try{await dbDelete(item.id);}catch{}}
  for(const pl of playlists){pl.items=pl.items.filter(id=>!ids.has(id));try{await playlistPut(pl);}catch{}}
  const currentId=currentMedia?.id;
  mediaFiles.splice(0,mediaFiles.length,...mediaFiles.filter(x=>!ids.has(x.id)));
  selectedMediaIds.clear();
  if(currentId&&ids.has(currentId)){
    currentIndex=-1;currentMedia=null;clearSubtitles();clearExternalAudio();videoPlayer.pause();releaseObjectUrl();videoPlayer.removeAttribute("src");videoPlayer.load();videoPlayer.hidden=true;audioArtwork.hidden=true;videoThumb.hidden=true;emptyMedia.hidden=false;mediaTitle.textContent="Selecciona un archivo";mediaType.textContent="SIN ARCHIVO";favoriteButton.classList.remove("active");favoriteButton.textContent="♡";progressBar.value=0;currentTimeEl.textContent="00:00";durationEl.textContent="00:00";statusPill.innerHTML="<i></i> READY";
  } else if(currentMedia){currentIndex=mediaFiles.findIndex(x=>x.id===currentMedia.id);}
  renderFolderSelect();renderPlaylistSelect();renderPlaylist();updateSelectionUI();
  showToast(`${chosen.length} archivo${chosen.length===1?"":"s"} eliminado${chosen.length===1?"":"s"}`);
}
function showFolderParent(){
  if(!activeFolderPath)return;
  const parts=activeFolderPath.split("/").filter(Boolean);parts.pop();activeFolderPath=parts.join("/");folderSelect.value=activeFolderPath;savePrefs();renderPlaylist();renderPlaylistSelect();
}

function renderPlaylist(){
  const visible=visibleItems();
  const total=mediaFiles.reduce((s,x)=>s+x.size,0);
  const ac=mediaFiles.filter(x=>x.type==="audio").length, vc=mediaFiles.filter(x=>x.type==="video").length;
  playlistCount.textContent=String(mediaFiles.length);
  const played=mediaFiles.reduce((s,x)=>s+(Number(x.playCount)||0),0);
  libraryMeta.textContent=`${mediaFiles.length} archivo${mediaFiles.length===1?"":"s"} • ${ac} audio • ${vc} vídeo`;
  librarySize.textContent=`${formatBytes(total)} • ${played} reproducciones`;

  if(!visible.length){
    let msg="No hay archivos en la biblioteca.",hint="Añade música o vídeos para comenzar.",icon="◌";
    if(mediaFiles.length&&searchInput.value.trim()){msg="No hay coincidencias.";hint="Prueba con otro nombre.";icon="⌕";}
    else if(activeFilter==="favorites"){msg="No tienes favoritos.";hint="Pulsa ♥ para guardar una pista.";icon="♥";}
    else if(activeFilter==="history"){msg="Sin historial.";hint="Los archivos reproducidos aparecerán aquí.";icon="◷";}
    else if(activeFilter==="audio"){msg="No hay audio.";hint="Añade archivos de música.";icon="♫";}
    else if(activeFilter==="video"){msg="No hay vídeos.";hint="Añade archivos de vídeo.";icon="▣";}
    else if(activeFilter==="rated"){msg="Sin archivos valorados.";hint="Abre los detalles de un archivo y dale una valoración.";icon="★";}
    else if(activeFolderPath){msg="Carpeta vacía.";hint="No hay archivos dentro de esta carpeta con los filtros actuales.";icon="▣";}
    playlist.innerHTML=`<div class="playlist-empty"><span>${icon}</span><p>${msg}</p><small>${hint}</small></div>`;
    return;
  }

  playlist.innerHTML=visible.map(({item,index})=>{
    const active=index===currentIndex,icon=item.type==="video"?"▣":"♫";
    const now=active?`<span class="now"> • ${videoPlayer.paused?"EN PAUSA":"REPRODUCIENDO"}</span>`:"";
    const fav=item.favorite?" ♥":"";
    const history=item.lastPlayed?` • ${new Date(item.lastPlayed).toLocaleDateString(undefined,{day:"2-digit",month:"2-digit"})}`:"";
    const plays=Number(item.playCount)||0;
    const rating=Number(item.rating)||0;
    const ratingText=rating?` • ★ ${rating}/5`:"";
    const tags=item.tags?.length?` • #${item.tags.slice(0,3).map(t=>escapeHtml(t)).join(" #")}`:"";
    const duration=item.duration?` • ${formatTime(item.duration)}`:"";
    const folder=item.folder?` • ${escapeHtml(item.folder.split("/").slice(0,-1).join(" / "))}`:"";
    const selected=selectedMediaIds.has(item.id);
    const action=activePlaylistId ? `<button class="queue-add" type="button" title="Quitar de playlist" aria-label="Quitar de playlist">−</button>` : `<button class="queue-add" type="button" title="Añadir a playlist" aria-label="Añadir a playlist">＋</button>`;
    const selectionControl=selectionMode ? `<button class="select-check ${selected?"checked":""}" type="button" aria-label="${selected?"Quitar selección":"Seleccionar"}">${selected?"✓":""}</button>` : "";
    const displayTitle=item.type==="audio" ? (item.metaTitle || item.name) : item.name;
    const artist=item.artist ? ` • ${escapeHtml(item.artist)}` : "";
    return `<div class="playlist-item ${active?"active":""} ${selected?"selected":""}" data-index="${index}">
      ${selectionControl}<button class="media-icon ${item.coverBlob?"has-cover":""}" type="button" title="Reproducir">${item.coverBlob?'<span class="media-cover-mini"></span>':icon}</button>
      <button class="playlist-name" type="button" title="${escapeHtml(displayTitle)}">
        <strong>${escapeHtml(displayTitle)}${fav}${now}</strong>
        <small>${item.type.toUpperCase()}${artist} • ${formatBytes(item.size)}${duration} • ▶ ${plays}${ratingText}${history}${tags}${folder}</small>
      </button>
      <div class="item-actions"><button class="details-item" type="button" title="Detalles" aria-label="Detalles">ⓘ</button>${action}<button class="remove-item" type="button" title="Eliminar de biblioteca" aria-label="Eliminar de biblioteca">×</button></div>
    </div>`;
  }).join("");

  playlist.querySelectorAll(".playlist-item").forEach(row=>{
    const index=Number(row.dataset.index);
    row.querySelector(".media-icon").addEventListener("click",()=>loadMedia(index,true));
    row.querySelector(".playlist-name").addEventListener("click",()=>loadMedia(index,true));
    row.querySelector(".details-item").addEventListener("click",()=>openDetails(mediaFiles[index].id));
    row.querySelector(".remove-item").addEventListener("click",()=>removeMedia(index));
    row.querySelector(".queue-add").addEventListener("click",()=>activePlaylistId ? removeFromPlaylist(mediaFiles[index].id) : (currentMedia ? addCurrentToPlaylist() : showToast("Selecciona un archivo y una playlist")));
    const check=row.querySelector(".select-check");
    if(check)check.addEventListener("click",()=>toggleSelected(mediaFiles[index].id));
  });
  updateSelectionUI();
}


let locked = false;
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;
let gestureStartVolume = 1;
let gestureStartPosition = 0;
let gestureActive = false;
let gestureTimer = null;

function setLocked(value) {
  locked = value;
  playerCard.classList.toggle("locked", locked);
  mediaContainer.classList.toggle("locked", locked);
  unlockButton.hidden = !locked;
  lockButton.textContent = locked ? "⌁" : "⌁";
  lockButton.title = locked ? "Controles bloqueados" : "Bloquear controles";
  lockButton.setAttribute("aria-label", lockButton.title);
  showToast(locked ? "Controles bloqueados" : "Controles desbloqueados");
}

lockButton.addEventListener("click", () => setLocked(!locked));
unlockButton.addEventListener("click", () => setLocked(false));

function showGesture(message) {
  gestureHint.textContent = message;
  gestureHint.classList.add("show");
  clearTimeout(gestureTimer);
  gestureTimer = setTimeout(() => gestureHint.classList.remove("show"), 700);
}

function changeVolumeBy(delta) {
  const next = Math.max(0, Math.min(1, Number(videoPlayer.volume) + delta));
  videoPlayer.muted = false;
  videoPlayer.volume = next;
  volumeBar.value = String(next);
  updateVolumeUI();
  savePrefs();
}

function seekBy(delta) {
  if (currentIndex === -1) return;
  const duration = Number.isFinite(videoPlayer.duration) ? videoPlayer.duration : Infinity;
  videoPlayer.currentTime = Math.max(0, Math.min(duration, videoPlayer.currentTime + delta));
  showSkip(delta);
}

function showSkip(delta) {
  skipIndicator.textContent = `${delta >= 0 ? "+" : ""}${delta}s`;
  skipIndicator.classList.add("show");
  clearTimeout(showSkip.timer);
  showSkip.timer = setTimeout(() => skipIndicator.classList.remove("show"), 500);
}

mediaContainer.addEventListener("touchstart", event => {
  if (event.touches.length !== 1) return;
  const t = event.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
  touchStartTime = Date.now();
  gestureStartVolume = Number(videoPlayer.volume);
  gestureStartPosition = Number(videoPlayer.currentTime) || 0;
  gestureActive = false;
}, {passive:true});

mediaContainer.addEventListener("touchmove", event => {
  if (event.touches.length !== 1) return;
  const t = event.touches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;

  gestureActive = true;
  if (Math.abs(dx) > Math.abs(dy)) {
    const seconds = Math.round(dx / 18);
    seekBy(seconds);
    showGesture(`${seconds >= 0 ? "+" : ""}${seconds}s`);
  } else {
    const delta = -dy / Math.max(180, mediaContainer.clientHeight);
    const next = Math.max(0, Math.min(1, gestureStartVolume + delta));
    videoPlayer.muted = false;
    videoPlayer.volume = next;
    volumeBar.value = String(next);
    updateVolumeUI();
    showGesture(`Volumen ${Math.round(next * 100)}%`);
  }
}, {passive:true});

mediaContainer.addEventListener("touchend", event => {
  const elapsed = Date.now() - touchStartTime;
  if (!gestureActive && elapsed < 280 && !locked) {
    const rect = mediaContainer.getBoundingClientRect();
    const x = event.changedTouches[0].clientX - rect.left;
    if (x < rect.width * .33) seekBy(-10);
    else if (x > rect.width * .67) seekBy(10);
    else togglePlay();
  }
});

async function enterImmersiveFullscreen() {
  try {
    if (mediaContainer.requestFullscreen) {
      await mediaContainer.requestFullscreen();
    } else if (mediaContainer.webkitRequestFullscreen) {
      mediaContainer.webkitRequestFullscreen();
    } else if (videoPlayer.webkitEnterFullscreen && currentMedia?.type === "video") {
      videoPlayer.webkitEnterFullscreen();
    } else {
      showToast("Pantalla completa no disponible en este navegador");
      return;
    }

    fullscreenTopbar.hidden = false;
    if (currentMedia) fsTitle.textContent = currentMedia.name;
    fullscreenButton.textContent = "×";

    try {
      if (screen.orientation?.lock) {
        await screen.orientation.lock("landscape");
      }
    } catch (_) {
      // Android may reject orientation lock outside an installed app/fullscreen context.
    }
  } catch (_) {
    showToast("No se pudo activar pantalla completa");
  }
}

async function exitImmersiveFullscreen() {
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (videoPlayer.webkitExitFullscreen) {
      videoPlayer.webkitExitFullscreen();
    }
  } catch (_) {}

  fullscreenTopbar.hidden = true;
  fullscreenButton.textContent = "⛶";
  try {
    if (screen.orientation?.unlock) screen.orientation.unlock();
  } catch (_) {}
}

fullscreenButton.addEventListener("click", async () => {
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    await exitImmersiveFullscreen();
  } else {
    await enterImmersiveFullscreen();
  }
});

fsBackButton.addEventListener("click", exitImmersiveFullscreen);
fsLockButton.addEventListener("click", () => setLocked(!locked));

document.addEventListener("fullscreenchange", () => {
  const active = Boolean(document.fullscreenElement);
  fullscreenTopbar.hidden = !active;
  fullscreenButton.textContent = active ? "×" : "⛶";
  if (active && currentMedia) fsTitle.textContent = currentMedia.name;
  if (!active) {
    try { if (screen.orientation?.unlock) screen.orientation.unlock(); } catch (_) {}
  }
});

document.addEventListener("webkitfullscreenchange", () => {
  const active = Boolean(document.webkitFullscreenElement);
  fullscreenTopbar.hidden = !active;
  fullscreenButton.textContent = active ? "×" : "⛶";
});;
document.addEventListener("fullscreenchange",()=>fullscreenButton.textContent=document.fullscreenElement?"×":"⛶");

document.addEventListener("keydown",event=>{
  const tag=document.activeElement?.tagName;if(tag==="INPUT")return;
  if(event.code==="Space"){event.preventDefault();togglePlay();}
  if(event.code==="ArrowLeft"&&currentIndex!==-1)videoPlayer.currentTime=Math.max(0,videoPlayer.currentTime-5);
  if(event.code==="ArrowRight"&&currentIndex!==-1){const d=Number.isFinite(videoPlayer.duration)?videoPlayer.duration:Infinity;videoPlayer.currentTime=Math.min(d,videoPlayer.currentTime+5);}
  if(event.key.toLowerCase()==="m"){videoPlayer.muted=!videoPlayer.muted;updateVolumeUI();showToast(videoPlayer.muted?"Silenciado":"Sonido activado");}
  if(event.key.toLowerCase()==="f")fullscreenButton.click();
  if(event.key.toLowerCase()==="l")setLocked(!locked);
  if(event.key.toLowerCase()==="r")cycleSpeed();
});

bassBar.addEventListener("input", () => { updateAudioLabels(); applyAudioSettings(); saveAudioPrefs(); });
trebleBar.addEventListener("input", () => { updateAudioLabels(); applyAudioSettings(); saveAudioPrefs(); });
balanceBar.addEventListener("input", () => { updateAudioLabels(); applyAudioSettings(); saveAudioPrefs(); });
preampBar.addEventListener("input", () => { eqProfileStatus.textContent = "Perfil: Personalizado"; presetButtons.forEach(btn=>btn.classList.remove("active")); applyAudioSettings(); saveAudioPrefs(); });
eqBandInputs.forEach(input => input.addEventListener("input", () => { eqProfileStatus.textContent = "Perfil: Personalizado"; presetButtons.forEach(btn=>btn.classList.remove("active")); applyAudioSettings(); saveAudioPrefs(); }));
presetButtons.forEach(button => button.addEventListener("click", () => setAudioPreset(button.dataset.preset)));
audioResetButton.addEventListener("click", () => { setAudioPreset("flat"); showToast("Audio restablecido"); });
equalizerResetButton.addEventListener("click", () => { setAudioPreset("flat"); showToast("Ecualizador restablecido"); });
videoPlayer.addEventListener("play", () => ensureAudioEngine());


const visualizerBars = [...document.querySelectorAll(".visualizer span")];
function animateVisualizer() {
  if (!visualizerBars.length) return;
  if (analyserNode && !videoPlayer.paused && currentMedia?.type === "audio") {
    const data = new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteFrequencyData(data);
    const step = Math.max(1, Math.floor(data.length / visualizerBars.length));
    visualizerBars.forEach((bar, index) => {
      const value = data[Math.min(data.length - 1, index * step)] || 0;
      const height = 16 + (value / 255) * 78;
      bar.style.height = `${height}%`;
    });
  } else {
    visualizerBars.forEach((bar, index) => {
      const idle = 18 + ((index * 17) % 34);
      bar.style.height = `${idle}%`;
    });
  }
  requestAnimationFrame(animateVisualizer);
}

window.addEventListener("beforeunload",()=>{persistCurrent();releaseObjectUrl();});
loadPrefs();
loadAudioPrefs();
loadMediaOptionsPrefs();
playlistSelect.addEventListener("change",()=>{ activePlaylistId=playlistSelect.value; renderPlaylistSelect(); renderPlaylist(); savePrefs(); });
folderSelect.addEventListener("change",()=>{ activeFolderPath=folderSelect.value; renderPlaylistSelect(); renderPlaylist(); savePrefs(); });
createPlaylistButton.addEventListener("click",createPlaylist);
addCurrentToPlaylistButton.addEventListener("click",addCurrentToPlaylist);
renamePlaylistButton.addEventListener("click",renameActivePlaylist);
duplicatePlaylistButton.addEventListener("click",duplicateActivePlaylist);
addVisibleToPlaylistButton.addEventListener("click",addVisibleToPlaylist);
deletePlaylistButton.addEventListener("click",deleteActivePlaylist);
selectionModeButton.addEventListener("click",()=>toggleSelectionMode());
selectVisibleButton.addEventListener("click",selectAllVisible);
clearSelectionButton.addEventListener("click",clearSelection);
bulkFavoriteButton.addEventListener("click",bulkFavorite);
bulkPlaylistButton.addEventListener("click",bulkAddToPlaylist);
bulkDeleteButton.addEventListener("click",bulkDelete);
detailsBackdrop.addEventListener("click",closeDetails);
detailsCloseButton.addEventListener("click",closeDetails);
detailsRenameButton.addEventListener("click",()=>renameMediaById(detailsMediaId));
detailsFavoriteButton.addEventListener("click",async()=>{const item=mediaFiles.find(x=>x.id===detailsMediaId);if(!item)return;item.favorite=!item.favorite;try{await dbPut(item);}catch{}openDetails(item.id);renderPlaylist();});
detailsRatingStars.querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>setDetailsRating(btn.dataset.rating)));
detailsSaveMetadataButton.addEventListener("click",saveDetailsMetadata);
lyricsButton?.addEventListener("click",()=>toggleLyrics(true));
lyricsCloseButton?.addEventListener("click",()=>toggleLyrics(false));
detailsPlayButton.addEventListener("click",()=>{const idx=mediaFiles.findIndex(x=>x.id===detailsMediaId);if(idx>=0){closeDetails();loadMedia(idx,true);}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!detailsModal.hidden)closeDetails();});
settingsButton?.addEventListener("click",openSettings);
settingsBackdrop?.addEventListener("click",closeSettings);
settingsCloseButton?.addEventListener("click",closeSettings);
settingsDoneButton?.addEventListener("click",()=>{closeSettings();showToast("Personalización guardada");});
resetAppearanceButton?.addEventListener("click",resetAppearance);
accentChoices.forEach(button=>button.addEventListener("click",()=>{appearancePrefs.accent=button.dataset.accent;applyAppearance(true);}));
themeChoices.forEach(button=>button.addEventListener("click",()=>{appearancePrefs.theme=button.dataset.theme;applyAppearance(true);}));
densityChoices.forEach(button=>button.addEventListener("click",()=>{appearancePrefs.density=button.dataset.density;applyAppearance(true);}));
visualizerChoices.forEach(button=>button.addEventListener("click",()=>{appearancePrefs.visualizer=button.dataset.visualizer;applyAppearance(true);}));
motionToggle?.addEventListener("change",()=>{appearancePrefs.motion=motionToggle.checked;applyAppearance(true);});
rememberSectionToggle?.addEventListener("change",()=>{appearancePrefs.rememberSection=rememberSectionToggle.checked;applyAppearance(true);});
startupSelect?.addEventListener("change",()=>{appearancePrefs.startup=startupSelect.value;applyAppearance(true);});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!settingsModal.hidden)closeSettings();});
loadAppearancePrefs();

speedButton.textContent = `${videoPlayer.playbackRate}×`;
updateVolumeUI();
syncMediaOptionsForCurrent();
const initialSection=getStartupSection();
if(initialSection && initialSection!=="home") setTimeout(()=>navigateFromMobileApp(initialSection),80);

/* =========================================================
   NOVA PLAYER V3.2 — NOVA FLOW / SMART QUEUE + LYRICS
   ========================================================= */
let novaV3QueueClosed = false;
function setupNovaV3(){
  const queue=$("novaQueue"), backdrop=$("novaQueueBackdrop"), close=$("queueCloseButton"), trigger=$("queueButton");
  const list=$("novaQueueList"), nowTitle=$("queueNowTitle"), nowMeta=$("queueNowMeta"), nowArt=$("queueNowArt"), summary=$("novaQueueSummary");
  const nextBtn=$("queuePlayNextButton"), mixBtn=$("queueShuffleButton");
  if(!queue||!list)return;
  const openQueue=()=>{ if(!currentMedia && !mediaFiles.length){showToast("Añade música para llenar la cola");return;} queue.hidden=false; document.body.classList.add("nova-v3-queue-open"); novaV3QueueClosed=false; renderNovaV3Queue(); };
  const closeQueue=()=>{queue.hidden=true;document.body.classList.remove("nova-v3-queue-open");};
  trigger?.addEventListener("click",openQueue); backdrop?.addEventListener("click",closeQueue); close?.addEventListener("click",closeQueue);
  nextBtn?.addEventListener("click",()=>{ if(mediaFiles.length<2)return showToast("No hay otra pista en la cola"); loadMedia(getNextIndex(),true); renderNovaV3Queue(); });
  mixBtn?.addEventListener("click",()=>{ isShuffle=!isShuffle; shuffleButton.classList.toggle("active",isShuffle); savePrefs(); renderNovaV3Queue(); showToast(isShuffle?"Cola mezclada":"Orden normal activado"); });
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!queue.hidden)closeQueue();});
  window.novaV3OpenQueue=openQueue;
  window.novaV3CloseQueue=closeQueue;
  window.renderNovaV3Queue=renderNovaV3Queue;
  function renderNovaV3Queue(){
    if(!list)return;
    const count=mediaFiles.length;
    summary.textContent=count?`${count} ${count===1?"pista disponible":"pistas disponibles"} • ${isShuffle?"modo aleatorio":"orden de biblioteca"}`:"Tu próxima reproducción, en orden.";
    if(currentMedia){
      nowTitle.textContent=currentMedia.metaTitle||currentMedia.name;
      nowMeta.textContent=`${currentMedia.type.toUpperCase()} • ${formatBytes(currentMedia.size)} • ${formatTime(videoPlayer.currentTime||0)} / ${formatTime(videoPlayer.duration||0)}`;
      nowArt.textContent=currentMedia.type==="video"?"▣":"♫";
    }else{nowTitle.textContent="Sin reproducción";nowMeta.textContent="Añade música a tu biblioteca";nowArt.textContent="♫";}
    list.innerHTML="";
    if(!count){list.innerHTML='<div class="nova-v3-queue-empty">Tu cola está vacía.<br>Añade archivos desde la biblioteca.</div>';return;}
    const ordered=[];
    for(let step=1;step<=count;step++){
      const idx=isShuffle ? null : (currentIndex+step)%count;
      if(idx!==null) ordered.push(idx);
    }
    if(isShuffle){
      const rest=mediaFiles.map((_,i)=>i).filter(i=>i!==currentIndex);
      for(let i=rest.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]];}
      ordered.push(...rest);
    }
    const indexes=[...(currentIndex>=0?[currentIndex]:[]),...ordered.filter(i=>i!==currentIndex)];
    indexes.slice(0,Math.min(40,count)).forEach((idx,pos)=>{
      const item=mediaFiles[idx], button=document.createElement("button");
      button.type="button"; button.className=`nova-v3-queue-item ${idx===currentIndex?"current":""}`;
      const art=document.createElement("span"); art.className="queue-item-art"; art.textContent=item.type==="video"?"▣":"♫";
      const copy=document.createElement("span"); copy.className="queue-item-copy";
      const strong=document.createElement("strong"); strong.textContent=item.name;
      const small=document.createElement("small"); small.textContent=`${item.type.toUpperCase()} • ${formatBytes(item.size)}${idx===currentIndex?" • ACTUAL":""}`;
      copy.append(strong,small);
      const state=document.createElement("span"); state.className="queue-item-state"; state.textContent=idx===currentIndex?"AHORA":pos===1?"SIGUIENTE":"";
      button.append(art,copy,state); button.addEventListener("click",()=>{loadMedia(idx,true);}); list.appendChild(button);
    });
  }
  const originalLoadMedia=loadMedia;
  loadMedia=function(index,autoplay=false,restorePosition=false){const result=originalLoadMedia(index,autoplay,restorePosition);setTimeout(()=>{renderNovaV3Queue();},0);return result;};
  ["timeupdate","play","pause","ended","loadedmetadata"].forEach(type=>videoPlayer.addEventListener(type,()=>{if(!queue.hidden)renderNovaV3Queue();}));
}

loadLibrary();
loadPlaylists();
renderFolderSelect();
animateVisualizer();
setupNovaV3();
