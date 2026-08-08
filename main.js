// Global variables
var radius = 240;
var autoRotate = true;
var rotateSpeed = -60;
var imgWidth = 120;
var imgHeight = 170;

var odrag = document.getElementById('drag-container');
var ospin = document.getElementById('spin-container');
var ground = document.getElementById('ground');

ground.style.width = radius * 3 + "px";
ground.style.height = radius * 3 + "px";

let userTargetName = "Friend"; 

// Monitor selected files count in real-time
document.getElementById('photo-upload').addEventListener('change', function(e) {
  const count = e.target.files.length;
  document.getElementById('file-count-label').innerText = `${count} photo(s) selected`;
});

// Triggered when user clicks 'Generate Surprise'
function startSurprise() {
  const nameInput = document.getElementById('birthday-name').value.trim();
  const fileInput = document.getElementById('photo-upload');

  if (!nameInput) {
    alert("Please enter a name!");
    return;
  }

  if (!fileInput.files || fileInput.files.length === 0) {
    alert("Please select at least one photo!");
    return;
  }

  // Update target name everywhere
  userTargetName = nameInput;
  document.getElementById('display-name').textContent = userTargetName;

  // Clear existing photos from 3D container (keeps <p> tag and <button> intact)
  const oldImgs = ospin.querySelectorAll('img');
  oldImgs.forEach(img => img.remove());

  // Convert ALL selected files into dynamic Blob URLs
  const selectedFiles = Array.from(fileInput.files);
  
  selectedFiles.forEach((file) => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    // Insert images inside #spin-container before <p> text
    ospin.insertBefore(img, ospin.firstChild);
  });

  // Hide customizer screen
  document.getElementById('setup-form-overlay').style.display = 'none';

  // Trigger background audio playback
  var audio = document.getElementById("myAudio");
  if (audio) {
    audio.muted = false;
    audio.play().catch(e => console.log('Audio playback blocked/failed:', e));
  }

  // Dynamically calculate 3D rotation based on exact number of uploaded images
  setTimeout(function() {
    init3DCarousel(0.2);
    initBackgroundCanvas();
  }, 100);
}

// Arranges elements evenly in a 3D circle
function init3DCarousel(delayTime) {
  var aImg = ospin.getElementsByTagName('img');
  var aVid = ospin.getElementsByTagName('video');
  var aEle = [...aImg, ...aVid];

  ospin.style.width = imgWidth + "px";
  ospin.style.height = imgHeight + "px";

  // Automatically adjust rotation math according to aEle.length (total images given)
  for (var i = 0; i < aEle.length; i++) {
    aEle[i].style.transform = "rotateY(" + (i * (360 / aEle.length)) + "deg) translateZ(" + radius + "px)";
    aEle[i].style.transition = "transform 1s";
    aEle[i].style.transitionDelay = delayTime || (aEle.length - i) / 4 + "s";
  }
}

function applyTranform(obj) {
  if (tY > 180) tY = 180;
  if (tY < 0) tY = 0;
  obj.style.transform = "rotateX(" + (-tY) + "deg) rotateY(" + (tX) + "deg)";
}

function playSpin(yes) {
  ospin.style.animationPlayState = (yes ? 'running' : 'paused');
}

var sX, sY, nX, nY, desX = 0, desY = 0, tX = 0, tY = 10;

if (autoRotate) {
  var animationName = (rotateSpeed > 0 ? 'spin' : 'spinRevert');
  ospin.style.animation = `${animationName} ${Math.abs(rotateSpeed)}s infinite linear`;
}

// 3D Pointer Dragging Interaction
document.onpointerdown = function (e) {
  clearInterval(odrag.timer);
  e = e || window.event;
  var sX = e.clientX, sY = e.clientY;

  this.onpointermove = function (e) {
    e = e || window.event;
    var nX = e.clientX, nY = e.clientY;
    desX = nX - sX;
    desY = nY - sY;
    tX += desX * 0.1;
    tY += desY * 0.1;
    applyTranform(odrag);
    sX = nX;
    sY = nY;
  };

  this.onpointerup = function (e) {
    odrag.timer = setInterval(function () {
      desX *= 0.95;
      desY *= 0.95;
      tX += desX * 0.1;
      tY += desY * 0.1;
      applyTranform(odrag);
      playSpin(false);
      if (Math.abs(desX) < 0.5 && Math.abs(desY) < 0.5) {
        clearInterval(odrag.timer);
        playSpin(true);
      }
    }, 17);
    this.onpointermove = this.onpointerup = null;
  };

  return false;
};

document.onmousewheel = function (e) {
  e = e || window.event;
  var d = e.wheelDelta / 20 || -e.detail;
  radius += d;
  init3DCarousel(1);
};

// =========================================
// Birthday Note Typewriter Modal Logic
// =========================================

let noteIndex = 0;
let typingSpeed = 40; 
let typingTimeout;

function openNote() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  }

  const modal = document.getElementById('note-modal');
  const typewriterElem = document.getElementById('typewriter-text');
  
  modal.style.display = 'flex';
  typewriterElem.innerHTML = '';
  noteIndex = 0;
  clearTimeout(typingTimeout);
  
  typeWriter();
}

function typeWriter() {
  const dynamicNote = `Dear ${userTargetName}, 🎉✨\n\nOn this super special day, I wish you endless happiness, beautiful memories, and laughter that lasts forever! 🎂\n\nMay your life be filled with all the sweet moments you deserve and every wish you make come true. Keep smiling always! ❤️✨`;

  if (noteIndex < dynamicNote.length) {
    document.getElementById('typewriter-text').innerHTML += dynamicNote.charAt(noteIndex);
    noteIndex++;
    typingTimeout = setTimeout(typeWriter, typingSpeed);
  }
}

function closeNote() {
  document.getElementById('note-modal').style.display = 'none';
  clearTimeout(typingTimeout);
}

// Background Fireworks & Floating Hearts Canvas
function initBackgroundCanvas() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function Firework(x, y) {
    this.x = x;
    this.y = y;
    this.radius = random(2, 4);
    this.color = `hsl(${random(0, 360)}, 100%, 50%)`;
    this.vx = random(-3, 3);
    this.vy = random(-3, 3);
    this.life = 100;
  }

  Firework.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  };

  Firework.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  };

  function Heart(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(20, 40);
    this.color = 'red';
    this.vy = random(-2, -1);
    this.opacity = 1;
  }

  Heart.prototype.draw = function () {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.bezierCurveTo(this.x - this.size / 2, this.y - this.size / 2, this.x - this.size, this.y + this.size / 3, this.x, this.y + this.size);
    ctx.bezierCurveTo(this.x + this.size, this.y + this.size / 3, this.x + this.size / 2, this.y - this.size / 2, this.x, this.y);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  Heart.prototype.update = function () {
    this.y += this.vy;
    this.opacity -= 0.01;
  };

  let fireworks = [];
  let hearts = [];

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (Math.random() < 0.1) {
      fireworks.push(new Firework(random(0, canvas.width), random(0, canvas.height)));
    }
    if (Math.random() < 0.05) {
      hearts.push(new Heart(random(0, canvas.width), canvas.height));
    }

    fireworks.forEach((firework, index) => {
      firework.draw();
      firework.update();
      if (firework.life <= 0) {
        fireworks.splice(index, 1);
      }
    });

    hearts.forEach((heart, index) => {
      heart.draw();
      heart.update();
      if (heart.opacity <= 0) {
        hearts.splice(index, 1);
      }
    });

    requestAnimationFrame(animate);
  }
  animate();
}
