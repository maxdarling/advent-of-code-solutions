/* run via `npx tsx <file>

** PART 1 **
problem:
- we have columns of "problems" (space-separated), consisting of nums and either + or * on the bottom.
each problem is the product/sum of its nums. find sum of all problems.

alg ideas:
- straightforward? unless we can't keep it all in memory?


** PART 2 **
problem:
- nums are now written as a column top to bottom, rather than a normal num left to right.

alg ideas:
- simple: parse one digit at a time, in order. n x m x |s| iterations.
- note: we have to conserve spaces now, and count col. width via last row.
- better: ideally we visit each cell once. can we distribute in a clever way? well, after sketching an idea i think you still have
to treat each cell as a list (you iterate over each char in it), so it's still n x m x |s| work no matter what. but yes, if you did
want to visit each cell once (better cache locality after a point?) you could.
*/

import { readFileSync } from "fs";

const add = (a: number, b: number) => a + b;
const mult = (a: number, b: number) => a * b;

// given "+" or "*", returns a 1-arg accumulator function
// for the relevant operation (add or mult).
function makeAcc(s: string) {
  const isSum = s === "+";
  let acc = isSum ? 0 : 1;
  const op = isSum ? add : mult;
  return (x: number) => {
    acc = op(acc, x);
    return acc;
  };
}

function part1(grid: string[][]) {
  let res = 0;
  for (let i = 0; i < grid[0].length; i++) {
    const acc = makeAcc(grid[grid.length - 1][i]);
    let prob = -1;

    for (let j = 0; j < grid.length - 1; j++) {
      prob = acc(Number(grid[j][i]));
    }
    res += prob;
  }
  return res;
}

function part2(rows: string[]): number {
  // formatting: normalize row length by padding right side with spaces
  const width = Math.max(...rows.map((row) => row.length));
  for (let i = 0; i < rows.length; i++) {
    rows[i] += " ".repeat(width - rows[i].length);
  }

  // part 2 difference: iterate columns of chars, not nums.
  // cases:
  // - if operator (or beyond last column), add the current problem to result and update accumulator
  // - default: parse a num column top-down and accumulate it into the current problem. skip num if all spaces.
  let res = 0;
  let prob = 0;
  let num = "0";
  let acc = makeAcc("+");
  for (let c = 0; c < rows[0].length; c++) {
    const x = rows[rows.length - 1][c];

    if (["+", "*"].includes(x)) {
      res += prob;
      acc = makeAcc(x);
    }

    num = "";
    for (let r = 0; r < rows.length - 1; r++) {
      num += rows[r][c];
    }
    if (num.trim() === "") continue;
    prob = acc(Number(num));
  }

  res += prob;
  return res;
}

function main() {
  // const input = readFileSync("2025-day6-input-ex.txt", "utf-8");
  const input = readFileSync("2025-day6-input.txt", "utf-8");
  const rows = input.split("\n").filter((row) => row.length);
  const grid: string[][] = rows
    .map((row: string) => row.split(" ").filter((s) => s !== ""))
    .filter((row: string[]) => row.length);

  // console.log(part1(grid));
  console.log(part2(rows));
}

main();
