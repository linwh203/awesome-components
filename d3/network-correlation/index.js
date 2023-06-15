const url = "../csv/syslog_report_correlation_ip_all.csv";
// "./test.csv"
// const url = "../sankey-chart/15.csv";
const links = await d3.csv(url, d3.autoType);
// console.log('links',links);

const ips = Array.from(new Set(links.map((d) => d.ip)));
console.log("ips", ips);

const data = {
  nodes: Array.from(
    new Set(links.flatMap((l) => [l.source, l.target])),
    (id) => ({ id })
  ),
  links,
};
console.log("data", data);

const color = d3.scaleOrdinal(ips, d3.schemeCategory10);

function linkArc(d) {
  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
  return `
      M${d.source.x},${d.source.y}
      A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
    `;
}
const drag = (simulation) => {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    // if (!event.active) simulation.alphaTarget(0);
    // d.fx = null;
    // d.fy = null;
  }

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
};
// SVG frame
// the same margin, width and height are used for both visualizations
const container = d3.select(".container");
const tooltip = container.append("div").attr("id", "tooltip");
const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};
let width = 1000;
let height = 1000;

const containerFrame = container
  .append("svg")
  //   .attr("viewBox", [-width / 2, -height / 2, width, height])
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + margin.top + "," + margin.left + ")");

width = width - margin.left - margin.right;
height = height - margin.top - margin.bottom;
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
function zoomFunction(e) {
  //   const { x, y, k } = d3.event.transform;
  const { x, y, k } = e.transform;
  containerFrame.attr("transform", `translate(${x} ${y}) scale(${k})`);
}

const zoom = d3
  .zoom()
  .scaleExtent([1, 5])
  .on("zoom", (e) => zoomFunction(e));
containerFrame.call(zoom);

drawChart(containerFrame);

function drawChart(svg) {
  const { nodes, links } = data;
  console.log("chartLinks", links);
  console.log("chartNodes", nodes);
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links).id((d) => d.id)
    )
    .force("charge", d3.forceManyBody().strength(-200))
    .force("collide", d3.forceCollide().radius(12))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX())
    .force("y", d3.forceY());

  //   const svg = d3
  //     .create("svg")
  //     .attr("viewBox", [-width / 2, -height / 2, width, height])
  //     .style("font", "12px sans-serif");

  // Per-type markers, as they don't inherit styles.

  svg
    .append("defs")
    .selectAll("marker")
    .data(ips)
    .join("marker")
    .attr("id", (d) => `arrow-${d}`)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -0.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("fill", color)
    .attr("d", "M0,-5L10,0L0,5");

  const link = svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("class", "link")
    .attr("stroke", (d) => color(d.ip))
    .attr("marker-end", (d) => `url(${new URL(`#arrow-${d.ip}`, location)})`)
    .on("mouseover", (e, d) => {
      console.log(d.ip);
    });

  const node = svg
    .append("g")
    .attr("class", "node")
    .attr("fill", "currentColor")
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr("indexName", (d) => color(d.id))

  node
    .append("circle")
    .attr("class", "node")
    // .attr("stroke", "white")
    // .attr("stroke-width", 1.5)
    .attr("r", 8)
    .attr("fill", "#dc241f")
    .on("mouseover", mouseOver(0.2))
    .on("mouseout", mouseOut);

  // build a dictionary of nodes that are linked
  var linkedByIndex = {};
  links.forEach(function (d) {
    linkedByIndex[d.source.index + "," + d.target.index] = 1;
  });

  // check the dictionary to see if nodes are linked
  function isConnected(a, b) {
    return (
      linkedByIndex[a.index + "," + b.index] ||
      linkedByIndex[b.index + "," + a.index] ||
      a.index == b.index
    );
  }
  // fade nodes on hover
  function mouseOver(opacity) {
    return function (d) {
      // check all other nodes to see if they're connected
      // to this one. if so, keep the opacity at 1, otherwise
      // fade
      node.style("stroke-opacity", function (o) {
        const thisOpacity = isConnected(d, o) ? 1 : opacity;
        return thisOpacity;
      });
      node.style("fill-opacity", function (o) {
        const thisOpacity = isConnected(d, o) ? 1 : opacity;
        return thisOpacity;
      });
      // also style link accordingly
      link.style("stroke-opacity", function (o) {
        return o.source === d || o.target === d ? 1 : opacity;
      });
      link.style("stroke", function (o) {
        return o.source === d || o.target === d ? "#dc241f" : "#ddd";
      });
    };
  }

  function mouseOut() {
    node.style("stroke-opacity", 1);
    node.style("fill-opacity", 1);
    link.style("stroke-opacity", 1);
    link.style("stroke", "#ddd");
  }

  node
    .append("text")
    .attr("x", 8)
    .attr("y", "0.1em")
    .text((d) => d.id.substring(0, 10))
    // .text((d) => d.id.split(':')[0]
    .clone(true)
    .lower()
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-width", 3);


  simulation.on("tick", () => {
    link.attr("d", linkArc);
    node.attr("transform", (d) => `translate(${d.x},${d.y})`);
  });

  function highlightAdjacentLinks(node) {
    const linkIDs = links.map(createLinkID);
    const adjacentLinks = adjacentLinksFrom(node);
    const adjacentLinkIDs = adjacentLinks.map(createLinkID);

    linkIDs.forEach((linkID) => {
      d3.select(linkID).classed(
        "highlight",
        adjacentLinkIDs.indexOf(linkID) !== -1
      );
    });

    function createLinkID(link) {
      return `#link-${link.index}`;
    }
  }
  function adjacentLinksFrom(node) {
    const linksData = [];
    if (!node) return linksData;
    links.forEach((link) => {
      (node.id === link.source.id || node.id === link.target.id) &&
        linksData.push(link);
    });
    return linksData;
  }

  return svg.node();
  //   invalidation.then(() => simulation.stop());
}
