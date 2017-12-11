// Inspiration from https://bl.ocks.org/bricedev/8aaef92e64007f882267

var selected = "2000";

var nov_switch = true;

var previous_year = 2000;

var width_radial = 700,
    height_radial = 500,
    barHeight = height_radial / 2 - 40;

var global_data_radial;

var slider = document.getElementById("myRange");
var output = document.getElementById("year");
output.innerHTML = slider.value;

var new_color_range = d3.schemeRdBu[11];

var map = {"01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun", "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"}

var color = d3.scaleThreshold()
    .domain([20,25,40,45,50,55,60,65,70,75,80])
    .range(new_color_range.reverse());

var svg_radial = d3.select('#radialbar').append("svg")
    .attr("width", width_radial)
    .attr("height", height_radial)
    .append("g")
    .attr("transform", "translate(" + (width_radial - 425) + "," + height_radial/2 + ")");

var tooltips_radial = d3.select("#radialbar").append("div")
    .attr("class", "toolTip")
    .style("opacity", 0)
    .style("display", "none");

d3.csv("data/AverageYearlyTemperature.csv", function(error, data) {
    global_data_radial = data;
    updatevisualization();
});

function updatemy() {
	pre_prev_year = previous_year
    var slider = document.getElementById("myRange");
    var output = document.getElementById("year");
    output.innerHTML = slider.value;
    selected = d3.select("#myRange").property("value");
    new_data = global_data_radial.filter(function(d) {
        return d.date.substring(0,4) == selected
    });

    var barScale = d3.scaleLinear()
        .domain([20, 80])
        .range([0, barHeight]);

    var keys = new_data.map(function(d,i) { return d.date; });
    var numBars = keys.length;

    var arc = d3.arc()
        .startAngle(function(d,i) { return (i * 2 * Math.PI) / numBars; })
        .endAngle(function(d,i) { return ((i + 1) * 2 * Math.PI) / numBars; })
        .innerRadius(0)
        .outerRadius(function(d){return barScale(d.value)});

    var sector = svg_radial.selectAll(".segments")
        .data(new_data);

    var exitTransition = d3.transition().duration(750).each(function() {
        sector.exit()
            .transition()
            .remove();
    });

    overlay_data = global_data_radial.filter(function(d) {
        return d.date.substring(0,4) == previous_year;
    });

    var updateTransition = exitTransition.transition().each(function() {
        sector.transition()
            .attr("class", "segments")
            .attr("fill", function(d) {return color(d.value)})
            .attr("stroke-width", 1)
            .attr("stroke", "black")
            .attr("d", arc);
    });

    sector.on("click", function(d){
	        updateInfoChart([selected + ": " + new_data[d.date.substring(4,6)-1].value + "°F", pre_prev_year + ": " + 
    	overlay_data[d.date.substring(4,6)-1].value + "°F", "Difference: " +
    	-1*Math.round((overlay_data[d.date.substring(4,6)-1].value-new_data[d.date.substring(4,6)-1].value)*100)/100 + "°F"]);
	});

    var overlaid = svg_radial.selectAll("path.overlay")
        .data(overlay_data);

    var exitTransitionOverlay = d3.transition().duration(750).each(function() {
        overlaid.exit()
            .transition()
            .remove();
    });
    var updateTransitionOverlay = exitTransitionOverlay.transition().each(function() {
        overlaid.transition()
            .attr("class", "overlay")
            .attr("fill", "black")
            .attr("stroke-width", 1)
            .attr("opacity", function(d){
            	return .3
            })
            .attr("stroke", "black")
            .attr("d", arc);
    });
    overlaid.on("click", function(d){
	        updateInfoChart([selected + ": " + new_data[d.date.substring(4,6)-1].value + "°F", pre_prev_year + ": " + 
    	d.value + "°F", "Difference: " +
    	-1*Math.round((d.value-new_data[d.date.substring(4,6)-1].value)*100)/100 + "°F"]);
	});
    previous_year = selected;
}

