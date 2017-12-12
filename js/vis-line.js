GMSLlineGraph = function(_parentElement, _data, _sizeData, _colLabel, _totalWidth, _totalHeight){
    this.parentElement = _parentElement;
    this.data = _data;
    this.sizeData = _sizeData;
    this.margin = { top: 40, right: 0, bottom: 60, left: 60 };
    if (_totalWidth)
        this.totalWidth = _totalWidth;
    else
        this.totalWidth = 1200;
    this.referenceWidth = 80;
    this.width = this.totalWidth - this.margin.left - this.margin.right - this.referenceWidth;
    if (_totalHeight)
        this.totalHeight = _totalHeight;
    else
        this.totalHeight = 400;
    this.height = 400 - this.margin.top - this.margin.bottom;
    if (_colLabel)
        this.colLabel = _colLabel;
    else
        this.colLabel = "GMSLsmoothedYearRemoved";
    this.formatDate = d3.timeFormat("%Y %B %d");
    this.transDur = 1500;
    this.delayDur = 700;
    this.circleRad = 3.5;
    this.lineColour = "lightseagreen";

    this.initVis();
};

GMSLlineGraph.prototype.initVis = function(){
    this.initSVG();
    this.initAxes();
    this.initRefLineFunction();
    this.initLineFunction();
    this.initAreaFunction();
    this.wrangleData(this.x.domain());
};

GMSLlineGraph.prototype.initSVG = function() {
    vis = this;

    vis.svg = d3.select("#" + this.parentElement).append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right + this.referenceWidth)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .attr("id", "GMSLlineGraphSVG")
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    vis.gLine = vis.svg.append("g")
        .attr("id", "gLine");

    vis.gRefLine = vis.svg.append("g")
        .attr("id", "gRefLine");

    vis.gLineCircles = vis.gLine.append("g")
        .attr("id", "gLineCircles");
};

GMSLlineGraph.prototype.initAxes = function() {
    vis = this;

    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width])
        .domain(d3.extent(vis.data, function(d) { return d.Time; }));

    vis.y = d3.scaleLinear()
        .range([vis.height, 0])
        .domain(d3.extent(vis.data, function(d) { return d[vis.colLabel]; }));;

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.xAxisGroup = vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.xAxisGroup.append("text")
        .attr("font-size", 15 + "px")
        .attr("fill", "black")
        .text("Year")
        .style("text-anchor", "middle")
        .attr("x", vis.width/2)
        .attr("y", 45);

    vis.yAxisGroup = vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.yAxisGroup.append("text")
        .attr("font-size", 15 + "px")
        .attr("fill", "black")
        .text("Relative Sea Height Variation (mm)")
        .style("text-anchor", "middle")
        .attr("x", -vis.height/2)
        .attr("y", -40)
        .attr("transform", "rotate(270)");
};

GMSLlineGraph.prototype.initRefLineFunction = function() {
    vis = this;

    vis.refLine = d3.line()
        .curve(d3.curveCardinal)
        .x(function(d) { return vis.x(d.Time) * (vis.width + vis.referenceWidth) / vis.width; })
        .y(function(d) { return vis.y(d.Height); });
};

GMSLlineGraph.prototype.initLineFunction = function() {
    vis = this;

    vis.line = d3.line()
        .curve(d3.curveCardinal)
        .x(function(d) { return vis.x(d.Time); })
        .y(function(d) { return vis.y(d[vis.colLabel]); });
};

GMSLlineGraph.prototype.initAreaFunction = function() {
    vis = this;
    vis.maxYValue = d3.max(vis.data,function(d){return d[vis.colLabel]});

    vis.area = d3.area()
        .curve(d3.curveCardinal)
        .x(function(d) { return vis.x(d.Time); })
        .y0(vis.height)
        .y1(function(d){ return vis.y(d3.min([d[vis.colLabel], vis.maxYValue])); });
};

