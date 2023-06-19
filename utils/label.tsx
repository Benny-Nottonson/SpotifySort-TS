import { get } from "http";

type DTYPE_t = number;

interface shape_info {
  x: DTYPE_t;
  y: DTYPE_t;
  z: DTYPE_t;
  numels: DTYPE_t;
  ndim: DTYPE_t;
  DEX: DTYPE_t[];
  ravel_index: (x: DTYPE_t, y: DTYPE_t, z: DTYPE_t, shapeinfo: shape_info) => number;
}

interface bginfo {
    background_val: number;
    background_node: number;
    background_label: number;
  }

const BG_NODE_NULL: DTYPE_t = -999;

function get_bginfo(background_val: DTYPE_t[][] | null): bginfo {
    let ret: bginfo = {
        background_val: 0,
        background_node: BG_NODE_NULL,
        background_label: 0
    };

    ret.background_node = BG_NODE_NULL;
    ret.background_label = 0;

    return ret;
}


const D_ed = 0,
  D_ea = 1,
  D_eb = 2,
  D_ec = 3,
  D_ef = 4,
  D_eg = 5,
  D_eh = 6,
  D_ei = 7,
  D_ej = 8,
  D_ek = 9,
  D_el = 10,
  D_em = 11,
  D_en = 12,
  D_COUNT = 13;

function get_shape_info(inarr_shape: DTYPE_t[]): shape_info {
    let res: shape_info = {
        x: 0,
        y: 0,
        z: 0,
        ravel_index: ravel_index2D,
        ndim: 0,
        numels: 0,
        DEX: new Array(D_COUNT)
    };

    res.y = 1;
    res.z = 1;
    res.ravel_index = ravel_index2D;
    let good_shape: DTYPE_t[] = inarr_shape.slice().sort();

    res.ndim = inarr_shape.length;
    if (res.ndim == 1) {
        res.x = inarr_shape[0];
        res.ravel_index = ravel_index1D;
    }
    else if (res.ndim == 2) {
        res.x = inarr_shape[1];
        res.y = inarr_shape[0];
        res.ravel_index = ravel_index2D;
        if (res.x == 1 && res.y > 1) {
            throw new Error("Swap axis of your " + inarr_shape + " array so it has a " + good_shape + " shape");
        }
    }
    else if (res.ndim == 3) {
        res.x = inarr_shape[2];
        res.y = inarr_shape[1];
        res.z = inarr_shape[0];
        res.ravel_index = ravel_index3D;
        if ((res.x == 1 && res.y > 1)
            || res.y == 1 && res.z > 1) {
            throw new Error("Swap axes of your " + inarr_shape + " array so it has a " + good_shape + " shape");
        }
    }
    else {
        throw new Error("Only for images of dimension 1-3 are supported, got a " + res.ndim + "D one");
    }

    res.numels = res.x * res.y * res.z;
    res.DEX[D_ed] = -1;
    res.DEX[D_ea] = res.ravel_index(-1, -1, 0, res);
    res.DEX[D_eb] = res.DEX[D_ea] + 1;
    res.DEX[D_ec] = res.DEX[D_eb] + 1;
    res.DEX[D_ef] = res.ravel_index(-1, -1, -1, res);
    res.DEX[D_eg] = res.DEX[D_ef] + 1;
    res.DEX[D_eh] = res.DEX[D_ef] + 2;
    res.DEX[D_ei] = res.DEX[D_ef] - res.DEX[D_eb];
    res.DEX[D_ej] = res.DEX[D_ei] + 1;
    res.DEX[D_ek] = res.DEX[D_ei] + 2;
    res.DEX[D_el] = res.DEX[D_ei] - res.DEX[D_eb];
    res.DEX[D_em] = res.DEX[D_el] + 1;
    res.DEX[D_en] = res.DEX[D_el] + 2;

    return res;
}

