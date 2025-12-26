/* run via `npx tsx <file>

** PART 1 **
problem:
- count the number of splits

alg:
- iterate each row and split beams accordingly.

** PART 2 **
problem:
- count the number of unique beam paths.

alg ideas:
- it's a binary tree. we can count the number of paths simply by traversing the tree.
*/

import { readFileSync } from "fs";

const splitter = "^";

function part1(beams: number[], rows: string[]) {
  let res = 0;
  rows.forEach((row) => {
    for (let i = 0; i < row.length; i++) {
      if (row[i] === splitter && beams[i]) {
        if (i > 0) beams[i - 1] = 1;
        beams[i] = 0;
        if (i < beams.length - 1) beams[i + 1] = 1;
        res++;
      }
    }
  });
  return res;
}

function part2(beamIdx: number, rows: string[]) {
  // f(A) =
  // recursive:
  // f("0,i", A) = f("1,i-1", A) + f("1, i+1", A)
  // base:
  // leaf beam = 1

  const D: Set<string> = new Set();

  function f(i: number, j: number): number {
    // assumption: A[i][j] is a beam. we only trace beams.

    if (j < 0 || j >= rows[i].length) return 0;
    if (i === rows.length - 1) return 1;

    const key = `${i},${j}`;
    if (key in D) return D[key];

    let res = 0;
    if (rows[i][j] === splitter) {
      res = f(i+1, j-1) + f(i+1, j+1);
    }
    else {
      res = f(i+1, j);
    }

    D[key] = res;
    return res;
  }

  return f(0, beamIdx);
}

function main() {
  // const input = readFileSync("2025-day7-input-ex.txt", "utf-8");
  const input = readFileSync("2025-day7-input.txt", "utf-8");
  const rows = input.split("\n").filter((line: string) => line.length);
  const beams = rows[0].split("").map((c) => (c === "S" ? 1 : 0));
  const beamIdx = beams.findIndex(((c) => c == 1))
  console.log(part1(beams, rows.slice(1)));
  console.log(part2(beamIdx, rows.slice(1)));
}

main();
