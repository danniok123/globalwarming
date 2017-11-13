var global_data;
var annual_state_data = {};

d3.csv("data/GlobalLandTemperaturesByState.csv", function(error, data) {
    global_data = data;
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

    console.log(annual_state_data)
});