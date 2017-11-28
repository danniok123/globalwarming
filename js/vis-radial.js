// Inspiration from https://bl.ocks.org/bricedev/8aaef92e64007f882267

var selected = "2000";

var width_radial = 500,
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
    .attr("transform", "translate(" + (width_radial - 230) + "," + height_radial/2 + ")");

var tooltips_radial = d3.select("#radialbar").append("div")
    .attr("class", "toolTip")
    .style("opacity", 0)
    .style("display", "none");

d3.csv("data/AverageYearlyTemperature.csv", function(error, data) {
    global_data_radial = data;
    updatevisualization();
});

function updatemy() {
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
                //updateVisualization()
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


    sector.enter().append("path")
        .attr("class","segments")
        .attr("fill", function(d) {return color(d.value)})
        .attr("stroke-width", 1)
        .attr("stroke", "black")
        .attr("d", arc)
        .on("mouseover", function(d) {
            tooltips_radial.transition()
                .duration(200)
                .style("opacity", .9);
            tooltips_radial.html(d.value + " °F")
                .style("left", (d3.event.pageX-500) + "px")
                .style("top", (d3.event.pageY-3600) + "px")
                .style("display", "block");
        })
        .on("mouseout", function(d) {
            tooltips_radial.transition()
                .duration(500)
                .style("opacity", 0);
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
}


function updatelapse(selected) {
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
            .attr("stroke", "darkslategray")
            .attr("d", arc);
    });

    var enterTransition = updateTransition.transition().duration(1100).each(function() {
        sector.enter().append("path")
            .attr("class", "segments")
            .attr("fill", function(d) {return color(d.value)})
            .attr("stroke", "black")
            .attr("d", arc)
            .transition().duration(1100);
    });
}


function timelapse() {
    lower_range = $('#slider-range').slider("values")[0];
    upper_range = $('#slider-range').slider("values")[1];
    document.getElementById("rad").disabled = true;
    var i = lower_range;
    function loop () {
        setTimeout(function () {
            updatelapse(i)
            i++;
            if (i <= upper_range) {
                loop();
            }
        }, 100)
    }
    loop();
    document.getElementById("rad").disabled = false;
}