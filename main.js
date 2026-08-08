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

  // Update target name
  userTargetName = nameInput;
  document.getElementById('display-name').textContent = userTargetName;

  // Clear old images from 3D scene
  const oldImgs = ospin.querySelectorAll('img');
  oldImgs.forEach(img => img.remove());

  // Inject user uploaded photos
  const selectedFiles = Array.from(fileInput.files);
  selectedFiles.forEach((file) => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    ospin.insertBefore(img, ospin.firstChild);
  });

  // Hide modal input screen
  document.getElementById('setup-form-overlay').style.display = 'none';

  // Play audio
  var audio = document.getElementById("myAudio");
  if (audio) {
    audio.muted = false;
    audio.play().catch(e => console.log('Audio playback prevented:', e));
  }

  // Initialize 3D carousel and original love/heart background animation
  setTimeout(function() {
    init3DCarousel(0.2);
    initHeartAnimation();
  }, 100);
}

// Arranges images dynamically in a 3D circle according to user selection length
function init3DCarousel(delayTime) {
  var aImg = ospin.getElementsByTagName('img');
  var aVid = ospin.getElementsByTagName('video');
  var aEle = [...aImg, ...aVid];

  ospin.style.width = imgWidth + "px";
  ospin.style.height = imgHeight + "px";

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

// Prevent drag interactions from capturing clicks on setup overlay inputs
document.onpointerdown = function (e) {
  if (e.target.closest('#setup-form-overlay') || e.target.closest('#note-modal')) {
    return;
  }

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
  if (e.target.closest('#setup-form-overlay') || e.target.closest('#note-modal')) {
    return;
  }
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

// =========================================
// Original Love/Heart Creating Canvas Animation
// =========================================
function initHeartAnimation() {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");

  var ww = window.innerWidth;
  var wh = window.innerHeight;
  canvas.width = ww;
  canvas.height = wh;

  var hearts = [];

  function Heart(x, y, size, speedX, speedY, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speedX = speedX;
    this.speedY = speedY;
    this.color = color;
    this.opacity = 1;
  }

  Heart.prototype.draw = function() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    var topCurveHeight = this.size * 0.3;
    ctx.moveTo(this.x, this.y + topCurveHeight);
    // top left curve
    ctx.bezierCurveTo(
      this.x, this.y, 
      this.x - this.size / 2, this.y, 
      this.x - this.size / 2, this.y + topCurveHeight
    );
    // bottom left curve
    ctx.bezierCurveTo(
      this.x - this.size / 2, this.y + (this.size + topCurveHeight) / 2, 
      this.x, this.y + (this.size + topCurveHeight) / 1.4, 
      this.x, this.y + this.size
    );
    // bottom right curve
    ctx.bezierCurveTo(
      this.x, this.y + (this.size + topCurveHeight) / 1.4, 
      this.x + this.size / 2, this.y + (this.size + topCurveHeight) / 2, 
      this.x + this.size / 2, this.y + topCurveHeight
    );
    // top right curve
    ctx.bezierCurveTo(
      this.x + this.size / 2, this.y, 
      this.x, this.y, 
      this.x, this.y + topCurveHeight
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  Heart.prototype.update = function() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.opacity -= 0.005;
  };

  function createHeart() {
    var x = Math.random() * ww;
    var y = wh + 20;
    var size = Math.random() * 18 + 10;
    var speedX = (Math.random() - 0.5) * 1.5;
    var speedY = -Math.random() * 2 - 1;
    var colors = ["#ff4d6d", "#ff758f", "#ff8fa3", "#ffb3c1", "#c77dff"];
    var color = colors[Math.floor(Math.random() * colors.length)];
    hearts.push(new Heart(x, y, size, speedX, speedY, color));
  }

  function render() {
    ctx.clearRect(0, 0, ww, wh);

    if (Math.random() < 0.2) {
      createHeart();
    }

    for (var i = 0; i < hearts.length; i++) {
      hearts[i].update();
      hearts[i].draw();

      if (hearts[i].opacity <= 0 || hearts[i].y < -20) {
        hearts.splice(i, 1);
        i--;
      }
    }

    requestAnimationFrame(render);
  }

  render();

  window.addEventListener('resize', function() {
    ww = window.innerWidth;
    wh = window.innerHeight;
    canvas.width = ww;
    canvas.height = wh;
  });
}
