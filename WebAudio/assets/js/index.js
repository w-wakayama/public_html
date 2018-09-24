var source, animationId;
var render;
var effector = {};
var analyser;
var audioContext = new AudioContext;
var fileReader   = new FileReader;
var gain;
var cVol = 1.0,
    cLow = 1.0,
    cHigh = 0;

var play = document.querySelector("audio");

window.onload = function(){
  analyser = audioContext.createAnalyser();
  gain2 = audioContext.createGain();
  gain2.gain.value = 0;
  analyser.connect(gain2);
  gain2.connect(audioContext.destination);

  var canvas        = document.getElementById('visualizer');
  var canvasContext = canvas.getContext('2d');
  canvas.setAttribute('width', analyser.frequencyBinCount);

  //visualizer描画
  render = function(){
    var freqVal = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqVal);

    var c1 = Math.floor(cVol*255) || 75;
    var c2 = Math.floor(cLow*255) || 75;
    var c3 = Math.floor(cHigh*255) || 75;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    for(var i=0, len=freqVal.length; i<len; i++){
      canvasContext.fillStyle = 'rgb('+c3+','+c2+','+c1+')';
      canvasContext.fillRect(i, 300, 1, freqVal[i]);
      canvasContext.fillRect(i, 300, 1, -freqVal[i]);
    }

    animationId = requestAnimationFrame(render);
  };

  init();
};

function init(){

  initialize(play);

  var eleVol = document.getElementById('volume');
  var rangeVolume = function (elem) {
    return function(evt){
      gain.gain.value = elem.value;
      cVol = elem.value;
    }
  }
  eleVol.addEventListener('input', rangeVolume(eleVol));

  var eleLow = document.getElementById('lowpass');
  var rangeLow = function (elem) {
    return function(evt){
      effector.lowpass.frequency.value = elem.value * 17500;
      cLow = elem.value;
    }
  }
  eleLow.addEventListener('input', rangeLow(eleLow));

  var eleHigh = document.getElementById('highpass');
  var rangeHigh = function (elem) {
    return function(evt){
      effector.highpass.frequency.value = elem.value * 4000;
      cHigh = elem.value;
    }
  }
  eleHigh.addEventListener('input', rangeHigh(eleHigh));
};

function initializeEffectors(player){
  effector.lowpass = audioContext.createBiquadFilter();
  effector.lowpass.type = "lowpass";
  effector.lowpass.frequency.value = 15000;
  effector.lowpass.Q.value = 10;
  effector.lowpass.connect(analyser);

  effector.highpass = audioContext.createBiquadFilter();
  effector.highpass.type = "highpass";
  effector.highpass.frequency.value = 0;
  effector.highpass.Q.value = 10;
  effector.highpass.connect(effector.lowpass);
}

function initialize(player){
  source = audioContext.createMediaElementSource(player);

  if(player.paused){
    player.play();
  }else{
    player.pause();
  }

  initializeEffectors(play);
  gain = audioContext.createGain();
  source.connect(gain);
  gain.connect(effector.highpass);

  animationId = requestAnimationFrame(render);
}
