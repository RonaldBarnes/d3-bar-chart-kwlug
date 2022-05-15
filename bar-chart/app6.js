
// NOTE on coordinates: 0,0 is TOP,LEFT
//
// NOTE on attr vs style:
//	style > CSS > attr
//
// .enter, .update, .exit in d3 v4:
// https://www.d3indepth.com/v4/enterexit/
//
// General transistions:
// https://www.d3indepth.com/transitions/

console.log(
	"--------------------------\n" +
	"© Ron@RonaldBarnes.ca 2022\n" +
	"--------------------------\n"
	);
let subject = "Data \"Constancy\"";



// Padding inside SVG to leave room for axes labels, etc.
let padding = {
	top: 30,
	right: 50,
	// Larger to leave room for labels:
	bottom: 100,
	left: 100
	};



let width = getPageWidth();
let height = getPageHeight();
let barPadding = 10;
let numBars = 12;
// let barWidth = (width - padding.left - padding.right) / numBars - barPadding;
let barWidth = width / numBars - barPadding;
// console.log(`BAR WIDTH: ${barWidth}`);




// Associate month names with numbers:
let months = [
	{num:  1, name: "January"},
	{num:  2, name: "February"},
	{num:  3, name: "March"},
	{num:  4, name: "April"},
	{num:  5, name: "May"},
	{num:  6, name: "June"},
	{num:  7, name: "July"},
	{num:  8, name: "August"},
	{num:  9, name: "September"},
	{num: 10, name: "October"},
	{num: 11, name: "November"},
	{num: 12, name: "December"}
	];






// Values to be assigned once data fetched:
let xScale = d3.scaleLinear();
let yScale = d3.scaleLinear();
let xAxis = d3.axisBottom();
let yAxis = d3.axisLeft();



// Data in JSON format for driving chart:
let birthData = {};

d3.queue()
	.defer(d3.json, "http://bclug.ca:8008/d3/kwlug/bar-chart/birthData-JSON.js")
/*
		function(row) {
			// Formatter function:
			return {
				year: Number(row.year),
				month: month,
				monthNum: months.find( (m) => m.name === month),
				births: Number(births)
				}
			}	// end formatter function
		)	// end defer
*/
	.await(function(error, birthData) {
		if (error) throw error;

		// Assign data to global scoped variables:
		minYear = d3.min( birthData, d => (d.year) );
		maxYear = d3.max( birthData, d => (d.year) );

		// Add data to our input selector:
		d3.select("#inputYear")
			.property("min", minYear)
			.property("max", maxYear)
			.property("value", Math.floor( (maxYear - minYear) / 2 ) + minYear)
			;
		d3.select("label")
			.text(`${minYear} <-- Year Range --> ${maxYear}`)
			;
		// Now we have data, ...
		updateScales();
		// Assign our scales to our axes:
		xAxis = d3.axisBottom(xScale);
		yAxis = d3.axisLeft(yScale);
		updateGraph();
		})	// end await
	;














// Insert new SVG at the "graph" div:
d3.select("#graph")
	.append("svg")
		.attr("id", "svg")
		.attr("width", width + padding.left + padding.right)
		.attr("height", height + padding.top + padding.bottom)
		.attr("x", padding.left)
		.attr("y", padding.top)
		// Overrides CSS, but doesn't work as attr():
		.style("outline", "solid red 1px")
	;
// Add a border around the graph (at padding boundary)
// For checking alignments, etc.
// NOTE: when very narrow window, xAxis is nowhere near right border!
d3.select("svg")
	.append("g")
	.append("path")
	.attr("id", "padding-border")
	// this style does not work, use function paddingBox() to draw path:
	//	.style("outline", "solid green 1px")
	;
// Invoke the SVG line drawing routine:
paddingBox();




// TITLE ----------------------------------------------------------------------
d3.select("svg")
	.append("text")
		.attr("id", "title")
		.text(`Births for year ${d3.select("#inputYear").property("value")}`)
		.style("font-size", "2rem")
		.attr("x", padding.left + width / 2)
		.attr("y", padding.top)
		// Adjust upwards from touching padding:
		.attr("dy", -2)
		// Align *middle* of text with x coordinates
		.attr("text-anchor", "middle")
	;




// SCALES ---------------------------------------------------------------------
// Once data has been loaded for .domain():
function updateScales()
	{
	// Xaxis scale:
	xScale	// = d3.scaleLinear()
		// domain is number of months in a year, as indices:
		.domain([ 1,12 ])
		// Data will be plotted from left padding across width
		// with a bit shaved off so outer bar edges touch padding boundaries:
		.range([ padding.left + barWidth / 2, padding.left + width - barWidth / 2 ])
		// clamping ensures no data falls outside range
		.clamp(true)
		;
	yScale	// = d3.scaleLinear()
		// Domain is from zero births to max # births in JSON data:
		.domain([ 0, d3.max(birthData, d => (d.births)) ])
		// Invert range: bars start mid-way and extend down to bottom
		.range([ height, 0])	//padding.top ])
		;
	}
// SCALES ---------------------------------------------------------------------



