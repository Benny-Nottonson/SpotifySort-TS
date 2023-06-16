import { reshape, zeros, max, multiply, matrix, Matrix } from "mathjs";

/**
 * """Module for processing images and colors"""
from io import BytesIO
from functools import cache
from numpy import (
    sum as numpy_sum,
    abs as numpy_abs,
    ndarray,
    array,
    max as numpy_max,
    bincount,
    count_nonzero,
    argmin,
    empty,
    dot,
)
from PIL import Image
from skimage.measure import label
from cv2 import cvtColor, resize, COLOR_RGB2BGR
from spotify_api import public_get as client_get


def get_image_from_url(url: str) -> ndarray:
    """Gets an image from a URL and converts it to BGR"""
    response_data = client_get(url, timeout=5)
    pil_image: Image = Image.open(BytesIO(response_data.content))
    bgr_image: ndarray = cvtColor(array(pil_image), COLOR_RGB2BGR)
    resized_image: ndarray = resize(bgr_image, (16, 16))
    return resized_image


def rgb_image_to_mac(img: ndarray) -> ndarray:
    """Converts an RGB image to a MAC image"""
    flattened_pixels: ndarray = img.reshape(-1, 3)
    macbeth_indices: ndarray = empty(flattened_pixels.shape[0], dtype="uint8")
    for i, pixel in enumerate(flattened_pixels):
        macbeth_indices[i] = find_minimum_macbeth(tuple(pixel), lab_distance_3d)
    mac_image: ndarray = macbeth_indices.reshape(img.shape[:2])
    return mac_image


def blob_extract(mac_image: ndarray) -> tuple[int, ndarray]:
    """Extracts blobs from a MAC image"""
    blob: ndarray = label(mac_image, connectivity=1) + 1
    n_blobs: int = numpy_max(blob)
    if n_blobs > 1:
        count: ndarray = bincount(blob.ravel(), minlength=n_blobs + 1)[2:]
        n_blobs += count_nonzero(count > 1)
    return n_blobs, blob


@cache
def find_minimum_macbeth(bgr_color: tuple[int, int, int], func: callable) -> int:
    """Finds the minimum Macbeth color for a given RGB color"""
    macbeth_colors = [
        [115, 82, 68], [194, 150, 130], [98, 122, 157], [87, 108, 67], [133, 128, 177],
        [103, 189, 170], [214, 126, 44], [80, 91, 166], [193, 90, 99], [94, 60, 108],
        [157, 188, 64], [224, 163, 46], [56, 61, 150], [70, 148, 73], [175, 54, 60],
        [231, 199, 31], [187, 86, 149], [8, 133, 161], [243, 243, 242], [200, 200, 200],
        [160, 160, 160], [122, 122, 121], [85, 85, 85], [52, 52, 52]
    ]
    color_distances = array([func(bgr_color, tuple(macbeth_color))
                             for macbeth_color in macbeth_colors])
    return argmin(color_distances)


@cache
def bgr_to_lab(bgr_color: tuple[int, int, int]) -> tuple:
    """Converts a BGR color to a CIELAB color"""
    bgr_color: ndarray = array(bgr_color, dtype=float) / 255.0
    bgr_color: ndarray = _bgr_to_xyz(bgr_color)
    lab_color: tuple = _xyz_to_lab(bgr_color)
    return lab_color


def lab_distance_3d(bgr_one: tuple[int, int, int], bgr_two: tuple[int, int, int]) -> float:
    """Estimates the distance between two BGR colors in LAB space"""
    l_one, a_one, b_one = bgr_to_lab(bgr_one)
    l_two, a_two, b_two = bgr_to_lab(bgr_two)
    return abs(l_one - l_two) + abs(a_one - a_two) + abs(b_one - b_two)


def ccv(image_url: str) -> tuple:
    """Calculates the Color Coherence Vector of an image"""
    bgr_image = get_image_from_url(image_url)
    size_threshold = round(0.01 * bgr_image.shape[0] * bgr_image.shape[1])
    macbeth_image = rgb_image_to_mac(bgr_image)
    n_blobs, blob = blob_extract(array(macbeth_image))
    table = [
        [macbeth_image[i][j], table[blob[i][j] - 1][1] + 1] if blob[i][j] != 0 else [0, 0]
        for i in range(blob.shape[0])
        for j in range(blob.shape[1])
        for table in [[[0, 0] for _ in range(0, n_blobs)]]
    ]
    color_coherence_vector = [(0, 0) for _ in range(24)]
    for color_index, size in ((entry[0], entry[1]) for entry in table):
        color_coherence_vector[color_index] = (
            color_coherence_vector[color_index][0] + size * (size >= size_threshold),
            color_coherence_vector[color_index][1] + size * (size < size_threshold),
        )
    return tuple(color_coherence_vector)


@cache
def ccv_distance(ccv_one: tuple, ccv_two: tuple) -> float:
    """Calculates the distance between two CCV vectors"""
    ccv_one, ccv_two = array(ccv_one), array(ccv_two)
    return numpy_sum(
        [3 * numpy_abs(ccv_one[:, 0] - ccv_two[:, 0]) + numpy_abs(ccv_one[:, 1] - ccv_two[:, 1])]
    )


def _bgr_to_xyz(normalized_bgr: ndarray) -> ndarray:
    """Converts a BGR color to a CIE XYZ color"""
    mask: ndarray = normalized_bgr > 0.04045
    normalized_bgr[mask] = ((normalized_bgr[mask] + 0.055) / 1.055) ** 2.4
    normalized_bgr[~mask] /= 12.92
    xyz_to_bgr_matrix: ndarray = array(
        [[0.1805, 0.3576, 0.4124], [0.0722, 0.7152, 0.2126], [0.9505, 0.1192, 0.0193]]
    )
    xyz_color: ndarray = dot(xyz_to_bgr_matrix, normalized_bgr)
    return xyz_color


def _xyz_to_lab(xyz: ndarray) -> tuple:
    """Converts a CIE XYZ color to a CIELAB color"""
    xyz_n_reference: ndarray = array([0.95047, 1.0, 1.08883])
    xyz_normalized: ndarray = (xyz / xyz_n_reference) ** (1 / 3)
    mask: ndarray = xyz_normalized <= 0.008856
    xyz_normalized[mask] = (7.787 * xyz_normalized[mask]) + (16 / 116)
    lab_color: tuple = (
        116 * xyz_normalized[1] - 16,
        500 * (xyz_normalized[0] - xyz_normalized[1]),
        200 * (xyz_normalized[1] - xyz_normalized[2]),
    )
    return lab_color
 */

