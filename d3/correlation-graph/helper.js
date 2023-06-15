// helpers
export const getRandomIntFrom0to7 = () => Math.floor(Math.random() * 8);

const generateColors = () => {
  const colorArray = [];
  for (let i = 0; i <= 7; i++) {
    const red = Math.round(i * (255 / 7));
    const green = 255 - Math.round(i * (255 / 7));
    const blue = 0;
    const color = `rgb(${red}, ${green}, ${blue})`;
    colorArray.push(color);
  }
  return colorArray;
};
const colors = generateColors();
export const color = (property) => colors[property];

export const cutName = (name) => name.split(":")[0].trim();

export const circleSize = (property) => property + 1;

// links are drawn as curved paths between nodes,
// through the intermediate nodes
export const positionLink = (d) => {
  const offset = 30;

  const midpoint_x = (d.source.x + d.target.x) / 2;
  const midpoint_y = (d.source.y + d.target.y) / 2;

  const dx = d.target.x - d.source.x;
  const dy = d.target.y - d.source.y;

  const normalise = Math.sqrt(dx * dx + dy * dy);

  const offSetX = midpoint_x + offset * (dy / normalise);
  const offSetY = midpoint_y - offset * (dx / normalise);

  // console.log(d)

  return (
    "M" +
    d.source.x +
    "," +
    d.source.y +
    "S" +
    offSetX +
    "," +
    offSetY +
    " " +
    d.target.x +
    "," +
    d.target.y
  );
};

// move the node based on forces calculations
export const positionNode = (width, height) => (d) => {
  // keep the node within the boundaries of the svg
  if (d.x < 0) {
    d.x = 0;
  }
  if (d.y < 0) {
    d.y = 0;
  }
  if (d.x > width) {
    d.x = width;
  }
  if (d.y > height) {
    d.y = height;
  }
  return "translate(" + d.x + "," + d.y + ")";
};
