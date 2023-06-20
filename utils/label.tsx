type NumberMatrix = number[][];

class UnionFind {
  parent: number[];
  rank: number[];

  constructor(size: number) {
    this.parent = new Array(size);
    this.rank = new Array(size);

    for (let i = 0; i < size; i++) {
      this.parent[i] = i;
      this.rank[i] = 0;
    }
  }

  find(label: number): number {
    if (this.parent[label] !== label) {
      this.parent[label] = this.find(this.parent[label]);
    }
    return this.parent[label];
  }

  union(label1: number, label2: number): void {
    const root1 = this.find(label1);
    const root2 = this.find(label2);

    if (root1 !== root2) {
      if (this.rank[root1] < this.rank[root2]) {
        this.parent[root1] = root2;
      } else if (this.rank[root1] > this.rank[root2]) {
        this.parent[root2] = root1;
      } else {
        this.parent[root2] = root1;
        this.rank[root1]++;
      }
    }
  }
}

export default function label(input: NumberMatrix): [NumberMatrix, number] {
  const rows = input.length;
  const cols = input[0].length;
  const labels: NumberMatrix = [];
  const labelMap = new Map<number, number>();
  const uf = new UnionFind(rows * cols);

  let currentLabel = 1;

  for (let i = 0; i < rows; i++) {
    labels[i] = [];
    for (let j = 0; j < cols; j++) {
      const pixel = input[i][j];

      if (pixel === 0) {
        labels[i][j] = 0;
        continue;
      }

      const neighbors: number[] = [];
      if (i > 0 && input[i - 1][j] === pixel) {
        neighbors.push(labels[i - 1][j]);
      }
      if (j > 0 && input[i][j - 1] === pixel) {
        neighbors.push(labels[i][j - 1]);
      }

      if (neighbors.length === 0) {
        labels[i][j] = currentLabel;
        labelMap.set(currentLabel, currentLabel);
        currentLabel++;
      } else {
        const minNeighbor = Math.min(...neighbors);
        labels[i][j] = minNeighbor;

        for (const neighbor of neighbors) {
          if (neighbor !== minNeighbor) {
            uf.union(minNeighbor, neighbor);
          }
        }
      }
    }
  }

  const visited: boolean[][] = [];
  for (let i = 0; i < rows; i++) {
    visited[i] = new Array(cols).fill(false);
  }

  const queue: [number, number][] = [];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (!visited[i][j] && labels[i][j] !== 0) {
        queue.push([i, j]);
        visited[i][j] = true;

        while (queue.length > 0) {
          const [x, y] = queue.shift()!;
          const currentLabel = labels[x][y];

          if (x > 0 && !visited[x - 1][y] && labels[x - 1][y] === currentLabel) {
            labels[x - 1][y] = currentLabel;
            visited[x - 1][y] = true;
            queue.push([x - 1, y]);
          }

          if (x < rows - 1 && !visited[x + 1][y] && labels[x + 1][y] === currentLabel) {
            labels[x + 1][y] = currentLabel;
            visited[x + 1][y] = true;
            queue.push([x + 1, y]);
          }

          if (y > 0 && !visited[x][y - 1] && labels[x][y - 1] === currentLabel) {
            labels[x][y - 1] = currentLabel;
            visited[x][y - 1] = true;
            queue.push([x, y - 1]);
          }

          if (y < cols - 1 && !visited[x][y + 1] && labels[x][y + 1] === currentLabel) {
            labels[x][y + 1] = currentLabel;
            visited[x][y + 1] = true;
            queue.push([x, y + 1]);
          }
        }
      }
    }
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const label = labels[i][j];
      if (label !== 0) {
        labels[i][j] = uf.find(label) || label;
      }
    }
  }

  const numLabels = new Set(labelMap.values()).size;

  return [
    labels,
    numLabels
  ]
}