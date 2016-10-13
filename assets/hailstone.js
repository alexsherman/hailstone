// to do:
//make fucking zoom actually work
// get zoom to follow the hailstone path roughly
// maybe make width dependent on length of line being traveled?

(function() {
  //Numbers I like the sound of:
  //440
  //10273
  //20001
  // 15234
  //12331
  //12778
  //19587
  let startNum;
  let num;
  let ticked = true;

  let speed = 150;
  let release = .5;
  let waveType = "sine";
  let maxVolume = .04;
  let speedCoefficient = 75;
  let releaseCoefficient = 5;
  let numberDiv = d3.select("#number_list");
  let svg_area;


  let rHeight = 250;
  let width = 1200;
  let height = 500;
  let oldX = width / 2;
  let oldY = height / 2;
  let currentStart = [width/2, 1];
  let currentEnd = [0,0];
  let ratio;

  function createSvgArea() {
    //Add the svg area
    return d3.select("#graphic_area").append("svg")
        .attr("id", "svg_area")
        .attr("width", width + "px")
        .attr("height", height + "px")
  }

    svg_area = createSvgArea();

  //change speed
  $('#speed').change(function() {
    let val = ($('#speed').val() != 0) ? $('#speed').val() : 1
    speed = (speedCoefficient / val) * speedCoefficient;
  })
  //change release time
  $('#release').change(function() {
    let val = ($('#release').val() != 0) ? $('#release').val() : 1
    release = (val / speedCoefficient) * releaseCoefficient;
  })
  $('#hailstone').click(function() {hailstoneHelper(); })
  $('#showAbout').click(function() {about();})
  $('#switch_sine').click(function() {switchTo('sine');})
  $('#switch_square').click(function() {switchTo('square');})
  $('#switch_triangle').click(function() {switchTo('triangle');})

  // initialize audio context
  let context;
  window.addEventListener('load', init, false);
  function init() {
    try {
      // Fix up for prefixing
      window.AudioContext = window.AudioContext||window.webkitAudioContext;
      context = new AudioContext();
    }
    catch(e) {
      alert('Web Audio API is not supported in this browser');
    }
  }

  //does exactly that
  function playSound(frequency, osctype) {

    let osc = context.createOscillator();
    osc.frequency.value = frequency;
    osc.type = osctype;


    let waveArray = new Float32Array(2);
    waveArray[0] = maxVolume;
    waveArray[1] = 0;

    let gainNode = context.createGain();
    osc.connect(gainNode);
    gainNode.connect(context.destination)
    gainNode.gain.setValueCurveAtTime(waveArray, context.currentTime, release);
    osc.start(0);
    osc.stop(context.currentTime + release);
  }

  function maxValOfSequence(val) {
    let max = val;
    while (val != 1) {
      if (val % 2 != 1) {
        val /= 2;
      } else {
        val *= 3;
        val += 1;
      }
      if (val > max) max = val;
    }

    return max;
  }

  // checks if number inputted > 0, is number, isn't stupid big
  function hailstoneHelper() {
    let val;
    if (!isNaN($('#startNumber').val()) && $('#startNumber').val() > 0 && $('#startNumber').val() < 1000000) {
      val = $('#startNumber').val();
      startNum = val;
      num = val

      let maxVal = maxValOfSequence(val);

      ticked = !ticked;

      numberDiv.text(val + "-> ");
      //call recursive method
      ratio = height / maxVal;
      currentStart = [width / 2, height - (val * ratio)];
      currentEnd = currentStart;
      hailstone();
    } else {
      $('#startNumber').val("Please enter a valid number!");
    }
  }

  //recursively runs through hailstone sequence based on startnumber and calls playSound for each frequency
  function hailstone() {
    if (!ticked) {
      num = startNum;
      ticked = true;
    }

    // because laptop speakers can only produce a certain range (and humans can only hear a certain range), shifts pitches so they are hearable and playable
    let adjustedNum = num;
    if (num < 100 && num > 40) {
      adjustedNum *= 4;
      playSound(adjustedNum, waveType);
    } else if (num <= 40) {
      adjustedNum *= 8;
      playSound(adjustedNum, waveType);
    } else if (num > 15000) {
      while(adjustedNum > 15000) {
        adjustedNum /= 2;
      }
        playSound(adjustedNum, waveType);
    } else {
      playSound(num, waveType);
    }

      if (num % 2 != 1) {
        num /= 2;
        let newCoord = currentEnd[1] + (height - currentEnd[1]) / 2;
        currentEnd = [Math.random() * width, newCoord];
      } else {
        num *= 3;
        num += 1;
        let newCoord = currentEnd[1] - (2 * (height - currentEnd[1]));
        currentEnd = [Math.random() * width, newCoord];
      }

      let ndHtml = numberDiv.text();
      ndHtml += num + ", ";
      numberDiv.text(ndHtml);

    svg_area.append("line")
      .attr("x1", currentStart[0])
      .attr("y1", currentStart[1])
      .attr("x2", currentStart[0])
      .attr("y2", currentStart[1])
      .transition()
      .attr("x2", currentEnd[0])
      .attr("y2", currentEnd[1])
      .attr("stroke", "black")
      .attr("stroke-width", "2px");

    d3.selectAll("line").each(function(d,i) {
      let currentOpacity = d3.select(this).style("opacity");
      if (currentOpacity != 0) {
        d3.select(this).style("opacity", currentOpacity - .1);
      }
    })

      //add zoom https://jsfiddle.net/2yx1cLrq/
      currentStart = currentEnd;
      if (num > 1) window.setTimeout(hailstone, speed);
  }


  function about() {
    if (d3.select("#about").style("display") == "none") {
      d3.select("#about").style("display", "block");
      $("html, body").animate({ scrollTop: $(document).height() }, 500)
    } else {
      d3.select("#about").style("display", "none");
    }
  }

  function switchTo(newWaveType) {
     waveType = newWaveType;
     let id = "switch_" + waveType;
     d3.selectAll(".waveSelection").style("background-color", "blue");
     d3.select("#" + id).style("background-color", "red");
  }

})();
