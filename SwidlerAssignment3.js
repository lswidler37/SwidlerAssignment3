//author: Lucas Swidler
//date: March 1 2021
//description: a small scene that varies between each of the four seasons.
//             The moon and sun also rotate around the screen. 
//The following keys have functionality: 
//s - slows down the planets
//m - speeds up planets
//1 - switches to the summer scene
//2 - switches to the fall scene
//3 - switches to the winter scene
//4 - switches to the winter scene
//Proposed Points out of 10: 10 because I have all of the html requirements, animation, and multiple colors

"use strict";

var canvas;
var gl;
//rotation and html functionality
    var theta = 0.0;    //Sun rotation
    var thetaLoc;
    var thetaTwo = 0.0; //Moon rotation
    var thetaLocTwo;
    var speed = 0.01;
    var direction = true;
//global variables used for switching between seasons
    var season = "summer";          //used for menu
    var sumCount = 0;               //used to make sure drawings don't loop and lag the program
    var fallCount = 0;
    var winCount = 0;
    var sprCount = 0;
    var summerColors = [    //various shades of green
        vec3(0, 0.4, 0),
        vec3(0, 0.5, 0),
        vec3(0, 0.6, 0),
        vec3(0, 0.7, 0)
    ];
    var fallColors = [ 
        vec3(1, 0.4, 0),        //orange
        vec3(0.8, 0.2, 0.2),    //red
        vec3(0.8, 0.2, 0.2),    //red
        vec3(1, 0.4, 0)         //orange
    ];
    var springColors = [
        vec3(0, 0.4, 0),
        vec3(0, 0.5, 0),
        vec3(0, 0.6, 0),
        vec3(1, 0.3, 0.3)   //shades of green with one pink to represent budding
    ];
    var flowerColors = [
        vec3(0.3, 0.1, 0.4),    //purple
        vec3(1, 0.3, 0.3),      //pink
        vec3(1, 1, 0),          //yellow
        vec3(0, 0.4, 1)         //blue
    ];
    var winColors = [
        vec3(0.6, 0.3, 0),  //brown and 3 different whites, so that the tree has some brown sticking through but mostly is white
        vec3(0.9, 0.9, 0.9),
        vec3(0.9, 0.9, 0.9),
        vec3(0.9, 0.9, 0.9)
    ]
//sun and moon attributes
    var verticesSun;      
    var verticesMoon;      
    var colorsSun;
    var colorsMoon;
//different programs
    var programSun;     //Program for the Sun
    var programMoon;    //Program for the Moon
    var altProgram;     //Program for other still objects
//final global variables, used in various places
    var points = [];
    var colors = [];
    var pointsTemp; //temp values are used to hold a single color or point, for the triangle and rectangle functions
    var colorTemp;

function loadAttributes(colorData, vertices, program) {
   //load up attributes for vertex and fragment shaders
   //Load shaders and initialize attribute buffers
   // Load the vertex data into the GPU
   var bufferId = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

   // Associate out shader variables with our data bufferData
   var positionLoc = gl.getAttribLocation(program, "aPosition");
   gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(positionLoc);

   //color data
   let cBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(colorData), gl.STATIC_DRAW );
   
   let colorLoc = gl.getAttribLocation(program, "aColor");
   gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(colorLoc);
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );

    //
    //  Configure WebGL
    //
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(.6, .6, .9, 1.0);
    

    //  Load shaders and initialize attribute buffers
        altProgram = initShaders(gl, "vertex-shader-still", "fragment-shader");
        gl.useProgram(altProgram);

    //Data for the Sun
        verticesSun = [
            vec2(0, 0.7),
            vec2(-.2, 0.7),
            vec2(0, 0.9),
            vec2(-.2, 0.9)           
        ];
        colorsSun = [
            vec3(0.9, 0.9, 0),
            vec3(0.9, 0.9, 0),
            vec3(0.9, 0.9, 0),
            vec3(0.9, 0.9, 0)
        ];
    //Data for the Moon
        verticesMoon = [
            vec2(0, -0.7),
            vec2(-.2, -0.7),
            vec2(0, -0.9),
            vec2(-.2, -0.9)
        ];
        colorsMoon = [
            vec3(0.9, 0.9, 0.9),
            vec3(0.9, 0.9, 0.9),
            vec3(0.9, 0.9, 0.9),
            vec3(0.9, 0.9, 0.9)
        ];
    // establish shaders and uniform variables
        programSun = initShaders(gl, "vertex-shader-rotating", "fragment-shader");
        thetaLoc = gl.getUniformLocation(programSun, "uTheta");
        
        programMoon = initShaders(gl, "vertex-shader-rotating", "fragment-shader");
        thetaLocTwo = gl.getUniformLocation(programMoon, "uTheta");
        
        altProgram = initShaders(gl, "vertex-shader-still", "fragment-shader");

    // Initialize event handler (slider)
        document.getElementById("slider").onchange = function(event) {
        speed = parseFloat(event.target.value);
        console.log("slider!!!", speed);
    }
    // Initialize event handler (menu)
        document.getElementById("Controls").onclick = function(event) {
        switch(event.target.index) {
            case 0: 
                season = "summer";
                console.log("Summer!");
                sumCount = 0;
                break;
            case 1: 
                season = "fall";
                console.log("Fall!");
                fallCount = 0;
                break;
            case 2: 
                season = "winter";
                console.log("Winter!");
                winCount = 0;
                break;
            case 3: 
                season = "spring"; 
                console.log("Spring!");
                sprCount = 0; 
                break;
        }
    }
    // Initialize event handler (button)
        document.getElementById("Direction").onclick = function() {
        console.log("pressed button");
        direction = !direction;
    }
    // Initialize event handler (keypress)
        window.onkeydown = function(event) {
            var key = String.fromCharCode(event.keyCode);
            switch( key ) {
            case 'F': //faster
            case 'f':
                speed += .01;
                break;
            case 'S': //slower
            case 's':
                speed -= .01;
                if (speed < 0) {
                    speed = 0;
                }
                break;
            case '1':   //summer
                season = "summer";
                console.log("Summer!");
                sumCount = 0;
                break;
            case '2':   //fall
                season = "fall";
                console.log("Fall!");
                fallCount = 0;
                break;
            case '3':   //winter
                season = "winter";
                console.log("Winter!");
                winCount = 0;
                break;
            case '4':   //spring
                season = "spring"; 
                console.log("Spring!");
                sprCount = 0; 
                break;
            }
    };
    render();
};

