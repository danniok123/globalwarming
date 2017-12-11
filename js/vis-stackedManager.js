StackedAreaGraphManager = function(_dataDirectory,_parentElement) {
    this.dataDirectory = _dataDirectory;
    this.parentElement = _parentElement;
    this.parseDate = d3.timeParse("%Y");
    this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    this.data = [];
    this.graph = null;


};

StackedAreaGraphManager.prototype.init = function() {
    manager = this;
    d3.csv(this.dataDirectory, function(error, data) {
        if (!error) {
            console.log("load data");
            manager.data = data;

            manager.parseData();
            manager.setColorScaleDomain();
            manager.createVis();
        }
    });
};

StackedAreaGraphManager.prototype.parseData = function() {
    manager = this;

    manager.data.forEach(function(d){
        d["Year"] = manager.parseDate(d["Year"]);
        d["Europe"] = +d["Europe"];
        d["Asia"] = +d["Asia"];
        d["United States"] = +d["United States"];
        d["Canada"] = +d["Canada"];
        d["Latin America and the Caribbean"] = +d["Latin America and the Caribbean"];
        d["Africa"] = +d["Africa"];
        d["Australia and Oceania"] = +d["Australia and Oceania"];
    });
};

StackedAreaGraphManager.prototype.setColorScaleDomain = function() {
    this.colorScale.domain(d3.keys(this.data[0]).filter(function(d){ return d != "Year"; }));
};

StackedAreaGraphManager.prototype.createVis = function() {
    console.log(this.data);
    this.graph = new StackedAreaGraph(this.parentElement,this.data,this.colorScale);
};