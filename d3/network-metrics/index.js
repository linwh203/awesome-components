import { WIDTH, HEIGHT, CIRCLE_SIZE_MAX, CIRCLE_SIZE_MIN } from "./constant.js";
import { KKG } from "./krackhardt_kite_graph.js";
import { centralityMeasures } from "./centrality-measures.js";
import {
  drawSVG,
  drawLine,
  drawNodes,
  drawText,
  drawTip,
  drawCentralityControls,
  drawTable,
  drawForceSimulation
} from "./draw-element.js";

const { scaleSqrt, format } = d3;

let currentMeasure = centralityMeasures[0];

const formatCentrality = format(".2");

const createNetworkVisualization = (graph, centralityMeasures) => {
  const { nodes: graphNodes, links: graphLinks } = graph;

  // draw svg start
  // svg
  const svg = drawSVG({ width: WIDTH, height: HEIGHT })
    .on("click", (event) => highlightNode(event, null))
    .on("contextmenu", (event) => event.preventDefault());
  // tip
  const tip = drawTip().html(
    (_, d) =>
      `${currentMeasure}:${formatCentrality(d.centrality[currentMeasure])}`
  );
  svg.call(tip);
  // scale
  const circleSize = { min: CIRCLE_SIZE_MIN, max: CIRCLE_SIZE_MAX };
  const circleRadiusScale = scaleSqrt()
    .domain([0, 1])
    .range([circleSize.min, circleSize.max]);
  // links
  const links = drawLine(svg, graphLinks);
  // nodes
  const nodes = drawNodes(svg, graphNodes)
    .on("click", (event, node) => highlightNode(event, node))
    .on("mouseenter", (event, node) => tip.show(event, node))
    .on("mouseout", () => tip.hide());
  nodes.append("title");
  // text
  const text = drawText(svg, graphNodes);
  // draw svg end

  // initialize start
  updateCentralityMeasure(currentMeasure);
  drawForceSimulation({
    nodesData: graphNodes,
    linksData: graphLinks,
    centerX:  WIDTH / 2,
    centerY: HEIGHT / 2,
    collide: circleSize.max * 1.25,
    D3nodes: nodes,
    D3links: links,
    D3text: text,
  })
  drawCentralityControls({
    controlData: centralityMeasures,
    clickEvent: updateCentralityMeasure,
  });
  drawTable({
    width: WIDTH,
    columns: centralityMeasures,
    format: formatCentrality,
    nodes: graphNodes,
    hightEvent: highlightNode,
  });
  // initialize end

  function updateCentralityMeasure(centralityMeasure) {
    nodes
      .transition()
      .duration(250)
      .attr("r", (d) => circleRadiusScale(d.centrality[centralityMeasure]));

    nodes
      .selectAll("title")
      .text((d) => formatCentrality(d.centrality[centralityMeasure]));
    currentMeasure = centralityMeasure;
  }
  
  function highlightNode(event, node) {
    highlightCircle(node);
    highlightTableRow(node);
    highlightAdjacentLinks(node);
    event.stopPropagation();

    function highlightCircle(node) {
      highlightElement(".nodes circle", node);
    }

    function highlightTableRow(node) {
      highlightElement("tbody tr", node);
    }

    function highlightElement(selector, node) {
      const elements = d3.selectAll(selector);
      elements.classed("highlight", false);
      node && elements.classed("highlight", (d) => d.id === node.id);
    }

    function highlightAdjacentLinks(node) {
      const linkIDs = graphLinks.map(createLinkID);
      const adjacentLinks = adjacentLinksFrom(node);
      const adjacentLinkIDs = adjacentLinks.map(createLinkID);

      linkIDs.forEach((linkID) => {
        d3.select(linkID).classed(
          "highlight",
          adjacentLinkIDs.indexOf(linkID) !== -1
        );
      });

      function createLinkID(link) {
        return `#link-${link.source.id}-${link.target.id}`;
      }

      function adjacentLinksFrom(node) {
        const links = [];
        if (!node) return links;
        graphLinks.forEach((link) => {
          (node.id === link.source.id || node.id === link.target.id) &&
            links.push(link);
        });
        return links;
      }
    }
  }
};

createNetworkVisualization(KKG, centralityMeasures);
