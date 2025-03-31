// Global variable
var gl= document.getElementById('gl').getContext('webgl') ||
// Support Internet Explorer, Edge, Safari
        document.getElementById('gl').getContext('experimental-webgl');


function InitWebGL()
    {
    if (!gl){ //Hvis instantieringen af var gl fejler, alert brugt
        alert('WebGL is not supported');
        return;
        }
    let canvas = document.getElementById('gl'); //Find canvas elementet i HTML
    if(canvas.width != canvas.clientWidth || canvas.height != canvas.clientHeight){ //Skaler canvas bredde og højde til klient størrelse
        canvas.width= canvas.clientWidth;
        canvas.height= canvas.clientHeight;
        }
    InitViewport(canvas);
    }

function InitViewport()
{
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); //Definerer størrelsen på viewport, de to første parametre definerer forskydning fra henholdsvis x og y.
    gl.clearColor(0.0, 0.4, 0.6, 1.0); //Sætter en baggrundsfarve (Bliver overridet senere alligevel - redundant)
    gl.enable(gl.DEPTH_TEST); //Starter depth buffer
    gl.enable(gl.CULL_FACE); //Aktiverer culling
    gl.cullFace(gl.FRONT); //Culler front face af vertices

    InitShaders();
}

function InitShaders()
{
    //Hoved-funktion som kører initialisering og validering af vertex og fragment shader, når de er initialiseret og valideret, skabber den geometrybuffers.

    const vertex = InitVertexShader();
    const fragment = InitFragmentShader();

    let program = InitShaderProgram(vertex, fragment);

    if (!ValidateShaderProgram(program))
    {
        return false;
    }
    return CreateGeometryBuffers(program);
}
    
function InitVertexShader()
{
    let e = document.getElementById('vs'); //Find text feltet med vertex shader konfigurationen
    let vs = gl.createShader(gl.VERTEX_SHADER); //Skab en default vertex shader
    gl.shaderSource(vs, e.value); //Set shaderens "source" (code?) til værdien af text feltet 'e'
    gl.compileShader(vs); //Kompiler shader

    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) //Validering at kompilering af shader har været succesfuld
    {
        let e = gl.getShaderInfoLog(vs);
        console.error('Failed init vertex shader: ', e);
        return;
    }
    return vs;
}

function InitFragmentShader()
{
    //Se kommentarer fra InitVertexShader(), eneste forskel er bruget af fs og FRAGMENT_SHADER i stedet for vs
    let e = document.getElementById('fs');
    let fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, e.value);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS))
    {
        let e = gl.getShaderInfoLog(vs);
        console.error('Failed init fragment shader: ', e);
        return;
    }
    return fs;
}

function InitShaderProgram(vs, fs)
{
    let p = gl.createProgram(); //Skaber et default program som WebGL vinduet skal køre
    gl.attachShader(p,vs); //Forbinder den skabte vertex shader til programmet
    gl.attachShader(p,fs); //Forbinder den skabte fragment shader til programmet
    gl.linkProgram(p); //Dokumentation beskriver det som 
    // "If any shader objects of type GL_VERTEX_SHADER are attached to program, they will be used to create an executable that will run on the programmable vertex processor."
    //Så linkProgram, tager de forbundne shaders og gør dem til executable filer som kører på dedikerede processorer på GPU'en.

    if (!gl.getProgramParameter(p,gl.LINK_STATUS)) //Fejl kode
    {
        console.error(gl.getProgramInfoLog(p));
        alert('Failed linking program');
        return;
    }
    return p;
}

function ValidateShaderProgram(p)
{
    gl.validateProgram(p); //Indbygget WebGL funktion til at validere

    if (!gl.getProgramParameter(p, gl.VALIDATE_STATUS)) //Tjekker om det har været succesfuldt
    {
        console.error(gl.getProgramInfoLog(p))
        alert('Errors found validating shader program');
        return false;
    }
    return true;
}

function CreateGeometryBuffers(program)
{
    //En matrix der holder tre punkter og RGB værdier for trekanten
    const vertices = [0.0, -0.5, 0.0, 1.0, 0.0, 0.0,
                    -0.5, 0.5, 0.0, 0.0, 1.0, 0.0,
                    0.5, 0.5, 0.0, 0.0, 0.0, 1.0];
    
    CreateVBO(program, new Float32Array(vertices));

    gl.useProgram(program); //Sætter grafikkortet til at følge de instrukser fra program der er opstillet.

    Render();
}

function CreateVBO(program, vert)
{
    let vbo = gl.createBuffer(); //Skaber en default buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo); //Binder en array buffer
    gl.bufferData(gl.ARRAY_BUFFER, vert, gl.STATIC_DRAW); //Indsætter data for trekanten i array buffer
    const s = 6 * Float32Array.BYTES_PER_ELEMENT; //Definerer længden af arrays, kunne bruge 7 hvis en alpha værdi skulle bruges, altså XYZ, RGBA

    let p = gl.getAttribLocation(program, 'Pos'); //Henter "attribute vec3 Pos;"
    gl.vertexAttribPointer(p,3,gl.FLOAT,gl.FALSE,s,0); //Sætter værdier fra matrixen til vec3 Pos
    gl.enableVertexAttribArray(p); //Enabler de nye værdier

    const o = 3 * Float32Array.BYTES_PER_ELEMENT; //Offset til at hente RGB værdier
    let c = gl.getAttribLocation(program, 'Color'); //Henter "attribute vec3 Color;"
    gl.vertexAttribPointer(c,3,gl.FLOAT,gl.FALSE,s,o); //Sætter værdier fra matrix til vec3 Color ved brug af offset
    gl.enableVertexAttribArray(c); //Enabler de nye værdier
}

function Render()
{
    gl.clearColor(0.0, 0.4, 0.6, 1.0); //Sætter baggrundsfarve
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //Rydder eventuelt gemt data i Color Buffer og Depth Buffer
    gl.drawArrays(gl.TRIANGLES, 0, 3); //Tegner trekanten
}