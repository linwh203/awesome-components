const { select, tip, forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } = d3;

const MARK_END_SIZE = 3
const MARK_START_SIZE = 2

export const drawSVG = (options) =>
  select("svg").attr("width", options.width).attr("height", options.height);

export const drawTip = () => tip().attr("class", "d3-tip");

export const drawLine = (svg, links) =>
  svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("id", (d) => `link-${d.source}-${d.target}`);

export const drawLineWithPath = (svg, links, color, colorKeyName) => 
  svg.append("g")
    .attr("class", "links")
    .attr("fill", "none")
    .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("stroke", d => color(d[colorKeyName]))

export const drawMarks = (svg, markData, color) => {
  const defs = svg
    .selectAll("defs")
    .data(markData)
    .join("defs");
  
  defs
    .append("marker")
    .attr("id", d => `arrow-${d}-end`)
    .attr("viewBox", "0 0 60 60")
    .attr("refX", 0)
    .attr("refY", 30)
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", MARK_END_SIZE)
    .attr("markerHeight", MARK_END_SIZE)
    .attr("orient", "auto")
    .attr("overflowX", "hidden")
    .append("path")
    .attr("d", "M 0 0 L 60 30 L 0 60 z")
    .attr("class", "stroke-and-fill")
    .attr("fill", color)

  defs
    .append("marker")
    .attr("id", d => `arrow-${d}-start`)
    .attr("viewBox", "0 0 60 60")
    .attr("refX", 60)
    .attr("refY", 30)
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", MARK_START_SIZE)
    .attr("markerHeight", MARK_START_SIZE)
    .attr("orient", "auto")
    .attr("overflowX", "hidden")
    .append("path")
    .attr("d", "M 60 0 L 0 30 L 60 60 z")
    .attr("class", "stroke-and-fill")
    .attr("fill", color)
}


export const drawNodes = (svg, nodes) =>
  svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle");

export const drawText = (svg, nodes) =>
  svg
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .text((node) => node.name);

export const drawCentralityControls = ({ controlData, clickEvent }) => {
  const spans = select("#controls")
    .selectAll("span")
    .data(controlData)
    .enter()
    .append("span");

  spans
    .append("input")
    .attr("id", (d) => d)
    .attr("type", "radio")
    .attr("name", "centrality")
    .attr("value", (d) => d)
    .property("checked", (_, i) => i === 0)
    .on("click", (_, node) => clickEvent(node));

  spans
    .append("label")
    .attr("for", (d) => d)
    .text((d) => titleCase(d));
};

export const drawTable = ({ width, columns, format, nodes, hightEvent }) => {
  const table = select("table").style("width", width + "px");

  const columnNames = ["Node"].concat(columns);
  table
    .append("thead")
    .append("tr")
    .selectAll("th")
    .data(columnNames)
    .enter()
    .append("th")
    .text((d) => titleCase(d));

  const rows = table
    .append("tbody")
    .selectAll("tr")
    .data(nodes, (d) => d.id)
    .enter()
    .append("tr")
    .attr("id", (d) => `row-${d.id}`);

  rows
    .selectAll("td")
    .data((node) => {
      const measures = columns.map((centralityMeasure) =>
        format(node.centrality[centralityMeasure])
      );
      return [node.id].concat(measures);
    })
    .enter()
    .append("td")
    .text((d) => d);

  rows
    .on("mouseover", (event, node) => hightEvent(event, node))
    .on("mouseout", (event, node) => hightEvent(event, null));
};

export const drawForceSimulation = ({nodesData, linksData, centerX, centerY, collide, D3nodes, D3links, D3text}) => {
  const simulation = forceSimulation()
    .force(
      "link",
      forceLink().id((d) => d.id)
    )
    .force("charge", forceManyBody())
    .force("center", forceCenter(centerX, centerY))
    .force(
      "collide",
      forceCollide((_) => collide)
    )
    .nodes(nodesData)
    // .on("tick", tick);

  simulation.force("link").links(linksData);

  return simulation

  // function tick() {
  //   D3nodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  //   D3links
  //     .attr("x1", (d) => {
  //       console.log(d)
  //       return d.source.x
  //     })
  //     .attr("y1", (d) => d.source.y)
  //     .attr("x2", (d) => d.target.x)
  //     .attr("y2", (d) => d.target.y);
  //   D3text.attr("x", (node) => node.x).attr("y", (node) => node.y);
  // }
};

function titleCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function lineLengthBetweenTwoCircle (x1,y1,r1,x2,y2,r2) {
  const ra = (x1 > x2 ? Math.PI : 0) + Math.atan((y2 - y1) / (x2 - x1));
  const sa = Math.sin(ra);
  const ca = Math.cos(ra);
  return [x1 + r1 * ca, y1 + r1 * sa, x2 - r2 * ca, y2 - r2 * sa];
}

export function lineLengthOfD ({d, circleRadiusScale, dPropertyName, currentMeasure,  offset = 0}) {
  const {source, target} = d
  const {x: x1, y: y1} = source
  const {x: x2, y: y2} = target
  // console.log(circleRadiusScale(source[dPropertyName][currentMeasure]))
  const r1 = circleRadiusScale(source[dPropertyName][currentMeasure]) + MARK_START_SIZE * offset
  const r2 = circleRadiusScale(target[dPropertyName][currentMeasure]) + MARK_END_SIZE * offset
  // x1,y1,r1,x2,y2,r2
  const ra = (x1 > x2 ? Math.PI : 0) + Math.atan((y2 - y1) / (x2 - x1));
  const sa = Math.sin(ra);
  const ca = Math.cos(ra);
  // return [x1 + r1 * ca, y1 + r1 * sa, x2 - r2 * ca, y2 - r2 * sa];
  return {
    lx1: x1 + r1 * ca,
    ly1: y1 + r1 * sa,
    lx2: x2 - r2 * ca,
    ly2: y2 - r2 * sa 
  }
}
