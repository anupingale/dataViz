const c = d3.scaleOrdinal(d3.schemeCategory10);
const formats = { Rs: d => `${d} ₹`, kCrRs: d => `${d / 1000}k Cr ₹`, Percent: d => `${d}%` };
const margin = {
    left: 100, right: 10,
    top: 10, bottom: 150
}
const chartSize = { width: 800, height: 600 };
const width = chartSize.width - margin.left - margin.right;
const height = chartSize.height - margin.top - margin.bottom;
const configs = [['CMP', formats.Rs], ['MarketCap', formats.kCrRs], ['PE'], ['DivYld', formats.Percent], ['ROCE', formats.Percent]];

const showCompanyDetails = function (companies, step) {
    const [fieldName] = configs[step % configs.length];
    const toLine = b => `<div class="companyDetails">${b["Name"]} </br>${b[fieldName]}</div> `;
    document.querySelector('#chart-data').innerHTML =  companies.map(toLine).join('<hr/>');
}

const initChart = function (companies) {
    showCompanyDetails(companies, 0);

    const svg = d3.select("#chart-area")
        .append("svg")
        .attr("width", chartSize.width)
        .attr("height", chartSize.height);

    const svgGroup = svg.append("g")
        .attr("class", "companies")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xAxisLabel = svgGroup.append("text")
        .attr("class", "x axis-label")
        .attr("x", width / 2)
        .attr("y", height + 140)
        .text("COMPANIES");

    const yAxisLabel = svgGroup.append("text")
        .attr("class", "y axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -60)
        .text("CMP");

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

const parseCompany = function (company) {
    const others = Object.keys(company).filter(e => e !== "Name")
    others.forEach(header => company[header] = +company[header])
    return company;
}

const updateChart = (companies, step = 0) => {
    showCompanyDetails(companies, step);

    const [fieldName, format] = configs[step % configs.length];
    const svg = d3.select('#chart-area svg');
    const svgGroup = d3.select('.companies');

    const x = d3.scaleBand()
        .range([0, width])
        .domain(_.map(companies, "Name"))
        .padding(0.3);

    const xAxis = d3.axisBottom(x);

    const y = d3.scaleLinear()
        .domain([0, _.get(_.maxBy(companies, fieldName), fieldName, 0)])
        .range([height, 0]);

    const yAxis = d3.axisLeft(y)
        .ticks(10)
        .tickFormat(format);

    svg.select('.y.axis-label').text(fieldName);
    svg.select('.y.axis').call(yAxis);
    svg.select('.x.axis').call(xAxis);
    svg.selectAll("rect").data(companies, (c) => c.Name).exit().remove();
    const rectangles = svgGroup.selectAll("rect").data(companies);

    const newRectangles = rectangles.data(companies).enter().append("rect");

    newRectangles
        .attr("y", b => y(0))
        .attr("x", (b, i) => x(0))
        .transition().duration(1000).ease(d3.easeLinear)
        .attr("y", b => y(b[fieldName]))
        .attr("x", (b, i) => x(b.Name))
        .attr("width", x.bandwidth)
        .attr("height", (b) => y(0) - y(b[fieldName]))
        .attr("fill", (b) => c(b.Name));

    rectangles.transition().duration(1000).ease(d3.easeLinear)
        .attr('height', b => y(0) - y(b[fieldName]))
        .attr('x', c => x(c.Name))
        .attr('y', b => y(b[fieldName]))
        .attr("width", x.bandwidth);
}

const frequentlyMoveCompanies = (src, dest) => {
    setInterval(() => {
        const c = src.shift();
        if (c) dest.push(c);
        else[src, dest] = [dest, src];
    }, 1000);
}

const startVisualization = (companies) => {
    let step = 1;
    initChart(companies);
    updateChart(companies, 0);
    setInterval(() => updateChart(companies, step++), 1000);
    frequentlyMoveCompanies(companies, []);
}

const main = () => {
    d3.csv("/data/companies.csv", parseCompany).then(startVisualization);
}

window.onload = main;