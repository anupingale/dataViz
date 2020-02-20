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

    const x = d3.scaleTime()
        .domain([_.first(quotes).Time, _.last(quotes).Time])
        .range([0, width]);

    const xAxis = d3.axisBottom(x);

    const minClose = _.minBy(quotes, "Close").Close;
    const maxClose = _.maxBy(quotes, "Close").Close;
    const minSma = _.minBy(quotes, "SMA").SMA;
    const maxSma = _.maxBy(quotes, "SMA").SMA;

    const y = d3.scaleLinear()
        .domain([_.min([minClose, minSma]), _.max([maxClose, maxSma])])
        .range([height, 0]);

    const yAxis = d3.axisLeft(y)
        .ticks(10)
        .tickFormat(d => Math.round(d));

    svg.select('.y.axis-label').text("CLOSE");
    svg.select('.y.axis').call(yAxis);
    svg.select('.x.axis').call(xAxis);

    const closePriceLine = d3.line().x(q => x(q.Time)).y(q => y(q.Close));
    const smaPriceLine = d3.line().x(q => x(q.Time)).y(q => y(q.SMA));

    d3.select('.close').attr("d", closePriceLine(quotes));
    d3.select('.sma').attr("d", smaPriceLine(_.filter(quotes, "SMA")));
}

const initChart = function () {
    const svg = d3.select("#chart-area")
        .append("svg")
        .attr("width", chartSize.width)
        .attr("height", chartSize.height);

    const svgGroup = svg.append("g")
        .attr("class", "quotes")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    svgGroup.append("text")  // x axis labels 
        .attr("class", "x axis-label")
        .attr("x", width / 2)
        .attr("y", height + 140)
        .text("TIME");

    svgGroup.append("text") // y axis labels
        .attr("class", "y axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -60)
        .text("CLOSE");

    // appending y axis
    svgGroup.append("g").attr("class", "y axis");
    //appending x axis
    svgGroup.append("g").attr("class", "x axis").attr("transform", `translate(0, ${height})`);

    svgGroup.selectAll(".x.axis text") // transform x axis text
        .attr("transform", "rotate(-40)")
        .attr("x", -5)
        .attr("y", 10);

    //added path for closing price for each quote
    svgGroup.append("path").attr("class", "close");

    //added path for sma calaculated based on (last 10 day's Closing price)
    svgGroup.append("path").attr("class", "sma");
}

const getSmaBasedOnClosingPrice = function (data) {
    let sum = 0;
    _.forEach(_.takeRight(data, 100), (obj => sum += obj.Close));
    return sum / 100;
}

const calculateSMA = function (quotes) {
    const data = quotes.slice(0);
    while (data.length > 100) {
        quotes[data.length - 1]["SMA"] = getSmaBasedOnClosingPrice(data);
        data.pop();
    }
    return quotes;
}


const createTimeRangeSlider = function (analysedData) {
    document.querySelector('#start-end-date').innerHTML = `<div>${0} - ${analysedData.length - 1}</div>`;
    slider = createD3RangeSlider(0, analysedData.length - 1, "#slider-container");
    slider.range(0, analysedData.length - 1);
    slider.onChange((newRange) => {
        updateChart(analysedData.slice(newRange.begin, newRange.end));
        document.querySelector('#start-end-date').innerHTML = `<div>${newRange.begin} - ${newRange.end}</div>`;
    }
    );
}

const startVisualization = function (niftyData) {
    initChart(); // Appending contents to the SVG
    const analysedData = calculateSMA(niftyData);
    updateChart(analysedData);
    createTimeRangeSlider(analysedData); //creating time range slider to visualize data for specific time range
    const transactions = getTransactions(analysedData.slice(100))
    createTransactionsTable(transactions); // Showing transaction table based on analysed transaction data
    showTransactionSummary(transactions);
}

const parseCompany = function ({ AdjClose, Volume, Date, ...rest }) {
    _.forEach(rest, (v, k) => rest[k] = +v);
    return { Date, Time: new window.Date(Date), ...rest };
}

const main = () => {
    d3.csv("/data/Nifty.csv", parseCompany).then(startVisualization);
}

window.onload = main;