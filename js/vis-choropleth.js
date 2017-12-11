var global_data_christi_choropleth;
var annual_state_data = {}

var dictionary_christi_choropleth = {
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

var slider_choropleth = document.getElementById("myRangeChoropleth");
var output_choropleth = document.getElementById("yearChoropleth");
output_choropleth.innerHTML = slider_choropleth.value;


var chorocolor = d3.schemeRdBu[11];

var color_choropleth = d3.scaleThreshold()
    .domain([0, 20,25,40,45,50,55,60,65,70])
    .range(chorocolor);

var legend_labels = ["0", "20","25","40","45","50","55","60","65","70","75","80°F"];

var svg = d3.select('#choroMap').append("svg")
    .attr("width", 1000)
    .attr("height", 600)
    .append("g");

var legend_choropleth = svg.selectAll("g.legend")
    .data([0,20,25,40,45,50,55,60,65,70])
    .enter().append("g")
    .attr("class", "legend");

var ls_w = 20, ls_h = 20;

legend_choropleth.append("rect")
    .attr("x", 890)
    .attr("y", function(d, i){ return 600 - (i*ls_h) - 2*ls_h;})
    .attr("width", ls_w)
    .attr("height", ls_h)
    .style("fill", function(d, i) { return color_choropleth(d); })
    .style("opacity", 0.8);

legend_choropleth.append("text")
    .attr("x", 920)
    .attr("y", function(d, i){ return 600 - (i*ls_h) - ls_h - 4;})
    .text(function(d, i){ return legend_labels[i]; });

var tooltips = d3.select("body").append("div")
    .attr("class", "toolTip")
    .style("opacity", 0)
    .style("display", "none");

var path = d3.geoPath();

years_choropleth = [1895, 2010]
$(function() {
    $("#sliding-choropleth").slider({
        range: true,
        min: Math.min.apply(null, years_choropleth),
        max: Math.max.apply(null, years_choropleth),
        values: [ Math.min.apply(null, years_choropleth), Math.max.apply(null, years_choropleth) ],
        slide: function(event, ui){
            $("#amount").val(ui.values[0] + " - " + ui.values[1] );
        }
    });
    $("#amount").val($("#sliding-choropleth").slider("values", 0 ) +
        " - " + $( "#sliding-choropleth" ).slider( "values", 1 ) );
});


d3.csv("data/GlobalLandTemperaturesByState.csv", function(error, data) {
    global_data_christi_choropleth = data;
    for (i = 0; i < data.length; i++){
        var split_string;
        if (data[i].dt.includes("/")){
            split_string = data[i].dt.split("/").reverse();
        }
        else {
            split_string = data[i].dt.split("-");
        }
        if (split_string[0] in annual_state_data){
            var object = annual_state_data[split_string[0]];
            if (data[i].State in object){
                if (data[i].AverageTemperature != "") {
                    object[data[i].State].push(data[i].AverageTemperature)
                }
            }
            else {
                if (data[i].AverageTemperature != "") {
                    object[data[i].State] = []
                    if (data[i].AverageTemperature != "") {
                        object[data[i].State].push(data[i].AverageTemperature)
                    }
                }
            }
        }
        else {
            annual_state_data[split_string[0]] = {}
            annual_state_data[split_string[0]][data[i].State] = []
            if (data[i].AverageTemperature != "") {
                annual_state_data[split_string[0]][data[i].State].push(data[i].AverageTemperature)
            }
        }
    }
    for (i in annual_state_data){
        object = annual_state_data[i];
        for (j in object){
            if (object[j].length > 0) {
                var length = object[j].length
                var total = 0
                for(k = 0; k < object[j].length; k++){
                    total = total + Number(object[j][k])
                }
                object[j] = total / length
                object[j] = object[j] * 9/5 + 32
            }
            else{
                object[j] = 0
            }
        }
    }
    d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
        if (error) throw error;
        current_year_data = annual_state_data[slider_choropleth.value];
        svg.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", function(d) {
                return color_choropleth(current_year_data[dictionary_christi_choropleth[parseInt(d.id)]]);
            })
            .on("mouseover", function(d) {
                //d3.select(this).transition().duration(300).style("opacity", 0.8).style("fill", "red")
                tooltips.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltips.html(dictionary_christi_choropleth[parseInt(d.id)] + "<br>" + Math.round(current_year_data[dictionary_christi_choropleth[parseInt(d.id)]]) + " °F")
                    .style("left", d3.event.pageX + "px")
                    .style("top", d3.event.pageY + "px")
                    .style("display", "inline");
            })
            .on("mouseout", function() {
                // d3.select(this)
                //   .transition().duration(300)
                //   .style("opacity", 1).style("fill", function(d) {
                //     return color(current_year_data[dictionary_christi_choropleth[parseInt(d.id)]]);
                //   })
                tooltips.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    });
});

