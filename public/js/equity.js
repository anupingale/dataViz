const c = d3.scaleOrdinal(d3.schemeCategory10);
const margin = {
    left: 100, right: 10,
    top: 10, bottom: 150
}
const chartSize = { width: 800, height: 600 };
const width = chartSize.width - margin.left - margin.right;
const height = chartSize.height - margin.top - margin.bottom;

const updateChart = (prices) => {
    const svg = d3.select('#chart-area svg');
    const svgGroup = d3.select('.prices');

    const x = d3.scaleTime()
        .domain([new Date(_.first(prices).Date), new Date(_.last(prices).Date)])
        .range([0,width]);

    const xAxis = d3.axisBottom(x);

    const y = d3.scaleLinear()
        .domain([_.minBy(prices,"Close").Close, _.maxBy(prices,"Close").Close])
        .range([height, 0]);

    const yAxis = d3.axisLeft(y)
        .ticks(10)
        .tickFormat(d => Math.round(d));

    svg.select('.y.axis-label').text("CLOSE");
    svg.select('.y.axis').call(yAxis);
    svg.select('.x.axis').call(xAxis);
}

const initChart = function () {
    const svg = d3.select("#chart-area")
        .append("svg")
        .attr("width", chartSize.width)
        .attr("height", chartSize.height);

    const svgGroup = svg.append("g")
        .attr("class", "prices")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xAxisLabel = svgGroup.append("text")
        .attr("class", "x axis-label")
        .attr("x", width / 2)
        .attr("y", height + 140)
        .text("TIME");

    const yAxisLabel = svgGroup.append("text")
        .attr("class", "y axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -60)
        .text("CLOSE");

    const appendYAxis = svgGroup.append("g")
        .attr("class", "y axis");

    const appendXAxis = svgGroup.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height})`);

    const transformXAxisText = svgGroup.selectAll(".x.axis text")
        .attr("transform", "rotate(-40)")
        .attr("x", -5)
        .attr("y", 10);
}

const startVisualization = function (companyDetails) {
    initChart();
    updateChart(companyDetails, 0);
}

const parseCompany = function ({ AdjClose, Volume, Date, ...rest }) {
    _.forEach(rest, (v, k) => rest[k] = +v);
    return { Date, ...rest };
}

const main = () => {
    d3.csv("/data/Nifty.csv", parseCompany).then(startVisualization);
}

window.onload = main;