import Deque from 'double-ended-queue';

function rotate(deq: Deque<[string, Array<Array<number>>]>, n: number): void {
    if (n > 0) {
        for (let i = 0; i < n; i++) {
            deq.insertBack(deq.removeFront() || ['', []]);
        }
    } else if (n < 0) {
        for (let i = 0; i < n; i++) {
            deq.insertFront(deq.removeBack() || ['', []]);
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
    movingLoopEntry: [number, number, number],
    distanceMatrix: Array<Array<number>>
  ): Deque<[string, Array<Array<number>>]> {
    let behindIndices: Array<number> = [];
    let aheadIndices: Array<number> = [];
    for (let i = 1; i < loop.length - 1; i++) {
        behindIndices.push(parseInt(loop.get(i - 1)![0]));
        aheadIndices.push(parseInt(loop.get(i + 1)![0]));
      }      
    let behindDistances: Array<number> = behindIndices.map(
      (item) => distanceMatrix[item][movingLoopEntry[0]]
    );
    let aheadDistances: Array<number> = aheadIndices.map(
      (item) => distanceMatrix[item][movingLoopEntry[0]]
    );
    let avgOfDistances: Array<number> = [];
    for (let i = 0; i < behindDistances.length; i++) {
      avgOfDistances.push((behindDistances[i] + aheadDistances[i]) / 2);
    }
    let minIndex: number = avgOfDistances.indexOf(Math.min(...avgOfDistances));
    if (minIndex == loop.length - 3) {
      loop.unshift(loop.get(movinmg));
    } else {
      rotate(loop, -(minIndex + 1));
      loop.unshift(movingLoopEntry);
      rotate(loop, minIndex + 1);
    }
    return loop;
  }


  export function resortLoop(loop, func, length) {
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
    let nLoop: Deque<[string, Array<Array<number>>]> = new Deque(getNLoop(loop));
    let distanceMatrix: Array<Array<number>> = generateDistanceMatrix(nLoop.get(0) || ["", []], nLoop, func);
    let counter: number = 0;
    while (counter < 100000) {
        counter++;
        let movingLoopEntry: [string, Array<Array<number>>] = nLoop.pop() || ["", []];
        nLoop = moveEntry(nLoop, movingLoopEntry, distanceMatrix);
        if (nLoop.get(0)![0] == 0) {
            break;
        }
    }
    return nLoop.map((item) => [loop[item[0]][0], ...item.slice(1)]);
  }
  

function generateDistanceMatrix(pEntry: [string, Array<Array<number>>], qEntries: Deque<[string, Array<Array<number>>]>, func: CallableFunction): Array<Array<number>> {
    /**
def generate_distance_matrix(n_loop: list, func: callable, loop_length: int) -> ndarray:
    """Generates a distance matrix for a loop"""
    distance_matrix: ndarray = zeros((loop_length, loop_length))
    for i in range(loop_length):
        for j in range(i):
            distance_matrix[i][j] = distance_matrix[j][i] = func(n_loop[i][1], n_loop[j][1])
    return distance_matrix */
    let distanceMatrix: Array<Array<number>> = [];
    for (let i = 0; i < qEntries.length; i++) {
        distanceMatrix.push([]);
        for (let j = 0; j < i; j++) {
            distanceMatrix[i].push(func(pEntry[1], qEntries.get(j) || ["", []][1]));
        }
    }
    return distanceMatrix;
}

function getNLoop(loop: Array<[string, Array<Array<number>>]>) {
    /**
def get_n_loop(loop: list) -> list[tuple[int, str, str]]:
    """Converts a loop to a list of tuples with the index and the color"""
    return [(i,) + tpl[1:] for i, tpl in enumerate(loop)] */
    return loop.map((item, index) => [index, ...item.slice(1)]);
}

function findMinimum(pEntry: [string, Array<Array<number>>], func: CallableFunction, qEntries: Deque<[string, Array<Array<number>>]>): number {
    /**def find_minimum(p_entry: tuple, func: callable, q_entries: tuple) -> int:
    """Finds the value of q_entries that minimizes the function func(p_entry, q_entry)"""
    return (min(enumerate(q_entries), key=lambda x: func(p_entry[1], x[1][1])))[0] */
    let minIndex: number = 0;
    let min: number = func(pEntry[1], qEntries.get(0) || ["", []][1]);
    for (let i = 1; i < qEntries.length; i++) {
        let value: number = func(pEntry[1], qEntries.get(i) || ["", []][1]);
        if (value < min) {
            min = value;
            minIndex = i;
        }
    }
    return minIndex;
}

export default function loopSort(entries:Array<[string, Array<Array<number>>]>,  func: CallableFunction): Array<[string, Array<Array<number>>]> {
    /**
     * def loop_sort(entries: list[tuple], func: callable) -> list[tuple]:
    """Sorts a list of entries by the function func"""
    loop: deque = deque([entries[0]])
    entries: deque = deque(entries[1:])
    length: int = len(entries)
    for _ in range(1, length + 1):
        item_one: tuple = loop[-1]
        item_two: deque = entries
        j: int = find_minimum(item_one, func, item_two)
        loop.append(item_two[j])
        item_two.rotate(-j)
        item_two.popleft()
    return list(loop)
     */
    let loop: Deque<[string, Array<Array<number>>]> = new Deque<[string, Array<Array<number>>]>([entries[0]]);
    let entriesDeque: Deque<[string, Array<Array<number>>]> = new Deque<[string, Array<Array<number>>]>(entries.slice(1));
    let length: number = entries.length;
    for (let i = 1; i < length + 1; i++) {
        let itemOne: [string, Array<Array<number>>] = loop.peekBack() || ["", []];
        let itemTwo: Deque<[string, Array<Array<number>>]> = entriesDeque;
        let j: number = findMinimum(itemOne, func, itemTwo);
        loop.push(itemTwo.get(j) || ["", []]);
        rotate(itemTwo, -j);
        itemTwo.shift();
    }
    return loop.toArray();
}