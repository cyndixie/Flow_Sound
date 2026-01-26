/*
Flow Sound, Jan, 2025, by Yao Xie

User Instruction: 
- Click to start the sound. Click again to stop. Click then to restart.
- Press "A/S/D/F" to create your own piece with sound effects.
- Press "M" to get bonus effect.

Acknowledgement: 
Simone Conradi on Mathematical Art
https://profconradi.com/

Daniel Shiffman on Perlin Noise and Flow Fields
https://youtu.be/ikwNrFvnL3g
https://editor.p5js.org/codingtrain/sketches/2_hBcOBrF

P5js Sound Documentation
https://p5js.org/reference/p5.FFT/getEnergy/
p5.js SoundLoop Documentation
https://p5js.org/reference/p5.sound/p5.SoundLoop/
https://editor.p5js.org/yxie012/sketches/IuY7gSe7a
https://editor.p5js.org/bmg9647/sketches/L392LUdCr

Royalty Free Main Sound
Flora and Sauna by Aerian
https://www.epidemicsound.com/music/tracks/93182f10-f0b4-4694-97b8-c6fb635edfbb/
*/
// increment step for Perlin noise
let inc = 0.1; 
// size of each grid in the flow field
let scl = 10; 
// number of columns and rows in the grid
let cols, rows; 
// z-offset for 3D Perlin noise
let zoff = 0; 
// array for storing particle objects and vectors
let particles = []; 
let flowfield = []; 

// sound sources
// main sound
let song; 
let metallic;
let radar;
let tremolo;
let stinger;

let fft;

// the note of bonus effect
let synth;
let notePattern = [64, 63, 64, 63, 64, 59, 62, 60, 57];

// initiate smoothed FFT values to avoid sudden jumps
let bassSmooth = 0;
let midSmooth = 0;
let highmidSmooth = 0;

// preload all sound files
function preload() {
  song = loadSound("mainsong.mp3");
  radar = loadSound("radar.mp3");
  metallic = loadSound("metallic.mp3");
  tremolo = loadSound("tremolo.mp3");
  stinger = loadSound("stinger.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // calculate grid size
  cols = floor(width / scl);
  rows = floor(height / scl);
  
  // initialize FFT with smoothing and frequency bins
  //output is an array
  fft = new p5.FFT(0.9, 64); 
  fft.setInput(song);
  // initialize flow field array
  flowfield = new Array(cols * rows);

  // create 300 particle objects in the flow field
  for (let i = 0; i < 350; i++) {
    particles[i] = new Particle();
  }
  background(0);
  // bonus effect synth
  synth = new p5.MonoSynth();
}

function mousePressed() {
  if (!song.isPlaying()) {
    song.play();
  } else {
    song.pause();
  }
}

function draw() {
  let spectrum = fft.analyze();
  // get energy from different frequency bands
  let bass = fft.getEnergy("bass");
  let mid = fft.getEnergy("mid");
  let highmid = fft.getEnergy("highMid");
  
  // smooth frequency values for more fluid visual
  bassSmooth = lerp(bassSmooth, bass, 0.1);
  midSmooth = lerp(midSmooth, mid, 0.1);
  highmidSmooth = lerp(highmidSmooth, highmid, 0.1);

  // normalize to 0–1
  let bassNorm = bassSmooth / 255.0;
  let midNorm = midSmooth / 255.0;
  let highmidNorm = highmidSmooth / 255.0;
  
  // 3D Perlin noise
  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      // high-mid frequencies increase angular variation
      let angle = noise(xoff, yoff, zoff) * TWO_PI * (2 + highmidNorm * 100);
      // create vector from the angle
      let v = p5.Vector.fromAngle(angle);
      // bass frequencies control vector magnitude
      let mag = 0.5 + bassNorm * 10.0;
      v.setMag(mag);
      // v.setMag(1);
      flowfield[index] = v;
      xoff += inc;
      stroke(0, 30);

    }
    yoff += inc;
  }
   // mid frequencies control how fast the field evolves
  let zSpeed = 0.00005 + midNorm * 0.0005;
  zoff += zSpeed;

  for (let i = 0; i < particles.length; i++) {
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
  }

}

function keyPressed() {
   if (key == 'l') {

    //get current full screen state https://p5js.org/reference/#/p5/fullscreen
    let fs = fullscreen();

    //switch it to the opposite of current value
    console.log("Full screen getting set to: " + !fs);
    fullscreen(!fs);
  }

  if (key === "a" || key === "A") {
    aKeyDown = true;
    if (keyIsDown) {
      metallic.play();
    }
  }
  if (key === "s" || key === "S") {
    if (keyIsDown) {
      radar.play();
    }
  }
  if (key === "f" || key === "F") {
    if (keyIsDown) {
      stinger.play();
    }
  }
  if (key === "d" || key === "D") {
    if (keyIsDown) {
      tremolo.play();
    }
  }
  if (key === " ") {
    test.stop();
  }
  if (key === "m" || key === "M") {
    let stepMs = 100; // 200 ms between notes (0.2s)

    for (let i = 0; i < notePattern.length; i++) {
      let freq = midiToFreq(notePattern[i]);

      setTimeout(() => {
        // freq in Hz, volume 0.6, play now (0 delay inside synth), duration 0.2s
        synth.oscillator.setType("square");
        synth.play(freq, 0.5, 0, 0.1);
      }, i * stepMs);
    }
  }
}
function keyReleased() {
  if ((keyIsDown && key === "a") || key === "A") {
    aKeyDown = false;
    metallic.stop();
  }
  if ((keyIsDown && key === "s") || key === "S") {
    radar.stop();
  }
  if ((keyIsDown && key === "d") || key === "D") {
    tremolo.stop();
  }
  if ((keyIsDown && key === "f") || key === "F") {
    stinger.stop();
  }
}

function windowResized() {
  //resize our canvas to the width and height of our browser window
  resizeCanvas(windowWidth, windowHeight);
  background(0);


  //update our variables
  // diameter = width / 6;
}
