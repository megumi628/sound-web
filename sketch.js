let song;
let bratImg;

let fft;
let peakDetect;   
let hiPeakDetect;
let amplitude;

let imgScale    = 1.0;
let targetScale = 1.0;
let beatFlash   = 0;

let CX, CY;
const IMG_BASE_SIZE = 340;

function preload() {
  song    = loadSound('sounds/360.mp3');
  bratImg = loadImage('images/brat.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  CX = width  / 2;
  CY = height / 2;
  fft = new p5.FFT(0.8, 1024);

  peakDetect   = new p5.PeakDetect(20,   200, 0.30, 20);

  hiPeakDetect = new p5.PeakDetect(200, 2000, 0.40, 15);

  amplitude = new p5.Amplitude();
  amplitude.smooth(0.85);

  imageMode(CENTER);
  noStroke();
  frameRate(60);
}

function draw() {
  background('#8ACF01');

  CX = width  / 2;
  CY = height / 2;

  fft.analyze();

  peakDetect.update(fft);
  hiPeakDetect.update(fft);

  let level = amplitude.getLevel(); 

  if (peakDetect.isDetected) {
    // Kick / bass → big punch
    targetScale = 1.55 + random(0, 0.15);
  }

  if (hiPeakDetect.isDetected) {
    targetScale = max(targetScale, 1.20 + random(0, 0.10));
  }
  let baseScale = 1.0 + level * 0.25;  
  targetScale   = max(targetScale, baseScale);
  imgScale     += (targetScale - imgScale) * 0.14;
  targetScale  *= 0.92;           
  drawBratImage();
}

function drawBratImage() {
  let sz = IMG_BASE_SIZE * imgScale;
  image(bratImg, CX, CY, sz, sz);
}

function mousePressed() {
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

function keyPressed() {
  if (key === ' ') {
    mousePressed();
    return false; 
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