function ravel_index1D(x: DTYPE_t, y: DTYPE_t, z: DTYPE_t, shapeinfo: shape_info): number {
    return x;
}

function ravel_index2D(x: DTYPE_t, y: DTYPE_t, z: DTYPE_t, shapeinfo: shape_info): number {
    return x + y * shapeinfo.x;
}

function ravel_index3D(x: DTYPE_t, y: DTYPE_t, z: DTYPE_t, shapeinfo: shape_info): number {
    return x + y * shapeinfo.x + z * shapeinfo.x * shapeinfo.y;
}

function join_trees_wrapper(data_p: DTYPE_t[], forest_p: DTYPE_t[], rindex: DTYPE_t, idxdiff: DTYPE_t): void {
    if (data_p[rindex] === 0 && data_p[rindex + idxdiff] === 0) {
        join_trees(forest_p, rindex, rindex + idxdiff);
    }
}

function find_root(forest_p: DTYPE_t[], rindex: DTYPE_t): DTYPE_t {
    let root = rindex;
    while (forest_p[root] < root) {
        root = forest_p[root];
    }
    return root;
}   

function set_root(forest_p: DTYPE_t[], n: DTYPE_t, root: DTYPE_t): void {
    let j: DTYPE_t;
    while (forest_p[n] < n) {
        j = forest_p[n];
        forest_p[n] = root;
        n = j;
    }
    forest_p[n] = root;
}

function join_trees(forest_p: DTYPE_t[], n: DTYPE_t, m: DTYPE_t): void {
    let root: DTYPE_t;
    let root_m: DTYPE_t;

    if (n !== m) {
        root = find_root(forest_p, n);
        root_m = find_root(forest_p, m);

        if (root > root_m) {
            root = root_m;
        }

        set_root(forest_p, n, root);
        set_root(forest_p, m, root);
    }
}

function get_swaps(shp: number[]): number[][] {
    const swaps: number[][] = [];
    const ones: number[] = [];
    const bigs: number[] = [];
    for (let i = 0; i < shp.length; i++) {
        if (shp[i] === 1) {
            ones.push(i);
        }
        if (shp[i] > 1) {
            bigs.push(i);
        }
    }
    for (let i = 0; i < ones.length; i++) {
        const one = ones[i];
        const big = bigs[i];
        if (one < big) {
            break;
        } else {
            swaps.push([one, big]);
        }
    }
    return swaps;
}

function apply_swaps(arr: number[][], swaps: number[][]): number[][] {
    let arr2 = arr;
    for (let i = 0; i < swaps.length; i++) {
        const one = swaps[i][0];
        const two = swaps[i][1];
        arr2 = swapaxes(arr2, one, two);
    }
    return arr2;
}

function swapaxes(arr: number[][], one: number, two: number): number[][] {
    const arr2: number[][] = [];
    for (let i = 0; i < arr.length; i++) {
        arr2.push([]);
        for (let j = 0; j < arr[i].length; j++) {
            arr2[i].push(arr[i][j]);
        }
    }
    for (let i = 0; i < arr.length; i++) {
        const temp = arr2[i][one];
        arr2[i][one] = arr2[i][two];
        arr2[i][two] = temp;
    }
    return arr2;
}

function reshape_array(arr: number[][]): [number[][], number[][]] {
    const swaps = get_swaps([arr.length, arr[0].length]);
    const reshaped = apply_swaps(arr, swaps);
    return [reshaped, swaps];
}

function undo_reshape_array(arr: number[][], swaps: number[][]): number[][] {
    const reversedSwaps = [...swaps].reverse();
    const reshaped = apply_swaps(arr, reversedSwaps);
    return reshaped;
}

