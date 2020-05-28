// Code is heavily borrowed from PointLightedSphere.js from the text

class Sphere { 
  constructor(color='hot pink', texture=2) {
    // Texture: 
    // 0 = no texture (plain color)
    // 1 = yes blocky texture
    // 2 = mixing color and texture
    // 3 = normal debugging 

    this.texture = texture;
    this.rgba = colors[color];
    this.numVertices = 195; // for 13
    this.indices = []
    /*
    this.UV = cubeCoords['texture'];
    this.normals = new Float32Array(cubeCoords['normals']);*/
    this.modelMatrix = new Matrix4();
    //this.initColors();
    //this._indexBuffer = gl.createBuffer();
      // Create + send data to texture coordinate buffer (attr a_UV)
      /*
    if (this.texture == 1) {
      initArrayBuffer(this.UV, 2, gl.FLOAT, 'a_UV');
    } else if (this.texture == 3) {
      initArrayBuffer(this.normals, 3, gl.FLOAT, 'a_Normal');
    }*/
  }

  initVertexBuffers() { // Create a sphere
    var SPHERE_DIV = 13;
  
    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;
  
    var positions = [];

    // Generate coordinates
    for (j = 0; j <= SPHERE_DIV; j++) {
      aj = j * Math.PI / SPHERE_DIV;
      sj = Math.sin(aj);
      cj = Math.cos(aj);
      for (i = 0; i <= SPHERE_DIV; i++) {
        ai = i * 2 * Math.PI / SPHERE_DIV;
        si = Math.sin(ai);
        ci = Math.cos(ai);
  
        positions.push(si * sj);  // X
        positions.push(cj);       // Y
        positions.push(ci * sj);  // Z
      }
    }
  
    // Generate indices
    for (j = 0; j < SPHERE_DIV; j++) {
      for (i = 0; i < SPHERE_DIV; i++) {
        p1 = j * (SPHERE_DIV+1) + i;
        p2 = p1 + (SPHERE_DIV+1);
  
        this.indices.push(p1);
        this.indices.push(p2);
        this.indices.push(p1 + 1);
  
        this.indices.push(p1 + 1);
        this.indices.push(p2);
        this.indices.push(p2 + 1);
      }
    }
   this.numVertices = Math.max(...this.indices) + 1;
  
    // Create + send data to vertex coordinate buffer (attr a_Color)
    initArrayBuffer(new Float32Array(positions), 3, gl.FLOAT, 'a_Position');

    // Create + send data to color buffer (attr a_Color)
    initArrayBuffer(new Float32Array(positions), 3, gl.FLOAT, 'a_Normal');

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
    // Write the indices to the buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    //debugger;
    return this.indices.length;
  }

  initColors() {
    // Get color array + add some nice arbitrary shading
    let colors = [];

    for (var j = 0; j < this.indices.length; ++j) {
      let rgbaShading = [];

      for (let i = 0; i < 3; i++) {
        rgbaShading.push(this.rgba[i] * (1.3 - j * .15));
      }
      // Keep alpha
      rgbaShading.push(this.rgba[3])

      // Now we have base color
      // Repeat each color four times for the four vertices of the face
      colors = colors.concat(
        rgbaShading.map(x=> x*0.5 ),  // make it gradienty,
        rgbaShading.map(x=> x += (Math.random() - 0.5) * 0.2),
        rgbaShading,
        rgbaShading.map(x=> x * 1.1),
      );
    }
    debugger;
    this.colors = new Float32Array(colors);
  }

  render() {
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.modelMatrix.elements);

    if (g_NormalOn) {
      gl.uniform1i(u_WhichTexture, 3);
    } else { 
      gl.uniform1i(u_WhichTexture, this.texture)
    }

    this.initColors();

    // Create + send data to color buffer (attr a_Color)
    initArrayBuffer(this.colors, 4, gl.FLOAT, 'a_Color');
    
    // Create + send data to index buffer
    let n = this.initVertexBuffers();

    // Draw
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
  }
}
