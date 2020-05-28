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
  attribute vec4 a_Normal;
  attribute vec4 a_Color;
  varying vec4 v_Color;
  varying vec2 v_UV;
  varying vec4 v_VertPos;
  varying vec4 v_Normal;
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
    v_VertPos = u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
const FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;  
  varying vec4 v_Color;
  varying vec4 v_Normal;
  varying vec4 v_VertPos;
  
  uniform sampler2D u_Sampler0;
  uniform int u_WhichTexture;
  uniform int u_LightingOn;
  uniform vec3 u_LightPos;
  uniform vec3 u_CameraPos;
  void main() {
    if (u_WhichTexture == 0) {
      gl_FragColor = v_Color; // Plain color
    } else if (u_WhichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler0, v_UV); // Plain texture
    } else if (u_WhichTexture == 2) {
      // Mixing the color and the texture
      gl_FragColor = (v_Color - 0.4 * texture2D(u_Sampler0, v_UV))+ 0.3 * v_Color* texture2D(u_Sampler0, v_UV); // secret sauce
    } else if (u_WhichTexture == 3) {
      gl_FragColor = vec4(v_Normal[0], v_Normal[1], v_Normal[2], 1.0);
    }
    
    vec3 lightVector = u_LightPos - vec3(v_VertPos);
    float r = length(lightVector);
    if (u_LightingOn == 1) {
      //gl_FragColor = vec4(vec3(gl_FragColor) / (r * r), 1);
      // N dot L
      vec3 L = normalize(lightVector);
      vec3 N = normalize(vec3(v_Normal));
      float nDotL = max(dot(N, L), 0.0);

      // Reflection
      vec3 R = reflect(L, N);
      // Eye
      vec3 E = normalize (u_CameraPos - vec3(v_VertPos) );
      // Specular
      float specular = pow(max(dot(E, R), 0.0), 10.0);

      vec3 diffuse = vec3(gl_FragColor) * nDotL;
      vec3 ambient = vec3(gl_FragColor) * nDotL;

      gl_FragColor = vec4(specular + diffuse + ambient, 1.0);

    }
  }
  
  `;


let shapesList = [];
const {gl, canvas} = setUpWebGL();
let {
  a_Position, a_UV, a_Color, a_Normal, u_ModelMatrix, u_GlobalRotateMatrix, u_ViewMatrix, u_ProjectionMatrix, 
  u_Sampler, u_LightPos, u_WhichTexture, u_LightingOn, u_CameraPos 
} = connectVariablesToGLSL(gl);
let animate = false;
let g_GlobalAngle = document.getElementById('angleSlider').value;
let g_NormalOn = document.getElementById('showNormal').checked;
let g_LightingOn = document.getElementById('showLighting').checked;
let g_YellowAnimate = document.getElementById('yellowAnimate').checked;
let g_MagentaAnimate = document.getElementById('magentaAnimate').checked;
let g_LightPos = [2.5, 0.21, -.3];
let startTime = performance.now();
let camera = new Camera();
let counterMouseMove = 0;

setUpEvents = () => {
  document.getElementById('angleSlider').addEventListener('input', (e) => {
    g_GlobalAngle = e.target.value;
    renderAllShapes();
  });
  document.getElementById('lightSlideX').addEventListener('input', (e) => {
    g_LightPos[0] = e.target.value / 100.0;
    // todo change divisor to make more dramatic
    renderAllShapes();
  });
  document.getElementById('lightSlideY').addEventListener('input', (e) => {
    g_LightPos[1] = e.target.value / 100.0;
    renderAllShapes();
  });
  document.getElementById('lightSlideZ').addEventListener('input', (e) => {
    g_LightPos[2] = e.target.value / 100.0;
    renderAllShapes();
  });
  document.getElementById('magentaAnimate').addEventListener('change', (e) => {
    g_MagentaAnimate = document.getElementById('magentaAnimate').checked;
    renderAllShapes();
  });
  document.getElementById('yellowAnimate').addEventListener('change', (e) => {
    g_YellowAnimate = document.getElementById('yellowAnimate').checked;
    renderAllShapes();
  });

  document.getElementById('showNormal').addEventListener('change', (e) => {
    g_NormalOn = document.getElementById('showNormal').checked;
    renderAllShapes();
  });
  document.getElementById('showLighting').addEventListener('change', (e) => {
    g_LightingOn = document.getElementById('showLighting').checked;
    if (g_LightingOn) tick();
    renderAllShapes();
  });

  document.getElementById('magentaSlider').addEventListener('input', (e) => {
    g_MagentaAnimate = e.target.value;
    renderAllShapes();
  });

  document.getElementById('yellowSlider').addEventListener('input', (e) => {
    g_YellowAnimate = e.target.value;
    renderAllShapes();
  });

  // Keydown for moving around / panning
  document.onkeydown = function(ev){ 
    keydown(ev); 
  };
  if (g_LightingOn) tick();

}

main = () => {
  const skyTexImage = initTextures('./skytexture.png');
  initAllShapes();

  // Register the event handler to be called on loading an image
  // wait before rendering
  skyTexImage.onload = function() { 
    sendTextureToGLSL(skyTexImage, gl.TEXTURE0); 
    setUpEvents();
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
  tick();
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
        body.modelMatrix.translate(x * 2 - 32, 0, y * 2 - 32);
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
  let body = new Cube(color='loaf darker', texture=0);
  body.modelMatrix.scale(
    inchesToGl(16), // long
    inchesToGl(5.5),  // tall
    inchesToGl(7) // wide
  ) 
  shapesList.push(body);

  // Head
  let head = new Cube(color='soft ginger', texture=0);
  head.modelMatrix.translate(-0.6, 0.1, 0.0);
  head.modelMatrix.scale(
    inchesToGl(3), 
    inchesToGl(3), 
    inchesToGl(3),
  );
  shapesList.push(head);


  // Snoot
  let headCoordMat = new Matrix4(head.modelMatrix);
  let snoot = new Cube(color='loaf darker', texture=0);
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
  

  // Big cube
  let bigCube = new Cube(color='turquoise', texture=2);
  bigCube.modelMatrix.scale(
    0.3, 
    0.3, 
    0.3,
  );
  bigCube.modelMatrix.translate(5, 1, 0);
  //bigCube.modelMatrix.rotate(15, 0, 1, 0);
  shapesList.push(bigCube);

  // Sphere
  let sphere = new Sphere(color='turquoise', texture=3);
  sphere.modelMatrix.scale(
    0.4, 
    0.4, 
    0.4,
  );
  sphere.modelMatrix.translate(5, 1, -3);

  shapesList.push(sphere);

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

let g_startTime = performance.now() / 1000.0;
let g_seconds = performance.now() / 1000.0 - g_startTime;

tick = () => {
  g_seconds = performance.now() / 1000.0 - g_startTime;

  updateAnimationAngles();
  renderAllShapes();
  if (g_LightingOn) requestAnimationFrame(tick);
}

updateAnimationAngles = () => {
  if (g_YellowAnimate) g_yellowAngle = 45 * Math.sin(g_seconds);
  if (g_MagentaAnimate) g_magentaAngle = 45 * Math.sin(3*g_seconds);
  g_LightPos[1] = Math.cos(g_seconds) + 0.75;
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

  gl.uniform3f(u_LightPos, g_LightPos[0], g_LightPos[1], g_LightPos[2]);
  gl.uniform3f(u_CameraPos, camera.eye[0], camera.eye[1], camera.eye[2]);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Light
  if (g_LightingOn) {
    gl.uniform1i(u_LightingOn, 1);
    let light = new Cube(color='light yellow', texture=0);
  
    light.modelMatrix.translate(g_LightPos[0], g_LightPos[1], g_LightPos[2]); 
    light.modelMatrix.scale(-.1, -.1, -.1);
    
    light.render();
  } else { 
    gl.uniform1i(u_LightingOn, 0);
  }

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