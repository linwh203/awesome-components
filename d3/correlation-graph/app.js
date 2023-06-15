import { circleSize, positionLink, positionNode } from "./helper.js";
import { fetchData } from "./fetchData.js";

const data = await fetchData();
// const { nodes, links } = data;
console.log(data);

const draw = (elSelector, data) => {
  const element = document.querySelector(elSelector);
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }

  const nodes = data.nodes;
  const links = data.links;

  // dimensions
  const width = 1000;
  const height = 1000;
  const margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  };

  const svg = d3
    .select(elSelector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const ctrWidth = width - margin.left - margin.right,
    ctrHeight = height - margin.top - margin.bottom;

  /*
      NOTE: For D3 v6+, must pass ndoes to forceSimulation and links to force link, 
      NOTE: to give links x and y coordinates
  
      force link => pull nodes together based on the links between them
      force charge => push nodes apart to space them out
      force collide => add some collision detection so they don't overlap
      force center => draw them around the centre of the space
    */
  const d3ForceLink = (links) => d3.forceLink(links).id((d) => d.id);
  const d3ForceCharge = (strength) => d3.forceManyBody().strength(strength);
  const d3ForceCollide = (radius) => d3.forceCollide().radius(radius);
  const d3ForceCenter = d3.forceCenter(ctrWidth / 2, ctrHeight / 2);
  const d3ForceX = d3.forceX();
  const d3ForceY = d3.forceY();

  updateForce(nodes, links);

  function updateForce(nodes, links) {
    const simulation = d3
      .forceSimulation(nodes)
      .force("link", d3ForceLink(links))
      .force("charge", d3ForceCharge(-200))
      .force("collide", d3ForceCollide(20))
      .force("center", d3ForceCenter)
      .force("x", d3ForceX)
      .force("y", d3ForceY);

    function dragStart(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragging(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnd(event, d) {
      if (!event.active) simulation.alphaTarget(0).restart();
      d.fx = event.x;
      d.fy = event.y;
    }

    const drag = d3
      .drag()
      .on("start", dragStart)
      .on("drag", dragging)
      .on("end", dragEnd);

    const graphLinks = svg
      .selectAll(".link")
      .data(links)
      .join("path")
      .attr("class", "link")
      .attr("stroke-width", (d) => d.value * 4)
      .attr("stroke", (d) => "#ddd");

    const graphNodes = svg.selectAll(".node").data(nodes).join("g");

    // build a dictionary of nodes that are linked
    const linkedByIndex = {};
    links.forEach(function (d) {
      linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });

    // check the dictionary to see if nodes are linked
    const isConnected = (a, b) => {
      return (
        linkedByIndex[a.index + "," + b.index] ||
        linkedByIndex[b.index + "," + a.index] ||
        a.index == b.index
      );
    };

    // fade nodes on hover
    const mouseOver = (opacity) => (event, d) => {
      // check all other nodes to see if they're connected
      // to this one. if so, keep the opacity at 1, otherwise
      // fade
      console.log(d);
      graphNodes.style("stroke-opacity", function (o) {
        const thisOpacity = isConnected(d, o) ? 1 : opacity;
        return thisOpacity;
      });
      graphNodes.style("fill-opacity", function (o) {
        const thisOpacity = isConnected(d, o) ? 1 : opacity;
        return thisOpacity;
      });
      // also style link accordingly
      graphLinks.style("stroke-opacity", function (o) {
        return o.source === d || o.target === d ? 1 : opacity;
      });
      graphLinks.style("stroke", function (o) {
        return o.source === d || o.target === d ? o.source.colour : "#ddd";
      });
    };

    const mouseOut = () => {
      graphNodes.style("stroke-opacity", 1);
      graphNodes.style("fill-opacity", 1);
      graphLinks.style("stroke-opacity", 1);
      graphLinks.style("stroke", "#ddd");
    };

    graphNodes
      .append("circle")
      .classed("node", true)
      .attr("r", (d) => circleSize(d.severity))
      .attr("fill", (d) => d.colour)
      .attr("data-severity", (d) => d.severity)
      .on("mouseover", mouseOver(0.2))
      .on("mouseout", mouseOut)
      .call(drag);

    graphNodes.append("title").text((d) => d.id);

    graphNodes
      .append("text")
      .attr("dx", -12)
      .attr("dy", "-0.9em")
      .attr("font-size", "10px")
      .text((d) => d.name)
      .style("stroke", "black")
      .style("stroke-width", 0.5)
      .style("fill", (d) => d.colour);

    // on each tick, update node and link positions
    const ticked = () => {
      graphLinks.attr("d", (d) => positionLink(d));
      graphNodes.attr("transform", positionNode(ctrWidth, ctrHeight));
    };

    // add the nodes to the simulation and
    // tell it what to do on each tick
    simulation.nodes(nodes).on("tick", ticked);
  }
};

draw("#chart", data);

d3.select("#severity").on("change", function (e) {
  e.preventDefault();
  // console.log(this.value)
  const severity = +this.value;
  // const newNodes = data.nodes.filter((node) => node.severity >= severity);
  const newLinks = data.links.filter(
    (link) => link.target.severity >= severity
  );
  let severityGroup = [];
  newLinks.forEach((link) => {
    severityGroup.push(link.source);
    severityGroup.push(link.target);
  });
  severityGroup = Array.from(new Set(severityGroup));
  // console.log(severityGroup);
  const newData = { nodes: severityGroup, links: newLinks };
  console.log(newData);
  draw("#chart", newData);
});
