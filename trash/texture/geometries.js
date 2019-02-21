function cubeGeometry(x, y, z, sx, sy, sz) {
	let popCount = n => {
		let t = 0;
		while (n) {
			t += n & 1;
			n >>= 1;
		}
		return t;
	}
	let x0 = x;
	let y0 = y;
	let z0 = z;
	let x1 = x + sx;
	let y1 = y + sy;
	let z1 = z + sz;
	var points = [];
	var order = [];
	let toPoint = mask => {
		let x = (mask >> 0) & 1;
		let y = (mask >> 1) & 1;
		let z = (mask >> 2) & 1;
		return [
			x*x1 + (1-x)*x0,
			y*y1 + (1-y)*y0,
			z*z1 + (1-z)*z0
		];
	}
	let toColor = mask => {
		let x = (mask >> 0) & 1;
		let y = (mask >> 1) & 1;
		let z = (mask >> 2) & 1;
		return [x, y, z];
	}
	for (let i=0; i<8; ++i) {
		points.push(toPoint(i));
		points.push(toColor(i));
	}
	let matchingBits = (a, b) => (a & b | (~a) & (~b)) & 7;
	for (let i=0; i<8; ++i) {
		for (let j=i+1; j<8; ++j) {
			for (let k=j+1; k<8; ++k) {
				for (let l=k+1; l<8; ++l) {
					let a = matchingBits(i, j);
					let b = matchingBits(j, k);
					let c = matchingBits(k, l);
					let d = matchingBits(l, i);
					let n = popCount(a & b & c & d);
					if (n) {
						order.push(i);
						order.push(j);
						order.push(k);
						order.push(j);
						order.push(k);
						order.push(l);
					}
				}
			}
		}
	}
	var temp = [];
	while (points.length) {
		temp = temp.concat(points.splice(0, 1)[0]);
	}
	return {
		element: new Uint8Array(order),
		attributes: new Float32Array(temp)
	};
}

function squareGeometry(x, y, z, sx, sy) {
	let x0 = x;
	let y0 = y;
	let x1 = x + sx;
	let y1 = y + sy;
	return {
		attributes: new Float32Array([
			x0, y0, z,
			 0,  0, 1,
			 0,  0,
			x1, y0, z,
			 0,  1, 0,
			 1,  0,
			x1, y1, z,
			 1,  0, 0,
			 1,  1,
			x0, y1, z,
			 1,  1, 0,
			 0,  1
		]),
		element: new Uint8Array([0, 1, 2, 0, 2, 3])
	};
}
