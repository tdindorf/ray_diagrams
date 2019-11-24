// ++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++
function ca_4s1(me, {arOb = [], arIm = [], arYm = [], 
	numberOfRays = 4, // number of rays; 0th used for dragging
	numberOfHelpers = 3, // number of rays; 0th used for dragging
	hide0th = false, // true of dragging bigRay
	deltaYm = 1,		// spacing of impact points on boundary = distance between rays
	arVis = [1,1,1], // incident, ref___, virtual
	asked = 1, // 0: object, 1: image, 2: focal point, 3: ray
	arShown = [1,1,0,0], // available for moving [object, image, focal point, ray]
	boundary = 1, // 0: none, 1: mirror, 2 : glass/water, 3: prism, 4: lens+, 5: lens-
	questionLookFor = '.que',
	submittedLookFor = 'readonly',
	pxScale = 50,															
	arStart = [[6.5, 2.5], [6.5, 1.5], [6.5, 0.75]]// starting positions of Object and Image
}={} ) {

arOb = getArOb(arOb);
arIm = getArIm(arOb, arIm);
	    //getArYm(ym = [], rayN = 4, yo = 1, deltaYm = 1)
arYm = getArYm(arYm, numberOfRays, arIm[1], deltaYm);
	
var polar = 	arShown[3];
	//used after submission to freeze asked and position others
var arObjects = [],
				arAnswers = [arOb, arIm, [3, 0], [20,0]]; // TODO add focal length, ray angle

var svg = SVG(me);
	
var gridW = svg.width(),
				gridH = svg.height();
	
var defs = svg.defs();
var markers = defs.group()
var box = svg.group()//.dx(250).dy(150);

var strStyle = getCssString();
//svg.element('style').words(strStyle)

// grid
var grid = box.group().center(0,0).opacity(0.5);
	// add ref___ surface
addBoundary(grid, boundary);

// draw background
drawGrid(0.5*gridW/pxScale, 0.5*gridH/pxScale);

//*********** DEF: MARKERS ******************

var arrow_end = markers
.marker(4, 4, function(z) {
	z.path("M 0 0 L 4 2 M 0 4 L 4 2");
})
.ref(4, 2);

var ar_end2 = markers
.marker(10,10, function(z) {
	z.path("M 0 0 L 10 5 M 0 10 L 10 5");
})
.ref(10, 5).stroke('grey');

//*********** DEF: ELEMENTS *****************

// hairy object/image arrow
var ar_short = defs.group();
ar_short.path("M 0 0 h 20")
.marker("end", arrow_end.stroke("grey"))
.addClass("halo flowing");

// draggable object and image, in definitions
var dragDotOb = defs.group(),
				dragDotIm = defs.group(),
				dragDotF = defs.group();
	
	var fp = defs.group();
	fp.rect(30,20).fill('red').x(-30)
	fp.circle(20).fill('green').x(30)
	fp.path('M -100 50 L 100 200').stroke('black');
	fp.plain('F').y(15)

// add short rays
for (i = 0; i < 8; i++) {
	dragDotOb.use(ar_short).rotate(45 * i, 0, 0);
	dragDotIm.use(ar_short).rotate(45 * i, 0, 0);
}

// add central dots
dragDotOb
.circle(8)	// in case of error with css radius
.center(0, 0)
.addClass("dotObject pulsating");

dragDotIm
.circle(8) // in case of error with css radius
.center(0, 0)
.addClass("dotImage pulsating");
	
 dragDotF.circle(8).center(0,0).addClass("dotFocus pulsating");
 dragDotF.path('M 0 -4 v 8 m -4 -4 h 8').stroke('black');
 dragDotF.plain('F').y(8);

var dragLim = function(x,y){
	return {
		x: Math.abs(x) < gridW/2,
		y: Math.abs(y) < gridH/2
	}
}	

// place object and image
var dgrmObject = box.group().hide()
.center(arStart[0][0]*pxScale, -arStart[0][1]*pxScale)
.addClass('grab');
dgrmObject.use(dragDotOb);
dgrmObject.element('title').words('OBJECT');
dgrmObject.draggy(dragLim);

arObjects.push(dgrmObject);
if (arShown[0]) dgrmObject.show();


var dgrmImage = box.group().hide()
.center(arStart[1][0]*pxScale, -arStart[1][1]*pxScale)
.addClass('grab');
dgrmImage.use(dragDotIm);
dgrmImage.element('title').words('IMAGE');
dgrmImage.draggy(dragLim);

	arObjects.push(dgrmImage);
if (arShown[1]) dgrmImage.show();
	
var dgrmFocus = box.group().hide()
.center(arStart[2][0]*pxScale, -arStart[2][1]*pxScale)
.addClass('grab');
dgrmFocus.use(dragDotF);
dgrmFocus.element('title').words('FOCUS');
dgrmFocus.draggy(dragLim);

	arObjects.push(dgrmFocus);
if (arShown[2]) dgrmFocus.show();

var dragRay;
if (arShown[3]){
	dragRay = makeDragRay(box, 200);
	dragRay.addClass('grab')
	hide0th = arShown[3];
}
	arObjects.push(dragRay);
	
	function makeDragRay2(box, x) {
		var ray = box.group();
		
		var arc = ray.group(),
						arcPath = arc.path().stroke('green').marker('end', ar_end2.stroke('black')),
						arcLabel = arc.text('');
		var rayEnd = ray.group();
		rayEnd.element('title').words('Drag Me')
		
		var tip = rayEnd.circle(20).cx(x).cy(0);
	   tip.addClass("bigRayEnd");
	   tip.draggy(dragLim);

    var rayLine = ray.line(0, 0, x, 0).addClass("bigRay animLogRay").marker('end', arrow_end.stroke('black'));

    ray.update = function () {
        rayLine.plot(0, 0, tip.cx(), tip.cy());
        drawArc(arcPath, arcLabel, XYtoA(tip.cx(), tip.cy()), 0.75 * Math.hypot(tip.cx(), tip.cy()), 1)
    }

    ray.update();
    tip.on("dragmove", ev => ray.update());
    return ray;
}
	
var helpCircle = defs.group()
helpCircle.circle(10).center(0,0).addClass("helpCircle grab");
helpCircle.element('title').words('drag me');

// add helper lines
for (i = 0; i < numberOfHelpers; i++) {
	var x1 = gridW/2 - 40,
	y1 = gridH/2 - 50 - 0.5 * pxScale*i,
	x2 = x1 + 0.50 * pxScale,
	y2 = y1 + 0.1 * pxScale;
	
	helperLine(x1, y1, x2, y2);
}


//********* End of general startup ***************
//***************************************

// *****************************************
// update displayed values when O/I moved

var nodeX = me.closest(questionLookFor)//.style({background: 'red'});    // find parent of current question

// proceeed only if question, not demo
var answerFldX	= nodeX ? nodeX.querySelector("input[type=text]") : null;
var nodeY 		= nodeX ? getNextSibling (nodeX, questionLookFor) : null;
var answerFldY	= nodeY ? nodeY.querySelector("input[type=text]") : null;

var updateText = function() {
	// solved for polar by adding class to dragged ray tip
 if (this.hasClass('polar')){
		if(answerFldX) answerFldX.value = -XYtoA(this.cx(), this.cy()).toFixed(0) + '°';
	} else {
	if(answerFldX) answerFldX.value = (this.x()/pxScale).toFixed(1);
	if(answerFldY) answerFldY.value = (-this.y()/pxScale).toFixed(1);
	}
}

// check if the answer was submitted by looking at the answer field
var bolSubmitted = answerFldX ? (answerFldX.hasAttribute(submittedLookFor) ? true : false) : false;

// ray appearance after submission
if (bolSubmitted) {
	// show virtual rays
	arVis[2] = 1;
	hide0th = false;
	
	//show incident rays is asked for
	arVis[0] = 1;
}

// drawRayDiagram(box, arOb, arIm, arYm, arVis, ar_end2, pxScale = 50)
drawRayDiagram(box, arOb, arIm, arYm, arVis, ar_end2, pxScale, hide0th)

// which element is the one asked for (= gives data)
var elAsked = arObjects[asked]
elAsked.removeClass('grab').addClass('move');
elAsked.on("dragmove", updateText, elAsked);

// look for previous data, position answer object
// plotPrevious(answerObject, answerFldX, answerFldY, polar?)
plotPrevious(elAsked, answerFldX, answerFldY, polar, pxScale)

// additional actions taken after submitted:
// position free element, freeze answer element, normal cursor
if (bolSubmitted){
	
	elAsked.fixed();
	elAsked.removeClass('move');
	
	// place elements that are visible but not asked
	for (var i in arObjects){
		if (arObjects[i].hasClass('grab') && arShown[i]) {
			// placeElement(element, coordinates, polar)
			placeElement(arObjects[i], arAnswers[i], i == 3 ? 1 : 0);
		}
	}
}

svg.viewbox(-gridW/2, -gridH/2, gridW, gridH)

// ++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++ Internal Functions ++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++
	
function getNextSibling (elem, selector) {
	
	// Get the next sibling element
	var sibling = elem.nextElementSibling;
	
	// If there's no selector, return the first sibling
	if (!selector) return sibling;
	
	// If the sibling matches our selector, use it
	// If not, jump to the next sibling and continue the loop
	while (sibling) {
		if (sibling.matches(selector)) return sibling;
		sibling = sibling.nextElementSibling
	}
	
};
	
	
function drawGrid(xMax = 5, yMax = 3){
	var gridStr = "M -" + (xMax*pxScale) + " 0 h " + (2*xMax*pxScale+1) + 
	" M 0 -" + (yMax*pxScale) + " v " + (2*yMax*pxScale + 1) + "";
	//var gridStr = "M 0 150 h 501 M 250 0 v 301";
	
	grid.path(gridStr).addClass("Maj grid");
	grid.path(gridStr).addClass("Min grid");
	grid.path(gridStr).addClass("Min ticks");
	//addLabels(x, y, px = 0, py = 0)
	addLabels(xMax-1, yMax-1, -xMax+0.3, yMax-0.3)
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++
function addLabels(x, y, px = 0, py = 0){
	
	// place each value on a white background
	// x values
	for (i=-x; i<=x; i++){
		grid.rect(20,20).cx(i*pxScale).cy(py*pxScale).addClass('text_background');
		grid.plain(i).x(i*pxScale).cy(py*pxScale);
	}
	
	// y values, negative
	for (i=-y; i<=y; i++){
		grid.rect(20,20).cy(i*pxScale).cx(px*pxScale).addClass('text_background');
		grid.plain(-i).cy(i*pxScale).x(px*pxScale);
	}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++
function addBoundary(el = box, b) {

	
	var medium = el.group();
	switch (b) {
		case 1:	// mirror
			medium.rect(10, 300).cy(0).x(-10).addClass('mirror');
			medium.rect(20, 300).cy(0).x(-10).addClass('mirrorArea');
			medium.element('title').words('Mirror');
			break;
			
		case 2: // water
			medium.rect(250, 300).cy(0).x(-250).addClass('water');
			medium.path('M 0 -150 v 300').addClass('waterSurface');
			medium.rect(250, 300).cy(0).x(-250).addClass('mirrorArea');
			medium.element('title').words('Water');
			break;
			
			case 3:	// lens, + convex
			medium.path('M 1 -150 A 1500 1500 0 0 1 1 150 h -2 A 1500 1500 0 0 1 -1 -150 z').addClass('lens');
			
			//medium.use(focalPoint).x(100)
			medium.rect(20, 300).cy(0).x(-10).addClass('mirrorArea');
			medium.element('title').words('Convex Lens');
			medium.use(fp).x(-200).opacity(1)
			break;
		
		case 4:	// lens, - concave
			medium.path('M 10 -150 A 1500 1500 0 0 0 10 150 h -20 A 1500 1500 0 0 0 -10 -150 z').addClass('lens');
			medium.rect(20, 300).cy(0).x(-10).addClass('mirrorArea');
			medium.element('title').words('Concave Lens');
			break;
			
		default:
			// none
	}
	
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++
function helperLine(x1, y1, x2, y2) {

    var helpLine = box.line().addClass(
        "helpLine");

    var end1 = box
        .use(helpCircle)
        .center(x1, y1)
        .draggy(dragLim);

    var end2 = box
        .use(helpCircle)
        .center(x2, y2)
        .draggy(dragLim);

    function drawLine() {
        helpLine.plot(end1.x(), end1
        .y(), end2.x(), end2.y())
    }
    drawLine();
    end1.on("dragmove", ev =>
    drawLine());
    end2.on("dragmove", ev =>
    drawLine());
}
	
function makeDragRay(box, x) {
    var arc = box.group(),
        arcPath = arc.path().stroke('green').marker('end', ar_end2.stroke('black')),
        arcLabel = arc.text('');

    var rayEnd = box.group();
    rayEnd.element('title').words('Drag Me')

    var tip = rayEnd.circle(20).cx(x).cy(0);
	   tip.addClass("bigRayEnd polar");
	   tip.draggy(dragLim);

    var ray = box.line(0, 0, x, 0).addClass("bigRay animLogRay").marker('end', arrow_end.stroke('black'));

    function drawRay() {
        ray.plot(0, 0, tip.cx(), tip.cy());
        drawArc(arcPath, arcLabel, XYtoA(tip.cx(), tip.cy()), 0.75 * Math.hypot(tip.cx(), tip.cy()), 1)
    }
	   
    tip.update = drawRay; // called after placing, TODO: devise more elegant solution
    tip.on("dragmove", ev => drawRay());
	
	   drawRay();
    return tip;
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++
function placeElement(e, c, polar) {
    // element, coordinates, polar
    // reverse y value

    if (polar) {
        // AtoXY(angle, radius)
        e.cx(AtoXY(-c[0], 200).x);
        e.cy(AtoXY(-c[0], 200).y);
					   e.update();
      
    } else {

        e.x(c[0] * pxScale);
        e.y(-c[1] * pxScale);
    }
}

}

// ++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++ SEPARATE FUNCTIONS +++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++


// ++++++++++++++++++++++++++++++++++++++++++++++++++
function drawRayDiagram(box, arOb, arIm, arYm, arVis, ar_end2, pxScale = 50, hide0th) {
	// bIm, bRe, bVi: booleans of which rays shown;
	// usualy bVi = 1 after submission
	
	// ym: array of points struck at boundary
	//var ym = fixBoundaryPoints(ym, rayN);
	
	var iRaysGrp = box.group().addClass("rayI animLogRay");
	var rRaysGrp = box.group().addClass("rayR animLogRay");
	var vRaysGrp = box.group().addClass("rayV animLogRay");
	
	arYm = arYm.map((e) => -e * pxScale)
	
	// prepare object coordinates
	var xo = arOb[0] * pxScale,
	yo = -arOb[1] * pxScale,
					
	// prepare image coordinates if empty
	// assume mirror
	xi = arIm[0] ? arIm[0] * pxScale : -xo,
	yi = arIm[1] ? -arIm[1] * pxScale : yo,
					
	// length of refracted ray
	xr = 3.5 * pxScale;
	
	
    var strPath = "";
    var yr = 0;
    var rayArrowPos = 0.8; // fraction along the length of the inciden ray where arrow-mid marker is placed
	   var scaleR = 1;
	
    for (var j = 0; j < arYm.length; j++) {
		
        yr = (arYm[j] - yi) * (xr / -xi);
		
		// make all r_ rays equal length
		scaleR = xr/Math.hypot(xr, yr);

		if (arVis[0]){
			// draw Incident ray
			strPath = "M " + xo + " " + yo + " L " + (1 - rayArrowPos) * xo + " " + (yo + rayArrowPos * (arYm[j] - yo)) + " 0 " + arYm[j];
			iRaysGrp.path(strPath).marker("mid", ar_end2)//.attr(id: "iR" + j);
		}
		
		if (arVis[1] && !(hide0th && j == 0)) {
			// draw Ref.. ray IF not (using dragRay and trying to plot 0th one)
			strPath = "M 0 " + arYm[j] + " l " + xr * scaleR + " " + yr * scaleR;
			rRaysGrp.path(strPath).marker("end", ar_end2)//.attr(id: "rR" + j);
		}
		
		if (arVis[2]){
			// draw Virtual ray
			strPath = "M " + xi + " " + yi + " L 0 " + arYm[j];
			vRaysGrp.path(strPath)//.attr(id: "vR" + j);
		}
		
	}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++
function plotPrevious(e, ansFldX, ansFldY, bPolar = false, pxScale) {
	// e: answerElement that feeds data into fields
	var x = 0, y = 0, angle = 0;

	x = e.cx()
	y = e.cy()
	
	if (bPolar) {
		// if polar
		angle = ansFldX.value !== "" ? stripUnits(ansFldX.value) : 0;
		var radius = Math.hypot(x,y) || 200;
		x = AtoXY(angle, radius).x;
		y = AtoXY(angle, radius).y;
		} else if (ansFldX){
		// if cartesian
		x = ansFldX.value !== "" ? ansFldX.value * pxScale : x;
		if (ansFldY) {
			y = ansFldY.value !== "" ? -ansFldY.value * pxScale : y;
		}
	}
	e.cx(x);
	e.cy(y);
	if (bPolar) {
		//updateLine(e, x, y);
	}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++
function getArOb(arOb = []) {
	arOb[0] = typeof arOb[0] == "number" ? arOb[0] : 1 + 2 * Math.random();
	arOb[1] = typeof arOb[1] == "number" ? arOb[1] : 2 - 4 * Math.random();
	return arOb;
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++
function getArIm(arOb = [], arIm = [] ) {
	// the default is for reflection, xi = -xo and yi = yo
	arIm[0] = typeof arIm[0] == "number" ? arIm[0] : -arOb[0];
	arIm[1] = typeof arIm[1] == "number" ? arIm[1] : arOb[1];
	return arIm;
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++
function getYm0(ym = []) {
	ym[0] = typeof ym[0] == "number" ? ym[0] : Math.round(10 - 20 * Math.random())/5;
	return ym;
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++
// returns ym array of impact points
function getArYm(ym = [], rayN = 4, yo = 1, deltaYm = 1) {
    // generate array ym[] of impact points
    // i.e. where incident rays strike
	   // rayN: number of rays
	   // deltaYm: separation of impact points
	
	ym = getYm0(ym);
	
	// plot more rays closer to the image
	var s = ym[0] > yo ? -1 : 1,
	k = 1,
	f = 1;
	while (k < rayN) {
		ym[k] = ym[0] + s * f * deltaYm;
		s = -s;
		k ++;
		f = Math.ceil(k / 2);
	}
	return ym
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++

function getCssString(){
	return "svg{fill:none;border:solid #00f 1px}text{fill:#000;text-anchor:middle}.helpCircle{fill:#0a0;stroke:#888}.helpLine{stroke:#000;stroke-dasharray:5 5}.halo{stroke:#888;stroke-dasharray:3 1}.dotObject{fill:#d00;stroke:#000}.dotImage{fill:#fa0;stroke:#000}.grab{cursor:grab;opacity:.5}.move{cursor:move;opacity:.8}.flowing{animation-name:runningRay;animation-duration:2s;animation-iteration-count:infinite;animation-timing-function:linear}.pulsating{animation-name:pulsating;animation-duration:2s;animation-iteration-count:infinite;animation-direction:alternate;animation-timing-function:ease-in-out}@keyframes runningRay{from{stroke-dashoffset:4}to{stroke-dashoffset:0}}@keyframes pulsating {from {r: 4} to {r: 6}}@keyframes runningLogRay{from{stroke-dashoffset:10}to{stroke-dashoffset:0}}.rayI{stroke:#0a0;stroke-dasharray:8 2}.rayR{stroke:#00f;stroke-dasharray:8 2}.rayV{stroke:#888;stroke-dasharray:2 8}.animLogRay{animation-name:runningLogRay;animation-duration:2s;animation-iteration-count:infinite;animation-timing-function:linear}.Min{stroke-dasharray:1,9;stroke:#888;opacity:.3}.Mid{stroke-dasharray:1,24;stroke:#8a2be2;opacity:.5}.Maj{stroke-dasharray:1,49;stroke:#00f;opacity:.8}.grid{stroke-width:500}.ticks{stroke-width:10;opacity:1}.mirror{fill:#888;opacity:.5}.water{fill:#0ff;opacity:.5}.mirrorArea{fill:transparent;cursor:crosshair}"
}
// ++++++++++++++++++++++++++++++++++++++++++++++++++

function drawArc(arcPath, arcLabel, angle, arcRadius, blShowLabel = 0) {

	var xa = AtoXY(angle, arcRadius).x; // arc point on ray, x-ccordinate
	var ya = AtoXY(angle, arcRadius).y; // arc point on ray, y-ccordinate

	var xLa = AtoXY(angle/2, 0.8*arcRadius).x; // arc label, x-ccordinate
	var yLa = AtoXY(angle/2, 0.8*arcRadius).y; // arc label, y-ccordinate

	var flags = angle > 0 ? " 0 0 1 " : " 0 0 0 ";
	var strArcPath = "M " + arcRadius + " 0 A " + arcRadius + " " + arcRadius + flags + xa + " " + ya;
	arcPath.plot(strArcPath) 

	if (blShowLabel) {
		arcLabel.plain(-Math.round(angle) + '\u00B0');
		arcLabel.x(xLa).cy(yLa);
	}
}
