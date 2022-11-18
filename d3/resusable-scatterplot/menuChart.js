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

/*
  <label for="cars">Choose a car:</label>
  <select name="cars" id="cars">
      <option value="volvo">Volvo</option>
      <option value="saab">Saab</option>
      <option value="mercedes">Mercedes</option>
      <option value="audi">Audi</option>
  </select>
*/

export const menuChart = () => {
  let id
  let labelText
  const instance = (selection) => {
    selection.selectAll('label').data([null]).join('label')
      .attr('for', id).text(labelText)
    selection.selectAll('select').data([null]).join('label')
      .attr('name', id).attr('id', id)
  };
  instance.id = function (_) {
    return arguments.length ? ((id = _), instance) : id;
  };
  instance.labelText = function (_) {
    return arguments.length ? ((labelText = _), instance) : labelText;
  };
  instance.width = function (_) {
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
