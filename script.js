// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const canvas = document.getElementById('user-image');
const ctx = canvas.getContext('2d');
const imginput = document.getElementById('image-input');
const genmeme = document.getElementById('generate-meme');
const submit = document.querySelector("[type='submit']");
const texttop = document.getElementById('text-top');
const textbottom = document.getElementById('text-bottom');
const reset = document.querySelector("[type='reset']");
const read = document.querySelector("[type='button']");
const volumegroup = document.getElementById('volume-group');
let volume = 1;
const voiceselect = document.getElementById('voice-selection');
const synth = window.speechSynthesis;
let voices = [];
function populateVoiceList() {
  voices = synth.getVoices();
  voiceselect.remove(0);
  voices.forEach(function(voice) {
    let option = document.createElement("option");
    option.textContent = voice.name + " (" + voice.lang + ")";
    if(voice.default) {
      option.textContent += " -- DEFAULT";
    }
    option.setAttribute('data-lang', voice.lang);
    option.setAttribute('data-name', voice.name);
    voiceselect.appendChild(option);
  });
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let dim = getDimmensions(canvas.width, canvas.height, img.width, img.height)
  ctx.drawImage(img, dim.startX, dim.startY, dim.width, dim.height);

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

imginput.addEventListener('change', () => {
  img.src = URL.createObjectURL(imginput.files[0]);
  img.alt = imginput.files[0].name;
});

genmeme.addEventListener('submit', (event) => {
  event.preventDefault();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.font = 'bolder 36px sans-serif';
  ctx.lineWidth = 6;
  ctx.miterLimit = 2;
  ctx.strokeText(texttop.value, canvas.width/2, 48);
  ctx.fillText(texttop.value, canvas.width/2, 48);
  ctx.strokeText(textbottom.value, canvas.width/2, canvas.height-24);
  ctx.fillText(textbottom.value, canvas.width/2, canvas.height-24);
  submit.disabled = true;
  reset.disabled = false;
  read.disabled = false;
  voiceselect.disabled = false;
});

reset.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  submit.disabled = false;
  reset.disabled = true;
  read.disabled = true;
  voiceselect.disabled = true;
});

read.addEventListener('click', () => {
  const top = new SpeechSynthesisUtterance(texttop.value);
  const bottom = new SpeechSynthesisUtterance(textbottom.value);
  const selected = voiceselect.selectedOptions[0].getAttribute('data-name');
  voices.forEach(function(voice) {
    if(voice.name === selected) {
      top.voice = voice;
      bottom.voice = voice;
    }
  });
  top.volume = volume;
  bottom.volume = volume;
  synth.speak(top);
  synth.speak(bottom);
});

volumegroup.addEventListener('input', () => {
  let volrange = document.querySelector("[type='range']");
  volume = volrange.value/100;
  let volico = document.querySelector("#volume-group > img");
  if(volrange.value > 66){
    volico.src = "icons/volume-level-3.svg";
    volico.alt="Volume Level 3";
  }else if(volrange.value > 33){
    volico.src = "icons/volume-level-2.svg";
    volico.alt="Volume Level 2";
  }else if(volrange.value > 0){
    volico.src = "icons/volume-level-1.svg";
    volico.alt="Volume Level 1";
  }else{
    volico.src = "icons/volume-level-0.svg";
    volico.alt="Volume Level 0";
  }
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