function rgbImageToMac(img: Matrix): Matrix {
	const flattenedPixels = reshape(img, [-1, 3]);
	const macbethIndicesArray: number[] = [];
	for (let i = 0; i < flattenedPixels.size()[0]; i++) {
		const pixel = flattenedPixels.get([i, 0]);
		macbethIndicesArray.push(findMinimumMacbeth(pixel, labDistance3d));
	}
	const width = img.size().slice(0, 2);
	const macImage = matrix(macbethIndicesArray).resize([width, width]);
	return macImage;
}

function bgrToLab(bgrColor: [number, number, number]): number[] {
	let bgrColorNormalized = Array.from(bgrColor, (x) => x / 255);
	bgrColorNormalized = bgrToXyz(bgrColorNormalized);
	const labColor = xyzToLab(bgrColorNormalized);
	return labColor;
}

function bgrToXyz(normalizedBgr: any): any {
	const mask = normalizedBgr.map((value: number) => value > 0.04045);
	const maskNegated = mask.map((value: boolean) => !value);

	normalizedBgr = normalizedBgr.map((value: number, index: number) =>
		maskNegated[index] ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
	);

	const xyzToBgrMatrix = [
		[0.1805, 0.3576, 0.4124],
		[0.0722, 0.7152, 0.2126],
		[0.9505, 0.1192, 0.0193],
	];

	const xyzColor = multiply(
		xyzToBgrMatrix,
		matrix(normalizedBgr).resize([3, 1]),
	);
	return xyzColor;
}

