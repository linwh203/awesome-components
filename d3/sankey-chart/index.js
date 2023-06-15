const container = d3.select(".container");

const tooltip = container.append("div").attr("id", "tooltip");
// SVG frame
// the same margin, width and height are used for both visualizations
const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};

const width = 1000 + (margin.left + margin.right);
const height = 600 + (margin.top + margin.bottom);
const containerFrame = container
  .append("svg")
  .attr(
    "viewBox",
    `0 0 ${width + (margin.left + margin.right)} ${
      height + (margin.top + margin.bottom)
    }`
  )
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// ZOOM feature
// include a rectangle spanning the entire container, as to allow a translation on the wrapping group
containerFrame
  .append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", width)
  .attr("height", height)
  .attr("fill", "transparent");
// detail the zoom function and attach it to the group container
function zoomFunction() {
  const { x, y, k } = d3.event.transform;
  containerFrame.attr("transform", `translate(${x} ${y}) scale(${k})`);
}

const zoom = d3.zoom().scaleExtent([1, 5]).on("zoom", zoomFunction);
containerFrame.call(zoom);

// const url = "./syslog_report_correlation_device_202305151711_celcom.csv";
const url = "./500.csv";
const url2 =
  "https://gist.githubusercontent.com/mbostock/ca9a0bb7ba204d12974bca90acc507c0/raw/398136b7db83d7d7fd89181b080924eb76041692/energy.json";
const source = await d3.csv(url, d3.autoType);

//set up graph in same style as original example but empty
const graph = { nodes: [], links: [] };
source.forEach(function (d) {
  graph.nodes.push({ name: d.source });
  graph.nodes.push({ name: d.target });
  graph.links.push({ source: d.source, target: d.target, value: +d.value });
});
console.log(source);

// return only the distinct / unique nodes
graph.nodes = d3.keys(
  d3
    .nest()
    .key(function (d) {
      return d.name;
    })
    .object(graph.nodes)
);

// loop through each link replacing the text with its index from node
// graph.links.forEach(function (d, i) {
//   graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
//   graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
// });

function removeCircularLinks(arr) {
  // 用于存储已访问的对象
  const visited = new Set();

  // 递归检查对象中的循环链接
  function checkCircularLinks(obj) {
    if (typeof obj !== "object" || obj === null) {
      return;
    }

    // 检查当前对象是否已经被访问过
    if (visited.has(obj)) {
      // 如果已经访问过，则将对象设置为null
      obj = null;
      return;
    }

    // 将当前对象标记为已访问
    visited.add(obj);

    // 递归检查对象的属性
    for (let key in obj) {
      checkCircularLinks(obj[key]);
    }
  }

  // 遍历数组中的每个对象
  for (let i = 0; i < arr.length; i++) {
    checkCircularLinks(arr[i]);
  }

  // 过滤掉为null的对象
  arr = arr.filter((obj) => obj !== null);

  return arr;
}

const result = removeCircularLinks(graph.links);
console.log(0);
console.log(result);

// now loop through each nodes to make nodes an array of objects
// rather than an array of strings
graph.nodes.forEach(function (d, i) {
  graph.nodes[i] = { name: d };
});

