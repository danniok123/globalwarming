// Referenced https://bl.ocks.org/mbostock/4060606 for help

var filtered;
var malariaDataByCountryId = {};

var margin = {top: 10, right: 10, bottom: 10, left: 10};

var width = 980 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var projection = d3.geoMercator()
    .center([-10, 0])
    .scale(450)
    .translate([width / 2, height / 2]);

var path = d3.geoPath()
    .projection(projection);

// have to use scaleQuantize since data isn't continuous
var color = d3.scaleQuantize()
    .range(colorbrewer.Blues["6"]);

// First data they should see
var selectMe = "UN_population";

d3.select("#africaD").on("change", function() {

    selectMe = d3.select("#africaD").property("value");

    updateChoropleth();

});

// Create tooltip
var tooltip = d3.select("#chart-area")
    .append("div")
    .attr("class", "d3-tip")
    .style("display", "none");

// need dictionary for correct label names
tipData = {
    "UN_population" : "Population",
    "At_risk" :"At Risk",
    "At_high_risk" : "At High Risk",
    "Suspected_malaria_cases" : "Suspected Malaria Cases",
    "Malaria_cases" : "Malaria Cases"
};


// Create legend
// Example from http://bl.ocks.org/KoGor/5685876

var ls_w = 20, ls_h = 20;

var legend = svg.selectAll("g.legend")
    .data(color.range())
    .enter().append("g")
    .attr("class", "legend");

legend.append("rect")
    .attr("x", 160)
    .attr("y", function(d, i){
        return height - (i*ls_h) - 10*ls_h;
    })
    .attr("width", ls_w)
    .attr("height", ls_h)
    .style("fill", function(d) {
        return d;
    })
    .attr("class", "legend-rect");

legend.append("text")
    .attr("x", 190)
    .attr("y", function(d, i){
        return height - (i*ls_h) - 10*ls_h + 14;
    })
    .attr("class", "legendtext");


// Pre append legend for the no data one
svg.append("rect")
    .attr("class", "legend-rect")
    .attr("x", 160)
    .attr("y", height - 9*ls_h)
    .attr("width", ls_w)
    .attr("height", ls_h)
    .style("fill", "#2c3e50");


svg.append("text")
    .attr("class", "legendtext")
    .attr("x", 190)
    .attr("y", height - 8*ls_h - 4)
    .text("No Data");


// Use the Queue.js library to read two files

queue()
  .defer(d3.json, "https://d3js.org/us-10m.v1.json")
  .defer(d3.csv, "data/GlobalTemperaturebyState.csv")
  .await(function(error, mapTopJson, landTempDataCsv){



      color.domain([0, d3.max(filtered, function(d) {
          return d[selectMe];
      })]);

      // Drawing choropleth

      var choro = svg.selectAll(".region")
          .data(topojson.feature(mapTopJson, mapTopJson.objects.collection).features)
          .enter()
          .append("path")
          .attr("class", "region")
          .attr("fill", function(d) {
              return "#2c3e50";
          })
          .attr("d", path);

      // Update choropleth
      updateChoropleth();
  });
    

function updateChoropleth() {

    // update the color domain
    color.domain([0, d3.max(filtered, function(d) {
        return d[selectMe];
    })]);

    // update colors
    svg.selectAll(".region")
        .attr("fill", function(d) {
            return "#2c3e50";
        });

}