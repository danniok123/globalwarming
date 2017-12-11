StackedAreaGraph = function(_parentElement, _data, _colorScale, _totalWidth, _totalHeight){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = this.data;
    this.selectedKeys = [];
    this.colorScale = _colorScale;
    this.margin = { top: 40, right: 0, bottom: 60, left: 60 };
    this.width = 1200 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;
    this.legendWidth = 400;
    this.transDur = 1500;
    this.delayDur = 700;

    this.initVis();
};

StackedAreaGraph.prototype.initVis = function(){
    stackVis = this;

    stackVis.initSVG();
    stackVis.initAxes();
    stackVis.stackData();
    stackVis.initLegend();
    stackVis.initAreaFunction();
    stackVis.displayData = stackVis.stackedData;
    stackVis.dataCategories = stackVis.colorScale.domain();
    stackVis.selectedKeys = stackVis.dataCategories;
    stackVis.wrangleData(this.x.domain());
};

StackedAreaGraph.prototype.initSVG = function() {
    this.svg = d3.select("#" + this.parentElement).append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .attr("id", "stackedAreaGraph")
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
};

StackedAreaGraph.prototype.initLegend = function() {
    stackVis = this;

    stackVis.legend = stackVis.svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (stackVis.width - stackVis.legendWidth) + "," + 25 + ")");

    stackVis.legend.append("text")
        .attr("font-size", 25 + "px")
        .attr("fill", "black")
        .text("Legend")
        .attr("x", stackVis.legendWidth/4)
        .attr("y", 0);

    stackVis.legendRect = stackVis.legend.selectAll(".legendRect")
        .data(stackVis.dataCategories)
        .attr("class", "legendRect")
        .enter().append("rect")
        .attr("x", 50)
        .attr("y", function(d,i) { return 25 + i * 20; })
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function(d,i) { return stackVis.colorScale(stackVis.dataCategories[stackVis.dataCategories.length - (i+1)]); });

    stackVis.legendText = stackVis.legend.selectAll(".legendText")
        .data(stackVis.dataCategories)
        .attr("class", "legendText")
        .enter().append("text")
        .attr("x", 80)
        .attr("y", function(d,i) { return 35 + i * 20; })
        .attr("font-size", 15 + "px")
        .attr("fill", "black")
        .style("opacity", 0.5)
        .text(function(d,i) { return stackVis.dataCategories[stackVis.dataCategories.length - (i+1)]; })
};

StackedAreaGraph.prototype.initAxes = function() {
    // Scales and axes
    this.x = d3.scaleTime()
        .range([0, this.width - this.legendWidth])
        .domain(d3.extent(this.displayData, function(d) { return d.Year; }));

    this.y = d3.scaleLinear()
        .range([this.height, 0]);

    this.xAxis = d3.axisBottom()
        .scale(this.x);

    this.yAxis = d3.axisLeft()
        .scale(this.y);

    this.xAxisGroup = this.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + this.height + ")");

    this.xAxisGroup.append("text")
        .attr("font-size", 15 + "px")
        .attr("fill", "black")
        .text("Year")
        .attr("x", (this.width - this.legendWidth)/2)
        .attr("y", 45);

    this.yAxisGroup = this.svg.append("g")
        .attr("class", "y-axis axis");

    this.yAxisGroup.append("text")
        .attr("font-size", 15 + "px")
        .attr("fill", "black")
        .text("Millions of Tons of Carbon Dioxide")
        .attr("x", -50)
        .attr("y", -45)
        .attr("transform", "rotate(270)");
};

StackedAreaGraph.prototype.stackData = function() {
    this.dataCategories = this.colorScale.domain();
    stack = d3.stack()
        .keys(this.dataCategories);

    this.stackedData = stack(this.displayData);
};

StackedAreaGraph.prototype.initAreaFunction = function() {
    stackVis = this;
    stackVis.area = d3.area()
        .curve(d3.curveCardinal)
        .x(function(d) { return stackVis.x(d.data.Year); })
        .y0(function(d) { return stackVis.y(d[0]); })
        .y1(function(d) { return stackVis.y(d[1]); });
};

StackedAreaGraph.prototype.filterData = function(){
    stackVis = this;

    var tempData = [];

    stackVis.selectedKeys.forEach(function(d){
        stackVis.stackedData.forEach(function(e){
            if(d === e.key)
                tempData[tempData.length] = e;
        });
    });

    stackVis.displayData = tempData;
};

StackedAreaGraph.prototype.wrangleData = function(newDomain){
    stackVis = this;

    stackVis.x.domain(newDomain);
    stackVis.filterData();

    stackVis.updateVis();
};

StackedAreaGraph.prototype.hoverArea = function(stackVis,d) {
    var currKey = d.key;

    console.log(this);

    stackVis.legendText._groups[0].forEach(function(d){
        if(d.textContent === currKey) {
            d.style.opacity = 1;
        }
        else{

        }
    });
};

StackedAreaGraph.prototype.clickArea = function(stackVis,d) {
    stackVis.selectedKeys = [d.key];
    this.wrangleData(this.x.domain());
};

StackedAreaGraph.prototype.unHoverArea = function(stackVis,d) {
    var currKey = d.key;

    stackVis.legendText._groups[0].forEach(function(d){
        if(d.textContent === currKey) {
            d.style.opacity = 0.5;
        }
    });
};

StackedAreaGraph.prototype.updateVis = function() {
    stackVis = this;
    // Update domain
    // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
    stackVis.y.domain([0, d3.max(stackVis.displayData, function(d) {
        return d3.max(d, function(e) {
            return e[1];
        });
    })
    ]);

    // Draw the layers
    stackVis.categories = stackVis.svg.selectAll(".area")
        .data(stackVis.displayData);

    stackVis.categories.enter().append("path")
        .attr("class", "area")
        .merge(stackVis.categories)
        .style("fill", function(d) {
            index = stackVis.colorScale.domain().indexOf(d.key);
            return stackVis.colorScale(stackVis.dataCategories[index]);
        })
        .on("mouseover", function(d) { console.log(stackVis); stackVis.hoverArea(stackVis,d); })
        //.on("click", function(d) { stackVis.clickArea(stackVis,d); })
        .on("mouseout", function(d) { stackVis.unHoverArea(stackVis,d); })
        .attr("d", function(d) {
            return stackVis.area(d);
        });

    stackVis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", stackVis.width)
        .attr("height", stackVis.height);

    stackVis.categories.exit().remove();


    // Call axis functions with the new domain
    stackVis.svg.select(".x-axis").call(stackVis.xAxis);
    stackVis.svg.select(".y-axis").call(stackVis.yAxis);
};

