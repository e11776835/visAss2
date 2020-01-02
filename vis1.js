var xAxisSP, yAxisSP, xAxisLabelSP, yAxisLabelSP;

// TODO: parse dimensions (i.e., attributes) from input file*
var dimensions = ["dimension 1", "dimension 2", "dimension 3", "dimension 4", "dimension 5", "dimension 6", "Mario"];
//*HINT: the first dimension is often a label; you can simply remove the first dimension with
// dimensions.splice(0, 1);

// the visual channels we can use for the scatterplot
var channels = ["scatterX", "scatterY", "color", "size"];

// size of the plots
var margin, widthPC, widthSP, height;
// svg containers
var svgPC, svgSP;

var values = [];
var y = {};

function init() {
    // define size of plots
    margin = {top: 20, right: 20, bottom: 20, left: 50},
        widthPC = 960,
        widthSP = 600,
        height = 500;

    // parallel coordinates SVG container
    svgPC = d3.select("#pc").append("svg")
        .attr("width", widthPC)
        .attr("height", height)
        .append("g");

    // scatterplot SVG container and axes
    svgSP = d3.select("#sp").append("svg")
        .attr("width", widthPC)
        .attr("height", height)
        .append("g");


    // read and parse input file
    var fileInput = document.getElementById("upload"),
        readFile = function () {

            // clear existing visualizations
            clear();

            var reader = new FileReader();
            reader.onloadend = function () {
                console.log("data loaded: ");
                //console.log(reader.result);
                var loadedData = reader.result;


                // TODO: parse reader.result data and call initVis with the parsed data!
                values = d3.csvParse(loadedData);
                console.log(values);
                initVis(values);
            };
            reader.readAsBinaryString(fileInput.files[0]);
        };
    fileInput.addEventListener('change', readFile);
}

function initVis(_data){

    // TODO: parse dimensions (i.e., attributes) from input file
    dimensions = Object.keys(_data[0]);
    dimensions.splice(0,1);
    console.log(dimensions);

    // x scaling for parallel coordinates
    var xPC = d3.scalePoint()
        .domain(dimensions)
        .range([margin.left, widthPC - margin.left - margin.right]);

    // y scalings
    // TODO: set y domain for each dimension
    for(i in dimensions){
        var name = dimensions[i];
        y[name] = d3.scaleLinear()
            .domain(d3.extent(_data, function(d) { return +d[name]; }))
            .range([height - margin.bottom - margin.top, margin.top]);

    }

    // TODO: render parallel coordinates polylines
    function path(d){
        return d3.line()(dimensions.map(function(p) { return [xPC(p), y[p](d[p])];}));
    }

    svgPC
        .selectAll(".path")
        .data(_data)
        .enter().append("path")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", "gray")
        .style("opacity", 0.5)

    // parallel coordinates axes container
    var gPC = svgPC.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function (d) {
            return "translate(" + xPC(d) + ")";
        });

    // parallel coordinates axes
    gPC.append("g")
        .attr("class", "axis")
        .each(function(d, i){
            d3.select(this)
                .call(d3.axisLeft().scale(y[d])) // TODO: call axis scale for current dimension*
                .append("text")
                .style("text-anchor", "middle")
                .attr("y", margin.top / 2)
                .text(d => dimensions[i]); // TODO: get domain name from data
        })


    // *HINT: to make a call for each bound data item, use .each!
    // example: http://bl.ocks.org/milroc/4254604

    // x scalings for scatter plot
    // TODO: set x domain for each dimension
    var xSP = d3.scaleLinear()
        .range([margin.left, widthSP - margin.left - margin.right]);

    // scatterplot axes
    yAxisSP = svgSP.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + ")")
        .call(d3.axisLeft().scale(y[d]));


    yAxisLabelSP = yAxisSP.append("text")
        .style("text-anchor", "middle")
        .attr("y", margin.top / 2)
        .text("x");

    xAxisSP = svgSP.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, " + (height - margin.bottom - margin.top) + ")")
        .call(d3.axisBottom(xSP));

    xAxisLabelSP = xAxisSP.append("text")
        .style("text-anchor", "middle")
        .attr("x", widthSP - margin.right)
        .text("y");

    // init menu for the four visual channels
    channels.forEach(function(c){
        initMenu(c, dimensions);
    });

    // refresh all four select menus
    channels.forEach(function(c){
       refreshMenu(c);
    });

    renderSP();
}

// clear visualizations before loading a new file
function clear(){
    svgPC.selectAll("*").remove();
    svgSP.selectAll("*").remove();
}


// render scatterplot
function renderSP(){

    // TODO: get domain names from menu and label x- and y-axis

    // TODO: re-render axes

    // TODO: render dots
}

// init scatterplot select menu
function initMenu(id, entries){
    $( "select#" + id ).empty();

    entries.forEach(function(d) {
        $( "select#" + id ).append("<option>"+d+"</option>");
    });

    $( "#"+id ).selectmenu({
        select: function() {
            renderSP();
        }
    });
}

// refresh menu after reloading data
function refreshMenu(id){
    $( "#"+id ).selectmenu("refresh");
}

// read current scatterplot parameters
function readMenu(id){
    return $( "#" + id ).val();
}