function update_choropleth() {
    var slider = document.getElementById("myRangeChoropleth");
    var output = document.getElementById("yearChoropleth");
    output.innerHTML = slider.value;
    selected = d3.select("#myRangeChoropleth").property("value");
    //console.log(annual_state_data[selected])
    current_year_data = annual_state_data[selected];

    d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
        if (error) throw error;
        current_year_data = annual_state_data[slider.value];
        var sector = svg.selectAll(".states").data(topojson.feature(us, us.objects.states).features);
        var exitTransition = d3.transition().duration(1100).each(function() {
            sector.exit()
                .transition().duration(1100)
                .remove();
        });

        var updateTransition = exitTransition.transition().duration(1100).each(function() {
            sector.transition()
                .attr("class", "states")
                .attr("d", path)
                .attr("fill", function(d) {
                    return color_choropleth(current_year_data[dictionary_christi_choropleth[parseInt(d.id)]]);
                });
        });

        var enterTransition = updateTransition.transition().duration(1100).each(function() {
            sector.enter().append("path")
                .attr("class", "states")
                .attr("d", path)
                .attr("fill", function(d) {
                    return color_choropleth(current_year_data[dictionary_christi_choropleth[parseInt(d.id)]]);
                })
                .on("mouseover", function(d) {
                    // d3.select(this).transition().duration(300).style("opacity", 0.5).style("fill", "red")
                    tooltips.html(dictionary_christi_choropleth[parseInt(d.id)] + "<br>" + Math.round(current_year_data[dictionary_christi_choropleth[parseInt(d.id)]]) + " °F")
                        .style("left", d3.event.pageX + "px")
                        .style("top", d3.event.pageY + "px")
                        .style("display", "inline")
                        .style("opacity", 1);
                })
                .on("mouseout", function() {
                    // d3.select(this)
                    //   .transition().duration(300)
                    //   .style("opacity", 1).style("fill", function(d) {
                    //     return color(current_year_data[dictionary[parseInt(d.id)]]);
                    //   });
                    tooltips.transition()
                        .duration(500)
                        .style("opacity", 1);
                })
                .transition().duration(1100);
        });
    });
}

function updateLapseChoropleth(year,lower_range,upper_range) {

    var slider = document.getElementById("myRangeChoropleth");
    var output = document.getElementById("yearChoropleth");
    output.innerHTML = year;
    slider.value = year;

    keys = Object.keys(annual_state_data[lower_range]);
    annual_state_data_diff = {};
    keys.forEach(function(d){
        annual_state_data_diff[d] = annual_state_data[upper_range][d] - annual_state_data[lower_range][d];
    });

    d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
        if (error) throw error;
        current_year_data = annual_state_data[year];
        var sector = svg.selectAll(".states").data(topojson.feature(us, us.objects.states).features);

        var exitTransition = d3.transition().duration(1100).each(function() {
            sector.exit()
                .transition().duration(1100)
                .remove();
        });

        var updateTransition = exitTransition.transition().duration(1100).each(function() {
            sector.transition()
                .attr("class", "states")
                .attr("d", path)
                .attr("fill", function(d) {
                    //console.log(current_year_data[dictionary_christi_choropleth[parseInt(d.id)]]);
                    return color_choropleth(current_year_data[dictionary_christi_choropleth[parseInt(d.id)]]);
                })
                .attr("stroke", function(d) {
                    var stateName = dictionary_christi_choropleth[parseInt(d.id)];

                    if (year == upper_range && annual_state_data_diff[stateName] >= 1)
                        return "black";
                    return "None";
                })
                .attr("stroke-width", 1.5);
        });

        var enterTransition = updateTransition.transition().duration(1100).each(function() {
            sector.enter().append("path")
                .attr("class", "states")
                .attr("d", path)
                .attr("fill", function(d) {
                    return color_choropleth(current_year_data[dictionary_christi_choropleth[parseInt(d.id)]]);
                })
                .on("mouseover", function(d) {
                    //d3.select(this).transition().duration(300).style("opacity", 0.5).style("fill", "red")
                    tooltips.html(dictionary_christi_choropleth[parseInt(d.id)] + "<br>" + Math.round(current_year_data[dictionary_christi_choropleth[parseInt(d.id)]]) + " °F")
                        .style("left", d3.event.pageX + "px")
                        .style("top", d3.event.pageY + "px")
                        .style("display", "inline")
                        .style("opacity", 1);
                })
                .on("mouseout", function() {
                    // d3.select(this)
                    //   .transition().duration(300)
                    //   .style("opacity", 1).style("fill", function(d) {
                    //     console.log(current_year_data[dictionary[parseInt(d.id)]]);
                    //     return color(current_year_data[dictionary[parseInt(d.id)]]);
                    //   });
                    tooltips.transition()
                        .duration(500)
                        .style("opacity", 1);
                })
                .transition().duration(1100);
        });
    });
}

