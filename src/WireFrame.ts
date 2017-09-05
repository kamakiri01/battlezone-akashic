export class Vector {
	x: number;
	y: number;
	z: number;
	w: number;
	constructor();
	constructor (x: number, y: number, z: number, w?: number);
	constructor(v: Vector);
	constructor(vectorOrX?: number|Vector, y?: number, z?: number, w?: number) {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.w = 1;
		if (vectorOrX !== undefined) {
			if (vectorOrX instanceof Vector) {
				this.x = vectorOrX.x;
				this.y = vectorOrX.y;
				this.z = vectorOrX.z;
				this.w = vectorOrX.w;
			} else {
				this.x = vectorOrX;
				this.y = y;
				this.z = z;
				if (w !== undefined) this.w = w;
			}
		}
	}
	distance(): number {
		const xx = Math.pow(this.x, 2);
		const yy = Math.pow(this.y, 2);
		const zz = Math.pow(this.z, 2);
		return Math.sqrt(xx + yy + zz);
	}
	normalize(): void {
		const dist = this.distance();
		this.x /= dist;
		this.y /= dist;
		this.z /= dist;
	}
	dotProduct(src: Vector): number {
		return this.x * src.x + this.y * src.y + this.z * src.z;
	}
	add(src: Vector): void {
		this.x += src.x;
		this.y += src.y;
		this.z += src.z;
		this.w += src.w;
	}
	sub(src: Vector): void {
		this.x -= src.x;
		this.y -= src.y;
		this.z -= src.z;
		this.w -= src.w;
	}
	scale(scale: number): void {
		this.x *= scale;
		this.y *= scale;
		this.z *= scale;
		this.w *= scale;
	}
	copy() {
		return new Vector(this.x, this.y, this.z, this.w);
	}
	toString(): string {
		return "("+this.x+","+this.y+","+this.z+","+this.w+")";
	}
}

