import {getRandomIntFrom0to7, cutName, color} from './helper.js'

const url = "../csv/syslog_report_correlation_ip_all.csv";

export const fetchData = async () => {
  const graph = await d3
    .csv(url, d3.autoType)
    .catch((err) => alert("fetch csv error: " + err));

  
  const data = {
    nodes: Array.from(
      new Set(graph.flatMap((l) => [l.source, l.target])),
      (name) => {
        const severity = getRandomIntFrom0to7();
        // const colorScale = d3.scaleLinear().domain(d3.extent([0,1,2,3,4,5,6,7])).range(['green', 'red'])
        const colorScale = d3.scaleQuantize().domain(d3.extent([0,1,2,3,4,5,6,7])).range(['lightgreen','darkgreen','yellow','orange','red'])
        // const colorScale = d3.scaleThreshold().domain([1,2,3,4,5,6]).range(d3.schemeRdYlGn[8].reverse())
        return {
          id: name,
          name: cutName(name),
          severity,
          // colour: color(severity),
          colour: colorScale(severity),
        };
      }
    ),
    links: graph,
  };

  return data
};
