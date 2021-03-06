var xAxisSP, yAxisSP, xAxisLabelSP, yAxisLabelSP;

// TODO: parse dimensions (i.e., attributes) from input file*
var dimensions = ["dimension 1", "dimension 2", "dimension 3", "dimension 4", "dimension 5", "dimension 6"];
//*HINT: the first dimension is often a label; you can simply remove the first dimension with
// dimensions.splice(0, 1);

// the visual channels we can use for the scatterplot
var channels = ["scatterX", "scatterY", "color", "size"];

// size of the plots
var margin, widthPC, widthSP, height;
// svg containers
var svgPC, svgSP;
// the loaded data
var values = [];
// containers for axis
var y = {};
var xSP = {};

//the selected options in SP
var ycolumn;
var xcolumn;
var color;
var size;

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

                var loadedData = reader.result;

                // TODO: parse reader.result data and call initVis with the parsed data!
                values = d3.csvParse(loadedData);

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

    // x scaling for parallel coordinates
    var xPC = d3.scalePoint()
        .domain(dimensions)
        .range([margin.left, widthPC - margin.left - margin.right]);

    // y scalings
    // TODO: set y domain for each dimension
    for(i in dimensions){
        var dimName = dimensions[i];
        y[dimName] = d3.scaleLinear()
            .domain(d3.extent(_data, function(d) { return +d[dimName]; }))
            .range([height - margin.bottom - margin.top, margin.top]);

    }



    // TODO: render parallel coordinates polylines

    //function to highlight hovered item
    var highlight = function (d){
        var nameColumn = values.columns[0];
        var selected_item = d[nameColumn];

        infoText.text(selected_item);
        infoText.style('visibility', 'visible')
        infoBox.style('visibility', 'visible');


        d3.selectAll(".line")
            .transition().duration(200)
            .style('stroke', 'lightgrey')
            .style('opacity', 0.2);

        d3.select(this)
            .transition().duration(200)
            .style('stroke', 'steelblue')
            .style('opacity', 1.0);
    };

    //function to remove the highlight
    var unhighlight = function(d){
        infoBox.style('visibility', 'hidden');
        infoText.style('visibility', 'hidden');
        d3.selectAll(".line")
            .transition().duration(200)
            .style('stroke', 'gray')
            .style('opacity', 0.5);
    }

    //function to crate a path across all dimensions
    function path(d){
        return d3.line()(dimensions.map(function(p) { return [xPC(p), y[p](d[p])];}));
    }

    svgPC
        .selectAll(".path")
        .data(_data)
        .enter().append("path")
        .attr("class", function (d) {
            var nameColumn = values.columns[0];
            return "line " + d[nameColumn]
        })
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", "gray")
        .style("opacity", 0.5)
        .on("mouseover", highlight)
        .on("mouseout",unhighlight);

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
        });


    //box for the lable in PC Plot
    var infoBox = svgPC.append('rect')
        .attr('x', 780)
        .attr('width', 120)
        .attr('height', 40)
        .attr('fill', 'lightgrey')
        .attr('rx', 15)
        .attr('ry', 15)
        .style("opacity", 0.8)
        .style("visibility", "hidden");



    //lable Text for PC Plot
    var infoText = svgPC.append('text')
        .attr('x', 840)
        .attr('y', 25)
        .attr("fill", "black")
        .style('text-anchor', 'middle')
        .style("visibility", "hidden")
        .style('font-size', 12)
        .text("name");


    var sPC = document.querySelector('#pc').querySelector('svg');
    var ptPC = sPC.createSVGPoint();

    function cursorPoint(evt){
        ptPC.x = evt.clientX;
        ptPC.y = evt.clientY;
        return ptPC.matrixTransform(sPC.getScreenCTM().inverse());
    }

    sPC.addEventListener('mousemove', function(evt) {
        var loc = cursorPoint(evt);
        infoBox
            .attr('x', loc.x)
            .attr('y', loc.y);
        infoText
            .attr('x', loc.x + 60)
            .attr('y', loc.y + 25);
    },false);


    // *HINT: to make a call for each bound data item, use .each!
    // example: http://bl.ocks.org/milroc/4254604

    // x scalings for scatter plot
    // TODO: set x domain for each dimension

    for(i in dimensions) {
        var name = dimensions[i];
        xSP[name] = d3.scaleLinear()
            .domain(d3.extent(_data, function (d) {
                return +d[name];
            }))
            .range([margin.left, widthSP - margin.left - margin.right]);
    }


    // scatterplot axes
    yAxisSP = svgSP.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + ")")
        .call(d3.axisLeft().scale(y[_data.columns[1]]));


    yAxisLabelSP = yAxisSP.append("text")
        .style("text-anchor", "middle")
        .attr("y", margin.top / 2)
        .text(_data.columns[1]);

    xAxisSP = svgSP.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, " + (height - margin.bottom - margin.top) + ")")
        .call(d3.axisBottom().scale(xSP[_data.columns[1]]));

    xAxisLabelSP = xAxisSP.append("text")
        .style("text-anchor", "middle")
        .attr("x", widthSP - margin.right)
        .text(_data.columns[1]);

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

    d3.select("#scatterX-button").select(".ui-selectmenu-text")
        .each(function(d, i){
            d3.select(this)
            xcolumn = this.textContent;
        });

    d3.select("#scatterY-button").select(".ui-selectmenu-text")
        .each(function(d, i){
            d3.select(this)
            ycolumn = this.textContent;
        });

    d3.select("#color-button").select(".ui-selectmenu-text")
        .each(function(d, i){
            d3.select(this)
            color = this.textContent;
        });

    d3.select("#size-button").select(".ui-selectmenu-text")
        .each(function(d, i){
            d3.select(this)
            size = this.textContent;
        });

    yAxisLabelSP
        .text(ycolumn);

    xAxisLabelSP
        .text(xcolumn);


    // TODO: re-render axes
    yAxisSP
        .call(d3.axisLeft().scale(y[ycolumn]));

    xAxisSP
        .call(d3.axisBottom().scale(xSP[xcolumn]));


    //values of currently selected options
    var xValue = d => d[xcolumn];
    var yValue = d => d[ycolumn];
    var cValue = d => d[color];
    var sValue = d => d[size];

    //Scales for currently selected options
    var xScale = xSP[xcolumn];
    var yScale = y[ycolumn];
    var sScale = d3.scaleLinear()
        .domain(d3.extent(values, function(d) { return +d[size]; }))
        .range([2, 15]);
    var cScale = d3.scaleLinear()
        .domain(d3.extent(values, function(d) { return +d[color]; }))
        .range(['green', 'magenta']);


    //funciton to highlight the hovered item in SP
    var highlightSP = function (d){
        var nameColumn = values.columns[0];
        var selected_item = d[nameColumn];

        infoTextSP.text(selected_item);
        infoTextSP.style('visibility', 'visible')
        infoBoxSP.style('visibility', 'visible');

        d3.select(this)
            .transition().duration(200)
            .style('opacity', 1.0);
    };

    //function to remove the highlight in SP
    var unhighlightSP = function(d){
        infoBoxSP.style('visibility', 'hidden');
        infoTextSP.style('visibility', 'hidden');

        d3.select(this)
            .transition().duration(200)
            .style('opacity', 0.7);
    }

    // TODO: render dots
    //create a circle for each item in values
    var circles = svgSP.selectAll('circle').data(values);

    circles.exit().remove();
    circles
         .enter().append('circle')
            .attr('cy', d => yScale(yValue(d)))
            .attr('cx', d => xScale(xValue(d)))
            .attr('r', d => sScale(sValue(d)))
            .attr('fill', d => cScale(cValue(d)))
            .attr('stroke', 'black')
            .attr('opacity', 0.7)
            .on("mouseover", highlightSP)
            .on('mouseout', unhighlightSP);

    circles.transition()
        .duration(500)
        .attr('cy', d => yScale(yValue(d)))
        .attr('cx', d => xScale(xValue(d)))
        .attr('r', d => sScale(sValue(d)))
        .attr('fill', d => cScale(cValue(d)));

    //box for the lable in SP
    var infoBoxSP = svgSP.append('rect')
        .attr('x', 600)
        .attr('width', 120)
        .attr('height', 40)
        .attr('fill', 'lightgrey')
        .attr('rx', 15)
        .attr('ry', 15)
        .style("opacity", 0.8)
        .style("visibility", "hidden");


    //lable text in SP
    var infoTextSP = svgSP.append('text')
        .attr('x', 660)
        .attr('y', 25)
        .attr("fill", "black")
        .style('text-anchor', 'middle')
        .style("visibility", "hidden")
        .style('font-size', 12)
        .text("name");

    var sSP = document.querySelector('#sp').querySelector('svg');
    var ptSP = sSP.createSVGPoint();

    function cursorPoint(evt){
        ptSP.x = evt.clientX;
        ptSP.y = evt.clientY;
        return ptSP.matrixTransform(sSP.getScreenCTM().inverse());
    }

    sSP.addEventListener('mousemove', function(evt) {
        var loc = cursorPoint(evt);
        infoBoxSP
            .attr('x', loc.x)
            .attr('y', loc.y);
        infoTextSP
            .attr('x', loc.x + 60)
            .attr('y', loc.y + 25);
    },false);
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