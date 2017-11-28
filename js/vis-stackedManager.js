StackedAreaGraphManager = function(_dataDirectory,_parentElement) {
    this.dataDirectory = _dataDirectory;
    this.parentElement = _parentElement;
    this.parseDate = d3.timeParse("%Y %B");
    this.colorScale = d3.scaleOrdinal(d3.schemeCategory20);
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
        d["Aviation Gasoline"] = +d["Aviation Gasoline"];
        d["Coal"] = +d["Coal"];
        d["Distillate Fuel Oil"] = +d["Distillate Fuel Oil"];
        d["Hydrocarbon Gas Liquids"] = +d["Hydrocarbon Gas Liquids"];
        d["Jet Fuel"] = +d["Jet Fuel"];
        d["Kerosene"] = +d["Kerosene"];
        d["Lubricants"] = +d["Lubricants"];
        d["Month"] = manager.parseDate(d["Month"]);
        d["Motor Gasoline"] = +d["Motor Gasoline"];
        d["Natural Gas"] = +d["Natural Gas"];
        d["Other Petroleum Products"] = +d["Other Petroleum Products"];
        d["Petroleum Coke"] = +d["Petroleum Coke"];
        d["Petroleum, Excluding Biofuels"] = +d["Petroleum, Excluding Biofuels"];
        d["Residual Fuel Oil"] = +d["Residual Fuel Oil"];
        d["Total Energy"] = +d["Total Energy"];
    });
};

StackedAreaGraphManager.prototype.setColorScaleDomain = function() {
    this.colorScale.domain(d3.keys(this.data[0]).filter(function(d){ return d != "Month" && d != "Total Energy"; }));
};

StackedAreaGraphManager.prototype.createVis = function() {
    console.log(this.data);
    this.graph = new StackedAreaGraph(this.parentElement,this.data,this.colorScale);
};