export default function label(input_: number[][], background: number[][] = [], return_num: boolean = true, connectivity: number = 1): ([number[][], number] | [number[][], number, number]) {
    const [reshaped, swaps] = reshape_array(input_);
    const shape = [reshaped.length, reshaped[0].length];
    const ndim = reshaped[0].length;

    const forest: number[] = [];
    for (let i = 0; i < ndim; i++) {
        forest.push(i);
    }

    let data = reshaped;
    const forest_p = forest;
    const data_p = data.flat();

    const shapeinfo = get_shape_info(shape);
    const bg = get_bginfo(background);

    const conn = connectivity;

    let ctr: number;
    scanBG(data_p, forest_p, shapeinfo, bg);
    scan3D(data_p, forest_p, shapeinfo, bg, conn);
    ctr = resolve_labels(data_p, forest_p, shapeinfo, bg);

    if (swaps) {
        data = undo_reshape_array(data, swaps);
    }

    if (return_num) {
        return [data, ctr];
    } else {
        return [data, ctr, 0];
    }
}


function resolve_labels(data_p: DTYPE_t[], forest_p: DTYPE_t[], shapeinfo: shape_info, bg: bginfo): DTYPE_t {
    let counter = 1;
    for (let i = 0; i < shapeinfo.numels; i++) {
        if (i === forest_p[i]) {
            if (i === bg.background_node) {
                data_p[i] = bg.background_label;
            } else {
                data_p[i] = counter;
                counter += 1;
            }
        }
    }
    return counter - 1;
}

function scanBG(data_p: DTYPE_t[], forest_p: DTYPE_t[], shapeinfo: shape_info, bg: bginfo): void {
    const bgval = bg.background_val;
    let firstbg = shapeinfo.numels;
    for (let i = 0; i < shapeinfo.numels; i++) {
        if (data_p[i] === bgval) {
            firstbg = i;
            bg.background_node = firstbg;
            break;
        }
    }
    if (bg.background_node === BG_NODE_NULL) {
        return;
    }
    for (let i = firstbg; i < shapeinfo.numels; i++) {
        if (data_p[i] === bgval) {
            forest_p[i] = firstbg;
        }
    }
}

function scan1D(data_p: DTYPE_t[], forest_p: DTYPE_t[], shapeinfo: shape_info, bg: bginfo, connectivity: DTYPE_t, y: DTYPE_t, z: DTYPE_t): void {
    if (shapeinfo.numels === 0) {
        return;
    }
    let x: DTYPE_t;
    let rindex: DTYPE_t;
    const bgval = bg.background_val;
    const DEX = shapeinfo.DEX;
    rindex = shapeinfo.ravel_index(0, y, z, shapeinfo);
    for (x = 1; x < shapeinfo.x; x++) {
        rindex += 1;
        if (data_p[rindex] === bgval) {
            continue;
        }
        join_trees_wrapper(data_p, forest_p, rindex, DEX[D_ed]);
    }
}

function scan2D(data_p: DTYPE_t[], forest_p: DTYPE_t[], shapeinfo: shape_info, bg: bginfo, connectivity: DTYPE_t, z: DTYPE_t): void {
    if (shapeinfo.numels === 0) {
        return;
    }
    let x: DTYPE_t;
    let y: DTYPE_t;
    let rindex: DTYPE_t;
    const bgval = bg.background_val;
    const DEX = shapeinfo.DEX;
    scan1D(data_p, forest_p, shapeinfo, bg, connectivity, 0, z);
    for (y = 1; y < shapeinfo.y; y++) {
        rindex = shapeinfo.ravel_index(0, y, 0, shapeinfo);
        if (data_p[rindex] !== bgval) {
            join_trees_wrapper(data_p, forest_p, rindex, DEX[D_eb]);
        }
        for (x = 1; x < shapeinfo.x - 1; x++) {
            rindex += 1;
            if (data_p[rindex] === bgval) {
                continue;
            }
            join_trees_wrapper(data_p, forest_p, rindex, DEX[D_eb]);
            join_trees_wrapper(data_p, forest_p, rindex, DEX[D_ed]);
        }
        rindex += 1;
        if (data_p[rindex] !== bgval) {
            join_trees_wrapper(data_p, forest_p, rindex, DEX[D_eb]);
            join_trees_wrapper(data_p, forest_p, rindex, DEX[D_ed]);
        }
    }
}

