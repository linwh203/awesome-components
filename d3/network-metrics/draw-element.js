const { select, tip, forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } = d3;

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
    .on("tick", tick);

  simulation.force("link").links(linksData);

  function tick() {
    D3nodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    D3links
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);
    D3text.attr("x", (node) => node.x).attr("y", (node) => node.y);
  }
};

function titleCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