//Functions used
    function drawSolidRectangle(pt0, dx, dy, color) {       //created to draw rectangles
    //adds values to points and colors global variables
    //creates a triangle at pt0, with width dx, and height dy
        let pt1 = vec2(pt0[0], pt0[1]+dy);
        let pt2 = vec2(pt0[0] + dx, pt0[1]);
        let pt3 = vec2(pt0[0] + dx, pt0[1] + dy);
    //First Triangle
        points.push(pt0);
        points.push(pt1);
        points.push(pt2);
    //Second Triangle
        points.push(pt1);
        points.push(pt2);
        points.push(pt3);
    //Colors
        for (let i = 0; i < 6; i++) {
            colors.push(color);     //runs 6 times
        } 
    }
    function drawSolidTriangle(pt0, dx, dy, color) {        //created to draw triangles, all of which are isosceles
        //adds values to points and colors global variables
        //creates a triangle at pt0, with width dx, and height dy
            let pt1 = vec2(pt0[0]+(dx/2), pt0[1]+dy);
            let pt2 = vec2(pt0[0] + dx, pt0[1]);
                //Vertices
                    points.push(pt0);
                    points.push(pt1);
                    points.push(pt2);
                //Colors
                    colors.push(color);
                    colors.push(color);
                    colors.push(color);
    }
    function getRandomArbitrary(min, max) {             //Code taken from here, purpose is to use Math.random() but with bounds other than [0, 1)
        return Math.random() * (max - min) + min;       //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    }
    function drawTreeLeaves(colorArray) {               //draws the leaves of the tree based on an array of vec3 colors
        for (let rows = 0; rows <= 0.45; rows += 0.045) {
            for (let leaf = 0; leaf < 50; leaf += 1) {
                let randomX = getRandomArbitrary(rows-0.1, 0.8-rows);
                let leafVertex = vec2(randomX, 0.1 + rows);
                if (leaf % 3 == 0) {
                    colorTemp = colorArray[0];
                } else if (leaf % 3 == 1) {
                    colorTemp = colorArray[1];
                } else if (leaf % 3 == 2) {
                    colorTemp = colorArray[2];
                } else {
                    colorTemp = colorArray[3];
                }
                drawSolidTriangle(leafVertex, 0.1, 0.1, colorTemp);
            }
        }
    }
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        // SUN AND MOON
            // SUN
                loadAttributes(colorsSun, verticesSun, programSun);
                gl.useProgram(programSun);
                gl.uniform1f(thetaLoc, theta);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            // MOON
                loadAttributes(colorsMoon, verticesMoon, programMoon);
                gl.useProgram(programMoon);
                gl.uniform1f(thetaLocTwo, thetaTwo);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // SUMMER DRAWING -----------------------------------------------------------
        if (season == "summer") {
            gl.useProgram(altProgram);
            if (sumCount == 0) {   //only run through the program once, so it doesn't continually redraw
                //Drawing the grass
                    colorTemp = vec3(0, .7, 0);
                    pointsTemp = vec2(-1, -1);
                    drawSolidRectangle(pointsTemp, 2, 1, colorTemp);
                //Drawing the trunk of the tree
                    colorTemp = vec3(0.6, .3, 0);
                    pointsTemp = vec2(0.3, -0.3);
                    drawSolidRectangle(pointsTemp, 0.2, 0.5, colorTemp);
                //Drawing the leaves
                    drawTreeLeaves(summerColors);
                    sumCount += 1;
                }
            //Finalize
                loadAttributes(colors, points, altProgram);
                gl.drawArrays(gl.TRIANGLES, 0, points.length);  
    // FALL DRAWING -------------------------------------------------------------
        } else if (season == "fall") {
            gl.useProgram(altProgram);
            if (fallCount == 0) {           //only run through the program once, so it doesn't continually redraw
                //Drawing the grass
                    colorTemp = vec3(0.2, 0.1, 0.1)
                    pointsTemp = vec2(-1, -1);
                    drawSolidRectangle(pointsTemp, 2, 1, colorTemp);
                //Draw leaves on the ground
                    for (let i = 0; i < 40; i += 1) {
                        let randomPoint = vec2(getRandomArbitrary(-1.0, 1.0), getRandomArbitrary(-1.0, -0.1));
                        drawSolidTriangle(randomPoint, .1, -.1, fallColors[(i % 2)]);
                    }
                //Drawing the trunk of the tree
                    colorTemp = vec3(0.6, .3, 0);
                    pointsTemp = vec2(0.3, -0.3);
                    drawSolidRectangle(pointsTemp, 0.2, 0.5, colorTemp);
                //Drawing the leaves
                    drawTreeLeaves(fallColors);
                fallCount += 1;
            }
            //Finalize
                loadAttributes(colors, points, altProgram);
                gl.drawArrays(gl.TRIANGLES, 0, points.length);
    // WINTER DRAWING -------------------------------------------------------------
        } else if (season == "winter") {    //only run through the program once, so it doesn't continually redraw
            gl.useProgram(altProgram);
            if (winCount == 0) {
                //Drawing the grass
                    colorTemp = vec3(0.9, .9, 0.9);
                    pointsTemp = vec2(-1, -1);
                    drawSolidRectangle(pointsTemp, 2, 1, colorTemp);
                //Drawing the trunk of the tree
                    colorTemp = vec3(0.6, .3, 0);
                    pointsTemp = vec2(0.3, -0.3);
                    drawSolidRectangle(pointsTemp, 0.2, 0.5, colorTemp);
                //Drawing the leaves
                    drawTreeLeaves(winColors);
                    winCount += 1;
            }              
            //Finalize
                loadAttributes(colors, points, altProgram);
                gl.drawArrays(gl.TRIANGLES, 0, points.length);  
    // SPRING DRAWING ---------------------------------------------------------------
        } else {
            gl.useProgram(altProgram);
            if (sprCount == 0) {           //only run through the program once, so it doesn't continually redraw
                //Drawing the grass
                    colorTemp = vec3(0, 0.7, 0)
                    pointsTemp = vec2(-1, -1);
                    drawSolidRectangle(pointsTemp, 2, 1, colorTemp);
                //Draw leaves on the ground
                    for (let i = 0; i < 40; i += 1) {
                        let randomPoint = vec2(getRandomArbitrary(-1.0, 1.0), getRandomArbitrary(-1.0, -0.1));
                        drawSolidRectangle(randomPoint, .1, -.1, flowerColors[(i % 4)]);
                    }
                //Drawing the trunk of the tree
                    colorTemp = vec3(0.6, .3, 0);
                    pointsTemp = vec2(0.3, -0.3);
                    drawSolidRectangle(pointsTemp, 0.2, 0.5, colorTemp);
                //Drawing the leaves
                    drawTreeLeaves(springColors);
                sprCount += 1;
            }
            //Finalize
                loadAttributes(colors, points, altProgram);
                gl.drawArrays(gl.TRIANGLES, 0, points.length);
        }
    // Rotation
            if (direction == true) {
                gl.useProgram(programSun);
                theta += speed;
                if (theta >= 6.27) {        //Resets theta after a near full loop
                    theta = 0.0;
                }
                if (theta >= 1.7 && theta <= 4.8) { //Changes the sky color based on theta
                    gl.clearColor(.2, .2, .2, 1.0);
                } else {
                    gl.clearColor(.6, .6, .9, 1.0);
                }

                gl.useProgram(programMoon);
                thetaTwo += speed;
                if (thetaTwo >= 6.27) {     //Resets theta after a near full loop
                    thetaTwo = 0.0;
                }
            } else {
                gl.useProgram(programSun);
                theta -= speed;
                if (Math.abs(theta) >= 6.27) {
                    theta = 0.0;
                }
                if (Math.abs(theta) >= 1.7 && Math.abs(theta) <= 4.8) { //Changes the sky color based on theta
                    gl.clearColor(.2, .2, .2, 1.0);
                } else {
                    gl.clearColor(.6, .6, .9, 1.0);
                }

                gl.useProgram(programMoon);
                thetaTwo -= speed;
                if (Math.abs(thetaTwo) >= 6.27) {        //Resets theta after a near full loop
                    thetaTwo = 0.0;
                } 
            }
        requestAnimationFrame(render);
    }