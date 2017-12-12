GMSLmanager = function(_dataDirectory,_sizeDataDirectory,_parentElement) {
    this.dataDirectory = _dataDirectory;
    this.sizeDataDirectory = _sizeDataDirectory;
    this.parentElement = _parentElement;
    this.data = [];
    this.sizeData = [];
    this.lineGraph = null;
    this.lineGraphWidth = 600;
    this.lineGraphHeight = 300;
    this.choropleth = null;
};

GMSLmanager.prototype.init = function() {
    manager2 = this;
    d3.csv(manager2.sizeDataDirectory, function(sizeError,sizeData) {
        d3.csv(manager2.dataDirectory, function(error, data) {
            if (!error) {
                console.log("load data");
                manager2.data = data;
                manager2.sizeData = sizeData;

                manager2.parseData();
                manager2.createVis();
            }
        });
    });
};

GMSLmanager.prototype.parseData = function() {
    manager2 = this;

    manager2.sizeData.forEach(function(d){
        d["Height"] = +d["Height"];
    });

    manager2.data.forEach(function(d){
        d["Time"] = manager2.convertDecimalDate(+d["Time"]);
        d["GMSL"] = +d["GMSL"];
        d["GMSL_rel"] = Math.round((d["GMSL"] - manager2.data[0]["GMSL"]) * 100) / 100;
        d["GMSL_uncertainty"] = +d["GMSL_uncertainty"];
        d["GMSL_uncertainty_rel"] = Math.round((d["GMSL_uncertainty"] - manager2.data[0]["GMSL_uncertainty"]) * 100) / 100;
    });

};

GMSLmanager.prototype.leapYear = function(year) {
    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
};

GMSLmanager.prototype.convertDecimalDate = function(decimalDate) {
    var year = parseInt(decimalDate);
    var reminder = decimalDate - year;
    var daysPerYear = this.leapYear(year) ? 366 : 365;
    var miliseconds = reminder * daysPerYear * 24 * 60 * 60 * 1000;
    var yearDate = new Date(year, 0, 1);
    return new Date(yearDate.getTime() + miliseconds);
};

GMSLmanager.prototype.createVis = function() {
    console.log(this.data);
    this.lineGraph = new GMSLlineGraph("GMSL-line-chart",this.data, this.sizeData, "GMSL_rel", this.lineGraphWidth,this.lineGraphHeight);
    //this.choropleth = new GMSLchoropleth("GMSL-choropleth");
};