// function creating the sankey diagram, based on an input data and frame (in which the visualization is plotted)
function createSankeyDiagram(data, frame) {
  // detail a color scale
  const color = d3.scaleOrdinal(d3.schemeSet3);

  // detail the sankey function
  const sankey = d3
    .sankey()
    // limit the nodes and links within the containing group
    .extent([
      [0, 0],
      [width, height],
    ]);

  // destructure the two arrays for the nodes and links in two variables
  const { nodes, links } = sankey(data);

  // detail in a defs block one linear gradient for each link
  // detail a unique identifier as to later call the id with the specified index
  const defs = frame.append("defs");

  const linearGradients = defs
    .selectAll("linearGradient")
    .data(links)
    .enter()
    .append("linearGradient")
    .attr("id", (d) => `gradient${d.index}`)
    .attr("x1", "0%")
    .attr("y1", "50%")
    .attr("x2", "100%")
    .attr("y2", "50%");

  // linear gradient going from left to right and detailing a color based on the source and target values
  linearGradients
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", (d) => color(d.source.index));

  linearGradients
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", (d) => color(d.target.index));

  // detail a generator function for the links
  const sankeyLinks = d3.sankeyLinkHorizontal();

  // append a path element for each link
  // using the generator function
  frame
    .selectAll("path.link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", sankeyLinks)
    .attr("fill", "none")
    // stroke using the gradient
    .attr("stroke", (d) => `url(#gradient${d.index})`)
    // stroke width based on the width of each data point
    .attr("stroke-width", (d) => d.width)
    // alter the opacity on hover
    // detail also the data through a simple tooltip
    .attr("opacity", 0.5)
    .on("mouseenter", function (d) {
      d3.select(this).transition().attr("opacity", 1);

      tooltip
        .append("p")
        .html(
          `<strong>${d.source.name}</strong> - <strong>${d.target.name}</strong>`
        );

      tooltip.append("p").html(`Value: <strong>${d.value}</strong>`);

      tooltip
        .style("opacity", 1)
        .style("left", `${d3.event.pageX}px`)
        .style("top", `${d3.event.pageY}px`);
    })
    .on("mouseout", function () {
      d3.select(this).transition().attr("opacity", 0.5);

      tooltip.style("opacity", 0).selectAll("p").remove();
    });

  // append a rectangle for each node
  // using the fabricated values and the color based on the index
  frame
    .selectAll("rect.node")
    .data(nodes)
    .enter()
    .append("rect")
    .attr("class", "node")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("pointer-events", "none")
    .attr("stroke", "#555")
    .attr("stroke-width", "1px")
    .attr("fill", (d) => color(d.index));

  // for each node append also a text element, detailing the respective value
  // horizontally position the text after or before the rectangle elements for each node
  frame
    .selectAll("text.node")
    .data(nodes)
    .enter()
    .append("text")
    .text((d) => d.name)
    .attr("font-size", "0.75rem")
    .attr("fill", "#111")
    .attr("x", (d) => {
      if (d.sourceLinks.length > 0) {
        return d.x0 + sankey.nodeWidth() + 5;
      }
      return d.x0 - 5;
    })
    .attr("y", (d) => (d.y1 + d.y0) / 2)
    .attr("pointer-events", "none")
    .attr("alignment-baseline", "middle")
    .attr("text-anchor", (d) => (d.sourceLinks.length > 0 ? "start" : "end"));
}

// createSankeyDiagram(graph, containerFrame);
fetch(url2)
  .then((response) => response.json())
  .then((json) => {
    // console.log(1);
    // console.log(graph);
    // console.log(2);
    // console.log(json);
    // createSankeyDiagram(graph, containerFrame)
    // const { nodes, links } = graph;
    testSankeyData(json);
  });

