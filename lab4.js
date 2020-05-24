// Lab 4: Spot Lighting 
// Rainbow Road Lite 

// Works Cited:
// Mozilla tutorial: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
// Calculating normals: https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal

// Vertex shader program
const VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  attribute vec4 a_Color;
  varying vec4 v_Color;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ProjectionMatrix;   // Perspective
  uniform mat4 u_ViewMatrix;         // Look at
  uniform mat4 u_GlobalRotateMatrix; // Global Rotation
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    //gl_Position = u_ProjectionMatrix * u_ViewMatrix * a_Position;
    //gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_Color = a_Color;
    v_UV = a_UV;
    v_Normal = a_Normal;
  }`;

// Fragment shader program
const FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;  
  varying vec4 v_Color;
  varying vec3 v_Normal;
  uniform sampler2D u_Sampler0;
  uniform int u_WhichTexture;
  void main() {
    if (u_WhichTexture == 0) {
      gl_FragColor = v_Color;
    } else if (u_WhichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_WhichTexture == 3) {
      // mixing the color and the texture
      // additive
      gl_FragColor = (0.5) * v_Color + 0.5 * texture2D(u_Sampler0, v_UV); // interpolate
      //gl_FragColor = v_Color - 0.5 * texture2D(u_Sampler0, v_UV); // nice subtractive
      gl_FragColor = (v_Color - 0.4 * texture2D(u_Sampler0, v_UV))+ 0.2 * v_Color* texture2D(u_Sampler0, v_UV); // secret sauce
    } else if (u_WhichTexture == 2) {
      // mixing the color and the texture
      gl_FragColor = v_Color * 1.1 + 0.3 - 0.4*texture2D(u_Sampler0, v_UV) ; // secret sauce
    } else {
      //gl_FragColor = vec4(v_UV, u_WhichTexture / 10, 1.0);
      gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
    }
  }`;


let shapesList = [];
const {gl, canvas} = setUpWebGL();
let {
  a_Position, a_UV, a_Color, a_Normal, u_ModelMatrix, u_GlobalRotateMatrix, u_ViewMatrix, u_ProjectionMatrix, u_Sampler, u_WhichTexture 
} = connectVariablesToGLSL(gl);
let animate = false;
let g_GlobalAngle = document.getElementById('angleSlider').value;
let startTime = performance.now();
let camera = new Camera();
let counterMouseMove = 0;

main = () => {
  const skyTexImage = initTextures('./skytexture.png');
  initAllShapes();

  // Register the event handler to be called on loading an image
  // wait before rendering
  skyTexImage.onload = function() { 
    sendTextureToGLSL(skyTexImage, gl.TEXTURE0); 
    document.getElementById('angleSlider').addEventListener('input', (e) => {
      g_GlobalAngle = e.target.value;
      renderAllShapes();
    });
    renderAllShapes();
  };
  /*
  canvas.addEventListener('mousemove', e => {
    counterMouseMove += 1;
    if (counterMouseMove % 3 != 0) return;
    if (e.offsetX > 350) {
      camera.panLeft(250);
      renderAllShapes();
    } else if (e.offsetX < 250) {
      camera.panRight(250);
      renderAllShapes();
    }
  });*/

  // Keydown for moving around / panning
  document.onkeydown = function(ev){ 
    keydown(ev); 
  };
}


drawMap = () => {
  for (let x=0; x < 32; x++) {
    for (let y=0; y < 32; y++) {
      if (g_map[x][y] == 1) {
        let colorIdx = g_map[x].indexOf(1);
        let body = new Cube(Object.keys(colors)[(y - colorIdx) % 7], texture=0);
        // make rainbow
        body.modelMatrix.translate(0, -.75, 0)
        body.modelMatrix.scale(.3, .3, .3)
        body.modelMatrix.translate(x* 2 - 32, 0, y * 2 - 32);
        shapesList.push(body);
      }
    }
  }
}
initAllShapes = () => {
  drawMap();
  // Sky
  let sky = new Cube(color='hot pink', texture=1);
  sky.modelMatrix.translate(0, 0, 0);
  sky.modelMatrix.scale(50, 50, 50);
  sky.modelMatrix.translate(-0.5, 0, -0.5);
  shapesList.push(sky);

  // Loaf body 
  let body = new Cube(color='loaf darker');
  body.modelMatrix.scale(
    inchesToGl(16), // long
    inchesToGl(5.5),  // tall
    inchesToGl(7) // wide
  ) 
  shapesList.push(body);

  // Head
  let head = new Cube(color='soft ginger');
  head.modelMatrix.translate(-0.6, 0.1, 0.0);
  head.modelMatrix.scale(
    inchesToGl(3), 
    inchesToGl(3), 
    inchesToGl(3),
  );
  shapesList.push(head);


  // Snoot
  let headCoordMat = new Matrix4(head.modelMatrix);
  let snoot = new Cube(color='loaf darker');
  snoot.modelMatrix = headCoordMat;
  snoot.modelMatrix.translate(-0.8, -0.3, 0.0);
  snoot.modelMatrix.rotate(10, 0, 0, 1);
  snoot.modelMatrix.scale(
    1, 
    0.5, 
    0.5,
  );
  snoot.modelMatrix.rotate(10, 0, 0, 1);
  shapesList.push(snoot);
  }

keydown = (ev) => {
  switch (ev.keyCode) {
    case 65:
      // A 
      camera.moveLeft();
      break;
    case 68:
      // D 
      camera.moveRight();
      break;
    case 87:
      // W
      camera.moveForward();
      break;
    case 83:
      // W
      camera.moveBackward();
      break;
    case 69:
      // E
      camera.panRight();
      break;
    case 81:
      // Q
      camera.panLeft();
      break;
  }
  renderAllShapes();
}


renderAllShapes = () => {
  // Pass the matrix to u_GlobalRotateMatrix 
  let globalRotationMatrix = new Matrix4().rotate(g_GlobalAngle, 0, 1, 0);
  //globalRotationMatrix.rotate(-5, 1, 0, 0); // arbitrary, just for perspective
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotationMatrix.elements);

  // if the clipping cuts off it looks really weird like a headless loaf with a neck stem
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMat);

  // Pass the view matrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMat);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (shape of shapesList) {
    shape.render();
  }

}

inchesToGl = (inches, mode='scalar') => {
  // Given a value in inches, approximates a webgl coordinates
  // For scalar mode, output is 0.0 - 1.0
  // For coordinates mode, output is -1.0 - 1.0
  // Loaf is ~22 inches long
  const screenLengthIn = 30.0;
  if (inches > screenLengthIn) throw 'too long';
  if (mode == 'scalar') return inches / screenLengthIn;
  else if (mode == 'coordinates') return ((2 * inches) / (screenLengthIn) - 1.0); 
}