export class Matrix {
	matrix: number[][];
	tmpMat: number[][];
	constructor(mat?: Matrix | number[][]) {
		this.matrix = [ [1,0,0,0],
						[0,1,0,0],
						[0,0,1,0],
						[0,0,0,1] ];
		this.tmpMat = [ [1,0,0,0],
						[0,1,0,0],
						[0,0,1,0],
						[0,0,0,1] ];
		if (mat) {
			if (mat instanceof Matrix) {
				for (var i = 0; i < 4; i ++) {
					for (var j = 0; j < 4; j ++) {
						this.matrix[i][j] = mat.matrix[i][j];	
					}
				}
			} else {
				this.matrix = mat;
			}	
		}
	}
	initialize(): void {
		const m = new Matrix();
		this.matrix = [ [1,0,0,0],
						[0,1,0,0],
						[0,0,1,0],
						[0,0,0,1] ];
		this.tmpMat = [ [1,0,0,0],
						[0,1,0,0],
						[0,0,1,0],
						[0,0,0,1] ];
	}
	apply(vector: Vector): Vector {
		const m = this.matrix;
		return new Vector(  m[0][0]*vector.x + m[0][1]*vector.y + m[0][2]*vector.z + m[0][3]*vector.w,
		                    m[1][0]*vector.x + m[1][1]*vector.y + m[1][2]*vector.z + m[1][3]*vector.w,
		                    m[2][0]*vector.x + m[2][1]*vector.y + m[2][2]*vector.z + m[2][3]*vector.w,
		                    m[3][0]*vector.x + m[3][1]*vector.y + m[3][2]*vector.z + m[3][3]*vector.w);
	}
	composition(mat: Matrix) {
		var m = this.matrix;
		var r = new Array();
		for(var i=0;i<4;i++){
			r[i] =new Array();
			for(var j=0;j<4;j++){
				r[i][j] =0;
				for(var k=0;k<4;k++){
					r[i][j] += m[i][k]*mat.matrix[k][j];
				}
			}
		}
		return new Matrix(r);
	}
	compositionMe(mat: Matrix): void {
		var m = this.matrix;
		for(var i=0;i<4;i++){
			for(var j=0;j<4;j++){
				var r=0;
				for(var k=0;k<4;k++){
					r += m[k][j]*mat.matrix[i][k];
				}
				this.tmpMat[i][j] =r;
			}
		}
		for(var i=0;i<4;i++){
			for(var j=0;j<4;j++){
				this.matrix[i][j] = this.tmpMat[i][j];
			}
		}
	}
	rotateX(T: number): void {
		var cosT =Math.cos(T);
		var sinT =Math.sin(T);
		this.matrix = [
            [    1,     0,    0, 0],
			[    0,  cosT,-sinT, 0],
			[    0, sinT, cosT, 0],
			[    0,     0,    0, 1]];
	}
	rotateY(T: number): void {
		var cosT =Math.cos(T);
		var sinT =Math.sin(T);
		this.matrix = [
            [ cosT, 0, sinT, 0],
			[    0, 1,    0, 0],
			[-sinT, 0, cosT, 0],
			[    0, 0,    0, 1]];
	}
	rotateZ(T: number): void {
		var cosT =Math.cos(T);
		var sinT =Math.sin(T);
		this.matrix = [
            [ cosT, -sinT, 0, 0],
			[ sinT,  cosT, 0, 0],
			[    0,     0, 1, 0],
			[    0,     0, 0, 1]];
	}
	rotateWithVector(T: number, V: Vector): void {
		var cosT =Math.cos(T);
		var cosTr = 1 - cosT;
		var sinT =Math.sin(T);
		var x = V.x;
		var y = V.y;
		var z = V.z;
		this.matrix = [ 
            [ x*x*cosTr+  cosT, x*y*cosTr-z*sinT, z*x*cosTr+y*sinT, 0],
			[ x*y*cosTr+z*sinT, y*y*cosTr+  cosT, y*z*cosTr+x*sinT, 0],
			[ z*x*cosTr-y*sinT, y*z*cosTr+x*sinT, z*z*cosTr+  cosT, 0],
			[                0,                0,                0, 1]];
	}
	toString(): string {
		var m=this.matrix;
		var str="";
		for(var i=0;i<4;i++){
			str+="|";
			for(var j=0;j<4;j++){
				str+=" "+m[i][j]+" ";
			}
			str+="|\n";
		}
		return str;
	}
	print(): void {
		alert(this.toString());
	}
}


export class VertexTable extends Array {
	constructor(vt?: VertexTable) {
		super();
		// @see https://github.com/Microsoft/TypeScript/issues/13720
		(<any>Object).setPrototypeOf(this, VertexTable.prototype);
		if (vt) {
			for(var i=0;i<vt.length;i++)
				this.push(new Vector(vt[i]));
		}
	}
	apply(mat: Matrix): VertexTable {
		let result = new VertexTable();
        for(var i=0;i<this.length;i++){
            result.push(mat.apply(this[i]));
        }
        return result;
	}
    applyFast(src: VertexTable, m: Matrix): VertexTable{
        for(var i=0;i<this.length;i++){
            this[i].x = m.matrix[0][0]*src[i].x +
                        m.matrix[0][1]*src[i].y +
                        m.matrix[0][2]*src[i].z +
                        m.matrix[0][3]*src[i].w ;
            this[i].y = m.matrix[1][0]*src[i].x +
                        m.matrix[1][1]*src[i].y +
                        m.matrix[1][2]*src[i].z +
                        m.matrix[1][3]*src[i].w ;
            this[i].z = m.matrix[2][0]*src[i].x +
                        m.matrix[2][1]*src[i].y +
                        m.matrix[2][2]*src[i].z +
                        m.matrix[2][3]*src[i].w ;
            this[i].w = m.matrix[3][0]*src[i].x +
                        m.matrix[3][1]*src[i].y +
                        m.matrix[3][2]*src[i].z +
                        m.matrix[3][3]*src[i].w ;
        }
        return this;
    }
    scale(fact: number): VertexTable {
        let result = new VertexTable();
        for(var i=0;i<this.length;i++){
            result.push(fact*this[i]);
        }
        return result;
    }
    toString(): string{
        let str="";
        for(var i=0;i<this.length;i++){
            str += this[i] +",";
        }
        return str;
    }
}

