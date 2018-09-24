var source, animationId;
var effector = {};
var audioContext = new AudioContext;
var fileReader   = new FileReader;
var gain;
var cVol = 1,
    cPeak = 1,
    cRate = 1;

window.onload = function(){
  init();
  var analyser = audioContext.createAnalyser();
  analyser.connect(audioContext.destination);

  var canvas        = document.getElementById('visualizer');
  var canvasContext = canvas.getContext('2d');
  canvas.setAttribute('width', analyser.frequencyBinCount);

  fileReader.onload = function(){
    audioContext.decodeAudioData(fileReader.result, function(buffer){
      if(source) {
        source.stop();
        cancelAnimationFrame(animationId);
      }

      source = audioContext.createBufferSource();
      source.buffer = buffer;
      initializeEffectors(source.buffer);
      gain = audioContext.createGain();
      source.connect(gain);
      gain.connect(effector.peaking);
      source.start(0);

      animationId = requestAnimationFrame(render);
    });
  };
  document.getElementById('file').addEventListener('change', function(e){
    fileReader.readAsArrayBuffer(e.target.files[0]);
  });

  function initializeEffectors(player){
    effector.peaking = audioContext.createBiquadFilter();
    effector.peaking.type = "peaking";
    effector.peaking.frequency.value = 10000;
    effector.peaking.gain.value = 15;
    effector.peaking.Q.value = 1;
    effector.peaking.connect(analyser);
  }

  //visualizer描画
  render = function(){
    var freqVal = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqVal);

    var c1 = Math.floor(cVol*255) || 75;
    var c2 = Math.floor(cPeak*255) || 75;
    var c3 = Math.floor(cRate*255) || 75;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    for(var i=0, len=freqVal.length; i<len; i++){
      canvasContext.strokeStyle = 'rgb('+c3+','+c2+','+c1+')';

      var x = Math.cos((i/freqVal.length * 360) * (Math.PI / 180))* freqVal[i] + 420,
          y = Math.sin((i/freqVal.length * 360) * (Math.PI / 180))* freqVal[i] + 300;
      canvasContext.beginPath();
      canvasContext.moveTo(420,300);
      canvasContext.lineTo(x,y);
      canvasContext.stroke();
    }

    animationId = requestAnimationFrame(render);
  };
};

function init(){
  var eleVol = document.getElementById('volume');
  var rangeVolume = function (elem) {
    return function(evt){
      gain.gain.value = elem.value;
      cVol = elem.value;
    }
  }
  eleVol.addEventListener('input', rangeVolume(eleVol));

  var elePeak = document.getElementById('peaking');
  var rangePeak = function (elem) {
    return function(evt){
      effector.peaking.frequency.value = elem.value * 10000;
      cPeak = elem.value;
    }
  }
  elePeak.addEventListener('input', rangePeak(elePeak));

  var eleRate = document.getElementById('rate');
  var rangeRate = function (elem) {
    return function(evt){
      source.playbackRate.value = elem.value;
      cRate = elem.value;
    }
  }
  eleRate.addEventListener('input', rangeRate(eleRate));
};
