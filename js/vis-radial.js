// Inspiration from https://bl.ocks.org/bricedev/8aaef92e64007f882267

var selected = "2000";

var width = 960,
    height = 500,
    barHeight = height / 2 - 40;

var gb;

var slider = document.getElementById("myRange");
var output = document.getElementById("year");
output.innerHTML = slider.value;

var map = {"01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun", "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"}

var color = d3.scaleThreshold()
    .domain([20,25,40,45,50,55,60,65,70,75,80])
    .range(d3.schemeRdBu[11].reverse());

var svg = d3.select('#slidecontainer').append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

d3.csv("data/AverageYearlyTemperature.csv", function(error, data) {
    gb = data;
    updatevisualization();
});

function updatemy() {
    var slider = document.getElementById("myRange");
    var output = document.getElementById("year");
    output.innerHTML = slider.value;
    selected = d3.select("#myRange").property("value");
    new_data = gb.filter(function(d) {
        return d.date.substring(0,4) == selected });

    var barScale = d3.scaleLinear()
        .domain([20, 80])
        .range([0, barHeight]);

    var keys = new_data.map(function(d,i) { return d.date; });
    var numBars = keys.length;

    var arc = d3.arc()
        .startAngle(function(d,i) {
            return (i * 2 * Math.PI) / numBars;
        })
        .endAngle(function(d,i) {
            return ((i + 1) * 2 * Math.PI) / numBars;
        })
        .innerRadius(0)
        .outerRadius(function(d){return barScale(d.value)});

    var sector = svg.selectAll(".segments")
        .data(new_data);

    var exitTransition = d3.transition().duration(750).each(function() {
        sector.exit()
            .transition()
            .remove();
    });

    var updateTransition = exitTransition.transition().each(function() {
        sector.transition()
            .attr("class", "segments")
            .attr("fill", function(d) {return color(d.value)})
            .attr("stroke-width", 1)
            .attr("stroke", "darkslategray")
            .attr("d", arc);
    });


    var enterTransition = updateTransition.transition().each(function() {
        sector.enter().append("path")
            .attr("class", "segments")
            .attr("fill", function(d) {return color(d.value)})
            .attr("stroke", "black")
            .attr("d", arc)
            .transition();
    });

}

function updatevisualization() {
    new_data = gb.filter(function(d) {
        return d.date.substring(0,4) == selected });

    var barScale = d3.scaleLinear()
        .domain([20, 80])
        .range([0, barHeight]);

    var keys = new_data.map(function(d,i) { return d.date; });
    var numBars = keys.length;

    var x = d3.scaleLinear()
        .domain([20, 80])
        .range([0, -barHeight]);

    var xAxis = d3.axisLeft(x)
        .ticks(3);

    var circles = svg.selectAll("circle")
        .data(x.ticks(3))
        .enter().append("circle")
        .attr("r", function(d) {return barScale(d);})
        .style("fill", "none")
        .style("stroke", "black")
        .style("stroke-dasharray", "2,2")
        .style("stroke-width",".5px");

    var arc = d3.arc()
        .startAngle(function(d,i) {return (i * 2 * Math.PI) / numBars; })
        .endAngle(function(d,i) {return ((i + 1) * 2 * Math.PI) / numBars; })
        .innerRadius(0)
        .outerRadius(function(d){return barScale(d.value)});
    var sector = svg.selectAll("path")
        .data(new_data)


    sector.enter().append("path")
        .attr("class","segments")
        .attr("fill", function(d) {return color(d.value)})
        .attr("stroke-width", 1)
        .attr("stroke", "black")
        .attr("d", arc);

    var lines = svg.selectAll("line")
        .data(keys)
        .enter().append("line")
        .attr("y2", -barHeight - 20)
        .style("stroke", "black")
        .style("stroke-width",".5px")
        .attr("transform", function(d, i) { return "rotate(" + (i * 360 / numBars) + ")"; });

    svg.append("g")
        .attr("class", "x axis")
        .call(xAxis);

    var labelRadius = barHeight * 1.025;

    var labels = svg.append("g")
        .classed("labels", true);

    labels.append("def")
        .append("path")
        .attr("id", "label-path")
        .attr("d", "m0 " + -labelRadius + " a" + labelRadius + " " + labelRadius + " 0 1,1 -0.01 0");

    labels.selectAll("text")
        .data(keys)
        .enter().append("text")
        .style("text-anchor", "middle")
        .style("font-weight","bold")
        .style("fill", function(d, i) {return "#3e3e3e";})
        .append("textPath")
        .attr("xlink:href", "#label-path")
        .attr("startOffset", function(d, i) {return i * 100 / numBars + 50 / numBars + '%';})
        .text(function(d) {return map[d.substring(4,6)]; });
}