// ------------------------------------------------------------------------
// ここからakashic-engine固有
// ------------------------------------------------------------------------

export class Coord3D extends g.E {
	dVec: Vector;
	up: Vector;
	r: Vector;
	u: Vector;
	f: Vector;
	rotMat: Matrix;
	movMat: Matrix;
	rm: Matrix;
	sphereOrigin: Vector;
	sphereR: number;
	constructor(scene: g.Scene);
	constructor(scene: g.Scene, vector: Vector);
	constructor(scene: g.Scene, x: number, y: number, z: number);
	constructor(scene: g.Scene, vectorOrX?: number | Vector, y?: number, z?: number) {
		super(scene);
		if (!vectorOrX) {
			this.dVec = new Vector(0, 0, 0)
		} else if (vectorOrX instanceof Vector) {
			this.dVec = vectorOrX;
		} else {
			this.dVec = new Vector(vectorOrX, y, z);
		}
		this.up = new Vector(0, 1, 0);
		this.r = new Vector(1, 0, 0);
		this.u = new Vector(0, 1, 0);
		this.f = new Vector(0, 0, 1);
		this.rotMat = new Matrix();
		this.movMat = new Matrix();
		this.rm = new Matrix();
		this.sphereOrigin = new Vector();
		this.sphereR = 0;

		this.update.handle(this, function() {
			this.modified();
		});
	}
	rotateY(T: number): void {
		this.rm.rotateY(T);
		this.r = this.rm.apply(this.r);
		this.u = this.rm.apply(this.u);
		this.f = this.rm.apply(this.f);
	}
    moveR(scalar: number): void {
        this.dVec.x += scalar * this.r.x;
        this.dVec.y += scalar * this.r.y;
        this.dVec.z += scalar * this.r.z;
    }
    moveU(scalar: number): void {
        this.dVec.x += scalar * this.u.x;
        this.dVec.y += scalar * this.u.y;
        this.dVec.z += scalar * this.u.z;
    }
    moveF(scalar: number): void {
        this.dVec.x += scalar * this.f.x;
        this.dVec.y += scalar * this.f.y;
        this.dVec.z += scalar * this.f.z;
    }
    movePosition(vectorOrX: number | Vector, y?: number, z?: number): void {
        if (vectorOrX instanceof Vector) {
            this.dVec.x += vectorOrX.x;
            this.dVec.y += vectorOrX.y;
            this.dVec.z += vectorOrX.z;
        } else {
            this.dVec.x += vectorOrX;
            this.dVec.y += y;
            this.dVec.z += z;
        }
    }
    setPosition(vectorOrX: number | Vector, y?: number, z?: number): void {
        if (vectorOrX instanceof Vector) {
            this.dVec.x = vectorOrX.x;
            this.dVec.y = vectorOrX.y;
            this.dVec.z = vectorOrX.z;
        } else {
            this.dVec.x = vectorOrX;
            this.dVec.y = y;
            this.dVec.z = z;
        }
    }
    setAttitude(r: Vector, u: Vector, f: Vector): void {
        this.r.x = r.x;
        this.r.y = r.y;
        this.r.z = r.z;
        this.u.x = u.x;
        this.u.y = u.y;
        this.u.z = u.z;
        this.f.x = f.x;
        this.f.y = f.y;
        this.f.z = f.z;
    }
    updateMat(): void {
        this.movMat.initialize();
        this.movMat.matrix[0][3] = this.dVec.x;
        this.movMat.matrix[1][3] = this.dVec.y;
        this.movMat.matrix[2][3] = this.dVec.z;
        this.rotMat.initialize();
        this.rotMat.matrix[0][0] = this.r.x;
        this.rotMat.matrix[0][1] = this.u.x;
        this.rotMat.matrix[0][2] = this.f.x;
        this.rotMat.matrix[1][0] = this.r.y;
        this.rotMat.matrix[1][1] = this.u.y;
        this.rotMat.matrix[1][2] = this.f.y;
        this.rotMat.matrix[2][0] = this.r.z;
        this.rotMat.matrix[2][1] = this.u.z;
        this.rotMat.matrix[2][2] = this.f.z;
    }
    toString(): string {
        return 'dv: ' + this.dVec.toString() + ', f: ' + this.f.toString();
    }
}

