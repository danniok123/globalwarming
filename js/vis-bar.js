// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1060 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);
var y = d3.scaleLinear()
    .range([height, 0]);



// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#barChart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


var svg2 = d3.select("#mapChart").append("svg")
    .attr("width", 960)
    .attr("height", 500);

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

var selectMe = "Alabama";

var data = {};


var projection = d3.geoAlbers();


var path = d3.geoPath()
    .projection(projection);

var tooltips = d3.select("#mapchart").append("div")
    .attr("class", "tooltips")
    .style("opacity", 0);


queue()
    .defer(d3.json, "data/us.json")
    .defer(d3.csv, "data/nclimate2583-s3.csv")
    .await(function(error, us, nclimate) {
        if (error) throw error;

        var states = topojson.feature(us, us.objects.states),
            state = states.features.filter(function(d) {
                return d.id === stateIDs[selectMe]; })[0];

        for (var i = 0; i < nclimate.length; i++) {
            data[nclimate[i].County_FIPS] = [nclimate[i].County_name, nclimate[i].x65_happening,
                nclimate[i].x67_human, nclimate[i].x73_consensus, nclimate[i].x78_worried, nclimate[i].x82_harmUS];
        }

        console.log(data);

        projection.scale(1)
            .translate([0, 0]);

        var b = path.bounds(state),
            s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
            t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        projection.scale(s)
            .translate(t);

        svg2.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "mesh")
            .attr("d", path);

        svg2.append("path")
            .datum(state)
            .attr("class", "outline")
            .attr("d", path)
            .attr('id', 'land');

        svg2.append("clipPath")
            .attr("id", "clip-land")
            .append("use")
            .attr("xlink:href", "#land");

        svg2.selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .attr("d", path)
            .attr('county-id', function(d){
                return d.id;
            }).attr("clip-path", "url(#clip-land)")
            .attr('class', 'county')
            .on("mouseover", function(d, i) {
                tooltips.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltips.html(data[d.id][0] + "<br>" + data[d.id][1])
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltips.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

    });


var tooltip = d3.select("#barChart").append("div").attr("class", "toolTip");

// get the data
d3.csv("data/nclimate2583-s2.csv", function(error, data) {
    if (error) throw error;

    // format the data
    data.forEach(function(d) {
        d.sales = +d.sales;
    });

    // Scale the range of the data in the domains
    x.domain(data.map(function(d) { return d.State_abb; }));
    y.domain([0, 100]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.State_abb); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.x65_happening); })
        .attr("height", function(d) { return height - y(d.x65_happening); })
        .on("mousemove", function(d){
            tooltip
                .style("left", d3.event.pageX - 80 + "px")
                .style("top", d3.event.pageY - 100 + "px")
                .style("display", "inline-block")
                .html(String(d.x65_happening) + "%");
        })
        .on("mouseout", function(d){ tooltip.style("display", "none");});

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("g")
        .attr("class", "y axis")
        .call(y)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Percentage(%)");

});