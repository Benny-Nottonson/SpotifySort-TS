import label from "./label";

const macbethCache = new Map<number[], number>();

export default async function getCCV(imageUrl: string, imageSize: number) {
	const bgrImageBytes: Array<Array<Array<number>>> = await getImageFromUrl(
		imageUrl,
		imageSize,
	);
	const sizeThreshold: number = Math.round(0.01 * imageSize * imageSize) * 2;
	const macbethImage: Array<Array<number>> = bgrImageToMac(bgrImageBytes);
	const [nBlobs, blob]: [number, number[][]] = blobExtract(macbethImage);
	const table: Array<Array<[number, number]>> = new Array<
		Array<[number, number]>
	>(blob.length)
		.fill([])
		.map(() => new Array<[number, number]>(nBlobs).fill([0, 0]));
	for (let i = 0; i < blob.length; i++) {
		for (let j = 0; j < blob[0].length; j++) {
			const isNonZero = blob[i][j] !== 0;
			const macbethValue = macbethImage[i][j];

			if (isNonZero && blob[i][j] <= nBlobs) {
				const previousValue = table[i][blob[i][j] - 1][1];
				table[i][j] = [macbethValue, previousValue + 1];
			} else {
				table[i][j] = [0, 0];
			}
		}
	}
	const colorCoherenceVector: Array<[number, number]> = Array(24).fill([0, 0]);
	for (let i = 0; i < table.length; i++) {
		for (let j = 0; j < table[0].length; j++) {
			const colorIndex = table[i][j][0];
			const size = table[i][j][1];
			const isSizeAboveThreshold = size >= sizeThreshold;
			const isSizeBelowThreshold = size < sizeThreshold;
			colorCoherenceVector[colorIndex] = [
				colorCoherenceVector[colorIndex][0] +
					size * (isSizeAboveThreshold ? 1 : 0),
				colorCoherenceVector[colorIndex][1] +
					size * (isSizeBelowThreshold ? 1 : 0),
			];
		}
	}
	return colorCoherenceVector;
}

function blobExtract(macbethImage: number[][]): [number, number[][]] {
	const [blob] = label(macbethImage);
	const incrementedBlob = blob.map((row) => row.map((element) => element + 1));
	let nBlobs = Math.max(...blob.flat());
	if (nBlobs > 1) {
		const count = new Array<number>(nBlobs + 1).fill(0);
		for (const row of incrementedBlob) {
			for (const element of row) {
				count[element]++;
			}
		}
		nBlobs += count.filter((value) => value > 1).length;
	}
	return [nBlobs, incrementedBlob];
}

function xyzToLab(xyz: Array<number>): Array<number> {
	const xyzNReference = [0.95047, 1.0, 1.08883];
	const xyzNormalized = xyz.map(
		(color, index) => color / xyzNReference[index] ** (1 / 3),
	);
	const mask = xyzNormalized.map((color) => color <= 0.008856);
	xyzNormalized.map((color, index) => {
		if (mask[index]) {
			return 7.787 * color + 16 / 116;
		}
		return color;
	});
	const labColor = [
		116 * xyzNormalized[1] - 16,
		500 * (xyzNormalized[0] - xyzNormalized[1]),
		200 * (xyzNormalized[1] - xyzNormalized[2]),
	];
	return labColor;
}

function bgrToXyz(bgr: Array<number>): Array<number> {
	const mask = bgr.map((color) => color > 0.04045);
	const normalizedBgr = bgr.map((color, index) => {
		if (mask[index]) {
			return ((color + 0.055) / 1.055) ** 2.4;
		}
		return color / 12.92;
	});
	const xyzToBgrMatrix = [
		[0.1805, 0.3576, 0.4124],
		[0.0722, 0.7152, 0.2126],
		[0.9505, 0.1192, 0.0193],
	];
	const xyzColor = xyzToBgrMatrix.map((row) => {
		return row.reduce(
			(sum, value, index) => sum + value * normalizedBgr[index],
			0,
		);
	});
	return xyzColor;
}

function bgrToLab(bgr: Array<number>): Array<number> {
	const bgrColor = bgr.map((color) => color / 255.0);
	const xyzColor = bgrToXyz(bgrColor);
	const labColor = xyzToLab(xyzColor);
	return labColor;
}

function labDistance3d(bgr1: Array<number>, bgr2: Array<number>): number {
	const [l1, a1, b1] = bgrToLab(bgr1);
	const [l2, a2, b2] = bgrToLab(bgr2);
	return Math.abs(l1 - l2) + Math.abs(a1 - a2) + Math.abs(b1 - b2);
}