function scan3D(data_p: DTYPE_t[], forest_p: DTYPE_t[], shapeinfo: shape_info, bg: bginfo, connectivity: DTYPE_t): void {
    if (shapeinfo.numels === 0) {
        return;
    }
    let x: DTYPE_t;
    let y: DTYPE_t;
    let z: DTYPE_t;
    let rindex: DTYPE_t;
    const bgval = bg.background_val;
    const DEX = shapeinfo.DEX;
    scan2D(data_p, forest_p, shapeinfo, bg, connectivity, 0);
    for (z = 1; z < shapeinfo.z; z++) {
        rindex = shapeinfo.ravel_index(0, 0, z, shapeinfo);
        if (data_p[rindex] !== bgval) {
            join_trees_wrapper(data_p, forest_p, rindex, DEX[D_ej]);
        }
        for (x = 1; x < shapeinfo.x - 1; x++) {
            rindex += 1;
            if (data_p[rindex] === bgval) {
                continue;
            }
            join_trees_wrapper(data_p, forest_p, rindex, DEX[D_ed]);
            join_trees_wrapper(data_p, forest_p, rindex, DEX[D_ej]);
        }
        rindex += 1;
        if (data_p[rindex] !== bgval) {
            join_trees_wrapper(data_p, forest_p, rindex, DEX[D_ed]);
            join_trees_wrapper(data_p, forest_p, rindex, DEX[D_ej]);
        }
        for (y = 1; y < shapeinfo.y - 1; y++) {
            rindex = shapeinfo.ravel_index(0, y, z, shapeinfo);
            if (data_p[rindex] !== bgval) {
                join_trees_wrapper(data_p, forest_p, rindex, DEX[D_eb]);
                join_trees_wrapper(data_p, forest_p, rindex, DEX[D_ej]);
            }
            for (x = 1; x < shapeinfo.x - 1; x++) {
                rindex += 1;
                if (data_p[rindex] === bgval) {
                    continue;
                }
                join_trees_wrapper(data_p, forest_p, rindex, DEX[D_eb]);
                join_trees_wrapper(data_p, forest_p, rindex, DEX[D_ed]);
                join_trees_wrapper(data_p, forest_p, rindex, DEX[D_ej]);
            }
            rindex += 1;
            if (data_p[rindex] !== bgval) {
                join_trees_wrapper(data_p, forest_p, rindex, DEX[D_eb]);
                join_trees_wrapper(data_p, forest_p, rindex, DEX[D_ed]);
                join_trees_wrapper(data_p, forest_p, rindex, DEX[D_ej]);
            }
        }
        rindex = shapeinfo.ravel_index(0, shapeinfo.y - 1, z, shapeinfo);
        if (data_p[rindex] !== bgval) {
            join_trees_wrapper(data_p, forest_p, rindex, DEX[D_eb]);
            join_trees_wrapper(data_p, forest_p, rindex, DEX[D_ej]);
        }
        for (x = 1; x < shapeinfo.x - 1; x++) {
            rindex += 1;
            if (data_p[rindex] === bgval) {
                continue;
            }
            join_trees_wrapper(data_p, forest_p, rindex, DEX[D_eb]);
            join_trees_wrapper(data_p, forest_p, rindex, DEX[D_ed]);
            join_trees_wrapper(data_p, forest_p, rindex, DEX[D_ej]);
        }
        rindex += 1;
        if (data_p[rindex] !== bgval) {
            join_trees_wrapper(data_p, forest_p, rindex, DEX[D_eb]);
            join_trees_wrapper(data_p, forest_p, rindex, DEX[D_ed]);
            join_trees_wrapper(data_p, forest_p, rindex, DEX[D_ej]);
        }
    }
}