/**
 * brat · 360 — sound-reactive visualizer
 * Based on the p5-sound-boilerPlate pattern by @ogbabydiesal
 *
 * Pattern:
 *   preload()  → loadSound(), loadImage()
 *   setup()    → p5.FFT, p5.PeakDetect, p5.Amplitude
 *   draw()     → fft.analyze() → peakDetect.update(fft)
 *                peakDetect.isDetected → scale image
 */

// ── Assets ──────────────────────────────────────────────────
let song;
let bratImg;

// ── p5.sound objects ─────────────────────────────────────────
let fft;
let peakDetect;   // kick/bass peak detector
let hiPeakDetect; // high-mid peak detector (snare / clap feel)
let amplitude;

// ── Visual state ─────────────────────────────────────────────
let imgScale    = 1.0;
let targetScale = 1.0;
let beatFlash   = 0;   // flash intensity, decays each frame

// layout
let CX, CY;
const IMG_BASE_SIZE = 340;

// ── preload ──────────────────────────────────────────────────
function preload() {
  song    = loadSound('sounds/360.mp3');
  bratImg = loadImage('images/brat.jpg');
}

// ── setup ────────────────────────────────────────────────────
function setup() {
  createCanvas(windowWidth, windowHeight);
  CX = width  / 2;
  CY = height / 2;

  // p5.FFT — 1024 bins, smoothing 0.8
  fft = new p5.FFT(0.8, 1024);

  // PeakDetect for kick / bass range (20 – 200 Hz)
  // threshold 0.35 (default), framesPerPeak ~20
  peakDetect   = new p5.PeakDetect(20,   200, 0.30, 20);

  // PeakDetect for snare / clap range (200 – 2000 Hz)
  hiPeakDetect = new p5.PeakDetect(200, 2000, 0.40, 15);

  // Amplitude for continuous volume level
  amplitude = new p5.Amplitude();
  amplitude.smooth(0.85);

  imageMode(CENTER);
  noStroke();
  frameRate(60);
}

// ── draw ─────────────────────────────────────────────────────
function draw() {
  // Brat green background
  background('#8ACE00');

  CX = width  / 2;
  CY = height / 2;

  // ── 1. FFT analysis (must come before peakDetect.update) ──
  fft.analyze();

  // ── 2. Update peak detectors ──
  peakDetect.update(fft);
  hiPeakDetect.update(fft);

  // ── 3. Continuous amplitude level ──
  let level = amplitude.getLevel();   // 0.0 – 1.0

  // ── 4. React to peaks ──────────────────────────────────────
  if (peakDetect.isDetected) {
    // Kick / bass → big punch
    targetScale = 1.55 + random(0, 0.15);
  }

  if (hiPeakDetect.isDetected) {
    // Snare / clap → medium pulse
    targetScale = max(targetScale, 1.20 + random(0, 0.10));
  }

  // ── 5. Lerp scale toward target ──
  let baseScale = 1.0 + level * 0.25;   // continuous swell from volume
  targetScale   = max(targetScale, baseScale);
  imgScale     += (targetScale - imgScale) * 0.14;
  targetScale  *= 0.92;                 // decay target each frame

  // ── 6. Draw image only ─────────────────────────────────────
  drawBratImage();
}

// ── Draw brat album art, scaled by beat ──────────────────────
function drawBratImage() {
  let sz = IMG_BASE_SIZE * imgScale;
  image(bratImg, CX, CY, sz, sz);
}

// ── Mouse click → play / pause ───────────────────────────────
function mousePressed() {
  // Dismiss splash if visible
  let splash = document.getElementById('splash');
  if (splash && !splash.classList.contains('hidden')) {
    splash.classList.add('hidden');
    document.getElementById('hud').classList.add('visible');
  }

  if (song.isPlaying()) {
    song.pause();
  } else {
    song.play();
  }
}

// ── Space bar also toggles ────────────────────────────────────
function keyPressed() {
  if (key === ' ') {
    mousePressed();
    return false; // prevent page scroll
  }
}

// ── Responsive canvas ────────────────────────────────────────
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
