// ++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++
function ca_4s1(me, {arOb = [], arIm = [], arYm = [], 
	numberOfRays = 4, 
	arVis = [1,1,1], // incident, ref___, virtual
	asked = false, // 1 = image, 0 = object
	boundary = 1, // 0: none, 1: mirror, 2 : glass/water, 3: prism, 4: lens+, 5: lens-
	visImage = true,
	visObject = true,
	pxScale = 50,
	arStart = [[4.5, 2.5], [4.5, 1.5]]	// starting positions of Object and Image
}={} ) {

arOb = getArOb(arOb);
arIm = getArIm(arOb, arIm);
arYm = getArYm(arYm, numberOfRays);

var svg = SVG(me);

var defs = svg.defs();
var markers = defs.group()
var box = svg.group()//.dx(250).dy(150);

var strStyle = "svg{fill:none;border:solid #00f 1px}text{fill:#000;text-anchor:middle}.helpCircle{fill:#0a0;stroke:#888}.helpLine{stroke:#000;stroke-dasharray:5 5}.halo{stroke:#888;stroke-dasharray:3 1}.dotObject{fill:#d00;stroke:#000}.dotImage{fill:#fa0;stroke:#000}.grab{cursor:grab;opacity:.5}.move{cursor:move;opacity:.8}.flowing{animation-name:runningRay;animation-duration:2s;animation-iteration-count:infinite;animation-timing-function:linear}.pulsating{animation-name:pulsating;animation-duration:2s;animation-iteration-count:infinite;animation-direction:alternate;animation-timing-function:ease-in-out}@keyframes runningRay{from{stroke-dashoffset:4}to{stroke-dashoffset:0}}@keyframes pulsating {from {r: 4} to {r: 6}}@keyframes runningLogRay{from{stroke-dashoffset:10}to{stroke-dashoffset:0}}.rayI{stroke:#0a0;stroke-dasharray:8 2}.rayR{stroke:#00f;stroke-dasharray:8 2}.rayV{stroke:#888;stroke-dasharray:2 8}.animLogRay{animation-name:runningLogRay;animation-duration:2s;animation-iteration-count:infinite;animation-timing-function:linear}.Min{stroke-dasharray:1,9;stroke:#888;opacity:.3}.Mid{stroke-dasharray:1,24;stroke:#8a2be2;opacity:.5}.Maj{stroke-dasharray:1,49;stroke:#00f;opacity:.8}.grid{stroke-width:500}.ticks{stroke-width:10;opacity:1}.mirror{fill:#888;opacity:.5}.water{fill:#0ff;opacity:.5}.mirrorArea{fill:transparent;cursor:crosshair}"

svg.element('style').words(strStyle)

// grid
var grid = box.group().center(0,0);

// draw background
drawGrid();

// add ref___ surface
addBoundary();

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
dragDotIm = defs.group();

// add short rays
for (i = 0; i < 8; i++) {
	dragDotOb.use(ar_short).rotate(45 * i, 0, 0);
	dragDotIm.use(ar_short).rotate(45 * i, 0, 0);
}

// add central dots
dragDotOb
.circle(4)	// in case of error with css radius
.center(0, 0)
.addClass("dotObject pulsating");

dragDotIm
.circle(4) // in case of error with css radius
.center(0, 0)
.addClass("dotImage pulsating");

var dragLim = function(x,y){
	return {
		x: Math.abs(x) < 5*pxScale,
		y: Math.abs(y) < 3*pxScale
	}
}	

// place object and image
var dgrmObject = box.group()
.center(arStart[0][0]*pxScale, -arStart[0][1]*pxScale)
.addClass('grab');
dgrmObject.use(dragDotOb);
dgrmObject.element('title').words('OBJECT');
dgrmObject.draggy(dragLim);

dgrmObject.hidden = !visObject


var dgrmImage = box.group()
.center(arStart[1][0]*pxScale, -arStart[1][1]*pxScale)
.addClass('grab');
dgrmImage.use(dragDotIm);
dgrmImage.element('title').words('IMAGE');
dgrmImage.draggy(dragLim);

dgrmImage.hidden = !visImage


var helpCircle = defs.group()
helpCircle.circle(10).center(0,0).addClass("helpCircle grab");
helpCircle.element('title').words('drag me');

// add helper lines
for (i = 0; i < numberOfRays; i++) {
	var x1 = 4.25 * pxScale,
	y1 = 2.50 * pxScale - 0.5 * pxScale*i,
	x2 = x1 + 0.50 * pxScale,
	y2 = y1 + 0.25 * pxScale;
	
	helperLine(x1, y1, x2, y2, box, helpCircle, dragLim);
}

//********* End of general startup ***************
//***************************************

// *****************************************
// update displayed values when O/I moved

var nodeX = me.closest('.que')//.style({background: 'red'});    // find parent of current question

// proceeed only if question, not demo
var answerFldX  = nodeX ? nodeX.querySelector("input[type=text]") : null;
var nodeY 		= nodeX ? nodeX.nextElementSibling : null;
var answerFldY  = nodeY ? nodeY.querySelector("input[type=text]") : null;

var updateText = function() {
	// TODO: polar update
	if(answerFldX) answerFldX.value = (this.x()/pxScale).toFixed(1);
	if(answerFldY) answerFldY.value = (this.y()*-1/pxScale).toFixed(1);
}

// check if the answer was submitted by looking at the answer field
var bolSubmitted = answerFldX ? (answerFldX.hasAttribute("readonly") ? true : false) : false;

// ray appearance after submission
if (bolSubmitted) {
	// show virtual rays
	arVis[2] = 1;
	
	//show incident rays is asked for
	arVis[0] = !asked;
}

// drawRayDiagram(box, arOb, arIm, arYm, arVis, ar_end2, pxScale = 50)
drawRayDiagram(box, arOb, arIm, arYm, arVis, ar_end2, pxScale)

// which element is the one asked for (= gives data)
var elAsked = asked ? dgrmImage : dgrmObject;
elAsked.removeClass('grab').addClass('move');
elAsked.on("dragmove", updateText);

// look for previous data, position answer object
// plotPrevious(answerObject, answerFldX, answerFldY, polar?)
plotPrevious(elAsked, answerFldX, answerFldY, false, pxScale)

// additional actions taken after submitted:
// position free element, freeze answer element, normal cursor
if (bolSubmitted){
	placeElement(!asked ? dgrmImage : dgrmObject, !asked ? arIm : arOb, pxScale);
	elAsked.fixed();
	elAsked.removeClass('move');
}

svg.viewbox(-250, -150, 500, 300)

// ++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++ Internal Functions ++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++
function drawGrid(){
	var gridStr = "M -" + (5*pxScale) + " 0 h " + (10*pxScale+1) + 
	" M 0 -" + (3*pxScale) + " v " + (6*pxScale + 1) + "";
	//var gridStr = "M 0 150 h 501 M 250 0 v 301";
	
	grid.path(gridStr).addClass("Maj grid");
	grid.path(gridStr).addClass("Min grid");
	grid.path(gridStr).addClass("Min ticks");
	addLabels()
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++
function addLabels(){
	// x values
	for (i=-4; i<=4; i++){
		grid.plain(i).x(i*pxScale).cy(2.8*pxScale);
	}
	
	// y values, negative
	for (i=-2; i<=2; i++){
		grid.plain(-i).cy(i*pxScale).x(-4.75*pxScale);
	}
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++
function addBoundary() {
    switch (boundary) {
        case 1:
		
		var mirror = box.group()
		mirror.rect(10, 300).cy(0).x(-10).addClass('mirror');
		mirror.rect(20, 300).cy(0).x(-10).addClass('mirrorArea');
		mirror.element('title').words('Mirror');
		break;
		
		case 2:
		
		var mirror = box.group()
		mirror.rect(250, 300).cy(0).x(-250).addClass('water');
		mirror.rect(250, 300).cy(0).x(-250).addClass('mirrorArea');
		mirror.element('title').words('Water');
		break;
		
        default:
	}
	
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++
function helperLine(x1, y1, x2, y2) {
	
	var helpLine = box.path().addClass("helpLine");
	
    var end1 = box
	.use(helpCircle)
	.center(x1, y1)
	.draggy(dragLim);
	
    var end2 = box
	.use(helpCircle)
	.center(x2, y2)
	.draggy(dragLim);
	
    function drawLine() {
        helpLine.plot(
            "M " + end1.x() + " " + end1.y() + " " + end2.x() + " " + end2.y()
		);
	}
    drawLine();
    end1.on("dragmove", ev => drawLine());
    end2.on("dragmove", ev => drawLine());
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++
function placeElement(elem, coords){
	// elem: element, coords: coordinates
	// reverse y value
	elem.x(coords[0] * pxScale);
	elem.y(-coords[1] * pxScale);
}

}

// ++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++ SEPARATE FUNCTIONS +++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++


// ++++++++++++++++++++++++++++++++++++++++++++++++++
function drawRayDiagram(box, arOb, arIm, arYm, arVis, ar_end2, pxScale = 50) {
	// bIm, bRe, bVi: booleans of which rays shown;
	// usualy bVi = 1 after submission
	
	// ym: array of points struck at boundary
	//var ym = fixBoundaryPoints(ym, rayN);
	
	var iRaysGrp = box.group().addClass("rayI animLogRay");
	var rRaysGrp = box.group().addClass("rayR animLogRay");
	var vRaysGrp = box.group().addClass("rayV animLogRay");
	
	arYm = arYm.map((e) => -e * pxScale)
	var xo = arOb[0] * pxScale,
	yo = -arOb[1] * pxScale,
	// in case of mirror
	xi = arIm[0] ? arIm[0] * pxScale : -xo,
	yi = arIm[1] ? -arIm[1] * pxScale : yo,
	xr = 3.5 * pxScale;
	
	
    var strPath = "";
    var yr = 0;
    var rayArPos = 0.8; // fraction along the length of the inciden ray where arrow-mid marker is placed
	var scaleR = 1;
	
    for (var j = 0; j < arYm.length; j++) {
		
        yr = (arYm[j] - yi) * (xr / -xi);
		
		// make all r_ rays equal length
		scaleR = xr/Math.hypot(xr, yr);
		
		if (arVis[0]){
			// draw Incident ray
			strPath = "M " + xo + " " + yo + " L " + (1 - rayArPos) * xo + " " + (yo + rayArPos * (arYm[j] - yo)) + " 0 " + arYm[j];
			iRaysGrp.path(strPath).marker("mid", ar_end2)//.attr(id: "iR" + j);
		}
		
		if (arVis[1]){
			// draw Ref.. ray
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
	var x, y, angle;
	//var xyprefix = e.tagName == "circle" ? "c" : "";
	x = e.x()
	y = e.y()
	
	if (bPolar) {
		// if polar
		angle = ansFldX.value !== "" ? stripUnits(ansFldX.value) : 0;
		var radius = 100;
		x = AtoXY(angle, radius).x;
		y = AtoXY(angle, radius).y;
		} else if (ansFldX){
		// if cartesian
		x = ansFldX.value !== "" ? ansFldX.value * pxScale : x;
		if (ansFldY) {
			y = ansFldY.value !== "" ? -ansFldY.value * pxScale : y;
		}
	}
	e.x(x);
	e.y(y);
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
function getArYm(ym = [], rayN = 4) {
    // generate array ym[] of impact points
    // i.e. where incident rays strike
	
	ym = getYm0(ym);
	
	var dym = 0.6; //separation of impact points
	var s = 1,
	k = 1,
	f = 1;
	while (k < rayN) {
		ym[k] = ym[0] + s * f * dym;
		s = -s;
		k ++;
		f = Math.ceil(k / 2);
	}
	return ym
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++
