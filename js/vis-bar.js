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

var dictionary1 = {
    01: "Alabama",
    02: "Alaska",
    04: "Arizona",
    05:  "Arkansas",
    06: "California",
    08:  "Colorado",
    09: "Connecticut",
    10: "Delaware",
    11: "District Of Columbia",
    12:  "Florida",
    13:  "Georgia (State)",
    15:   "Hawaii",
    16:    "Idaho",
    17:    "Illinois",
    18:    "Indiana",
    19:    "Iowa",
    20:    "Kansas",
    21:    "Kentucky",
    22:    "Louisiana",
    23:    "Maine",
    24:    "Maryland",
    25:    "Massachusetts",
    26:    "Michigan",
    27:    "Minnesota",
    28:    "Mississippi",
    29:    "Missouri",
    30:    "Montana",
    31:    "Nebraska",
    32:    "Nevada",
    33:    "New Hampshire",
    34:    "New Jersey",
    35:    "New Mexico",
    36:    "New York",
    37:    "North Carolina",
    38:    "North Dakota",
    39:    "Ohio",
    40:    "Oklahoma",
    41:    "Oregon",
    42:    "Pennsylvania",
    44:   "Rhode Island",
    45:    "South Carolina",
    46:    "South Dakota",
    47:    "Tennessee",
    48:    "Texas",
    49:    "Utah",
    50:    "Vermont",
    51:    "Virginia",
    53:    "Washington",
    54:    "West Virginia",
    55:    "Wisconsin",
    56:    "Wyoming",
    60:    "America Samoa" }

var updated_data = {};

var data = {};
var width = 900,
    height = 500,
    centered;

var projection = d3.geoAlbersUsa()
    .scale(1000)
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

    //updateChoropleth();

});

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
            .on("click", clicked)
            .on("mouseover", function(d) {
                new_dict = {};
                for (var key in data) {
                    var dummy_array = data[key];
                    if (dummy_array[0].split(", ")[1] == dictionary1[d.id]) {
                        new_dict[key] = data[key];
                    }
                }
                console.log(new_dict);
            })


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