GMSLlineGraph.prototype.wrangleData = function(newDomain){
    vis = this;

    vis.x.domain(newDomain);

    vis.updateVis();
};

/*

GMSlineGraph.prototype.updateSeaChart = function(time, GMSL) {

}*/

GMSLlineGraph.prototype.moveArea = function(dataPoint) {
    vis.maxYValue = dataPoint[vis.colLabel];

    vis.area.y1(function(d){ return vis.y(d3.min([d[vis.colLabel], vis.maxYValue])); });

    // Update the Area
    vis.svg.select(".area")
        .style("opacity",100)
        .transition()
        .duration(vis.transDur)
        .delay(vis.delayDur)
        .style("opacity",100)
        .attr("d", vis.area(vis.data));
};

GMSLlineGraph.prototype.addCircles = function() {
    vis = this;

    vis.circles = vis.gLineCircles.selectAll(".circle")
        .data(vis.data, function(d) { return d; });
    vis.circles.enter().append("circle")
        .attr("class", "circle")
        .attr("fill", "red")
        .on('mouseover', function(d) {
            $("#lineData").html("<strong>" + vis.formatDate(d.Time) + "</strong> <br>" + "GMSL : " + d[vis.colLabel] + "</br>")

        })
        .on('click', function(d) { return vis.moveArea(d); } )
        .attr("r", vis.circleRad)
        .merge(vis.circles)
        .attr("cx", function(d) {return vis.x(d.Time)})
        .attr("cy", function(d) {return vis.y(d[vis.colLabel])})
        .style("opacity", 0.3);
    vis.circles.exit().remove();
};

GMSLlineGraph.prototype.addRefLines = function() {
    // Update the Ref Lines
    vis.sizeData.forEach(function(d){
        vis.gRefLine.append("path")
            .attr("class", "refLine")
            .attr("fill", "none")
            .attr("stroke", "grey")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .style("opacity",0)
            .transition()
            .duration(vis.transDur)
            .delay(vis.delayDur)
            .style("opacity",0.3)
            .attr("d", vis.refLine([{"Time": d3.min(vis.x.domain()),"Height": d.Height},{"Time": d3.max(vis.x.domain()),"Height": d.Height}]));

        vis.gRefLine.append("text")
            .attr("font-size", 12 + "px")
            .attr("fill", "grey")
            .text(d.Object)
            .style("text-anchor", "end")
            .attr("x", vis.width + vis.referenceWidth)
            .attr("y", vis.y(d.Height))
            .style("opacity",0)
            .transition()
            .duration(vis.transDur)
            .delay(vis.delayDur)
            .style("opacity",0.3);
    });
};

GMSLlineGraph.prototype.addLine = function() {
    vis.linePath = vis.gLine.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", vis.lineColour)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5);
};

GMSLlineGraph.prototype.addArea = function() {
    vis.gLine.append("path")
        .attr("class", "area")
        .style("fill", "lightseagreen");
};

GMSLlineGraph.prototype.updateVis = function() {
    vis = this;

    vis.addRefLines();
    vis.addLine();
    vis.addArea();
    vis.addCircles();

    // Update the Line
    vis.svg.select(".line")
        .style("opacity",0)
        .transition()
        .duration(vis.transDur)
        .delay(vis.delayDur)
        .style("opacity",100)
        .attr("d", vis.line(vis.data));

    // Update the Area
    vis.svg.select(".area")
        .style("opacity",0)
        .transition()
        .duration(vis.transDur)
        .delay(vis.delayDur)
        .style("opacity",100)
        .attr("d", vis.area(vis.data));

    // Update the Axis
    vis.svg.select(".x-axis")
        .transition()
        .duration(vis.transDur)
        .delay(vis.delayDur)
        .call(vis.xAxis);
    vis.svg.select(".y-axis")
        .transition()
        .duration(vis.transDur)
        .delay(vis.delayDur)
        .call(vis.yAxis);


    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
};