function xyzToLab(xyz: any): number[] {
	const xyzNReference = [0.95047, 1.0, 1.08883];
	const xyzNormalized = xyz
		.map((value: number, index: number) => value / xyzNReference[index])
		.map((value: number) => value ** (1 / 3));

	const mask = xyzNormalized.map((value: number) => value <= 0.008856);
	xyzNormalized.forEach((value: number, index: number) => {
		if (mask[index]) {
			xyzNormalized[index] = 7.787 * value + 16 / 116;
		}
	});

	const labColor = [
		116 * xyzNormalized[1] - 16,
		500 * (xyzNormalized[0] - xyzNormalized[1]),
		200 * (xyzNormalized[1] - xyzNormalized[2]),
	];
	return labColor;
}

function labDistance3d(
	bgrOne: [number, number, number],
	bgrTwo: [number, number, number],
): number {
	const [lOne, aOne, bOne] = bgrToLab(bgrOne);
	const [lTwo, aTwo, bTwo] = bgrToLab(bgrTwo);
	return Math.abs(lOne - lTwo) + Math.abs(aOne - aTwo) + Math.abs(bOne - bTwo);
}
function bincount(
	data: any[],
	weights: any[] | null,
	minlength: number,
): any[] {
	const result: any[] = new Array(minlength).fill(0);

	if (weights) {
		for (let i = 0; i < data.length; i++) {
			const index = data[i];
			if (index >= 0 && index < result.length) {
				result[index] += weights[i];
			}
		}
	} else {
		for (let i = 0; i < data.length; i++) {
			const index = data[i];
			if (index >= 0 && index < result.length) {
				result[index]++;
			}
		}
	}

	return result;
}

function nonzero(array: any[]): any[] {
	const indices: any[] = [];

	for (let i = 0; i < array.length; i++) {
		if (array[i] !== 0) {
			indices.push(i);
		}
	}

	return indices;
}

function label(matrix: number[][]): number[][] {
	const rows = matrix.length;
	const cols = matrix[0].length;

	const labeledMatrix: number[][] = [];
	const equivalences = new Map();

	let labelCount = 0;

	for (let i = 0; i < rows; i++) {
		labeledMatrix.push(new Array(cols).fill(0));
	}

	function getLabel(equivalence: Map<number, number>, label: number): number {
		while (equivalence.has(label) && equivalence.get(label) !== label) {
			const nLabel = equivalence.get(label);
            if (nLabel !== undefined) {
                label = nLabel;
            }
		}
		return label;
	}

	function setLabel(
		equivalence: Map<number, number>,
		label: number,
		newLabel: number,
	): void {
		while (equivalence.has(label) && equivalence.get(label) !== label) {
			const temp = label;
			const nLabel = equivalence.get(label);
            if (nLabel !== undefined) {
                label = nLabel;
            }
			equivalence.set(temp, newLabel);
		}
		equivalence.set(label, newLabel);
	}

	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			if (matrix[i][j] !== 0) {
				const neighbors: number[] = [];
				if (i > 0 && labeledMatrix[i - 1][j] !== 0) {
					neighbors.push(labeledMatrix[i - 1][j]);
				}
				if (j > 0 && labeledMatrix[i][j - 1] !== 0) {
					neighbors.push(labeledMatrix[i][j - 1]);
				}

				if (neighbors.length === 0) {
					labelCount++;
					labeledMatrix[i][j] = labelCount;
				} else {
					const minNeighborLabel = Math.min(...neighbors);
					labeledMatrix[i][j] = minNeighborLabel;
					for (const neighborLabel of neighbors) {
						setLabel(equivalences, neighborLabel, minNeighborLabel);
					}
				}
			}
		}
	}

	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			if (labeledMatrix[i][j] !== 0) {
				labeledMatrix[i][j] = getLabel(equivalences, labeledMatrix[i][j]);
			}
		}
	}

	return labeledMatrix;
}

