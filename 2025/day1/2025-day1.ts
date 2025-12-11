/* Run with `npx tsx <file>` */

/* Part 1:

- problem: dial 0-99. starts pointing at 50. input are rotations, left or right. dial loops around.
- goal: keep track of how many times the dial points at 0.

alg ideas:
- we can express the modulo-style arithmetic directly. not too hard


Part 2:
problem: now, we count passing 0 during a rotation in addition to landing at 0.

ideas:
- divide rotation by 100 and count this.
- then, we'll get at most 1 passing of 0. we should be able to calc this "manually".
    - if we we went left and got bigger (or stayed the same?) we passed 0. conversely with right side.
    - ^make sure we don't double count this with 0. i.e. 98 + 2 => 0 just counts once.
    - bug: make sure we dont count 0 L1 -> 99. yes, we went left and got bigger, but
    actually didn't cross 0 since we started at 0.
*/

import { readFileSync } from "fs";

function main() {
  // get rotations as a list
  const input = readFileSync("2025-day1-input.txt", "utf-8");
  //   const input = readFileSync("2025-day1-input2.txt", "utf-8");
  const lines = input.split("\n").filter((line) => line.trim() !== "");

  const rotations = lines.map((line: string) => {
    return { dir: line[0], amt: parseInt(line.slice(1)) };
  });

  console.log(`part 1: ${part1(rotations)}`);
  console.log(`part 2: ${part2(rotations)}`);
}

function part1(rotations): number {
  let val = 50;
  let numZeroes = 0;
  rotations.forEach((rot) => {
    const c = rot.dir === "L" ? -1 : 1;
    val = (val + c * rot.amt) % 100;
    if (val < 0) val += 100;

    if (val === 0) numZeroes++;

    // examples:
    // 50 + 1 => 51
    // 50 + 55 => 5
    // 50 - 50 => 0
    // 50 - 51 => 99
    // 50 - 52 => 98
    // 50 - 240 = -190 = -90 => 10
  });

  return numZeroes;
}

function part2(rotations): number {
  let val = 50;
  let numZeroes = 0;
  rotations.forEach((rot) => {
    const extra = Math.floor(rot.amt / 100);
    rot.amt %= 100;

    const c = rot.dir === "L" ? -1 : 1;
    const orig = val;
    val = (val + c * rot.amt) % 100;
    if (val < 0) val += 100;

    if (
      val === 0 ||
      (orig !== 0 && ((c === 1 && val < orig) || (c === -1 && val > orig)))
    ) {
      numZeroes += 1;
    }
    numZeroes += extra;

    // console.log(`${rot.dir}${rot.amt} : ${numZeroes}. val: ${val}`);

    // examples:
    // 50 + 1 => 51
    // 50 + 55 => 5
    // 50 - 50 => 0
    // 50 - 51 => 99
    // 50 - 52 => 98
    // 50 - 240 = -190 = -90 => 10
  });

  return numZeroes;
}

main();
