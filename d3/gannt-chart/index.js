import { w, h, taskArray } from "./data.js";

const tip = d3.tip().attr("class", "d3-tip");

const svg = d3
  .selectAll(".svg")
  .append("svg")
  .attr("width", w)
  .attr("height", h)
  .attr("class", "svg");

svg.call(tip);

const timeScale = d3
  .scaleTime()
  .domain([
    d3.min(taskArray, function (d) {
      return new Date(d.startTime);
    }),
    d3.max(taskArray, function (d) {
      return new Date(d.endTime);
    }),
  ])
  .range([0, w - 150]);

let catsUnfiltered = taskArray.map((task) => task.type); //for rect labels

const categories = Array.from(new Set(catsUnfiltered));

makeGant(taskArray, w, h);

const title = svg
  .append("text")
  .text("Frontend schedule Gantt Chart")
  .attr("x", w / 2)
  .attr("y", 25)
  .attr("text-anchor", "middle")
  .attr("font-size", 18)
  .attr("fill", "#009FFC");

function makeGant(tasks, pageWidth, pageHeight) {
  var barHeight = 20;
  var gap = barHeight + 4;
  var topPadding = 75;
  var sidePadding = 75;

  var colorScale = d3
    .scaleLinear()
    .domain([0, categories.length])
    .range(["#00B9FA", "#F95002"])
    .interpolate(d3.interpolateHcl);

  makeGrid(sidePadding, topPadding, pageWidth, pageHeight);
  drawRects(
    tasks,
    gap,
    topPadding,
    sidePadding,
    barHeight,
    colorScale,
    pageWidth,
    pageHeight
  );
  vertLabels(gap, topPadding, sidePadding, barHeight, colorScale);
}

function drawRects(
  theArray,
  theGap,
  theTopPad,
  theSidePad,
  theBarHeight,
  theColorScale,
  w
) {
  const bigRects = svg
    .append("g")
    .selectAll("rect")
    .data(theArray)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (_, i) => i * theGap + theTopPad - 2)
    .attr("width", (_) => w - theSidePad / 2)
    .attr("height", theGap)
    .attr("stroke", "none")
    .attr("fill", (d) => {
      for (let i = 0; i < categories.length; i++) {
        if (d.type == categories[i]) {
          return d3.rgb(theColorScale(i));
        }
      }
    })
    .attr("opacity", 0.2);

  var rectangles = svg.append("g").selectAll("rect").data(theArray).enter();

  var innerRects = rectangles
    .append("rect")
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("x", function (d) {
      return timeScale(new Date(d.startTime)) + theSidePad;
    })
    .attr("y", function (d, i) {
      return i * theGap + theTopPad;
    })
    .attr("width", function (d) {
      return timeScale(new Date(d.endTime)) - timeScale(new Date(d.startTime));
    })
    .attr("height", theBarHeight)
    .attr("stroke", "none")
    .attr("fill", (d) =>
      d3.rgb(
        theColorScale(categories.findIndex((category) => category == d.type))
      )
    );

  var rectText = rectangles
    .append("text")
    .text(function (d) {
      return d.task;
    })
    .attr("x", function (d) {
      return (
        (timeScale(new Date(d.endTime)) - timeScale(new Date(d.startTime))) /
          2 +
        timeScale(new Date(d.startTime)) +
        theSidePad
      );
    })
    .attr("y", function (d, i) {
      return i * theGap + 14 + theTopPad;
    })
    .attr("font-size", 11)
    .attr("text-anchor", "middle")
    .attr("text-height", theBarHeight)
    .attr("fill", "#fff");

  const setTipContent = (d, color) => {
    let tag = `
            Task: ${d.task}<br />
            Type: ${d.type}<br />
            Starts: ${d.startTime}<br />
            Ends: ${d.endTime}<br />
        `;
    tag += d.details ? `Details: ${d.details}` : "";
    document.documentElement.style.setProperty("--tip-bg-color", color);
    return tag;
  };

  const showTip = (e, d) => {
    tip.html((e, d) =>
      setTipContent(
        d,
        d3.rgb(
          theColorScale(categories.findIndex((category) => category == d.type))
        )
      )
    );
    tip.show(e, d);
  };

  rectText
    .on("mouseover", (e, d) => showTip(e, d))
    .on("mouseout", () => tip.hide());

  innerRects
    .on("mouseover", function (e, d) {
      showTip(e, d);
      /* how to make my tip
      let tag = `
        Task: ${d.task}<br />
        Type: ${d.type}<br />
        Starts: ${d.startTime}<br />
        Ends: ${d.endTime}<br />
    `;
      tag += d.details ? `Details: ${d.details}` : "";
      document.documentElement.style.setProperty(
        "--tip-bg-color",
        d3.rgb(
          theColorScale(categories.findIndex((category) => category == d.type))
        )
      );
      var output = document.getElementById("tag");
      var x = this.x.animVal.value + this.width.animVal.value / 2 + "px";
      var y = this.y.animVal.value + 25 + "px";
      output.innerHTML = tag;
      output.style.top = y;
      output.style.left = x;
      output.style.display = "block";
    */
    })
    .on("mouseout", () => {
      tip.hide();
      /* how to make my tip
      var output = document.getElementById("tag");
      output.style.display = "none";
      */
    });
}

