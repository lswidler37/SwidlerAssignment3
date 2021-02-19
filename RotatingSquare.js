"use strict";

var canvas;
var gl;

var theta = 0.0;
var thetaLoc;

var colors;
var Tcolors;

var vertices;
var verticesTriangle;
var program;
var programTriangle;

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
        program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);

    //note that this is no longer a local variable (removed the "var")
        colors = [
            vec3(0, 0, 1),
            vec3(0, 1, 0),
            vec3(1, 0, 0),
            vec3(1, 1, 1)
        ];
        Tcolors = [
            vec3(.2, .6, 0),
            vec3(.2, .6, 0),
            vec3(.2, .6, 0)
        ];

        vertices = [
            vec2(0, 0.7),
            vec2(.2, 0.7),
            vec2(0, 0.9),
            vec2(0.2, 0.9)
        ];
    
        verticesTriangle = [
            vec2(-2, 0),
            vec2(2, 0),
            vec2(0, -2)
        ];

        
    // establish shaders and uniform variables
        program = initShaders(gl, "vertex-shader", "fragment-shader");
        thetaLoc = gl.getUniformLocation(program, "uTheta");
        programTriangle = initShaders(gl, "vertex-shader-still", "fragment-shader");

        let cBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
        let colorLoc = gl.getAttribLocation(program, "aColor");
        gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLoc);

        let cBufferTriangle = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, cBufferTriangle);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Tcolors), gl.STATIC_DRAW );
        let colorLocTriangle = gl.getAttribLocation(programTriangle, "aColor");
        gl.vertexAttribPointer(colorLocTriangle, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLocTriangle);

        

    render();
};


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
        // DRAW THE SQUARE
            gl.useProgram(program);
            // Load the data 
                var bufferId = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
            // Associate shader variables with our data bufferData
                var positionLoc = gl.getAttribLocation(program, "aPosition");
                gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(positionLoc);
            // rotation
                theta += 0.01;
                gl.uniform1f(thetaLoc, theta);
            // DRAW IT!
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // DRAW THE TRIANGLE
        // switch to the Triangle shaders
            gl.useProgram(programTriangle);
            // Load the data
                var bufferId2 = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, bufferId2);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesTriangle), gl.STATIC_DRAW);
            // Associate shader variables with our data bufferData
                var positionLoc2 = gl.getAttribLocation(programTriangle, "aPosition");
                gl.vertexAttribPointer(positionLoc2, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(positionLoc2);
            // DRAW IT!
                gl.drawArrays(gl.TRIANGLES, 0, verticesTriangle.length);

    requestAnimationFrame(render);
}
