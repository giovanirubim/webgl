function strMul(src1, src2) {
	const dst = [];
	const hasSum = str => {
		let stack = 0;
		for (let i=(str[0]==="-")|0; i<str.length; ++i) {
			const chr = str[i];
			if (chr === "(") {
				++ stack;
				continue;
			}
			if (chr === ")") {
				-- stack;
				continue;
			}
			if (stack === 0 && (chr === "-" || chr === "+")) {
				return true;
			}
		}
		return false;
	};
	const isn = a => a[0] === "-";
	const neg = a => {
		if (a[0] == "-") {
			return a.substr(1);
		}
		return "-" + a;
	};
	const sum = (a, b) => {
		if (a === "0") return b;
		if (b === "0") return a;
		if (isn(b)) return a + b;
		if (isn(a)) return b + a;
		return a + "+" + b;
	};
	const mul = (a, b) => {
		if (a === "0" || b === "0") return "0";
		if (a === "1") return b;
		if (b === "1") return a;
		if (isn(a)) return neg(mul(neg(a), b));
		if (isn(b)) return neg(mul(a, neg(b)));
		if (hasSum(a)) {
			a = "(" + a + ")";
		}
		if (hasSum(b)) {
			b = "(" + b + ")";
		}
		return a + "*" + b;
	}
	for (let i=0, c=0; i<4; i++) {
		const a = 4*i;
		for (let j=0; j<4; j++, c++) {
			dst[c] = "0";
			for (let k=0; k<4; k++) {
				dst[c] = sum(dst[c], mul(src1[a + k], src2[4*k + j]));
			}
		}
	}
	return dst;
}

window.onload = _ => {
	const f = s => {
		const r = [];
		for (let i=0; i<16; ++i) {
			r.push(s + "[" + (i<10?" "+i:i) + "]");
		}
		return r;
	};
	const a = f("a");
	const b = f("b");
	let m = strMul(a, b);
	for (let i=4; i<16; ++i) {
		m[i] = "0";
	}
	let c = f("c");
	c.forEach((x, i) => {
		c[i] = x + " = " + m[i] + ";";
	});
	document.body.innerHTML = c.join("<br>");
}

const mulMatMat = (a, b, c) => {
	c[ 0] = a[ 0]*b[0] + a[ 1]*b[ 4] + a[ 2]*b[ 8] + a[ 3]*b[12];
	c[ 1] = a[ 0]*b[1] + a[ 1]*b[ 5] + a[ 2]*b[ 9] + a[ 3]*b[13];
	c[ 2] = a[ 0]*b[2] + a[ 1]*b[ 6] + a[ 2]*b[10] + a[ 3]*b[14];
	c[ 3] = a[ 0]*b[3] + a[ 1]*b[ 7] + a[ 2]*b[11] + a[ 3]*b[15];
	c[ 4] = a[ 4]*b[0] + a[ 5]*b[ 4] + a[ 6]*b[ 8] + a[ 7]*b[12];
	c[ 5] = a[ 4]*b[1] + a[ 5]*b[ 5] + a[ 6]*b[ 9] + a[ 7]*b[13];
	c[ 6] = a[ 4]*b[2] + a[ 5]*b[ 6] + a[ 6]*b[10] + a[ 7]*b[14];
	c[ 7] = a[ 4]*b[3] + a[ 5]*b[ 7] + a[ 6]*b[11] + a[ 7]*b[15];
	c[ 8] = a[ 8]*b[0] + a[ 9]*b[ 4] + a[10]*b[ 8] + a[11]*b[12];
	c[ 9] = a[ 8]*b[1] + a[ 9]*b[ 5] + a[10]*b[ 9] + a[11]*b[13];
	c[10] = a[ 8]*b[2] + a[ 9]*b[ 6] + a[10]*b[10] + a[11]*b[14];
	c[11] = a[ 8]*b[3] + a[ 9]*b[ 7] + a[10]*b[11] + a[11]*b[15];
	c[12] = a[12]*b[0] + a[13]*b[ 4] + a[14]*b[ 8] + a[15]*b[12];
	c[13] = a[12]*b[1] + a[13]*b[ 5] + a[14]*b[ 9] + a[15]*b[13];
	c[14] = a[12]*b[2] + a[13]*b[ 6] + a[14]*b[10] + a[15]*b[14];
	c[15] = a[12]*b[3] + a[13]*b[ 7] + a[14]*b[11] + a[15]*b[15];
};

const mulMatVec = (a, b, c) => {
	c[0] = a[ 0]*b[0] + a[ 1]*b[4] + a[ 2]*b[8] + a[ 3]*b[12];
	c[1] = a[ 4]*b[0] + a[ 5]*b[4] + a[ 6]*b[8] + a[ 7]*b[12];
	c[2] = a[ 8]*b[0] + a[ 9]*b[4] + a[10]*b[8] + a[11]*b[12];
	c[3] = a[12]*b[0] + a[13]*b[4] + a[14]*b[8] + a[15]*b[12];
};
const mulVecMat = (a, b, c) => {
	c[0] = a[0]*b[0] + a[1]*b[4] + a[2]*b[ 8] + a[3]*b[12];
	c[1] = a[0]*b[1] + a[1]*b[5] + a[2]*b[ 9] + a[3]*b[13];
	c[2] = a[0]*b[2] + a[1]*b[6] + a[2]*b[10] + a[3]*b[14];
	c[3] = a[0]*b[3] + a[1]*b[7] + a[2]*b[11] + a[3]*b[15];
};

class Mat4 {
	constructor() {
		const blob = new ArrayBuffer(0x80);
		this.blob = blob;
		this.array1 = new Float32Array(blob, 0x00, 0x10);
		this.array2 = new Float32Array(blob, 0x40, 0x10);
	}
	mul(other) {
		if (other instanceof Mat4) {
			const {array1, array2} = this;
			mulMatMat(array1, other.array1, array2);
			this.array1 = array2;
			this.array2 = array1;
		} else {
			const {array1, array2} = other;
			mulMatVec(this.array1, array1, array2);
			other.array1 = array2;
			other.array2 = array1;
		}
		return this;
	}
	get s() {
		let str = "";
		const col_size = new Array(4).fill(0);
		for (let i=0; i<4; ++i) {
			for (let j=0; j<4; ++j) {
			}
		}
	}
}

class Vec4 {
	constructor() {
		const blob = new ArrayBuffer(0x20);
		this.blob = blob;
		this.array1 = new Float32Array(blob, 0x00, 0x04);
		this.array2 = new Float32Array(blob, 0x10, 0x04);
	}
	xyzLen() {
		const [x, y, z] = this.array1;
		return Math.sqrt(x*x + y*y + z*z);
	}
}

const recPush = (a, e) => {
	if (e != null && e.array1 !== undefined) {
		e = e.array1;
	}
	if (e != null && e.length !== undefined) {
		const n = e.length;
		for (let i=0; i<n; ++i) {
			recPush(a, e[i]);
		}
	} else {
		a.push(e);
	}
	return a;
};

function fastConstructor(type, args) {
	const m = new type();
	const array = [];
	recPush(array, args);
	for (let i=array.length; i--;) {
		m.array1[i] = array[i];
	}
	return m;
}

function mat4() {
	return fastConstructor(Mat4, arguments);
}

function vec4() {
	return fastConstructor(Vec4, arguments);
}