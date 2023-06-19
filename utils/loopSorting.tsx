import Deque from "double-ended-queue";

function rotate(deq: Deque<[string, Array<Array<number>>]>, n: number): void {
	if (n > 0) {
		for (let i = 0; i < n; i++) {
			deq.insertBack(deq.removeFront() || ["", []]);
		}
	} else if (n < 0) {
		for (let i = 0; i < n; i++) {
			deq.insertFront(deq.removeBack() || ["", []]);
		}
	}
}

function moveEntry(
	/**def move_entry(loop: deque[tuple[int, int, int]],
               moving_loop_entry: tuple[int, int, int],
               distance_matrix: ndarray) -> deque[tuple[int, int, int]]:
    """Moves the entry with the least average distance to the front of the loop"""
    behind_indices = array([loop[i - 1][0] for i in range(1, len(loop) - 1)])
    ahead_indices = array([loop[i + 1][0] for i in range(len(loop) - 2)])
    behind_distances = distance_matrix[behind_indices, moving_loop_entry[0]]
    ahead_distances = distance_matrix[ahead_indices, moving_loop_entry[0]]
    avg_of_distances = (behind_distances + ahead_distances) / 2
    min_index = argmin(avg_of_distances)
    if min_index == len(loop) - 3:
        loop.appendleft(moving_loop_entry)
    else:
        loop.rotate(-(min_index + 1))
        loop.appendleft(moving_loop_entry)
        loop.rotate(min_index + 1)
    return loop */
	loop: Deque<[string, Array<Array<number>>]>,
	movingLoopEntry: number[][],
	distanceMatrix: Array<Array<number>>,
): Deque<[string, Array<Array<number>>]> {
	const behindIndices: Array<number> = [];
	const aheadIndices: Array<number> = [];
	for (let i = 1; i < loop.length - 1; i++) {
		behindIndices.push(parseInt(loop.get(i - 1)?.[0]));
		aheadIndices.push(parseInt(loop.get(i + 1)?.[0]));
	}
	const behindDistances: Array<number> = behindIndices.map(
		(item) => distanceMatrix[item][movingLoopEntry[0]],
	);
	const aheadDistances: Array<number> = aheadIndices.map(
		(item) => distanceMatrix[item][movingLoopEntry[0]],
	);
	const avgOfDistances: Array<number> = [];
	for (let i = 0; i < behindDistances.length; i++) {
		avgOfDistances.push((behindDistances[i] + aheadDistances[i]) / 2);
	}
	const minIndex: number = avgOfDistances.indexOf(Math.min(...avgOfDistances));
	if (minIndex === loop.length - 3) {
		loop.unshift(loop.get(movinmg));
	} else {
		rotate(loop, -(minIndex + 1));
		loop.unshift(movingLoopEntry);
		rotate(loop, minIndex + 1);
	}
	return loop;
}

export function resortLoop(
	loop: Array<[string, Array<Array<number>>]>,
	func: (a: Array<Array<number>>, b: Array<Array<number>>) => number,
	loopLength: number
): Array<[string, Array<Array<number>>]> {
	/**
    * def resort_loop(loop: list[tuple[int, int, int]], func: callable,
                loop_length: int) -> list[tuple[int, int, int]]:
    """Reorders a loop to minimize the distance between the colors"""
    n_loop = deque(get_n_loop(loop))
    distance_matrix = generate_distance_matrix(n_loop, func, loop_length)
    counter = 0
    while counter < 100000:
        counter += 1
        moving_loop_entry = n_loop.pop()
        n_loop = move_entry(n_loop, moving_loop_entry, distance_matrix)
        if n_loop[0][0] == 0:
            break
    return [(loop[tpl[0]][0],) + tpl[1:] for tpl in n_loop]
    */
	// Deque holds the list of songs and CCV values, ex - ['ldwajj@i32jja2, [[0, 2], [1, 3], ...]]
	// Type is [string, Array<Array<number>>]
	// getNLoop returns a list [index, ...values]
	// nLoop shoudl hold that
	let nLoop: Deque<[string, Array<Array<number>>]> = new Deque<[string, Array<Array<number>>]>(getNLoop(loop));
  const distanceMatrix: Array<Array<number>> = generateDistanceMatrix(nLoop, func, loopLength);
  let counter = 0;
  while (counter < 100000) {
    counter++;
    const movingLoopEntry = nLoop.pop()!;
    nLoop = moveEntry(nLoop, movingLoopEntry[1], distanceMatrix);
	const nVal = nLoop.get(0) || ["", []];
    if (nVal[1][0][0] === 0) {
      break;
    }
  }
  return nLoop.toArray().map((tpl) => [loop[tpl[0]][0], ...tpl.slice(1)]);
}

function generateDistanceMatrix(
	nLoop: Deque<[string, Array<Array<number>>]>,
	func: CallableFunction,
	loopLength: number,
): Array<Array<number>> {
	const distanceMatrix: Array<Array<number>> = [];
	for (let i = 0; i < loopLength; i++) {
		for (let n = 0; n < i; n++) {
			const iVal = nLoop.get(i)![1];
			const nVal = nLoop.get(n)![1];
			distanceMatrix[i][n] = distanceMatrix[n][i] = func(iVal[1], nVal[1]);
		}
	}
	return distanceMatrix;
}

function getNLoop(loop: Array<[string, Array<Array<number>>]>) {
	return loop.map((item, index) => [index, ...item.slice(1)]);
}

function findMinimum(
	pEntry: [string, Array<Array<number>>],
	func: CallableFunction,
	qEntries: Deque<[string, Array<Array<number>>]>,
): number {
	let minIndex = 0;
	let qVal = qEntries.get(0) || ["", []];
	let min: number = func(pEntry[1], qVal[1]);
	for (let i = 1; i < qEntries.length; i++) {
		const q = qEntries.get(i)![1];
		const value: number = func(pEntry[1], q);
		if (value < min) {
			min = value;
			minIndex = i;
		}
	}
	return minIndex;
}

export default function loopSort(
	entries: Array<[string, Array<Array<number>>]>,
	func: (a: number[][], b: number[][]) => number
  ): Array<[string, Array<Array<number>>]> {
	const loop: Deque<[string, Array<Array<number>>]> = new Deque<[string, Array<Array<number>>]>([entries[0]]);
  const entriesDeque: Deque<[string, Array<Array<number>>]> = new Deque<[string, Array<Array<number>>]>(entries.slice(1));
  const length: number = entries.length;
  for (let i = 1; i < length + 1; i++) {
    const itemOne: [string, Array<Array<number>>] = loop.peekBack() || ["", []];
    const itemTwo: Deque<[string, Array<Array<number>>]> = entriesDeque;
    const j: number = findMinimum(itemOne, func, itemTwo);
    loop.push(itemTwo.get(j) || ["", []]);
    rotate(itemTwo, -j);
    itemTwo.shift();
  }
  return loop.toArray();
}
