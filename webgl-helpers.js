setUpWebGL = () => {
  // Retrieve <canvas> element
  const canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  const gl = getWebGLContext(canvas);
  if (!gl) throw 'Failed to get the rendering context for WebGL';

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  return {gl, canvas};
}


connectVariablesToGLSL = (gl) => {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) throw 'Failed to intialize shaders.';

  // Get the storage location of a_Position
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) throw 'Failed to get the storage location of a_Position';

  // Get the storage location of a_Position
  let a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) throw 'Failed to get the storage location of a_UV';

  // Get the storage location of a_Color
  let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (!a_Color) throw 'Failed to get the storage location of a_Color';

  // Get the storage location of a_Normal
  let a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
 // debugger;
  if (!a_Normal) throw 'Failed to get the storage location of a_Normal';

  let u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
  if (!u_LightPos) throw 'Failed to get the storage location of u_LightPos';

  // Holds all the transformations and pass when drawing
  let u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) throw 'Failed to get the storage location of u_ModelMatrix';

  // Camera angle
  let u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) throw 'Failed to get the storage location of u_GlobalRotateMatrix';

  // View matrix
  let u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) throw 'Failed to get the storage location of u_ViewMatrix';

  // Orthographic projection matrix
  let u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) throw 'Failed to get the storage location of u_ProjectionMatrix';
  
  // Texture sampler
  let u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler) throw 'Failed to get the storage location of u_Sampler0';

  // Pick whether we're using texture, color, or a combo
  let u_WhichTexture = gl.getUniformLocation(gl.program, 'u_WhichTexture');
  if (!u_WhichTexture) throw 'Failed to get the storage location of u_WhichTexture';

  let u_LightingOn = gl.getUniformLocation(gl.program, 'u_LightingOn');
  if (!u_LightingOn) throw 'Failed to get the storage location of u_igihtinigon';

  return {
    a_Position, a_UV, a_Color, a_Normal, u_ModelMatrix, u_GlobalRotateMatrix, u_ViewMatrix, u_ProjectionMatrix, u_Sampler, u_LightPos, u_WhichTexture, u_LightingOn
  }
}

initArrayBuffer = (data, num, type, attribute, buffer=undefined) => {
  if (!buffer) {
    buffer = gl.createBuffer();   // Create a buffer object
    if (!buffer) throw ('Failed to create the buffer object');
  }

  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Assign the buffer object to the attribute variable
  let a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) throw ('Failed to get the storage location of ' + attribute);

  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);
  return buffer;
}

initTextures = (path) => {
  let image = new Image();  // Create the image object
  if (!image) throw 'Failed to create the image object';

  // Tell the browser to load an image
  image.src = path;
  return image;
}

sendTextureToGLSL = (image, textureUnit) => {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) throw 'Failed to create the texture object';

  // Flip the image's y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 

  // Enable texture unit0 (there are 8 texture units total)
  gl.activeTexture(textureUnit); 

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  // 1i = 1 integer
  gl.uniform1i(u_Sampler, 0);
}