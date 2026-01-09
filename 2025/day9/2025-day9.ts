/* run via `npx tsx <file>

** PART 1 **
problem:
- given 2D coordinates, find the pair of points that, when used as opposite corners
of a rectangle, yield the largest area.

alg ideas:
- it seems the largest rect's 2 points will be the furthest toward their respective "corners".
e.g. the most up-left point and the most down-right point. i'm pretty convinced after doing a
little proof of contradiction in my head.
- disproof of above: (0, 1.5), (1,1), (7, 7), (8, 6.5) on an 9x9 grid. (1,1) and (7,7) are the extreme
points (only sqrt(2) away from the corners), and yet we squeeze out some extra perimiter to make a larger
area.
- after much such tinkering, i conceded and did the naive solution. recall that N = ~500!
- post-talk with Dom from RC: he did naive, too, but thought you could do some clever stuff with medians.

** PART 2 **
problem:
- now, input is a sequence of coordinates that form axis-aligned line segments. these describe a polygon.
- do the same as in part 1, but the solution must be contained within the polygon.

alg ideas:
- thought for a while on how to do this cleverly/fast. pretty stumped!
- then chatted with Dom at RC and he led me to realize that N = ~500 only! So no guilt about an N^3 solution.
in that case, i just go with my most idea of checking each rect by walking the perimiter of the polygon for overlaps.

bug log:
- my approach of just taking the segment to the immediate left of the current segment was wrong. left turns break this!
see code for explanation (or pdf for clear visual)
- brutal one: in hasOverlap, i was sorting [start, end] pairs lexicographically via the no-argument '.sort()'. shite!
i glanced at the doc and saw "ascending" but didn't parse the "UTF-16 code unit order". oof.

reflections:
- it can be useful to glance at N for hard problems like this one. it'd have saved me time thiking up too-clever solutions.
- i thought the dir vector was particularly clean, for example, and made later operations easy to express.
but overall i was humbled by this problem - i havent' done much vector-y grid-y geometry-y stuff like this recently and it
took me a while for me to wrap my head around it. but i feel quite refreshed and confident after finally solving it!
- i'm gonna abandon ts for the rest of the challenges, i think. i did it to get familiar with the language, and the returns
are starting to diminish. now i'd like to start refreshing my python.
*/

import { readFileSync } from "fs";

type Point = [number, number];
function pointEq(a: Point, b: Point) {
  return a[0] === b[0] && a[1] === b[1];
}
// left-rotate a basis vector
function Lrotate(a: Point): Point {
  return [a[1], -a[0]];
}
function sign(v: number[]): number[] {
  return v.map((x) => (x ? x / Math.abs(x) : 0));
}
function hasOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  [start1, end1] = [start1, end1].sort((a, b) => a - b);
  [start2, end2] = [start2, end2].sort((a, b) => a - b);
  // assumption: start <= end
  // invariant: first range ends before second range
  if (end1 > end2) {
    [start1, end1, start2, end2] = [start2, end2, start1, end1];
  }
  // [-----[-]-------] vs. [----] [----]
  return start2 <= end1;
}

// naive sol.
function part1(points: Point[]) {
  let maxArea = -1;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const w = Math.abs(points[i][0] - points[j][0]) + 1;
      const h = Math.abs(points[i][1] - points[j][1]) + 1;
      maxArea = Math.max(maxArea, w * h);
    }
  }

  return maxArea;
}

function part2(points: Point[]) {
  // strategy: iterate the line segments that comprise the out-of-bounds ("oob") peremiter of the overall polygon.
  // notes:
  // - we can get a direction basis vector of a segment by taking the sign.
  // - to find the adjacent oob segment, we need a notion of in/out orientation. to do this:
  //  - find the top segment (asssume it goes left to right)
  //  - then the outer region is to the segment's left.
  //  - if you left-rotate the direction vec and add it to the segment, you get the parallel oob segment
  //    - tricky: left turns will cause this oob segment to overlap with valid tiles at the ends.
  //    if the segment starts/ends at a left turn, we must trim the start/end by 1 tile, respectively.

  // find topmost edge
  const yMin = Math.min(...points.map((p) => p[1]));
  let topI = points.findIndex((p) => p[1] === yMin);
  const nextI = (topI + 1) % points.length;
  if (
    points[topI][1] !== points[nextI][1] ||
    points[nextI][0] <= points[topI][0]
  ) {
    throw new Error(
      `Top line segment is not horizontal and left-to-right: i=${topI}: ${points[topI]}, ${points[nextI]}`
    );
  }

  // determine if p[i] -> p[j] -> p[k] is a left turn
  function doesLeftTurn(i: number, j: number, k: number): boolean {
    let x = points[i];
    let y = points[j];
    let z = points[k];
    const dir1: Point = sign([y[0] - x[0], y[1] - x[1]]) as Point;
    const dir2: Point = sign([z[0] - y[0], z[1] - y[1]]) as Point;
    return pointEq(Lrotate(dir1), dir2);
  }

  function isValidRect(a: Point, b: Point) {
    for (let n = 0; n < points.length; n++) {
      const i = (topI + n) % points.length;
      const j = (i + 1) % points.length;
      const k = (i + 2) % points.length;
      const h = (i - 1 + points.length) % points.length;
      let p = points[i];
      let q = points[j];

      const dir: Point = sign([q[0] - p[0], q[1] - p[1]]) as Point;
      const lRot = Lrotate(dir);
      const oobPts: [Point, Point] = [
        [p[0] + lRot[0], p[1] + lRot[1]],
        [q[0] + lRot[0], q[1] + lRot[1]],
      ];

      // trim in case of left turns
      const prevLeft = doesLeftTurn(h, i, j);
      const nextLeft = doesLeftTurn(i, j, k);
      const segAxis = dir[0] !== 0 ? 0 : 1;
      if (prevLeft) oobPts[0][segAxis] += dir[segAxis];
      if (nextLeft) oobPts[1][segAxis] -= dir[segAxis];

      if (
        hasOverlap(oobPts[0][0], oobPts[1][0], a[0], b[0]) &&
        hasOverlap(oobPts[0][1], oobPts[1][1], a[1], b[1])
      ) {
        return false;
      }
    }
    return true;
  }

  let maxArea = -1;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (isValidRect(points[i], points[j])) {
        const w = Math.abs(points[i][0] - points[j][0]) + 1;
        const h = Math.abs(points[i][1] - points[j][1]) + 1;
        maxArea = Math.max(maxArea, w * h);
        // console.log(
        //   `found rect on ${points[i]}-${points[j]} (a=${w * h},m=${maxArea})`
        // );
      }
    }
  }

  return maxArea;
}

function main() {
  // const input = readFileSync("2025-day9-input-ex.txt", "utf-8");
  const input = readFileSync("2025-day9-input.txt", "utf-8");
  const points = input
    .split("\n")
    .map((line: string) => line.split(",").map(Number));

  // console.log(part1(points));
  console.log(part2(points));
}

main();
