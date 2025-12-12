/* run via `npx tsx <file>

** PART 1 **

problem:
-only need to check some ranges (puzzle input)
-invalid ids: sequence repeated twice
-no leading zeroes for IDs.

alg ideas:
- it's ~2mil (2264108) total values in all ranges. tested it, naive solution is still fast!
- could do some basic number-theory-ish analysis to improve it...


** PART 2 **

problem:
- invalid ids are now a sequence repeated 2 *or more* times.

- simple: use a nice checking scheme
example: 12345|12345.
- len1: s[0] == s[1]
- len2: s[0] == s[2] && s[1] == s[3]
- len3: s[0] == s[3] && s[1] == s[4] && s[2] == s[5]
- ...
^these are the first checks you'd perform, and then you'd iterate up.
the general form is:
check(s, n) =
  for i in (s.len / n, step=n):
    check s[i: i+n] == s[i+n : i+2n]
*/

import { readFileSync } from "fs";

function part1(ranges: { start: string; end: string }[]): number {
  let invalidIDs: number[] = [];

  // naive alg: for each range, iterate start to end, and check each num.
  // improvement: on success, if num is {x}{x}, you can advance to {x+1}000.
  ranges.forEach(({ start, end }) => {
    for (let i = Number(start); i <= Number(end); i++) {
      const s = String(i);
      if (
        s.length % 2 == 0 &&
        s.slice(0, s.length / 2) === s.slice(s.length / 2)
      ) {
        invalidIDs.push(i);
      }
    }
  });

  return invalidIDs.reduce((a, b) => a + b, 0);
}

// note: this isn't builtin, best is to use "lodash" utility library. meh.
function chunked(s: string, n: number): string[] {
  let res: string[] = [];
  for (let c = 0; c * n < s.length; c++) {
    res.push(s.slice(c * n, (c + 1) * n));
  }
  return res;
}

// returns whether an ID is invalid (according to part 2 rules)
function p2isInvalid(x: number): boolean {
  const s = String(x);
  for (let n = 1; n <= s.length / 2; n++) {
    if (s.length % n === 0) {
      // check if adjacent subsequences are all equal.
      // j is subseq index.
      // let allSame = true;
      // for (let j = 0; (j + 2) * n <= s.length; j++) {
      //   if (s.slice(j * n, (j + 1) * n) !== s.slice((j + 1) * n, (j + 2) * n)) {
      //     allSame = false;
      //     break;
      //   }
      // }

      // slower, cleaner method
      const chunks = chunked(s, n);
      const allSame = chunks.every((chunk) => chunk === chunks[0]);
      if (allSame) {
        // console.log(`${s} for n=${n}`);
        return true;
      }
    }
  }
  return false;
}

function part2(ranges: { start: string; end: string }[]): number {
  let invalidIDs: number[] = [];

  ranges.forEach(({ start, end }) => {
    for (let i = Number(start); i <= Number(end); i++) {
      if (p2isInvalid(i)) invalidIDs.push(i);
    }
  });

  return invalidIDs.reduce((a, b) => a + b, 0);
}

function main() {
  // const input = readFileSync("2025-day2-input-ex.txt", "utf-8");
  const input = readFileSync("2025-day2-input.txt", "utf-8");
  const ranges = input.split(",").map((s) => {
    const [start, end] = s.split("-");
    return { start, end };
  });

  // console.log(part1(ranges));
  console.log(part2(ranges));
}

main();