function updatevisualization() {
	pre_prev_year = previous_year
    years = [1895, 2010]
    $(function() {
        $("#slider-range").slider({
            range: true,
            min: Math.min.apply(null, years),
            max: Math.max.apply(null, years),
            values: [ Math.min.apply(null, years), Math.max.apply(null, years) ],
            slide: function(event, ui){
                $("#amount2").val(ui.values[ 0 ] + " - " + ui.values[ 1 ] );
            },
            change: function(event, ui) {
            }
        });
        $("#amount2").val($("#slider-range").slider("values", 0 ) +
            " - " + $( "#slider-range" ).slider( "values", 1 ) );
    });

    new_data = global_data_radial.filter(function(d) {
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

    var circles = svg_radial.selectAll("circle")
        .data(x.ticks(3))
        .enter().append("circle")
        .attr("r", function(d) {return barScale(d);})
        .style("fill", "none")
        .style("stroke", "black")
        .style("stroke-dasharray", "2,2")
        .style("stroke-width",".5px");

    var arc = d3.arc()
        .startAngle(function(d,i) { return (i * 2 * Math.PI) / numBars; })
        .endAngle(function(d,i) { return ((i + 1) * 2 * Math.PI) / numBars; })
        .innerRadius(0)
        .outerRadius(function(d){return barScale(d.value)});
    var sector = svg_radial.selectAll("path")
        .data(new_data)

    var overlain = svg_radial.selectAll("path.overlay")
        .data(new_data)

    sector.enter().append("path")
        .attr("class","segments")
        .attr("fill", function(d) {return color(d.value)})
        .attr("stroke-width", 1)
        .attr("stroke", "black")
        .attr("d", arc)
        .on("click", function(d){
		    updateInfoChart([selected + ": " + new_data[d.date.substring(4,6)-1].value + "°F", pre_prev_year + ": " + 
	    	d.value + "°F", "Difference: " +
	    	-1*Math.trunc(d.value-new_data[d.date.substring(4,6)-1].value) + "°F"]);
	    });

    overlain.enter().append("path")
        .attr("class","overlay")
        .attr("fill", "black")
        .attr("opacity", 0)
        .attr("stroke-width", 1)
        .attr("stroke", "black")
        .attr("d", arc)
        .on("click", function(d){
		    updateInfoChart([selected + ": " + new_data[d.date.substring(4,6)-1].value + "°F", pre_prev_year + ": " + 
	    	d.value + "°F", "Difference: " +
	    	-1*Math.trunc(d.value-new_data[d.date.substring(4,6)-1].value) + "°F"]);
	    });

    var lines = svg_radial.selectAll("line")
        .data(keys)
        .enter().append("line")
        .attr("y2", -barHeight - 20)
        .style("stroke", "black")
        .style("stroke-width",".5px")
        .attr("transform", function(d, i) { return "rotate(" + (i * 360 / numBars) + ")"; });

    svg_radial.append("g")
        .attr("class", "x axis")
        .call(xAxis);

    var labelRadius = barHeight * 1.025;

    var labels = svg_radial.append("g")
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

    var legend_labels = ["0", "20","25","40","45","50","55","60","65","70","75","80°F"];

    var legend_radial = svg_radial.selectAll("g.legend")
        .data([0,20,25,40,45,50,55,60,65,70])
        .enter().append("g")
        .attr("class", "legend");

    var ls_w = 20, ls_h = 20;

    legend_radial.append("rect")
        .attr("x", 280)
        .attr("y", function(d, i){
            return (-250 + (i*ls_h))
        })
        .attr("width", ls_w)
        .attr("height", ls_h)
        .style("fill", function(d){
            return color(d);
        });

    legend_radial.append("text")
        .attr("x", 280 + ls_w + 5)
        .attr("y", function(d, i){ return (-250 + (i*ls_h) + ls_h - 5); })
        .text(function(d, i){ return legend_labels[i] + "°F"; });

    //Add the text, and dynamically change it
    var text_radial = svg_radial.selectAll("g.info_chart")
    	.data(["Current: ", "Previous: ", "Difference: "])
    	.enter().append("g")
    	.attr("class", "info_chart");

    text_radial.append("text")
    	.attr("x", 280)
    	.attr("y", function(d, i){ return (150 + (i*18)); })
    	.attr("class","infoChartText")
    	.text(function(d, i){ return d; });
}

function updateInfoChart(info_array) {
	var chart_area = svg_radial.selectAll(".infoChartText")
        .data(info_array);

    var exitTransition = d3.transition().duration(1100).each(function() {
        chart_area.exit()
            .transition().duration(1100)
            .remove();
    });

    var updateTransition = exitTransition.transition().duration(1100).each(function() {
        chart_area.transition()
            .attr("x", 280)
    		.attr("y", function(d, i){ return (150 + (i*18)); })
    		.attr("class","infoChartText")
    		.text(function(d, i){ return d; });
    });
}

function updatelapse(selected, end, beginning_year) {
    var slider = document.getElementById("myRange");
    var output = document.getElementById("year");
    output.innerHTML = selected;
    slider.value = selected;
    new_data = global_data_radial.filter(function(d) {
        return d.date.substring(0,4) == selected
    });

    var barScale = d3.scaleLinear()
        .domain([20, 80])
        .range([0, barHeight]);

    var keys = new_data.map(function(d,i) { return d.date; });
    var numBars = keys.length;

    var arc = d3.arc()
        .startAngle(function(d,i) {return (i * 2 * Math.PI) / numBars; })
        .endAngle(function(d,i) {return ((i + 1) * 2 * Math.PI) / numBars; })
        .innerRadius(0)
        .outerRadius(function(d){return barScale(d.value)});

    var sector = svg_radial.selectAll(".segments")
        .data(new_data);

    var exitTransition = d3.transition().duration(1100).each(function() {
        sector.exit()
            .transition().duration(1100)
            .remove();
    });

    var updateTransition = exitTransition.transition().duration(1100).each(function() {
        sector.transition()
            .attr("class", "segments")
            .attr("fill", function(d) {return color(d.value)})
            .attr("stroke-width", 1)
            .attr("stroke", function(d) {return "black"})
            .attr("d", arc);
    });

    overlay_data = global_data_radial.filter(function(d) {
        return d.date.substring(0,4) == beginning_year;
    });

    sector.on("click", function(d){
	    updateInfoChart([selected + ": " + new_data[d.date.substring(4,6)-1].value + "°F", beginning_year + ": " + 
    	overlay_data[d.date.substring(4,6)-1].value + "°F", "Difference: " +
    	-1*Math.round((overlay_data[d.date.substring(4,6)-1].value-new_data[d.date.substring(4,6)-1].value)*100)/100 + "°F"]);
	});

    var enterTransition = updateTransition.transition().duration(1100).each(function() {
        sector.enter().append("path")
            .attr("class", "segments")
            .attr("fill", function(d) {return color(d.value)})
            .attr("stroke", "black")
            .attr("d", arc)
            .transition().duration(1100);
    });

    var overlaid = svg_radial.selectAll("path.overlay")
        .data(overlay_data);

    var exitTransitionOverlay = d3.transition().duration(750).each(function() {
        overlaid.exit()
            .transition()
            .remove();
    });
    var updateTransitionOverlay = exitTransitionOverlay.transition().each(function() {
        overlaid.transition()
            .attr("class", "overlay")
            .attr("fill", "black")
            .attr("stroke-width", 1)
            .attr("opacity", function(d){
            	if (end){
            		previous_year = selected
            		return .3
            	}
            	else {
            		return 0
            	}
            })
            .attr("stroke", "black")
            .attr("d", arc);
    });
    overlaid.on("click", function(d){
	    updateInfoChart([selected + ": " + new_data[d.date.substring(4,6)-1].value + "°F", beginning_year + ": " + 
    	d.value + "°F", "Difference: " +
    	-1*Math.round((d.value-new_data[d.date.substring(4,6)-1].value)*100)/100 + "°F"]);
	});
}

function timelapse() {
    var button = document.getElementById("radial-button");
    button.disabled = true;

    lower_range = $('#slider-range').slider("values")[0];
    upper_range = $('#slider-range').slider("values")[1];
    var i = lower_range;
    function loop (change) {
        setTimeout(function () {
            updatelapse(i, change, lower_range)
            i++;
            if (i < upper_range) {
                loop(false);
            }
            if (i == upper_range) {
                loop(true);
                button.disabled = false;
                if (nov_switch) {
                	var nov_svg = d3.select("#nov_info").append("div")
					    .attr("class", "nov_popup");

                    nov_switch = false;

                    nov_svg.html("<p>Oh wow, it's getting hot in here! But did you see what happened in November from 1895 to 2016? <br> <br>Temperatures rose nearly 8 degrees, which studies have shown can cause sea levels to rise. If this trend continues in the next century, then half of the state of Florida will disappear! </p>")
                }
            }
        }, 100)
    }
    loop(false);
}