function makeGrid(theSidePad, theTopPad, w, h) {
  var xAxis = d3
    .axisBottom(timeScale)
    .ticks(d3.timeDay, 1)
    .tickSize(-h + theTopPad + 20, 0, 0)
    .tickFormat(d3.timeFormat("%d %b"));

  var grid = svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", "translate(" + theSidePad + ", " + (h - 50) + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "middle")
    .attr("fill", "#000")
    .attr("stroke", "none")
    .attr("font-size", 10)
    .attr("dy", "1em");
}

function vertLabels(
  theGap,
  theTopPad,
  theSidePad,
  theBarHeight,
  theColorScale
) {
  var numOccurances = [];
  var prevGap = 0;

  for (var i = 0; i < categories.length; i++) {
    numOccurances[i] = [categories[i], getCount(categories[i], catsUnfiltered)];
  }
  console.log(numOccurances);

  var axisText = svg
    .append("g") //without doing this, impossible to put grid lines behind text
    .selectAll("text")
    .data(numOccurances)
    .enter()
    .append("text")
    .text((d) => d[0])
    .attr("x", 10)
    .attr("y", function (d, i) {
      if (i > 0) {
        for (var j = 0; j < i; j++) {
          prevGap += numOccurances[i - 1][1];
          // console.log(prevGap);
          return (d[1] * theGap) / 2 + prevGap * theGap + theTopPad;
        }
      } else {
        return (d[1] * theGap) / 2 + theTopPad;
      }
    })
    .attr("font-size", 11)
    .attr("text-anchor", "start")
    .attr("text-height", 14)
    .attr("fill", function (d) {
      for (var i = 0; i < categories.length; i++) {
        if (d[0] == categories[i]) {
          return d3.rgb(theColorScale(i)).darker();
        }
      }
    });
}

//from this stackexchange question: http://stackoverflow.com/questions/14227981/count-how-many-strings-in-an-array-have-duplicates-in-the-same-array
function getCounts(arr) {
  var i = arr.length, // var to loop over
    obj = {}; // obj to store results
  while (i) obj[arr[--i]] = (obj[arr[i]] || 0) + 1; // count occurrences
  return obj;
}

// get specific from everything
function getCount(word, arr) {
  return getCounts(arr)[word] || 0;
}

// old school remove duplicates
function checkUnique(arr) {
  var hash = {},
    result = [];
  for (var i = 0, l = arr.length; i < l; ++i) {
    if (!hash.hasOwnProperty(arr[i])) {
      //it works with objects! in FF, at least
      hash[arr[i]] = true;
      result.push(arr[i]);
    }
  }
  return result;
}