function blobExtract(macImage: number[][]): [number, number[][]] {
	const labeledMatrix: number[][] = label(macImage).map((row) =>
		row.map((value) => value + 1),
	);
	let nBlobs: number = Math.max(...labeledMatrix.flat());
	if (nBlobs > 1) {
		const count: number[] = bincount(
			labeledMatrix.flat(),
			null,
			nBlobs + 1,
		).slice(2);
		nBlobs += count.filter((c) => c > 1).length;
	}
	return [nBlobs, labeledMatrix];
}

function findMinimumMacbeth(
	bgrColor: [number, number, number],
	func: Function,
): number {
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
		func(bgrColor, macbethColor),
	);
	return argmin(colorDistances);
}

export default async function getCCV(url: string, imageSize: number) {
	const image = await getImageFromUrl(url, imageSize);
	const sizeThreshold = Math.round(0.01 * imageSize * imageSize);
	const imageArray = Array.from(image);
	const imageMatrix = matrix(imageArray);
	const macbethImage = rgbImageToMac(imageMatrix);
	const [nBlobs, blob] = blobExtract(macbethImage);

	const table: [number, number][] = [];
	for (let i = 0; i < blob.shape[0]; i++) {
		for (let j = 0; j < blob.shape[1]; j++) {
			const entry = blob[i][j];
			const colorIndex = entry !== 0 ? macbethImage[i][j] : 0;
			const size = entry !== 0 ? table[entry - 1][1] + 1 : 0;
			table.push([colorIndex, size]);
		}
	}

	const colorCoherenceVector: [number, number][] = Array.from(
		{ length: 24 },
		() => [0, 0],
	);
	for (const [colorIndex, size] of table) {
		const index = colorIndex - 1;
		colorCoherenceVector[index] = [
			colorCoherenceVector[index][0] + size * (size >= sizeThreshold),
			colorCoherenceVector[index][1] + size * (size < sizeThreshold),
		];
	}

	return image;
}

async function getImageFromUrl(url: string, imageSize: number) {
	const response = await fetch(url);
	const arrayBuffer = await response.arrayBuffer();
	const imageBytes = new Uint8Array(arrayBuffer);

	const resizedImageBytes = resizeImage(imageBytes, imageSize);
	const bgrImageBytes = convertToBGR(resizedImageBytes);

	return bgrImageBytes;
}

function argmin(array: number[]): number {
	let minIndex = 0;
	let minValue = array[0];

	for (let i = 1; i < array.length; i++) {
		if (array[i] < minValue) {
			minIndex = i;
			minValue = array[i];
		}
	}

	return minIndex;
}

function resizeImage(imageBytes: Uint8Array, imageSize: number): Uint8Array {
	const imageWidth = Math.floor(Math.sqrt(imageBytes.length / 3));
	const imageHeight = imageWidth;

	const targetSize = Math.min(imageSize, imageWidth, imageHeight);

	const widthRatio = imageWidth / targetSize;
	const heightRatio = imageHeight / targetSize;

	const resizedWidth = Math.floor(imageWidth / widthRatio);
	const resizedHeight = Math.floor(imageHeight / heightRatio);

	const resizedImageBytes = new Uint8Array(targetSize * targetSize * 3);

	for (let y = 0; y < resizedHeight; y++) {
		for (let x = 0; x < resizedWidth; x++) {
			const sourceX = Math.floor(x * widthRatio);
			const sourceY = Math.floor(y * heightRatio);

			const targetIndex = (y * resizedWidth + x) * 3;
			const sourceIndex = (sourceY * imageWidth + sourceX) * 3;

			resizedImageBytes[targetIndex] = imageBytes[sourceIndex];
			resizedImageBytes[targetIndex + 1] = imageBytes[sourceIndex + 1];
			resizedImageBytes[targetIndex + 2] = imageBytes[sourceIndex + 2];
		}
	}

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