export class Shape extends Coord3D {
	color: string;
	vt: VertexTable;
	rvt: VertexTable;
	_lines: Line[];
	constructor(scene: g.Scene);
	constructor(scene: g.Scene, x: number, y: number, z: number);
	constructor(scene: g.Scene, x?: number, y?: number, z?: number) {
		if (x !== undefined) {
			super(scene, x, y, z);
		} else {
			super(scene);
		}
		this.color = "#ff0000";
		this.vt = new VertexTable();
		this.rvt = new VertexTable()
		this.updateMat();
		this._lines = [];
	}
	setVT(vt: VertexTable): void {
		this.vt = new VertexTable(vt);
		this.rvt = new VertexTable(vt);
	}
	draw(camMat: Matrix, convMat: Matrix): void {
		if (this._lines.length > 0) {
			for (var i = 0; i < this._lines.length; i++) {
				this._lines[i].remove();
			}
			this._lines = [];
		}

		const r = this.rvt;
		this.updateMat();
		this.rm = this.movMat.composition(this.rotMat);
		this.rm.compositionMe(camMat);
		this.rm.compositionMe(convMat);
		r.applyFast(this.vt, this.rm);

		let cx, cy;
		if(r[0].w >= 0) {
			cx = Math.round(r[0].x/r[0].w);
			cy = Math.round(r[0].y/r[0].w);
		} else {
			cx = 0;
			cy = 0;
		}

		for (var i = 1, l = r.length; i < l; i++) {
			if (r[i].w < 0) continue;
			const nx = Math.round(r[i].x/r[i].w);
			const ny = Math.round(r[i].y/r[i].w);
			let line = new Line(this.scene, this.color);
			line.createLine(cx, cy, nx, ny);
			this.scene.append(line);
			this._lines.push(line);
			cx = nx;
			cy = ny;
		}
		this.modified();
	}
	shapeSphereHit(shape: Coord3D) {
		let dVec = this.dVec;
		let so = this.sphereOrigin;

		const origin = new Vector(dVec.x + so.x, dVec.y + so.y, dVec.z + so.z);
		dVec = shape.dVec;
		so = shape.sphereOrigin;
		const aOrigin = new Vector(dVec.x + so.x, dVec.y + so.y, dVec.z + so.z);
		origin.sub(aOrigin);
		if (origin.distance() <= shape.sphereR + this.sphereR) {
			return true;
		} else {
			return false;
		}
	}
	onHit() {
		// need instance
	}
}

export class Line extends g.FilledRect {
	dx: number;
	dy: number;
	_value: number[];
	constructor(scene: g.Scene, color: string) {
		super({scene: scene, cssColor: color, width: 1, height: 1});
	}
	createLine(x1: number, y1: number, x2: number, y2: number) {
		this._value = [x1, y1, x2, y2];
		this.x = (x1 + x2) / 2;
		this.y = (y1 + y2) / 2;
		this.width = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
		this.height = 1;
		this.angle = Math.atan2(x1 - x2, -(y1 - y2)) * 180 / Math.PI - 90;
		this.modified();
	}
}

