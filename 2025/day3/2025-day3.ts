/* run via `npx tsx <file>

** PART 1 **
problem:
- input is rows (banks), each digit representing battery "joltage" (value [1,9])
- select 2 batteries within the bank. their digits, left to right, become joltage.
- goal: find largest possible joltage for each bank. then sum them.

alg ideas:
- simple: the max on [0, n) and then the max on (i, n). because


** PART 2 **
problem:
- for each bank, you must select 12 joltages to make the biggest joltage possible.

examples:
- 234234234234278
12 of 15 digits. leading digit is the most important. so we skip 2/3 and choose 4. this feels like a sliding window.
then we need 11 of 12 digits. subproblem!

alg:
- f(a, n) =
    - if a.len == n: return a
    - else
      find largest digit in [0, a.len - n] with index i.
      recur: prepend digit to f(a[i+1:], n-1)
*/

import { readFileSync } from "fs";

// fancy: extend Array with util method
declare global {
  interface Array<T> {
    indexOfMax(start?: number, end?: number): number;
  }
}
Array.prototype.indexOfMax = function <T>(this: T[]): number {
  if (this.length === 0) {
    return -1;
  }
  return this.reduce(
    (maxIdx, val, idx) => (val > this[maxIdx] ? idx : maxIdx),
    0
  );
};

function part1(banks: number[][]) {
  let sum = 0;
  banks.forEach((bank) => {
    const slice = bank.slice(0, -1);
    const i = slice.indexOfMax();
    const first = slice[i];
    const second = Math.max(...bank.slice(i + 1));
    sum += 10 * first + second;
  });
  return sum;
}

function part2(banks: number[][]) {
  function maxJoltage(bank: number[], n: number): number {
    if (bank.length === n) {
      return Number(bank.join(""));
    }
    if (n === 1) {
      return Math.max(...bank);
    }
    const i = bank.slice(0, bank.length - n + 1).indexOfMax();
    return Number(`${bank[i]}${maxJoltage(bank.slice(i + 1), n - 1)}`);

    // below: faster numeric prepend example (but more verbose, so i skip)
    // const rest = maxJoltage(bank.slice(i + 1), n - 1);
    // const digits = rest === 0 ? 1 : Math.floor(Math.log10(rest)) + 1;
    // return bank[i] * Math.pow(10, digits) + rest;
  }

  return banks.reduce((sum, bank) => sum + maxJoltage(bank, 12), 0);
}

function main() {
  // const input = readFileSync("2025-day3-input-ex.txt", "utf-8");
  const input = readFileSync("2025-day3-input.txt", "utf-8");
  const banks: number[][] = input
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => line.split("").map(Number));

  // console.log(part1(banks));
  console.log(part2(banks));
}

main();