function testSankeyData() {
  let data2 = {
    nodes: [
      { name: "startA" },
      { name: "startB" },
      { name: "process1" },
      { name: "process2" },
      { name: "process3" },
      { name: "process4" },
      { name: "process5" },
      { name: "process6" },
      { name: "process7" },
      { name: "process8" },
      { name: "process9" },
      { name: "process10" },
      { name: "process11" },
      { name: "process12" },
      { name: "process13" },
      { name: "process14" },
      { name: "process15" },
      { name: "process16" },
      { name: "finishA" },
      { name: "finishB" },
      { name: "finishC" },
    ],
    links: [
      { source: "startA", target: "process1", value: 15 },
      { source: "startA", target: "process8", value: 20 },
      { source: "startA", target: "process5", value: 30 },
      { source: "startA", target: "process6", value: 20 },
      { source: "startB", target: "process1", value: 15 },
      { source: "startB", target: "process5", value: 15 },
      { source: "process1", target: "process4", value: 20 },
      { source: "process4", target: "process1", value: 10 },
      { source: "process2", target: "process7", value: 30 },
      { source: "process1", target: "process3", value: 10 },
      { source: "process5", target: "process3", value: 20 },
      { source: "process6", target: "startA", value: 5 },
      { source: "process4", target: "process2", value: 5 },
      { source: "process6", target: "process8", value: 15 },
      { source: "process4", target: "startB", value: 5 },
      { source: "process4", target: "process7", value: 10 },
      { source: "process3", target: "process2", value: 25 },
      { source: "process3", target: "startB", value: 5 },
      { source: "process15", target: "process13", value: 10 },
      { source: "process13", target: "finishC", value: 10 },
      { source: "process7", target: "startB", value: 20 },
      { source: "process8", target: "process1", value: 10 },
      { source: "process16", target: "process9", value: 10 },
      { source: "process8", target: "process11", value: 35 },
      { source: "process11", target: "process10", value: 25 },
      { source: "process4", target: "process12", value: 10 },
      { source: "process12", target: "process11", value: 5 },

      { source: "process7", target: "process15", value: 20 },
      { source: "process15", target: "process14", value: 10 },
      { source: "process10", target: "process9", value: 10 },
      { source: "process10", target: "process16", value: 20 },
      { source: "process14", target: "finishB", value: 10 },
      { source: "process9", target: "finishA", value: 10 },
      { source: "process16", target: "process8", value: 10 },
      { source: "process9", target: "finishB", value: 10 },
      { source: "process11", target: "process14", value: 25 },
    ],
  };

  var margin = { top: 200, right: 200, bottom: 200, left: 200 };
  var width = 1200;
  var height = 700;

  let data = graph;

  var nodePadding = 40;

  var sankey = d3
    .sankey()
    .nodeWidth(15)
    .nodePadding(nodePadding)
    .nodePaddingRatio(0.1)
    .size([width, height])
    .nodeId(function (d) {
      return d.name;
    })
    .nodeAlign(d3.sankeyJustify)
    .iterations(32);

  var svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  var g = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var linkG = g
    .append("g")
    .attr("class", "links")
    .attr("fill", "none")
    .attr("stroke-opacity", 0.2)
    .selectAll("path");

  var nodeG = g
    .append("g")
    .attr("class", "nodes")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .selectAll("g");

  //run the Sankey + circular over the data
  let sankeyData = sankey(data);
  let sankeyNodes = sankeyData.nodes;
  let sankeyLinks = sankeyData.links;

  let depthExtent = d3.extent(data.nodes, function (d) {
    return d.depth;
  });

  var colour = d3.scaleSequential(d3.interpolateCool).domain(depthExtent);

  let linkDistance = width / depthExtent[1];

  //Adjust link Y's based on target/source Y positions
  sortTargetLinks();
  sortSourceLinks();

  //create paths for circular links
  sankeyLinks = addCircularPathData(sankeyLinks);

  //draw everything
  var node = nodeG.data(sankeyNodes).enter().append("g");

  node
    .append("rect")
    .attr("x", function (d) {
      return d.x0;
    }) //Use original sankey defined positions
    .attr("y", function (d) {
      return d.y0;
    }) //Use force defined positions
    .attr("height", function (d) {
      return d.y1 - d.y0;
    })
    .attr("width", function (d) {
      return d.x1 - d.x0;
    })
    .style("fill", function (d) {
      return d.partOfCycle ? "red" : colour(d.depth);
    })
    .style("fill", function (d) {
      return colour(d.depth);
    })
    .style("opacity", 0.5)
    .style("stroke", "white")
    .on("mouseover", function (d) {
      d3.select(this).style("opacity", 1);
      let thisName = d.name;
      d3.selectAll("path").style("opacity", function (l) {
        return l.source.name == thisName || l.target.name == thisName ? 1 : 0.3;
      });
    })
    .on("mouseout", function (d) {
      d3.selectAll("rect").style("opacity", 0.5);
      d3.selectAll("path").style("opacity", 0.7);
    });

  node
    .append("text")
    .attr("x", function (d) {
      return d.x0 - 6;
    })
    .attr("y", function (d) {
      return d.y0 + (d.y1 - d.y0) / 2;
    })
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .text(function (d) {
      return d.name;
    })
    .filter(function (d) {
      return d.x0 < width / 2;
    })
    .attr("x", function (d) {
      return d.x1 + 6;
    })
    .attr("text-anchor", "start");

  node.append("title").text(function (d) {
    return d.name + "\n" + d.value;
  });

  var link = linkG
    .data(sankeyLinks)
    .enter()
    .append("path")
    .attr("d", curveSankeyForceLink)
    .style("stroke-width", function (d) {
      return Math.max(1, d.width);
    })
    .style("stroke", function (d) {
      return d.circular ? "red" : "black";
    })
    .style("opacity", 0.7);

  link.append("title").text(function (d) {
    return d.source.name + " → " + d.target.name + "\n ID: " + d.index;
  });

  //Create a normal curve or circular curve
  function curveSankeyForceLink(link) {
    let path = "";
    if (link.circular) {
      //path = computeCircleForcePath(d)
      path = link.circularPathData.path;
    } else {
      var normalPath = d3
        .linkHorizontal()
        .source(function (d) {
          let x = d.source.x0 + (d.source.x1 - d.source.x0);
          let y = d.y0; // + (d.source.y - d.source.y0);
          return [x, y];
        })
        .target(function (d) {
          let x = d.target.x0;
          let y = d.y1; // + (d.target.y - d.target.y0);
          return [x, y];
        });
      path = normalPath(link);
    }
    return path;
  }

  function linkAngle(link) {
    let angle = 0;
    let opposite = link.y1 - link.y0;
    let adjacent = link.target.x0 - link.source.x1;

    angle = Math.atan(Math.abs(opposite) / Math.abs(adjacent));

    console.log(
      "index: " +
        link.index +
        " y1: " +
        link.y1 +
        " y0: " +
        link.y0 +
        " opp: " +
        opposite +
        " adj: " +
        adjacent +
        " angle: " +
        angle
    );

    if (opposite > 0) {
      angle = angle + Math.PI / 2;
    } else {
      angle = Math.PI / 2 - angle;
    }

    return angle;
  }

  function addCircularPathData(links) {
    let maxLinkWidth = d3.max(links, function (link) {
      return link.width;
    });
    let minRadius = maxLinkWidth;
    let maxNodeDepth = d3.max(links, function (link) {
      return link.target.depth;
    });
    let minY = d3.min(links, function (link) {
      return link.source.y0;
    });

    let baseRadius = 10;

    let circularLinkGap = 2;

    //add the base data for each link
    links.forEach(function (link) {
      if (link.circular) {
        link.circularPathData = {};
        link.circularPathData.arcRadius = link.width + baseRadius;
        link.circularPathData.leftNodeBuffer = 10;
        link.circularPathData.rightNodeBuffer = 10;
        link.circularPathData.sourceWidth = link.source.x1 - link.source.x0;
        link.circularPathData.targetWidth = link.target.x1 - link.target.x0; //probably won't use
        link.circularPathData.sourceX =
          link.source.x0 + link.circularPathData.sourceWidth;
        link.circularPathData.targetX = link.target.x0;
        link.circularPathData.sourceY = linkSourceY(link);
        link.circularPathData.targetY = linkTargetY(link);

        //add left extent coordinates, based on links with same source depth and circularLink type
        let thisDepth = link.source.depth;
        let thisCircularLinkType = link.circularLinkType;
        let sameDepthLinks = links.filter(function (l) {
          return (
            l.source.depth == thisDepth &&
            l.circularLinkType == thisCircularLinkType
          );
        });

        if (link.circularLinkType == "bottom") {
          sameDepthLinks.sort(sortLinkSourceYDescending);
        } else {
          sameDepthLinks.sort(sortLinkSourceYAscending);
        }

        let radiusOffset = 0;
        sameDepthLinks.forEach(function (l, i) {
          if (l.circularLinkID == link.circularLinkID) {
            link.circularPathData.leftSmallArcRadius =
              baseRadius + link.width / 2 + radiusOffset;
            link.circularPathData.leftLargeArcRadius =
              baseRadius + link.width / 2 + i * circularLinkGap + radiusOffset;
          }
          radiusOffset = radiusOffset + l.width;
        });

        //add right extent coordinates, based on links with same target depth and circularLink type
        thisDepth = link.target.depth;
        sameDepthLinks = links.filter(function (l) {
          return (
            l.target.depth == thisDepth &&
            l.circularLinkType == thisCircularLinkType
          );
        });
        if (link.circularLinkType == "bottom") {
          sameDepthLinks.sort(sortLinkTargetYDescending);
        } else {
          sameDepthLinks.sort(sortLinkTargetYAscending);
        }

        radiusOffset = 0;
        sameDepthLinks.forEach(function (l, i) {
          if (l.circularLinkID == link.circularLinkID) {
            link.circularPathData.rightSmallArcRadius =
              baseRadius + link.width / 2 + radiusOffset;
            link.circularPathData.rightLargeArcRadius =
              baseRadius + link.width / 2 + i * circularLinkGap + radiusOffset;
          }
          radiusOffset = radiusOffset + l.width;
        });

        //add vertical extent coordinates, based on links with same target depth and circularLink type
        let sameCircularTypeLinks = links.filter(function (l) {
          return l.circularLinkType == thisCircularLinkType;
        });
        sameCircularTypeLinks.sort(sortLinkDepthAscending);

        let verticalOffset = 0;
        sameCircularTypeLinks.forEach(function (l, i) {
          if (l.circularLinkID == link.circularLinkID) {
            link.circularPathData.verticalBuffer =
              link.width / 2 + verticalOffset + i * circularLinkGap;
          }
          verticalOffset = verticalOffset + l.width;
        });

        //all links
        link.circularPathData.leftInnerExtent =
          link.circularPathData.sourceX + link.circularPathData.leftNodeBuffer;
        link.circularPathData.rightInnerExtent =
          link.circularPathData.targetX - link.circularPathData.rightNodeBuffer;
        link.circularPathData.leftFullExtent =
          link.circularPathData.sourceX +
          link.circularPathData.leftLargeArcRadius +
          link.circularPathData.leftNodeBuffer;
        link.circularPathData.rightFullExtent =
          link.circularPathData.targetX -
          link.circularPathData.rightLargeArcRadius -
          link.circularPathData.rightNodeBuffer;

        //bottom links
        if (link.circularLinkType == "bottom") {
          link.circularPathData.verticalFullExtent =
            height + 25 + link.circularPathData.verticalBuffer;
          link.circularPathData.verticalLeftInnerExtent =
            link.circularPathData.verticalFullExtent -
            link.circularPathData.leftLargeArcRadius;
          link.circularPathData.verticalRightInnerExtent =
            link.circularPathData.verticalFullExtent -
            link.circularPathData.rightLargeArcRadius;
        }
        //top links
        else {
          link.circularPathData.verticalFullExtent =
            minY - 25 - link.circularPathData.verticalBuffer;
          link.circularPathData.verticalLeftInnerExtent =
            link.circularPathData.verticalFullExtent +
            link.circularPathData.leftLargeArcRadius;
          link.circularPathData.verticalRightInnerExtent =
            link.circularPathData.verticalFullExtent +
            link.circularPathData.rightLargeArcRadius;
        }

        link.circularPathData.path = createCircularPathString(link);
      }
    });

    return links;
  }

  function createCircularPathString(link) {
    let pathString = "";
    let pathData = console.log(link.circularPathData.sourceX);

    if (link.circularLinkType == "top") {
      pathString =
        // start at the right of the source node
        "M" +
        link.circularPathData.sourceX +
        " " +
        link.circularPathData.sourceY +
        " " +
        // line right to buffer point
        "L" +
        link.circularPathData.leftInnerExtent +
        " " +
        link.circularPathData.sourceY +
        " " +
        //Arc around: Centre of arc X and  //Centre of arc Y
        "A" +
        link.circularPathData.leftLargeArcRadius +
        " " +
        link.circularPathData.leftSmallArcRadius +
        " 0 0 0 " +
        //End of arc X //End of arc Y
        link.circularPathData.leftFullExtent +
        " " +
        (link.circularPathData.sourceY -
          link.circularPathData.leftSmallArcRadius) +
        " " + //End of arc X
        // line up to buffer point
        "L" +
        link.circularPathData.leftFullExtent +
        " " +
        link.circularPathData.verticalLeftInnerExtent +
        " " +
        //Arc around: Centre of arc X and  //Centre of arc Y
        "A" +
        link.circularPathData.leftLargeArcRadius +
        " " +
        link.circularPathData.leftLargeArcRadius +
        " 0 0 0 " +
        //End of arc X //End of arc Y
        link.circularPathData.leftInnerExtent +
        " " +
        link.circularPathData.verticalFullExtent +
        " " + //End of arc X
        // line left to buffer point
        "L" +
        link.circularPathData.rightInnerExtent +
        " " +
        link.circularPathData.verticalFullExtent +
        " " +
        //Arc around: Centre of arc X and  //Centre of arc Y
        "A" +
        link.circularPathData.rightLargeArcRadius +
        " " +
        link.circularPathData.rightLargeArcRadius +
        " 0 0 0 " +
        //End of arc X //End of arc Y
        link.circularPathData.rightFullExtent +
        " " +
        link.circularPathData.verticalRightInnerExtent +
        " " + //End of arc X
        // line down
        "L" +
        link.circularPathData.rightFullExtent +
        " " +
        (link.circularPathData.targetY -
          link.circularPathData.rightSmallArcRadius) +
        " " +
        //Arc around: Centre of arc X and  //Centre of arc Y
        "A" +
        link.circularPathData.rightLargeArcRadius +
        " " +
        link.circularPathData.rightSmallArcRadius +
        " 0 0 0 " +
        //End of arc X //End of arc Y
        link.circularPathData.rightInnerExtent +
        " " +
        link.circularPathData.targetY +
        " " + //End of arc X
        //line to end
        "L" +
        link.circularPathData.targetX +
        " " +
        link.circularPathData.targetY;
    }
    //bottom path
    else {
      pathString =
        // start at the right of the source node
        "M" +
        link.circularPathData.sourceX +
        " " +
        link.circularPathData.sourceY +
        " " +
        // line right to buffer point
        "L" +
        link.circularPathData.leftInnerExtent +
        " " +
        link.circularPathData.sourceY +
        " " +
        //Arc around: Centre of arc X and  //Centre of arc Y
        "A" +
        link.circularPathData.leftLargeArcRadius +
        " " +
        link.circularPathData.leftSmallArcRadius +
        " 0 0 1 " +
        //End of arc X //End of arc Y
        link.circularPathData.leftFullExtent +
        " " +
        (link.circularPathData.sourceY +
          link.circularPathData.leftSmallArcRadius) +
        " " + //End of arc X
        // line down to buffer point
        "L" +
        link.circularPathData.leftFullExtent +
        " " +
        link.circularPathData.verticalLeftInnerExtent +
        " " +
        //Arc around: Centre of arc X and  //Centre of arc Y
        "A" +
        link.circularPathData.leftLargeArcRadius +
        " " +
        link.circularPathData.leftLargeArcRadius +
        " 0 0 1 " +
        //End of arc X //End of arc Y
        link.circularPathData.leftInnerExtent +
        " " +
        link.circularPathData.verticalFullExtent +
        " " + //End of arc X
        // line left to buffer point
        "L" +
        link.circularPathData.rightInnerExtent +
        " " +
        link.circularPathData.verticalFullExtent +
        " " +
        //Arc around: Centre of arc X and  //Centre of arc Y
        "A" +
        link.circularPathData.rightLargeArcRadius +
        " " +
        link.circularPathData.rightLargeArcRadius +
        " 0 0 1 " +
        //End of arc X //End of arc Y
        link.circularPathData.rightFullExtent +
        " " +
        link.circularPathData.verticalRightInnerExtent +
        " " + //End of arc X
        // line up
        "L" +
        link.circularPathData.rightFullExtent +
        " " +
        (link.circularPathData.targetY +
          link.circularPathData.rightSmallArcRadius) +
        " " +
        //Arc around: Centre of arc X and  //Centre of arc Y
        "A" +
        link.circularPathData.rightLargeArcRadius +
        " " +
        link.circularPathData.rightSmallArcRadius +
        " 0 0 1 " +
        //End of arc X //End of arc Y
        link.circularPathData.rightInnerExtent +
        " " +
        link.circularPathData.targetY +
        " " + //End of arc X
        //line to end
        "L" +
        link.circularPathData.targetX +
        " " +
        link.circularPathData.targetY;
    }

    return pathString;
  }

  function sortLinkDepthAscending(link1, link2) {
    return linkDepthDistance(link1) - linkDepthDistance(link2);
  }

  function sortLinkSourceYAscending(link1, link2) {
    return linkSourceY(link1) - linkSourceY(link2);
  }

  function sortLinkSourceYDescending(link1, link2) {
    return linkSourceY(link2) - linkSourceY(link1);
  }

  function sortLinkTargetYAscending(link1, link2) {
    return linkTargetY(link1) - linkTargetY(link2);
  }

  function sortLinkTargetYDescending(link1, link2) {
    return linkTargetY(link2) - linkTargetY(link1);
  }

  function linkDepthDistance(link) {
    return link.source.depth - link.target.depth;
  }

  function linkSourceY(link) {
    //return link.y0 + (link.source.y - link.source.y0);
    return link.y0;
  }

  function linkTargetY(link) {
    //return link.y1 + (link.target.y - link.target.y0);
    return link.y1;
  }

  function sortSourceLinks() {
    sankeyNodes.forEach(function (node) {
      //move any nodes up which are off the bottom
      if (node.y + (node.y1 - node.y0) > height) {
        console.log("adjusted y for node " + node.name);
        node.y = node.y - (node.y + (node.y1 - node.y0) - height);
      }

      let nodesSourceLinks = sankeyLinks.filter(function (l) {
        return l.source.name == node.name;
      });

      //if more than 1 link then sort
      if (nodesSourceLinks.length > 1) {
        nodesSourceLinks.sort(function (link1, link2) {
          //if both are not circular...
          if (!link1.circular && !link2.circular) {
            console.log(
              "---------------------------------------------------------"
            );

            let link1Angle = linkAngle(link1);
            let link2Angle = linkAngle(link2);

            console.log(
              "node: " +
                node.name +
                " link1 " +
                link1.index +
                " link1 A " +
                link1Angle +
                " link2 " +
                link2.index +
                " link2 A " +
                link2Angle
            );

            console.log(
              "---------------------------------------------------------"
            );

            return link1Angle - link2Angle;
            //return link2Angle - link1Angle
          }

          //if only one is circular, the move top links up, or bottom links down
          if (link1.circular && !link2.circular) {
            console.log(link1.circularLinkID);
            return link1.circularLinkType == "top" ? -1 : 1;
          } else if (link2.circular && !link1.circular) {
            console.log(link2.circularLinkID);
            return link2.circularLinkType == "top" ? 1 : -1;
          }

          //if both links are circular...
          if (link1.circular && link2.circular) {
            //...and they both loop the same way (both top)
            if (
              link1.circularLinkType === link2.circularLinkType &&
              link1.circularLinkType == "top"
            ) {
              //...and they both connect to a target with same depth, then sort by the target's y
              if (link1.target.depth === link2.target.depth) {
                return link1.target.y1 - link2.target.y1;
              }
              //...and they connect to different depth targets, then sort by how far back they
              else {
                return link1.target.depth - link2.target.depth;
              }
            }

            //...and they both loop the same way (both bottom)
            else if (
              link1.circularLinkType === link2.circularLinkType &&
              link1.circularLinkType == "bottom"
            ) {
              //...and they both connect to a target with same depth, then sort by the target's y
              if (link1.target.depth === link2.target.depth) {
                return link2.target.y1 - link1.target.y1;
              }
              //...and they connect to different depth targets, then sort by how far back they
              else {
                return link1.target.depth - link2.target.depth;
              }
            }

            //...and they loop around different ways, the move top up and bottom down
            else {
              return link1.circularLinkType == "top" ? -1 : 1;
            }
          }
        });
      }

      //update y0 for links
      let ySourceOffset = node.y0;

      console.log(nodesSourceLinks);

      nodesSourceLinks.forEach(function (link) {
        link.y0 = ySourceOffset + link.width / 2;
        ySourceOffset = ySourceOffset + link.width;
      });
    });
  }

  function sortTargetLinks() {
    sankeyNodes.forEach(function (node) {
      let nodesTargetLinks = sankeyLinks.filter(function (l) {
        return l.target.name == node.name;
      });

      if (nodesTargetLinks.length > 1) {
        nodesTargetLinks.sort(function (link1, link2) {
          //if both are not circular, the base on the target y position
          if (!link1.circular && !link2.circular) {
            let link1Angle = linkAngle(link1);
            let link2Angle = linkAngle(link2);

            return link2Angle - link1Angle;
          }

          //if only one is circular, the move top links up, or bottom links down
          if (link1.circular && !link2.circular) {
            console.log(link1.circularLinkID);
            return link1.circularLinkType == "top" ? -1 : 1;
          } else if (link2.circular && !link1.circular) {
            console.log(link2.circularLinkID);
            return link2.circularLinkType == "top" ? 1 : -1;
          }

          //if both links are circular...
          if (link1.circular && link2.circular) {
            //...and they both loop the same way (both top)
            if (
              link1.circularLinkType === link2.circularLinkType &&
              link1.circularLinkType == "top"
            ) {
              //...and they both connect to a target with same depth, then sort by the target's y
              if (link1.source.depth === link2.source.depth) {
                return link1.source.y1 - link2.source.y1;
              }
              //...and they connect to different depth targets, then sort by how far back they
              else {
                return link1.source.depth - link2.source.depth;
              }
            }

            //...and they both loop the same way (both bottom)
            else if (
              link1.circularLinkType === link2.circularLinkType &&
              link1.circularLinkType == "bottom"
            ) {
              //...and they both connect to a target with same depth, then sort by the target's y
              if (link1.source.depth === link2.source.depth) {
                return link2.source.y1 - link1.source.y1;
              }
              //...and they connect to different depth targets, then sort by how far back they
              else {
                return link2.source.depth - link1.source.depth;
              }
            }

            //...and they loop around different ways, the move top up and bottom down
            else {
              return link1.circularLinkType == "top" ? -1 : 1;
            }
          }
        });
      }

      //update y1 for links
      let yTargetOffset = node.y0;

      nodesTargetLinks.forEach(function (link) {
        console.log(link.circularLinkID);
        link.y1 = yTargetOffset + link.width / 2;
        yTargetOffset = yTargetOffset + link.width;
      });
    });
  }
}
