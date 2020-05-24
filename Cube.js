
class Cube { 
  constructor(color='hot pink', texture=3) {
    // Texture: 1 = yes blocky texture; 0 = no texture
    this.texture = texture;
    // got tired of converting to percentages and dindt wwant to change them all to 255
    this.rgba = colors[color];
    this.vertices = new Float32Array(cubeCoords['positions']);
    this.indices = new Float32Array(cubeCoords['indices']);
    this.UV = new Float32Array(cubeCoords['texture']);
    this.numFaces = 6;
    this.modelMatrix = new Matrix4();
    this.initColors();
    this._indexBuffer = gl.createBuffer();
      // Create + send data to texture coordinate buffer (attr a_UV)
    if (this.texture == 1) initArrayBuffer(this.UV, 2, gl.FLOAT, 'a_UV');
  }
  generateNormals() {
  

  }
  
  initIndexBuffer() {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.indices), gl.STATIC_DRAW);
  }

  initColors() {
    // Get color array + add some nice arbitrary shading
    let colors = [];

    for (var j = 0; j < this.numFaces * 4; ++j) {
      let rgbaShading = [];

      // Subtract .08 from alpha for each face to simulate shading
      // IF U PUT I < 4 + KEEP ALPHA IT MAKES IT RAINBOW 
      for (let i = 0; i < 3; i++) {
        rgbaShading.push(this.rgba[i] * (1.3 - j * .15));
      }
      // Keep alpha
      rgbaShading.push(this.rgba[3])

      // Repeat each color four times for the four vertices of the face
      colors = colors.concat(
        rgbaShading.map(x=> x*0.5 ),  // make it gradienty,
        rgbaShading.map(x=> x += (Math.random() - 0.5) * 0.2),
        rgbaShading,
        rgbaShading.map(x=> x * 1.1),
      );
    }
    this.colors = new Float32Array(colors);
  }

  render() {
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.modelMatrix.elements);

    gl.uniform1i(u_WhichTexture, this.texture);

    
    // Create + send data to index buffer
    this.initIndexBuffer();

    // Create + send data to color buffer (attr a_Color)
    initArrayBuffer(this.colors, 4, gl.FLOAT, 'a_Color');
  
    // Create + send data to vertex coordinate buffer (attr a_Color)
    initArrayBuffer(this.vertices, 3, gl.FLOAT, 'a_Position');

    // Draw
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    //debugger;
  }
}
