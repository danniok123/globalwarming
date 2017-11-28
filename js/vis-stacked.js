StackedAreaGraph = function(_parentElement, _data, _colorScale, _totalWidth, _totalHeight){
    this.parentElement = _parentElement;
    this.data = _data;
    console.log(this.data);
    this.colorScale = _colorScale;
    this.displayData = [];
    this.margin = { top: 40, right: 0, bottom: 60, left: 60 };
    this.width = 800 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.initVis();
};

StackedAreaGraph.prototype.initVis = function(){
    this.initSVG();
    this.initAxes();
    this.stackData();
    this.initAreaFunction();
    this.wrangleData(this.x.domain());
};

StackedAreaGraph.prototype.initSVG = function() {
    this.svg = d3.select("#" + this.parentElement).append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .attr("id", "stackedAreaGraph")
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
};

StackedAreaGraph.prototype.initAxes = function() {
    // Scales and axes
    this.x = d3.scaleTime()
        .range([0, this.width])
        .domain(d3.extent(this.data, function(d) { return d.Month; }));

    this.y = d3.scaleLinear()
        .range([this.height, 0]);

    this.xAxis = d3.axisBottom()
        .scale(this.x);

    this.yAxis = d3.axisLeft()
        .scale(this.y);

    this.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + this.height + ")");

    this.svg.append("g")
        .attr("class", "y-axis axis");
};

StackedAreaGraph.prototype.stackData = function() {
    this.dataCategories = this.colorScale.domain();
    stack = d3.stack()
        .keys(this.dataCategories);

    this.stackedData = stack(this.data);
    //console.log(this.stackedData);
};

StackedAreaGraph.prototype.initAreaFunction = function() {
    vis = this;
    vis.area = d3.area()
        .curve(d3.curveCardinal)
        .x(function(d) { return vis.x(d.data.Month); })
        .y0(function(d) { return vis.y(d[0]); })
        .y1(function(d) { return vis.y(d[1]); });
};

StackedAreaGraph.prototype.wrangleData = function(newDomain){
    vis = this;

    vis.displayData = vis.stackedData;
    vis.x.domain(newDomain);

    vis.updateVis();
};

StackedAreaGraph.prototype.updateVis = function() {
    vis = this;
    // Update domain
    // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
    vis.y.domain([0, d3.max(vis.displayData, function(d) {
        return d3.max(d, function(e) {
            return e[1];
        });
    })
    ]);

    vis.dataCategories = vis.colorScale.domain();

    // Draw the layers
    vis.categories = vis.svg.selectAll(".area")
        .data(vis.displayData);

    vis.categories.enter().append("path")
        .attr("class", "area")
        .merge(vis.categories)
        .style("fill", function(d,i) {
            //console.log(vis.dataCategories);
            //console.log(vis.colorScale);
            return vis.colorScale(vis.dataCategories[i]);
        })
        //.on("mouseover", function(d) { updateTooltip(this,d); })
        .attr("d", function(d) {
            console.log(d);
            return vis.area(d);
        });

    vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    vis.categories.exit().remove();


    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
};