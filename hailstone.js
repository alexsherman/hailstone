var startNum = 20003;
var num = startNum;
var speed = 150;
var release = .5;
var ticked = true;
var numberDiv = d3.select("#number_list");
var rHeight = 250;
var maxVolume = .04;
var speedCoefficient = 75;
var releaseCoefficient = 5;
var waveType = "sine";

var width = 1200;
var height = 500;

var oldX = width / 2;
var oldY = height / 2;
//Numbers I like the sound of:
//440
//10273
//20001
// 15234

//Add the svg area
d3.select("#graphic_area").append("svg")
    .attr("id", "svg_area")
    .attr("width", width +"px")
    .attr("height", height + "px")
  .append("rect")
    .attr("id", "rectangle");

//change speed
$('#speed').change(function() {
  var val = ($('#speed').val() != 0) ? $('#speed').val() : 1
  speed = (speedCoefficient / val) * speedCoefficient;
})

//change release time
$('#release').change(function() {
  var val = ($('#release').val() != 0) ? $('#release').val() : 1
  release = (val / speedCoefficient) * releaseCoefficient;
  console.log("release=" + release);
})

// initialize
var context;
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

  var osc = context.createOscillator();
  osc.frequency.value = frequency;
  osc.type = osctype;


  var waveArray = new Float32Array(2);
  waveArray[0] = maxVolume;
  waveArray[1] = 0;

  var gainNode = context.createGain();
  osc.connect(gainNode);
  gainNode.connect(context.destination)
  gainNode.gain.setValueCurveAtTime(waveArray, context.currentTime, release);
  osc.start(0);
  osc.stop(context.currentTime + release);
}

// checks if number inputted > 0, is number, isn't stupid big
function hailstoneHelper() {
  var val;
  if (!isNaN($('#startNumber').val()) && $('#startNumber').val() > 0 && $('#startNumber').val() < 1000000) {
    val = $('#startNumber').val();
    startNum = val;
    num = val

    ticked = !ticked;

    numberDiv.text(val + "-> ");
    //call recursive method
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
  var adjustedNum = num;
  if (num < 100 && num > 40) {
    adjustedNum *= 4;
    playSound(adjustedNum, waveType);
  } else if (num <= 40) {
    adjustedNum *= 8;
    playSound(adjustedNum, waveType);
  } else if (num > 15000) {
    while(adjustedNum > 15000) {
      adjustedNum /= 2;
      console.log(adjustedNum);
    }
      playSound(adjustedNum, waveType);
  } else {
    playSound(num, waveType);
  }

    if (num % 2 == 0) {
      num /= 2;
    } else {
      num *= 3;
      num += 1;
    }
    var ndHtml = numberDiv.text();
    ndHtml += num + ", ";
    numberDiv.text(ndHtml);

    d3.select("#rectangle").style("transition", speed / 700 + "s")
      .attr("height", (rHeight / startNum) * num + "px")
      .attr("width", (300 / startNum) * num + "px")

       oldX = +d3.select("#rectangle").attr("width").replace("px", "")
       oldY = +d3.select("#rectangle").attr("height").replace("px", "");

      d3.select("#rectangle").attr("x", width / 2 - oldX / 2)
      .attr("y", height / 2 - oldY / 2)
      .attr("transition", speed/200 + "s")
      .attr("fill", function() {
        return "hsl(" + Math.random() * 360 + ",100%,50%)";
      })


/*    d3.select("#svg_area").append("rect")
      .attr("height", (rHeight / startNum) * num + "px")
      .attr("width", (300 / startNum) * num + "px")
      .attr("transition", speed/500 + "s")
      .attr("fill", function() {
        return "hsl(" + Math.random() * 360 + ",100%,50%)";
      });
*/
  //  d3.selectAll("rect")
  //    .style("opacity", function (d) {
  //      return d3.select(this).style("opacity") - .05;
  //    });


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