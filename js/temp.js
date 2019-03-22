function inverseMatrix(src, n, dst, aux) {
	aux = aux || [];
	const l = src.length;
	const d = n + 1;
	for (let i=0; i<l; i++) {
		aux[i] = src[i];
		dst[i] = 0 | (i%d===0);
	}
	for (let i=0, a=0; i<n; i++, a+=n) {
		let b = a + i;
		let c = aux[b];
		if (c === 0) {
			for (let j=b+n; j<l; j+=n) {
				if (aux[j] !== 0) {
					for (let k=a, l=j-i, end=k+n; k<end; ++k, ++l) {
						c = aux[k];
						aux[k] = aux[l];
						aux[l] = c;
						c = dst[k];
						dst[k] = dst[l];
						dst[l] = c;
					}
					break;
				}
			}
			c = aux[b];
			if (c === 0) {
				return false;
			}
		}
		const m = 1/c;
		for (let j=a+n; --j>=a;) {
			aux[j] *= m;
			dst[j] *= m;
		}
		for (let j=0, c=0; j<n; j++, c+=n) {
			if (j === i) {
				continue;
			}
			const d = aux[c + i];
			for (let k=c, j=a, end=k+n; k<end; ++k, ++j) {
				aux[k] -= d*aux[j];
				dst[k] -= d*dst[j];
			}
		}
	}
	return dst;
}

var kfsdhafd = [94, 30, 65, 28, 21, 78, 46, 66, 16, 77, 68, 17, 19, 27, 25, 14];
var dfksjfsa = [];
inverseMatrix(kfsdhafd, 4, dfksjfsa);
var jfdhkjas = [-0.02600753552391002, -0.03082369375585856, -0.048476382273951846, 0.25619094865809483, -0.060783092993874036, -0.043561849056232525, -0.05893504861832334, 0.3984931762893798, 0.06650851716573232, 0.04537616486523327, 0.08668241603343627, -0.4521904595938799, 0.03375526833182725, 0.04481542744633995, 0.024659798218850625, -0.23729873531929005];
console.clear();
console.log("dfksjfsa = [" + dfksjfsa.join(", ") + "]");
console.log("jfdhkjas = [" + jfdhkjas.join(", ") + "]");
console.log(dfksjfsa.join(", ")===jfdhkjas.join(", "))