function findMinimumMacbeth(
	pixel: Array<number>,
	distanceFunction: Function,
): number {
	if (macbethCache.has(pixel)) {
		const result = macbethCache.get(pixel);
		if (result) {
			return result;
		}
	}
	const macbethColors = [
		[115, 82, 68],
		[194, 150, 130],
		[98, 122, 157],
		[87, 108, 67],
		[133, 128, 177],
		[103, 189, 170],
		[214, 126, 44],
		[80, 91, 166],
		[193, 90, 99],
		[94, 60, 108],
		[157, 188, 64],
		[224, 163, 46],
		[56, 61, 150],
		[70, 148, 73],
		[175, 54, 60],
		[231, 199, 31],
		[187, 86, 149],
		[8, 133, 161],
		[243, 243, 242],
		[200, 200, 200],
		[160, 160, 160],
		[122, 122, 121],
		[85, 85, 85],
		[52, 52, 52],
	];
	const colorDistances = macbethColors.map((macbethColor) =>
		distanceFunction(pixel, macbethColor),
	);
	const result = colorDistances.indexOf(Math.min(...colorDistances));
	macbethCache.set(pixel, result);
	return result;
}

function bgrImageToMac(
	bgrImageBytes: Array<Array<Array<number>>>,
): Array<Array<number>> {
	const flattenedPixels = bgrImageBytes.flat(1);
	const macbethIndices = new Uint8Array(flattenedPixels.length);
	for (let i = 0; i < flattenedPixels.length; i++) {
		macbethIndices[i] = findMinimumMacbeth(flattenedPixels[i], labDistance3d);
	}
	const macImage = new Array<Array<number>>(bgrImageBytes.length);
	for (let i = 0; i < bgrImageBytes.length; i++) {
		macImage[i] = new Array<number>(bgrImageBytes[i].length);
		for (let j = 0; j < bgrImageBytes[i].length; j++) {
			macImage[i][j] = macbethIndices[i * bgrImageBytes.length + j];
		}
	}
	return macImage;
}

async function getImageFromUrl(url: string, imageSize: number) {
	const response = await fetch(url);
	const arrayBuffer = await response.arrayBuffer();
	const imageBytes = new Uint8Array(arrayBuffer);
	const resizedImageBytes = resizeImage(imageBytes, imageSize);
	const bgrImageBytes = convertToBGR(resizedImageBytes);
	const pixels: Array<Array<Array<number>>> = [];
	for (let i = 0; i < imageSize; i++) {
		const pixel = [];
		for (let j = 0; j < imageSize; j++) {
			const index = (i * imageSize + j) * 3;
			pixel.push([
				bgrImageBytes[index],
				bgrImageBytes[index + 1],
				bgrImageBytes[index + 2],
			]);
		}
		pixels.push(pixel);
	}
	return pixels;
}

function resizeImage(imageBytes: Uint8Array, imageSize: number): Uint8Array {
	const imageDataSize = imageSize * imageSize * 4;
	const imageData = new Uint8ClampedArray(imageDataSize);
	for (let i = 0; i < imageSize * imageSize; i++) {
		const srcOffset = i * 3;
		const destOffset = i * 4;
		imageData[destOffset] = imageBytes[srcOffset];
		imageData[destOffset + 1] = imageBytes[srcOffset + 1];
		imageData[destOffset + 2] = imageBytes[srcOffset + 2];
		imageData[destOffset + 3] = 255;
	}
	const canvas = document.createElement("canvas");
	canvas.width = imageSize;
	canvas.height = imageSize;
	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("Could not get canvas context");
	}
	context.putImageData(new ImageData(imageData, imageSize, imageSize), 0, 0);
	const resizedImageData = context.getImageData(0, 0, imageSize, imageSize);
	const resizedImageBytes = new Uint8Array(resizedImageData.data);
	return resizedImageBytes;
}

function convertToBGR(imageBytes: Uint8Array): Uint8Array {
	const bgrImageBytes = new Uint8Array(imageBytes.length);
	for (let i = 0; i < imageBytes.length; i += 3) {
		const red = imageBytes[i];
		const green = imageBytes[i + 1];
		const blue = imageBytes[i + 2];
		bgrImageBytes[i] = blue;
		bgrImageBytes[i + 1] = green;
		bgrImageBytes[i + 2] = red;
	}
	return bgrImageBytes;
}

export function ccvDistance(ccvOne: number[], ccvTwo: number[]): number {
	if (ccvOne.length !== ccvTwo.length) {
		return Infinity;
	}
	const ccvOneArray = new Array<number>();
	for (let i = 0; i < ccvOne.length; i++) {
		ccvOneArray.push(
			3 * Math.abs(ccvOne[0] - ccvTwo[0]) +
				Math.abs(ccvOne[1] - ccvTwo[1]),
		);
	}
	const dist = ccvOneArray.reduce((a, b) => a + b, 0);
	return dist;
}