// AXES -----------------------------------------------------------------------
// Append X axis ONCE, add data-driven attributes in a callable routine later:
d3.select("svg")
	// append a group as collection of axis elements:
	.append("g")
		.attr("id", "xaxis")
	;
// Append Y axis ONCE, add data-driven attributes in a callable routine later:
d3.select("svg")
	// append a group as collection of axis elements:
	.append("g")
		.attr("id", "yaxis")
	;



function updateAxes()
	{
	console.log("updateAxes()");

	// Update xAxis:
	d3.select("#xaxis")
		// Align with centre of first bar:
		// Why is transform required, and attr(x,y) doesn't work?
		.attr("transform", `translate(0, ${padding.top + height})`)
		//		.attr("x", padding.left + barWidth / 2)
		//		.attr("y", padding.top + height)
		.call(xAxis)
			.selectAll("text")
			.attr("stroke", "blue")
			.attr("fill", "red")
			.attr("text-anchor", "end")
			.style("font-size", "1rem")
			// Convert data element's number to month's name by looking up
			// d (.range([1,12])) in months array:
			.text( d =>  (months.find( m => (m.num === d)).name ))
			.attr("transform", "rotate(-45)")
		;

	// Y Axis:
	// Update Y Axis (tickSize changes when screen resizes):
	yAxis
		.tickSizeInner( -1 * width)
		;
	d3.select("#yaxis")
		// append a group as collection of axis elements:
		.attr("transform", `translate(${padding.left}, ${padding.top})`)
		.call(yAxis)
			.attr("stroke-dasharray", "10 5")
			.style("stroke-width", "0.5px")
			.selectAll("text")
				.attr("stroke-dasharray", "1 0")
				.style("stroke-width", "1px")
				.attr("stroke", "blue")
				.text( d => (d3.format(".2s")(d) ))
				.attr("fill", "red")
				.attr("text-anchor", "end")
				.style("font-size", "1rem")
		;
	}	// end updateAxes


// Append X axis label:
d3.select("svg")
	.append("text")
		.attr("id", "xaxis-label")
		.text("Month")
	;
// Append Y axis Label:
d3.select("svg")
	.append("text")
		.attr("id", "yaxis-label")
		.text("Births")
	;

function updateAxesLabels()
	{
	d3.select("#xaxis-label")
		.attr("x", padding.left + width / 2)
		.attr("y", padding.top + height + padding.bottom)
		// Move baseline UP slightly (delta-y negative value):
		.attr("dy", -10 )
		.attr("text-anchor", "middle")
		.style("font-size", "1.75rem")
	;

	d3.select("#yaxis-label")
		.attr("transform", "rotate(-90)")
		// Now coordinates are rotated 90°, x & y are swapped:
		.attr("x", -1 * height / 2 - padding.top)
		.attr("y", "1em")
		.attr("text-anchor", "middle")
		.style("font-size", "1.75rem")
	;
	}
// AXES -----------------------------------------------------------------------









// DRAW CHART -----------------------------------------------------------------
function updateGraph()
	{
	console.log(`updateGraph() year:`,
		d3.select("#inputYear").property("value")
		);
	//
	width = getPageWidth();
	height = getPageHeight();
	year = +d3.select("#inputYear").property("value")
	barWidth = (width - padding.left - padding.right) / numBars - barPadding;
	barWidth = width / numBars - barPadding;

	// Update SVG size & position properties
	d3.select("svg")
		.attr("width", width + padding.left + padding.right)
		.attr("height", height + padding.top + padding.bottom)
		.attr("x", padding.left)
		.attr("y", padding.top)
		;

	// Update title to reflect updated year:
	d3.select("#title")
		.text(`Births for year ${year}`)
		.attr("x", padding.left + width / 2)
		;

	updateScales();
	updateAxes();
	updateAxesLabels();



	// Filter out data not from year chosen in input range selector:
	let barData = birthData.filter( (y) => (y.year === year) );

	let bars = d3.select("svg")
		.selectAll("rect")
		.data(barData,
			// Add a "key function":
			// Return array of months as keys binding array elements to bars:
			function(m) { return m.month }
			)
		;

	bars
		.enter()
			.append("rect")
				// Add listeners to show / hide tooltips:
				.on("mousemove", tooltipShow)
				.on("touchstart", tooltipShow)
				.on("mouseout", tooltipHide)
				.on("touchend", tooltipHide)
			.merge(bars)
				.attr("width", barWidth)
				// Adjust the x pos left by ½ barWidth to centre-align at X axis ticks:
				.attr("x", (data, index) => (xScale(
					months.find( m => (m.name === data.month)).num
					) - barWidth / 2))
				// Starts mid-way, ends at bottom (at x axis):
				.attr("y", (d) => (yScale(d.births) + padding.top))
				.attr("height", (d) => (height - yScale(d.births)))
				.attr("id", (d) => (d.month))
		;


	// Update our padding indicator box upon resize:
	paddingBox();
	}	// end updateGraph
// DRAW CHART -----------------------------------------------------------------













