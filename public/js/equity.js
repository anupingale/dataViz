const c = d3.scaleOrdinal(d3.schemeCategory10);
const margin = {
    left: 100, right: 10,
    top: 10, bottom: 150
}
const chartSize = { width: 1200, height: 600 };
const width = chartSize.width - margin.left - margin.right;
const height = chartSize.height - margin.top - margin.bottom;

const updateChart = (quotes) => {

    const svg = d3.select('#chart-area svg');
    const svgGroup = d3.select('.quotes');

    const x = d3.scaleTime()
        .domain([_.first(quotes).Time, _.last(quotes).Time])
        .range([0, width]);

    const xAxis = d3.axisBottom(x);

    const minClose = _.minBy(quotes, "Close").Close;
    const maxClose = _.maxBy(quotes, "Close").Close;
    const minSma = _.minBy(quotes, "SMA").SMA;
    const maxSma = _.maxBy(quotes, "SMA").SMA;

    const y = d3.scaleLinear()
        .domain([_.min([minClose,minSma]), _.max([maxClose,maxSma])])
        .range([height, 0]);

    const yAxis = d3.axisLeft(y)
        .ticks(10)
        .tickFormat(d => Math.round(d));

    svg.select('.y.axis-label').text("CLOSE");
    svg.select('.y.axis').call(yAxis);
    svg.select('.x.axis').call(xAxis);

    const line = d3.line().x(q => x(q.Time)).y(q => y(q.Close));

    const line1 = d3.line().x(q => x(q.Time)).y(q => y(q.SMA));

    d3.select('.close').attr("d", line(quotes));
    d3.select('.sma').attr("d", line1(_.filter(quotes, "SMA")));
}

const initChart = function () {
    const svg = d3.select("#chart-area")
        .append("svg")
        .attr("width", chartSize.width)
        .attr("height", chartSize.height);

    const svgGroup = svg.append("g")
        .attr("class", "quotes")
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

    svgGroup.append("path")
        .attr("class", "close");

    svgGroup.append("path")
        .attr("class", "sma");

}

const getAverage = function (data) {
    let sum = 0;
    _.forEach(_.takeRight(data, 100), (obj => sum += obj.Close));
    return sum / 100;
}

const analyseData = function (quotes) {
    const data = quotes.slice(0);
    while (data.length > 100) {
        quotes[data.length - 1]["SMA"] = getAverage(data);
        data.pop();
    }
    return quotes;
}

const startVisualization = function (niftyData) {
    const analysedData = analyseData(niftyData);
    initChart();
    updateChart(analysedData);

    document.querySelector('#start-end-date').innerHTML = `<div>${0} - ${analysedData.length - 1}</div>`;

    slider = createD3RangeSlider(0, analysedData.length - 1, "#slider-container");
    
    slider.onChange((newRange) => {
        updateChart(analysedData.slice(newRange.begin, newRange.end));
        document.querySelector('#start-end-date').innerHTML = `<div>${newRange.begin} - ${newRange.end}</div>`;
    }
    );
}

const parseCompany = function ({ AdjClose, Volume, Date, ...rest }) {
    _.forEach(rest, (v, k) => rest[k] = +v);
    return { Date, Time: new window.Date(Date), ...rest };
}

const main = () => {

    d3.csv("/data/Nifty.csv", parseCompany).then(startVisualization);
}

window.onload = main;