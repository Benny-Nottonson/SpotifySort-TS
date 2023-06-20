import prepImage from "./imagePreprocess";

export default async function getCCV(imageUrl: string, imageSize: number): Promise<number[][]> {
  const preppedData = await prepImage(imageUrl, imageSize);
  const height = preppedData.length;
  const width = preppedData[0].length;
  const threshold = Math.round(height * width * 0.05);
  const { connectedComponents, coherencePairs } = computeConnectedComponents(preppedData, threshold);
  const colorCoherenceVector = computeColorCoherenceVector(coherencePairs);
  return colorCoherenceVector;
}

function computeConnectedComponents(data: number[][], threshold: number): {
  connectedComponents: number[][],
  coherencePairs: { [key: number]: { alpha: number, beta: number, color: number } }
} {
  const height = data.length;
  const width = data[0].length;
  const visited: boolean[][] = [];
  const connectedComponents: number[][] = [];
  const coherencePairs: { [key: number]: { alpha: number, beta: number, color: number } } = {};

  for (let y = 0; y < height; y++) {
    visited[y] = [];
    connectedComponents[y] = [];
    for (let x = 0; x < width; x++) {
      visited[y][x] = false;
      connectedComponents[y][x] = -1;
    }
  }

  let componentLabel = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!visited[y][x]) {
        const color = data[y][x];
        const { componentSize, coherentSize } = exploreConnectedComponent(data, visited, connectedComponents, x, y, color, threshold);
        coherencePairs[componentLabel] = { alpha: coherentSize, beta: componentSize - coherentSize, color: color };
        componentLabel++;
      }
    }
  }

  return { connectedComponents, coherencePairs };
}

function exploreConnectedComponent(
  data: number[][],
  visited: boolean[][],
  connectedComponents: number[][],
  x: number,
  y: number,
  color: number,
  threshold: number
): { componentSize: number, coherentSize: number } {
  const height = data.length;
  const width = data[0].length;
  const queue: [number, number][] = [[x, y]];
  let componentSize = 0;
  let coherentSize = 0;

  while (queue.length > 0) {
    const [currentX, currentY] = queue.shift()!;
    visited[currentY][currentX] = true;
    connectedComponents[currentY][currentX] = color;
    componentSize++;

    const neighbors = getNeighbors(currentX, currentY, width, height);
    for (const [nx, ny] of neighbors) {
      if (!visited[ny][nx] && data[ny][nx] === color) {
        visited[ny][nx] = true;
        connectedComponents[ny][nx] = color;
        queue.push([nx, ny]);
        coherentSize++;
      }
    }
  }

  if (componentSize < threshold) {
    coherentSize = 0;
  }

  return { componentSize, coherentSize };
}

function getNeighbors(x: number, y: number, width: number, height: number): [number, number][] {
  const neighbors: [number, number][] = [];

  for (let ny = Math.max(y - 1, 0); ny <= Math.min(y + 1, height - 1); ny++) {
    for (let nx = Math.max(x - 1, 0); nx <= Math.min(x + 1, width - 1); nx++) {
      if (nx !== x || ny !== y) {
        neighbors.push([nx, ny]);
      }
    }
  }

  return neighbors;
}

function computeColorCoherenceVector(coherencePairs: { [key: number]: { alpha: number, beta: number, color: number } }): number[][] {
  const numColors = 24;
  const colorCoherenceVector: number[][] = new Array(numColors);
  for (const componentLabel in coherencePairs) {
    const { alpha, beta, color } = coherencePairs[componentLabel];
    if (!colorCoherenceVector[color]) {
      colorCoherenceVector[color] = [0, 0];
    }
    colorCoherenceVector[color][0] += alpha;
    colorCoherenceVector[color][1] += beta;
  }
  return colorCoherenceVector;
}

export function ccvDistance(ccvOne: number[][], ccvTwo: number[][]): number {
  const numBuckets = Math.max(ccvOne.length, ccvTwo.length);
  let deltaH = 0;
  let deltaG = 0;

  for (let j = 0; j < numBuckets; j++) {
    const alphaOne = ccvOne[j]?.[0] || 0;
    const betaOne = ccvOne[j]?.[1] || 0;
    const alphaTwo = ccvTwo[j]?.[0] || 0;
    const betaTwo = ccvTwo[j]?.[1] || 0;

    deltaH += Math.abs(alphaOne + betaOne - alphaTwo - betaTwo);
    deltaG += Math.abs(alphaOne - alphaTwo) + Math.abs(betaOne - betaTwo);
  }

  return deltaG;
}
