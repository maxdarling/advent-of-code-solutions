/* run via `npx tsx <file>

** PART 1 **
problem:
- determine # of accessible paper rolls, denoted by "@". accessible = <4 adjacent rolls.

alg ideas:
- iterate each cell and count adjacent cells. simplest possible.

** PART 2 **

problem:
- now, accessible rolls can be removed, which may make new rolls accessible, which can be removed, etc.
how many can be removed total?

alg ideas:
- naive: keep making passes

- improvement ideas:
  - the above is wasteful. this is clear when you make several passes at the end where there's just 1
  removed. when you remove just 1 roll in a pass, only adjacent cells might have changed. it's
  wasteful to check all others. we could use a set to keep track of cells adjacent to a removed cell
  for each pass.
*/

import { readFileSync } from "fs";

const MAX_ADJ = 3;

function numAdj(i: number, j: number, grid: boolean[][]): number {
  let sum = 0;
  for (let y = -1; y <= 1; y++) {
    for (let x = -1; x <= 1; x++) {
      if (
        i + y >= 0 &&
        i + y < grid.length &&
        j + x >= 0 &&
        j + x < grid[0].length &&
        !(y === 0 && x === 0) &&
        grid[i + y][j + x]
      ) {
        sum++;
      }
    }
  }
  return sum;
}

function part1(grid: boolean[][]): number {
  let res = 0;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] && numAdj(i, j, grid) <= MAX_ADJ) {
        res++;
      }
    }
  }
  return res;
}

// naive approach
function part2(grid: boolean[][]): number {
  let res = 0;

  // naive alg: remove cells after each pass and re-scan full grid.
  while (true) {
    const toRemove = new Set<string>();
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[0].length; j++) {
        if (grid[i][j] && numAdj(i, j, grid) <= MAX_ADJ) {
          res++;
          toRemove.add(`${i},${j}`);
        }
      }
    }

    if (toRemove.size === 0) {
      return res;
    }

    toRemove.forEach((key) => {
      const [i, j] = key.split(",").map(Number);
      grid[i][j] = false;
    });
  }

  return res;
}

function main() {
  // const input = readFileSync("2025-day4-input-ex.txt", "utf-8");
  const input = readFileSync("2025-day4-input.txt", "utf-8");
  const grid = input
    .split("\n")
    .map((row: string) =>
      row.split("").map((e: string) => (e === "@" ? 1 : 0))
    );
  // console.log(part1(grid));
  console.log(part2(grid));
}

main();
