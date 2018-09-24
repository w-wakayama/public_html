var source, animationId;
var effector = {};
var audioContext = new AudioContext;
var fileReader   = new FileReader;
var gain;
var cPeak = 1.0,
    cLow = 1.0,
    cHigh = 0;

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
      gain.connect(effector.highpass);
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

    effector.lowpass = audioContext.createBiquadFilter();
    effector.lowpass.type = "lowpass";
    effector.lowpass.frequency.value = 15000;
    effector.lowpass.Q.value = 10;
    effector.lowpass.connect(effector.peaking);

    effector.highpass = audioContext.createBiquadFilter();
    effector.highpass.type = "highpass";
    effector.highpass.frequency.value = 0;
    effector.highpass.Q.value = 10;
    effector.highpass.connect(effector.lowpass);
  }

  //visualizer描画
  render = function(){
    var freqVal = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqVal);

    var c1 = Math.floor(cPeak*255) || 75;
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
};

function init(){
  var elePeak = document.getElementById('peaking');
  var rangePeak = function (elem) {
    return function(evt){
      effector.peaking.frequency.value = elem.value * 10000;
      cPeak = elem.value;
    }
  }
  elePeak.addEventListener('input', rangePeak(elePeak));

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
