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

var selectMe = "Texas";

d3.select("#africaD").on("change", function() {

    selectMe = d3.select("#africaD").property("value");

    //updateChoropleth();

});
var data = {};

var width = 700,
    height = 400;

var projection = d3.geoAlbers();


var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#mapchart").append("svg")
    .attr("width", width)
    .attr("height", height);

var tooltip = d3.select("#mapchart").append("div")
    .attr("class", "tooltip")
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

        projection.scale(1)
            .translate([0, 0]);

        var b = path.bounds(state),
            s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
            t = [350, (height - s * (b[1][1] + b[0][1])) / 2];

        projection.scale(s)
            .translate(t);

        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "mesh")
            .attr("d", path);

        svg.append("path")
            .datum(state)
            .attr("class", "outline")
            .attr("d", path)
            .attr('id', 'land');

        svg.append("clipPath")
            .attr("id", "clip-land")
            .append("use")
            .attr("xlink:href", "#land");

        svg.selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .attr("d", path)
            .attr('county-id', function(d){
                return d.id;
            }).attr("clip-path", "url(#clip-land)")
            .attr('class', 'county')
            .on("mousemove", function(d, i) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(data[d.id][0] + "<br>" + data[d.id][1] + "%")
                    .style("left", (d3.event.pageX - 100) + "px")
                    .style("top", (d3.event.pageY - 200) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

    });

var margin = {top: 50, right: 50, bottom: 50, left: 50}
    , widthh = 500 - margin.left - margin.right // Use the window's width
    , heightt = 500 - margin.top - margin.bottom; // Use the window's height

// The number of datapoints
var n = 21;

var xScale = d3.scaleLinear()
    .domain([0, n-1]) // input
    .range([0, widthh]); // output

var yScale = d3.scaleLinear()
    .domain([0, 1]) // input
    .range([heightt, 0]); // output

var line = d3.line()
    .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
    .y(function(d) { return yScale(d.y); }) // set the y values for the line generator
    .curve(d3.curveMonotoneX) // apply smoothing to the line

// 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
var dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } })

// 1. Add the SVG to the page and employ #2
var svg2 = d3.select("#linechart").append("svg")
    .attr("width", widthh + margin.left + margin.right)
    .attr("height", heightt + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 3. Call the x axis in a group tag
svg2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + heightt + ")")
    .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

// 4. Call the y axis in a group tag
svg2.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

// 9. Append the path, bind the data, and call the line generator
svg2.append("path")
    .datum(dataset) // 10. Binds data to the line
    .attr("class", "line") // Assign a class for styling
    .attr("d", line); // 11. Calls the line generator

// 12. Appends a circle for each datapoint
svg2.selectAll(".dot")
    .data(dataset)
    .enter().append("circle") // Uses the enter().append() method
    .attr("class", "dot") // Assign a class for styling
    .attr("cx", function(d, i) { return xScale(i) })
    .attr("cy", function(d) { return yScale(d.y) })
    .attr("r", 5);