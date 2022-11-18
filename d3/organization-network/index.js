import { nodes, links, MANY_BODY_STRENGTH } from "./data.js";
const { forceSimulation, forceManyBody, forceLink, forceCenter, select, drag } =
  d3;

const width = window.innerWidth;
const height = window.innerHeight;
const centerX = width / 2;
const centerY = height / 2;

const svg = select("#container")
  .attr('width', width)
  .attr('height', height);

const simulation = forceSimulation(nodes)
  .force("charge", forceManyBody().strength(MANY_BODY_STRENGTH))
  .force(
    "link",
    forceLink(links).distance((link) => link.distance)
  )
  //   .force("link", forceLink(links).id(function(d) { return d.id; })) // 用字符串名称匹配
  .force("center", forceCenter(centerX, centerY));

const dragInteraction = drag()
  .on('drag', function(dragEvent, node) {
      console.log(dragEvent)
      console.log(node)
      node.fx = dragEvent.x
      node.fy = dragEvent.y
      simulation.alpha(1)
      simulation.restart()
  })

const lines = svg
  .selectAll("line")
  .data(links)
  .enter()
  .append("line")
  .attr("stroke", (node) => node.color);
//   .attr('x1', link => console.log(link.source.x))

const circles = svg
  .selectAll("circle")
  .data(nodes)
  .enter()
  .append("circle")
  .attr("fill", (node) => node.color || "gray")
  .attr("r", (node) => node.size)
  .call(dragInteraction)

// display label on the circle
const text = svg
  .selectAll("text")
  .data(nodes)
  .enter()
  .append("text")
  .attr("text-anchor", "middle")
  .attr("alignment-baseline", "middle")
  .style('pointer-events', 'none')
  .text((node) => node.id);

simulation.on("tick", () => {
  circles.attr("cx", (node) => node.x).attr("cy", (node) => node.y);
  text.attr("x", (node) => node.x).attr("y", (node) => node.y);
  lines
    .attr("x1", (link) => link.source.x)
    .attr("y1", (link) => link.source.y)
    .attr("x2", (link) => link.target.x)
    .attr("y2", (link) => link.target.y);
});