export class Camera extends Coord3D {
	front: Vector;
	cv: Vector;
	constructor(scene: g.Scene, x: number, y: number, z: number) {
		super(scene, x, y, z)
		this.front = new Vector(0, 0, -1);
		this.cv = new Vector();
		this.updateMat();
	}
	updateMat() {
		this.front = this.f.copy();
		this.front.scale(-1);
        this.cv.x = this.dVec.dotProduct(this.r);
        this.cv.y = this.dVec.dotProduct(this.u);
        this.cv.z = this.dVec.dotProduct(this.front);
        this.rotMat.matrix[0][3] = -this.cv.x;
        this.rotMat.matrix[1][3] = -this.cv.y;
        this.rotMat.matrix[2][3] = -this.cv.z;
        this.rotMat.matrix[0][0] = this.r.x;
        this.rotMat.matrix[0][1] = this.r.y;
        this.rotMat.matrix[0][2] = this.r.z;
        this.rotMat.matrix[1][0] = this.u.x;
        this.rotMat.matrix[1][1] = this.u.y;
        this.rotMat.matrix[1][2] = this.u.z;
        this.rotMat.matrix[2][0] = this.front.x;
        this.rotMat.matrix[2][1] = this.front.y;
        this.rotMat.matrix[2][2] = this.front.z;
	}
}

export class Bullet extends Shape {
	speed: number;
	frame: number;
	frameLimit: number;
	appear: boolean;
	constructor(scene: g.Scene, x: number, y: number, z: number) {
		super(scene, x, y, z);
		this.speed = 15;
		this.frame = 0;
		this.frameLimit = 30;
		this.appear = false;
	}
	onShotStart(c: Coord3D) {
		this.setPosition(c.dVec);
		this.setAttitude(c.r, c.u, c.f);
		this.appear = true;
		this.modified();
	}
	onShotFrame(enemies: Shape[]) {
		this.moveF(this.speed)
		this.frame += 1;
		for (var i = 0, l = enemies.length; i < l; i++) {
			if (this.shapeSphereHit(enemies[i])) {
				enemies[i].onHit();
				this.onShotEnd();
				break;
			}
		}
		if (this.frame > this.frameLimit) {
			this.onShotEnd();
		}
		this.modified();

	}
	onShotEnd() {
		this.frame = 0;
		this.appear = false;
		this.modified();
	}
}

