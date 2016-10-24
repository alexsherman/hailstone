// to do:

/*
Make controls prettier
clean up code and comment
add x and y axis, x axis scaled to highest number in this list each time

add additional graph view?
*/

(function() {

  let startNum;
  let num;
  let ticked = true;
  let speed = 150;
  let release = .5;
  let waveType = "sine";
  let maxVolume = .04;
  let speedCoefficient = 75;
  let releaseCoefficient = 5;
  let svg_area;
  let stone;
  let width = window.innerWidth;
  let height = window.innerHeight * 4.5 / 5.5;
  let oldX = width / 2;
  let oldY = height / 2;
  let currentStart = [width/2, 1];
  let currentEnd = [0,0];
  let ratio;
  let maxVal;
  let seqArray = [];
  let context;
  let path = d3.path();
  let xScale;
  let yScale;
  let graph = false;
  let lineDisplay = "block";
  let graphDisplay = "none";

  initialize();

  function createSvgArea() {
    //Add the svg area
    return d3.select("#graphic_area").append("svg")
        .attr("id", "svg_area")
        .attr("width", width + "px")
        .attr("height", height + "px");
  }

  function createStone() {
    return d3.select("#svg_area").append("circle")
      .attr("id", "stone")
      .attr("r", "8")
      .attr("stroke", "black")
      .attr("fill", "white");
  }

  function initialize() {
    svg_area = createSvgArea();
    stone = createStone();


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
  $('#toggleGraph').click(function() {toggleGraph();})
  stone.style("display", "none");

  // initialize audio context

  window.addEventListener('load', init, false);

  }

  function toggleGraph() {
    if (!graph) {
      d3.selectAll('.hailstoneline').style("display", "none");
      stone.style("display", "none");
      d3.selectAll(".graphline").style("display", "block");
      d3.select("#xaxis").style("display", "block");
      lineDisplay = "none";
      graphDisplay = "block";
      graph = true;
      d3.select('#toggleGraph').html("Toggle Hail View");
    } else {
      d3.selectAll('.hailstoneline').style("display", "block");
      stone.style("display", "block");
      d3.selectAll(".graphline").style("display", "none");
      d3.select("#xaxis").style("display", "none");
      lineDisplay = "block";
      graphDisplay = "none";
      graph = false;
      d3.select('#toggleGraph').html("Toggle Graph View");
    }
  }

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
        val++;
      }
      if (val > max) max = val;
    }

    return max;
  }

  function lengthOfSequence(val) {
    let length = 0
    while (val != 1) {
      if (val % 2 != 1) {
        val /= 2;
      } else {
        val *= 3;
        val += 1;
      }
      length++;
    }

    return length;
  }

  // checks if number inputted > 0, is number, isn't stupid big
  function hailstoneHelper() {
    let val;
    if ($('#startNumber').val() != null && $("#startNumber").val() < 10000000) {
      val = $('#startNumber').val();
      startNum = val;
      num = val

      maxVal = maxValOfSequence(val);
      lengthOf = lengthOfSequence(val);

      ticked = !ticked;
      //call recursive method
      ratio = height / maxVal;
      currentStart = [width / 2, height - (val * ratio)];
      currentEnd = currentStart;

      svg_area.selectAll(".axis").remove();

      xScale = d3.scaleLinear()
        .domain([0, lengthOf])
        .range([0, width]);

      yScale = d3.scaleLinear()
        .domain([0, maxVal])
        .range([height - 40, 0]);

      svg_area.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(yScale).ticks(10))
        .attr("transform", "translate(40,20)");

      let xticks = (lengthOf > 30) ? lengthOf / 2 : lengthOf;

      svg_area.append("g")
        .attr("class", "axis")
        .attr("id", "xaxis")
        .call(d3.axisBottom(xScale).ticks(xticks))
        .attr("transform", "translate(40," + (height - 20) + ")")
        .style("display", function() {
          if (graph) {
            return "block";
          } else {
            return "none";
          }
        })

      seqArray = [];
      seqArray.push({index: 0, value: num});
      stone.style("display", "block");
      hailstone();
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

    // calculate new coordinate for stone and line
    if (num % 2 != 1) {
      num /= 2;
      let newCoord = currentEnd[1] + (height - currentEnd[1]) / 2;
      currentEnd = [width / 5 + Math.random() * 3*width /5 , newCoord];
    } else {
      num *= 3;
      num++;
      let newCoord = currentEnd[1] - (2 * (height - currentEnd[1]));
      currentEnd = [width / 5 + Math.random() * 3*width / 5, newCoord];
    }

    seqArray.push({index: seqArray.length - 1, value: num});

    svg_area.selectAll(".graphline").remove();

    let gline = d3.line()
			.x(function (d) { return xScale(d.index); })
			.y(function (d) { return yScale(d.value); });

    let path = svg_area.append("path")
      .datum(seqArray)
      .attr("class", "graphline")
      .attr("d", gline)
      .style("display", graphDisplay)
      .attr("stroke-width", '1.25px')
      .attr("transform", "translate(40,20)");

    stone.transition().duration(speed).attr("cx", currentEnd[0])
      .attr("cy", currentEnd[1]);

    svg_area.append("line")
      .attr("class", "hailstoneline")
      .attr("x1", currentStart[0])
      .attr("y1", currentStart[1])
      .attr("x2", currentStart[0])
      .attr("y2", currentStart[1])
      .attr("stroke", "black")
      .attr("stroke-dasharray", "2,5")
      .attr("stroke-width", "2px")
      .style("display", lineDisplay)
      .transition()
      .duration(speed)
      .attr("x2", currentEnd[0])
      .attr("y2", currentEnd[1])
      .transition()
      .duration(speed * 20)
      .style("opacity", 0);

      currentStart = currentEnd;
      if (num > 1) {
        window.setTimeout(hailstone, speed);
      } else {
        stone.style("display", "none");
      }
  }


  function about() {
    if (d3.select("#about").style("display") == "none") {
      d3.select("#about").style("display", "block");
      $("html, body").animate({ scrollTop: $(document).height() }, 800)
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
