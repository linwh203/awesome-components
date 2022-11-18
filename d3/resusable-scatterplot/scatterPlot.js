const {
  scaleLinear,
  scaleOrdinal,
  extent,
  axisLeft,
  axisBottom,
  symbol,
  symbols,
  transition,
} = d3;

export const scatterPlot = () => {
  let width = 400;
  let height = 300;
  let data, size, xValue, yValue, margin, symbolValue;

  const instance = (selection) => {
    // selection => parentDom
    const x = scaleLinear()
      .domain(extent(data, xValue))
      .range([margin.left, width - margin.right]);

    const y = scaleLinear() // d3-scale
      .domain(extent(data, yValue))
      .range([height - margin.bottom, margin.top]);

    const symbolScale = scaleOrdinal()
      .domain(data.map(symbolValue))
      .range(symbols);

    const symbolGenerator = symbol().size(size)

    const marks = data.map((d) => ({
      x: x(xValue(d)), // d.petal_length
      y: y(yValue(d)), // d.sepal_length
      pathD: symbolGenerator.type(symbolScale(symbolValue(d)))()
    }));

    const tran = transition().duration(700)

    selection
      .selectAll("path")
      .data(marks)
    //   .join("path")
      .join(
        enter => enter.append("path")
                    .attr('d', d => d.pathD)
                    .attr('transform', d => `translate(${d.x}, ${height-margin.bottom})`)
                    .call(enter => 
                        enter.transition(tran)
                            .attr('transform', d => `translate(${d.x}, ${d.y})`),
                    ),
        update => update.call(update => 
                        update.transition(tran)
                            .attr('transform', d => `translate(${d.x}, ${d.y})`)
                    ),
        exit => exit,
      )
    //   .attr('d', d => d.pathD)
    //   .attr('transform', d => `translate(${d.x}, ${d.y})`)

    selection.selectAll('g.y-axis') // using unique classname as id
      .data([null]) // just let axis became single dom element
      .join('g')
      .transition(tran)
      .attr("class", 'y-axis')
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(axisLeft(y));
    selection.selectAll('g.x-axis')
      .data([null])
      .join('g')
      .transition(tran)
      .attr("class", 'x-axis')
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(axisBottom(x));
  };

  instance.width = function (_) {
    // MARK: (a, b, c) => 执行后返回括号最后一个元素，并且a和b能够是可执行的函数
    // EG：(x = 5, "foo") => 赋值5给x，然后返回"foo"
    return arguments.length ? ((width = +_), instance) : width;
  };
  instance.height = function (_) {
    return arguments.length ? ((height = +_), instance) : height;
  };
  instance.data = function (_) {
    return arguments.length ? ((data = _), instance) : data;
  };
  instance.xValue = function (_) {
    return arguments.length ? ((xValue = _), instance) : xValue;
  };
  instance.yValue = function (_) {
    return arguments.length ? ((yValue = _), instance) : yValue;
  };
  instance.margin = function (_) {
    return arguments.length ? ((margin = _), instance) : margin;
  };
  instance.size = function (_) {
    return arguments.length ? ((size = +_), instance) : size;
  };
  instance.symbolValue = function (_) {
    return arguments.length ? ((symbolValue = _), instance) : symbolValue;
  };
  return instance;
};