export class Tank extends Shape {
	bullet: Bullet;
	distance: number;
	appear: boolean;
	free: boolean;
	frame: number;
	patternNum: number;
	speed: number;
	turnRad: number;
	maxframe: number;
	escapeDist: number;
	shotDist: number;
	shotRad: number;
	constructor(scene: g.Scene, bulletVT: VertexTable);
	constructor(scene: g.Scene, bulletVT: VertexTable, x: number, y: number, z: number)
	constructor(scene: g.Scene, bulletVT: VertexTable, x?: number, y?: number, z?: number) {
		if (x !== undefined) {
			super(scene, x, y, z);
		} else {
			super(scene);
		}
		this.bullet = new Bullet(this.scene, 0, 0, 0);
		this.bullet.setVT(bulletVT);
		this.bullet.color = '#0000ff';
		this.distance = 0;
		this.appear = false;
		this.free = true;
		this.frame = 0;
		this.patternNum = 0;
		this.speed = 2;
		this.turnRad = 2*3.14159/180;
		this.maxframe = 100;
		this.escapeDist = 300;
		this.shotDist = 200;
		this.shotRad = 15*3.14159/180;
	}
	setAIProps(speed: number, turnRad: number, maxframe: number, escapeDist: number, shotDist: number, shotRad: number) {
		this.speed = speed;
		this.turnRad = turnRad;
		this.maxframe = maxframe;
		this.escapeDist = escapeDist;
		this.shotDist = shotDist;
		this.shotRad = shotRad;
	}
	spawn(camera: Camera) {
    	this.free = true;
        this.frame = 0;
        this.dVec.x = random() * 600 - 300 + camera.dVec.x;
        this.dVec.x += (this.dVec.x / Math.abs(this.dVec.x)) * 50;

        this.dVec.y = 0;
        this.dVec.z = random() * 600 - 300 + camera.dVec.z;
        this.dVec.z += (this.dVec.z / Math.abs(this.dVec.z)) * 50;

        this.appear = true;

		const t = random() * 3.14159 * 2;
        this.rotateY(t);
        this.color = '#' + parseInt((random()*0xffffff).toString()).toString(16);
	}
	onFrame(camera: Camera) {
		const c = camera.dVec.copy();
		c.sub(this.dVec);
		this.distance = c.distance();
		let table: any[] = [];
		if (this.free) {
			if (this.distance < this.shotDist) {
				table = [ 1, 1, 2, 3, 3, 3 ];
			} else if (this.distance <= this.escapeDist) {
				table = [ 0, 0, 1, 1, 2];
			} else {
				table = [ 0, 1 ];
			}
			this.patternNum = table[(random() * table.length) | 0];
			this.free = false;
		}

		const rad = Math.acos(this.f.dotProduct(c) / (1 + this.distance));
		const cross = this.f.x * c.z - this.f.z * c.x;
		switch(this.patternNum) {
			case 0:
				// 索敵
				if (rad >= this.shotRad) {
					if (cross > 0) {
						this.rotateY(-this.turnRad);
					} else {
						this.rotateY(this.turnRad);
					}
				} else {
					this.moveF(this.speed);
				}
				break;
			case 1:
				// 旋回
                    if (rad <= 3.14159 / 2) {
                        if (cross > 0) {
                            this.rotateY(this.turnRad);
                        } else {
                            this.rotateY(-this.turnRad);
                        }
                        this.moveF(this.speed);
                    } else {
                        if (cross > 0) {
                            this.rotateY(-this.turnRad);
                        } else {
                            this.rotateY(this.turnRad);
                        }
                        this.moveF(this.speed);
                    }
                    break;
                case 2:
                    // 回避
                    if (rad <= 3.14159 - this.shotRad) {
                        if (cross > 0) {
                            this.rotateY(this.turnRad);
                        } else {
                            this.rotateY(-this.turnRad);
                        }
                        this.moveF(this.speed);
                    } else {
                        this.moveF(this.speed);
                    }
                    break;
                case 3:
                    // 攻撃 
                    if (rad >= this.shotRad) {
                        if (cross > 0) {
                            this.rotateY(-this.turnRad);
                        } else {
                            this.rotateY(this.turnRad);
                        }
                    } else {
                        this.attack();
                        this.frame = this.maxframe;
                    }
                    break;
                }

                this.frame++;
                if (this.frame > this.maxframe) {
                    this.free = true;
                    this.frame = 0;
                }

				this.modified();
	}
	attack() {
		if (!this.bullet.appear) {
			// no instance
		}
	}
	onHit() {
	    this.appear = false;
	}
}

export class Rader extends g.E {
	_plots: g.FilledRect[];
	_cross: g.FilledRect[];

	constructor(param: g.EParameterObject) {
		super(param);
		const vLine = new Line(this.scene, "white");
		vLine.createLine(24, 0, 24, 48);
		this.append(vLine);
		const hLine = new Line(this.scene, "white");
		hLine.createLine(0, 24, 48, 24);
		this.append(hLine);
		this._plots = [];
	}
	onFrame(camera: Camera, enemies: Tank[]) {
		if (this._plots.length > 0) {
			for (var i = 0; i < this._plots.length; i++) {
				this._plots[i].remove();
				this._plots[i].destroy();
			}
			this._plots = [];
		}
		for (var i = 0, l = enemies.length; i < l; i++) {
	        var x = enemies[i].dVec.dotProduct(camera.r);
            var y = enemies[i].dVec.dotProduct(camera.front);
            x = (x - camera.cv.x) / 450 * 16;
            y = (y - camera.cv.z) / 450 * 16;
            this.plot(x, y);
		}
		this.modified();
	}
	plot(x: number, y: number) {
		const dot = new g.FilledRect({
			scene: this.scene,
			cssColor: "white",
			width: 1,
			height: 1
		})
		dot.x = x + 48;
		dot.y = y + 48 / 2;
		this._plots.push(dot);
		this.append(dot);

	}
}

const random = function() {
    return g.game.random[0].get(0, 99999) / 100000;
}