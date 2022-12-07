import {
  WIDTH,
  HEIGHT,
  CIRCLE_SIZE_MAX,
  CIRCLE_SIZE_MIN,
  LINE_STROKE_WIDTH,
  LINE_STROKE_WIDTH_HIGHLIGHT,
} from "./constant.js";
import { KKG } from "./krackhardt_kite_graph.js";
import { centralityMeasures } from "./centrality-measures.js";
import {
  drawSVG,
  drawLine,
  drawLineWithPath,
  lineLengthOfD,
  drawMarks,
  drawNodes,
  drawText,
  drawTip,
  drawCentralityControls,
  drawTable,
  drawForceSimulation,
} from "./draw-element.js";

const { scaleSqrt, format, drag } = d3;

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

  // Per-type markers, as they don't inherit styles.
  const status = Array.from(new Set(graphLinks.map((d) => d.status)));
  const color = d3.scaleOrdinal(status, d3.schemeCategory10);
  const defs = drawMarks(svg, status, color);
  // links
  const links = drawLine(svg, graphLinks)
    // const links = drawLineWithPath(svg, graphLinks, color, 'status')
    .attr("stroke", (d) => color(d.status))
    .attr("marker-start", (d) => `url(#arrow-${d.status}-start)`)
    .attr("marker-end", (d) => `url(#arrow-${d.status}-end)`);
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
  const simulation = drawForceSimulation({
    nodesData: graphNodes,
    linksData: graphLinks,
    centerX: WIDTH / 2,
    centerY: HEIGHT / 2,
    collide: circleSize.max * 1.25,
    D3nodes: nodes,
    D3links: links,
    D3text: text,
  });

  simulation.on("tick", tick);
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
  updateCentralityMeasure(currentMeasure);

  const dragInteraction = drag()
  .on('drag', function(dragEvent, node) {
    simulation.restart()
  })

  svg.call(dragInteraction)

  // initialize end

  function tick(offset = LINE_STROKE_WIDTH + 2, transitionFlag = false) {
    nodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    let newLink = links;
    if (transitionFlag) {
      // newLink = links.transition();
    }
    newLink
      .attr("x1", (d) => {
        const { lx1 } = lineLengthOfD({
          d,
          circleRadiusScale,
          dPropertyName: "centrality",
          currentMeasure,
          offset,
        });
        return lx1;
        // return d.source.x
      })
      .attr("y1", (d) => {
        const { ly1 } = lineLengthOfD({
          d,
          circleRadiusScale,
          dPropertyName: "centrality",
          currentMeasure,
          offset,
        });
        return ly1;
        // d.source.y
      })
      .attr("x2", (d) => {
        const { lx2 } = lineLengthOfD({
          d,
          circleRadiusScale,
          dPropertyName: "centrality",
          currentMeasure,
          offset,
        });
        return lx2;
        // d.target.x
      })
      .attr("y2", (d) => {
        const { ly2 } = lineLengthOfD({
          d,
          circleRadiusScale,
          dPropertyName: "centrality",
          currentMeasure,
          offset,
        });
        return ly2;
        // d.target.y
      });
    text.attr("x", (node) => node.x).attr("y", (node) => node.y);
  }

  function updateCentralityMeasure(centralityMeasure) {
    currentMeasure = centralityMeasure;
    nodes
      .transition()
      .duration(250)
      .attr("r", (d) => circleRadiusScale(d.centrality[centralityMeasure]));

    nodes
      .selectAll("title")
      .text((d) => formatCentrality(d.centrality[centralityMeasure]));

    tick(LINE_STROKE_WIDTH_HIGHLIGHT + 2, true);
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

// const data = function() {
//   const { nodes, links } = KKG
//   console.log(newNodes.concat(nodes))
//   let newNodes = [], newLinks = []
//   for(let i = 0; i < 10; i++) {
//     newNodes.concat(nodes)
//     newLinks.concat(links)
//   }
//   console.log(newNodes)
//   return {
//     nodes: newNodes,
//     links: newLinks
//   }
// }

// createNetworkVisualization(data(), centralityMeasures);
createNetworkVisualization(KKG, centralityMeasures);