function highlightDifferences() {
    var outlinePath = d3.geoPath();

    keys = Object.keys(annual_state_data[lower_range]);

    d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
        if (error) throw error;
        current_year_data = annual_state_data[year];

        features = topojson.feature(us, us.objects.states).features;

        filteredFeatures = features.filter(function(d) {
            found = false;
            dictToArray.forEach(function(e){
                if(e[0] === dictionary_christi_choropleth[d.id])
                    found = true;
            });
            return found;
        });

        console.log(dictToArray);
        console.log(features);
        console.log(filteredFeatures);


        var sector = svg.selectAll(".stateOutlines").data(filteredFeatures);

        var exitTransition = d3.transition().duration(1100).each(function() {
            sector.exit()
                .transition().duration(1100)
                .remove();
        });

        var updateTransition = exitTransition.transition().duration(1100).each(function() {
            sector.transition()
                .attr("class", "stateOutlines")
                .attr("d", outlinePath)
                .attr("fill", "None")
                .on("mouseover", function(d) {
                    //d3.select(this).transition().duration(300).style("opacity", 0.5).style("fill", "red")
                    tooltips.html(dictionary_christi_choropleth[parseInt(d.id)] + "<br>" + Math.round(current_year_data[dictionary_christi_choropleth[parseInt(d.id)]]) + " °F")
                        .style("left", d3.event.pageX + "px")
                        .style("top", d3.event.pageY + "px")
                        .style("display", "inline")
                        .style("opacity", 1);
                })
                .on("mouseout", function() {
                    // d3.select(this)
                    //   .transition().duration(300)
                    //   .style("opacity", 1).style("fill", function(d) {
                    //     console.log(current_year_data[dictionary[parseInt(d.id)]]);
                    //     return color(current_year_data[dictionary[parseInt(d.id)]]);
                    //   });
                    tooltips.transition()
                        .duration(500)
                        .style("opacity", 1);
                });
        });

        var enterTransition = updateTransition.transition().duration(1100).each(function() {
            sector.enter().append("path")
                .attr("class", "stateOutlines")
                .attr("d", outlinePath)
                .attr("fill", "None")
                .attr("stroke", "black")
                .on("mouseover", function(d) {
                    //d3.select(this).transition().duration(300).style("opacity", 0.5).style("fill", "red")
                    tooltips.html(dictionary_christi_choropleth[parseInt(d.id)] + "<br>" + Math.round(current_year_data[dictionary_christi_choropleth[parseInt(d.id)]]) + " °F")
                        .style("left", d3.event.pageX + "px")
                        .style("top", d3.event.pageY + "px")
                        .style("display", "inline")
                        .style("opacity", 1);
                })
                .on("mouseout", function() {
                    // d3.select(this)
                    //   .transition().duration(300)
                    //   .style("opacity", 1).style("fill", function(d) {
                    //     console.log(current_year_data[dictionary[parseInt(d.id)]]);
                    //     return color(current_year_data[dictionary[parseInt(d.id)]]);
                    //   });
                    tooltips.transition()
                        .duration(500)
                        .style("opacity", 1);
                })
                .transition().duration(1100);
        });
    });
};

function timelapseChoropleth() {
    lower_range = $('#sliding-choropleth').slider("values")[0];
    upper_range = $('#sliding-choropleth').slider("values")[1];
    var i = lower_range;
    function loop () {
        setTimeout(function () {
            updateLapseChoropleth(i,lower_range,upper_range)
            i++;
            if (i <= upper_range) {
                loop();
            }
        }, 100)
    }
    loop();

}
