/**
 * Calls the respective drawing functions based on the selected options.
 */
// Define the namespace

var GraphSelector = GraphSelector || {};

GraphSelector.ChartComponent = function (element) {

    var data;
    var selectedOptions;
    var selectedCategories = null;   // stores the categories selected from the user for the bar chart and the calendar
                                     // chart

    // some variables for the window sizes:
    var w,d,e,windowG,windowX,windowY,vaadin_menu_width,margin,width,height,svg,g,adjusted_height,x,y;

    // this function gets called whenever the data for GraphSelector has been set
    this.setData = function (dataString, userSelectedOptions) {
    
        // parse the input represented by json 
        var dat = JSON.parse(dataString);
        selectedOptions = JSON.parse(userSelectedOptions);

        console.log(selectedOptions);

        // sort the data by time
        data = dat.sort(function(a,b){
            return a.startDateInUTC-b.startDateInUTC;
        });

        console.log(data);
        
        // update the window variables according to the screen resolution
        updateWindowVariables();

        // draw the chart
        drawChart();
    };

    function drawChart() {

        switch(selectedOptions.plotSelected) {

            case "LineChart":
                drawLineChart(data, selectedOptions, svg, g, width, adjusted_height);
                break;
            case "StackedBarChart":
                selectedCategories =
                    drawStackedBarChart(data, selectedOptions, element, svg, g, width, adjusted_height, margin,
                        selectedCategories);
                console.log("mygraph after:")
                console.log(selectedCategories);
                break;
            case "CalendarChart":
                selectedCategories = drawCalendarChart(data, selectedOptions, element, svg, g, width, adjusted_height,
                    margin, selectedCategories);
                break;
        }
    }


    /*
     * updates the variables related to the window
     */
    function updateWindowVariables() {

        console.log("window var")

        // get the current window sizes
        w = window,
            d = document,
            e = d.documentElement,
            windowG = d.getElementsByTagName('body')[0],
            windowX = w.innerWidth || e.clientWidth || windowG.clientWidth,
            windowY = w.innerHeight|| e.clientHeight|| windowG.clientHeight;

        // the vaadin menu sizes (left and top), are depending on the window width
        if (windowX > 1000) {
            vaadin_menu_width = 200;
            vaadin_top_bar_height = 65;
        } else if (windowX <= 1000 && windowX > 600) {
            vaadin_menu_width = 80;
            vaadin_top_bar_height = 65;
        } else {
            vaadin_menu_width = 0;
            vaadin_top_bar_height = 65+37;
        }

        // TODO: testing
        d.body.style.overflow = "hidden";

        // set the margin, the width and the height accordingly
        margin = {top: 10, right: 100, bottom: 30, left: 50},
            width = windowX - margin.left - margin.right - vaadin_menu_width,
            height = windowY - margin.top - margin.bottom - vaadin_top_bar_height;

        // remove previously drawn elements
        d3.selectAll("svg").remove();

        // adjust the height for the range of the y axis
        adjusted_height = height-margin.top-margin.bottom;

        // create the svg with the corresponding size
        svg = d3.select(element).append("svg:svg").attr("width", width+margin.right).attr("height",
                                                                                    height),
            g  = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    }


    /*
     * updates the view by updating the window variables and redrawing the chart afterwards
     */
    function updateView(){

        // update width, height, etc. for the window
        updateWindowVariables();

        // draw the chart
        drawChart();
    }


    /*
     * helper function to add a listener to the corresponding event
     * code based on:
     * https://stackoverflow.com/questions/641857/javascript-window-resize-event/3150139#3150139
     */
    var addEvent = function(object, type, callback) {
        if (object == null || typeof(object) == 'undefined') return;
        if (object.addEventListener) {
            object.addEventListener(type, callback, false);
        } else if (object.attachEvent) {
            object.attachEvent("on" + type, callback);
        } else {
            object["on"+type] = callback;
        }
    };


    // resizeWindow gets called after 200ms after the window has been resized
    var timeoutForResizeWindow;
    addEvent(window, "resize", function(event) {
        clearTimeout(timeoutForResizeWindow);
        timeoutForResizeWindow = setTimeout(updateView, 200);
    });

};