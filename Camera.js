class Camera { 
  constructor() {
    this._viewMat = new Matrix4();
    this._projectionMat = new Matrix4();
    this.eye =  new Vector3([3.8, 0.8, 0]);
    this.at = new Vector3([-55, 0.4, 0]);
    this.up = new Vector3([0, 1, 0]);
    this.speed = 1.03; // how much you move 
    this.alpha = 130; // degrees for each pan.....supposedly
    /* z larger = backing up (or u can set wider perspective ˚)
     x larger = shifts to the left */
  }

  get viewMat() {
    this._viewMat.setLookAt(
      ...this.eye.elements, // eye position (camera position) 
      ...this.at.elements,  // at (target to look at)
      ...this.up.elements,  // up (camera up vector)
    );
    return this._viewMat.elements;
  }

  get projectionMat() {
    this._projectionMat.setPerspective(
      95, // degrees wide (kinda cropping)
      canvas.width / canvas.height, // aspect ratio, should be square otherwise it squishes
      0.1, // clipping (near)
      120, // clipping (far)
    )
    return this._projectionMat.elements;
  }
  getD() {
    // Get the forward vector
    // vector pointing the Distance between at and eye
    let d = new Vector3();
    d.set(this.at);
    d.sub(this.eye);
    d.normalize();
    d.mul(this.speed);
    return d;
  }
  moveForward() {
    const d = this.getD();
    this.eye.add(d)
    this.at.add(d)
  }
  moveBackward() {
    const d = this.getD();
    this.eye.sub(d)
    this.at.sub(d)
  }
  moveLeft() {
    const d = this.getD();
    let sideVec = Vector3.cross(this.up, d)
    sideVec.normalize();
    sideVec.mul(this.speed);
    this.eye.add(sideVec)
    this.at.add(sideVec)
  }
  moveRight() {
    const d = this.getD();
    let sideVec = Vector3.cross(this.up, d)
    sideVec.normalize();
    sideVec.mul(this.speed);
    this.eye.sub(sideVec)
    this.at.sub(sideVec)
  }
  panLeft(amt=this.alpha) {
    const d = this.getD();
    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(amt, ...this.up.elements);
    const dPrime = rotationMatrix.multiplyVector3(d);
    this.at.add(dPrime);
  }
  panRight(amt=this.alpha) {
    const d = this.getD();
    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(amt, ...this.up.elements);
    const dPrime = rotationMatrix.multiplyVector3(d);
    this.at.sub(dPrime);
  }


}