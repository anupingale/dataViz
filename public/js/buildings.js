const drawBuildings = (buildings) => {
  const toLine = b => `<strong>${b.name}</strong> <i>${b.height}</i>`;
  document.querySelector('#chart-data').innerHTML = buildings.map(toLine).join('<hr/>');
  
  const svgWidth = 400, svgHeight = 400;

  const svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  const y = d3.scaleLinear()
    .domain([0, _.maxBy(buildings, "height").height])
    .range([0, svgHeight]);

    const x = d3.scaleBand()
    .range([0, svgWidth])
    .domain(_.map(buildings, "name"))
    .padding(0.3);
    
  const rectangles = svg.selectAll("rect").data(buildings);

  const newRectangles = rectangles.enter().append("rect");

  newRectangles.attr("y", 0)
    .attr("x", (b, i) => x(b.name))
    .attr("width", x.bandwidth)
    .attr("height", (b) => y(b.height));
}

const main = () => {
  d3.json('data/buildings.json').then(drawBuildings);
}

window.onload = main;