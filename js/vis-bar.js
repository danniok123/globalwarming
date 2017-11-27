// variables for the map chart
var stateIDs = {
    "Alabama": 1, "Alaska": 2, "Arizona": 4, "Arkansas": 5, "California": 6, "Colorado": 8,
    "Connecticut": 9, "Delaware": 10, "DistrictofColumbia": 11, "Florida": 12, "Georgia": 13,
    "Hawaii": 15, "Idaho": 16, "Illinois": 17, "Indiana": 18, "Iowa": 19, "Kansas": 20,
    "Kentucky": 21, "Louisiana": 22, "Maine": 23, "Maryland": 24, "Massachusetts": 25,
    "Michigan": 26, "Minnesota": 27, "Mississippi": 28, "Missouri": 29, "Montana": 30,
    "Nebraska": 31, "Nevada": 32, "New Hampshire": 33, "New Jersey": 34, "New Mexico": 35,
    "New York": 36, "North Carolina": 37, "North Dakota": 38, "Ohio": 39, "Oklahoma": 40,
    "Oregon": 41, "Pennsylvania": 42, "Rhode Island": 44, "South Carolina": 45, "South Dakota": 46,
    "Tennessee": 47, "Texas": 48, "Utah": 49, "Vermont": 50, "Virginia": 51, "Washington": 53,
    "West Virginia": 54, "Wisconsin": 55, "Wyoming": 56
};

var data = {};
var width = 500,
    height = 500,
    centered;

var projection = d3.geoAlbersUsa()
    .scale(700)
    .translate([width / 2, height / 2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#mapchart").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);

var tooltip = d3.select("#mapchart").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var g = svg.append("g");

var selectMe = 1;

d3.select("#quest").on("change", function() {
    selectMe = Number(d3.select("#quest").property("value")) + 1;
});

// variables for the line graph

var xScale = d3.scaleLinear()
    .domain([0, n-1])
    .range([0, widthh]);

var yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([heightt, 0]);

var line = d3.line()
    .x(function(d, i) { return xScale(i); })
    .y(function(d) { return yScale(d.y); })
    .curve(d3.curveMonotoneX);


queue()
    .defer(d3.json, "data/us.json")
    .defer(d3.csv, "data/nclimate2583-s3.csv")
    .await(function(error, us, nclimate) {
        if (error) throw error;

        for (var i = 0; i < nclimate.length; i++) {
            data[nclimate[i].County_FIPS] = [nclimate[i].County_name, nclimate[i].x65_happening,
                nclimate[i].x67_human, nclimate[i].x73_consensus, nclimate[i].x78_worried, nclimate[i].x82_harmUS];
        }

        g.append("g")
            .attr("id", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", "county-boundary")
            .on("mousemove", function(d, i) {
                tooltip.transition()
                    .style("opacity", .9);
                tooltip.html(data[d.id][0] + "<br>" + data[d.id][selectMe] + "%")
                    .style("left", (d3.event.pageX - 100) + "px")
                    .style("top", (d3.event.pageY - 230) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", clicked2);

        g.append("g")
            .attr("id", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", "state")
            .on("click", clicked);


        g.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("id", "state-borders")
            .attr("d", path);
    });

function clicked(d) {
    var x, y, k;

    if (d && centered !== d) {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;
    } else {
        x = width / 2;
        y = height / 2;
        k = 1;
        centered = null;
    }

    g.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });

    g.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
}

console.log(data);

function clicked2(d) {
    var x, y, k;

    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;

    g.selectAll("path")
        .classed("active", function(d) { return false });


    g.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
}

var margin = {top: 50, right: 50, bottom: 50, left: 50}
    , widthh = 500 - margin.left - margin.right
    , heightt = 500 - margin.top - margin.bottom;

var n = 21;

var dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } });

var svg2 = d3.select("#linechart").append("svg")
    .attr("width", widthh + margin.left + margin.right)
    .attr("height", heightt + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + heightt + ")")
    .call(d3.axisBottom(xScale));


svg2.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(yScale));

svg2.append("path")
    .datum(dataset)
    .attr("class", "line")
    .attr("d", line);

svg2.selectAll(".dot")
    .data(dataset)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", function(d, i) { return xScale(i) })
    .attr("cy", function(d) { return yScale(d.y) })
    .attr("r", 5);