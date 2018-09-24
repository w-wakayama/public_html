var source, animationId;
var render;
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
};

function initialize(player){
  source = audioContext.createMediaElementSource(player);
  source.connect(analyser);

  if(player.paused){
    player.play();
  }else{
    player.pause();
  }

  gain = audioContext.createGain();
  gain.gain.value = 0;
  analyser.connect(gain);
  gain.connect(audioContext.destination);

  animationId = requestAnimationFrame(render);
}