// TOOLTIP HANDLING -----------------------------------------------------------
// Changing opacity or transforming can mess with z-index!
// https://www.freecodecamp.org/news/4-reasons-your-z-index-isnt-working-and-how-to-fix-it-coder-coder-6bc05f103e6c/
let tooltip = d3.select("body")
	.append("div")
		.attr("id", "tooltip")
		.classed("tooltip", true)
	;

// Display tooltip "on mousemove" or "on touchstart":
function tooltipShow(data) {
	if (data === undefined && d === undefined)
		{
		return;
		}
	tooltip = d3.select("#tooltip");
	tooltip
/*
		.style("left", d3.event.x + 10 + "px")
		.style("top", d3.event.y + 10 + "px")
*/
		// THIS fixed the z-index issue as it gets reset by opacity & transforms
		// Changing opacity or transforming can fuck with z-index!
		// https://www.freecodecamp.org/news/4-reasons-your-z-index-isnt-working-and-how-to-fix-it-coder-coder-6bc05f103e6c/
		.style("z-index", 100)
		.html(`
			<p>Year: ${data.year}</p>
			<p>Month: ${data.month}</p>
			<p>
				Births: ${data.births.toLocaleString()}
			</p>
			`)
//		.style("left", d3.event.x + 10 + "px")
//		.style("left", d3.event.x - (tooltip.node().offsetWidth / 2) + "px")
		.style("left", `${d3.event.x + 20}px`)
		// Since tooltip is to RIGHT of mouse, align so box's pointer is near
		// bottom of mouse pointer:
		.style("top", `${d3.event.y - tooltip.node().offsetHeight / 3 + -5}px`)
		.transition().duration(250)
		.style("opacity", 1)
	}

function tooltipHide() {
	tooltip
		.transition().duration(500)
		.style("opacity", 0);
	}
// TOOLTIP HANDLING -----------------------------------------------------------












// CHANGE HANDLING ------------------------------------------------------------
// For responsive design, listen to page resizing, NO debounce though:
window.addEventListener("resize", updateGraph );

// Handle CHANGES (on="input") to the year slider input element (type=range):
d3.select("input")
	.on("input", function() {
		updateGraph();
		}) // end "on input" (slider changes)
	;
// CHANGE HANDLING ------------------------------------------------------------




// Place focus on year selector for mouse control:
document.getElementById("inputYear")
	.focus()
	;




// PAGE SIZE HANDLING ---------------------------------------------------------
function getPageWidth() {
	let divWidth = window.innerWidth;
	//
	// Shrink it to leave some space around sides and make it
	// an even number:
	divWidth = Math.floor( divWidth / 100 - 2) * 100;
	// On mobile, seeing widths of 100!
	divWidth = Math.max(500, divWidth);
	//
	return divWidth;
	}

function getPageHeight() {
	//
	// document.body.clientHeight = 854 (but is only 34px at load!)
	// window.innerHeight = 997
	// document.documentElement.clientHeight = 997
	// window.screen.height = 1200
	// window.screen.availHeight = 1200
	//
	// GREAT example on stackoverflow:
	// https://stackoverflow.com/questions/3437786/get-the-size-of-the-screen-current-web-page-and-browser-window
	let tmpHeight = window.innerHeight
		|| document.documentElement.clientHeight
		|| window.screen.availHeight
		|| document.body.clientHeight
		;
	// Shave some space off height for radios & make an even number:
	tmpHeight = Math.floor(tmpHeight / 100 - 3) * 100;
	// If screen too small (i.e. mobile landscape): set minimum size:
	return tmpHeight < 400 ? 400 : tmpHeight;
	}
// PAGE SIZE HANDLING ---------------------------------------------------------






function paddingBox()
	{
	// For testing proportions, draw line around padding
	// Note: a rect will prevent SVG from working since it'll have no data
	d3.select("#padding-border")
		//  .append("g")
		//  .append("path")
		//  .attr("id", "padding-border")
		.attr("stroke", "green")
		.attr("stroke-dasharray", "9,3")
		.attr("fill", "transparent")
		.style("opacity", 0.5)
		.attr("d", `M ${padding.left},${padding.top} h ${width} `
			+ `v ${height} `
			+ `h ${-width} `
			+ `v ${-height}`
			)
		;
	}






// Some automated pagination: everything pre-programmed for smooth
// presentation:
updateNav();
function updateNav()
	{
	// Get current page of presentation from http://.../pageN.html:
	let currPageNum = Number(document.location.toString()
		.split("page")[1]
		.split(".")[0]
		)
		|| 1
		;
	console.log(`updateNav() currPageNum: ${currPageNum}`);
	//
	// Previous page:
	d3.select("#prev")
		.html( currPageNum > 1
			? `<a href="page${currPageNum - 1}.html">Previous</a>`
			: `<a href="index.html">Introduction</a>`
			)
		;
	// Current page:
	d3.select("#current")
		.text( `Page ${currPageNum}: ${subject}`)
		;
	// Next page:
	d3.select("#next")
		.html( `<a href="page${currPageNum + 1}.html">Next</a>`)
		;
	}
