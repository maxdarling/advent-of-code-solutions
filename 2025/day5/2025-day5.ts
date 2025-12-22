/* run via `npx tsx <file>

** PART 1 **
problem:
- determine how many numbers are in the given ranges. ranges inclusive, can overlap.

alg ideas:
- naive: check each num against list of ranges
- better: do binary search over ranges
- preprocessing: combine duplicate ranges
- best: sort both ranges and nums. check num against current range. range either contains num,
num comes before range, or num comes after ranges.
so it's O(n) + O(m): you iterate the nums list and the ranges list at most once.
  - hone: will sorting ranges by earliest end time work?
    - consider 2 ranges, A, B. A end time earlier
    - if non-overlapping, yes. [--A--] [--B--]
    - if overlapping and A starts earlier: yes. [--A-[-]-B--]
    - if overlapping and B starts earlier: yes. [-[-A-]--B--]

...wait. it's wrong.

bad case:
  x is before A. we'd skip x here.
      [--A--]
        [--B--]
    x
      y

  but the following shows the danger of skipping x. future ranges
  could have an earlier start time.
      [--A--]
    [----B----]
    x
      y

  note: this only happens for entirely-contained ranges,
  if we eliminated such ranges, we'd be fine.

  how to merge ranges:
    think of ranges as only knowing the end, like:
      ---] ... --A-] --B-] ... ---]

    we iterate above, considering 2 at a time.
    case 1: B start after A end -> non-overlapping.
    case 2: B start before A end -> merge to new range [min(A.start, B.start), B.end]

    note that while iterating, at any time we can hit a case 2 that merges an arbitary number of
    ranges. so we'll move backwards a lot here. but it's still O(n): each range will get considered
    once to determine case, and once more if/when it's absorbed.


** PART 2 **
problem:
- how many unique nums spanned by all ranges?
- ...or, how large is the span of all ranges after merging overlapping ones?

alg ideas:
- solved if we can merge the ranges!
*/

import { readFileSync } from "fs";

type Range = { start: number; end: number };

function mergeRanges(ranges: Range[]): Range[] {
  ranges.sort((a, b) => a.end - b.end);

  // consider 2 ranges at a time. if the later B start before A end then
  // merge to new range [min(A.start, B.start), B.end] and repeat this process looking "backwards"
  // at other A's to merge
  for (let i = 1; i < ranges.length; i++) {
    const B = ranges[i];

    // merge previous ranges
    for (let j = i - 1; j >= 0; j--) {
      const A = ranges[j];
      if (A.start === -1) continue;
      if (B.start <= A.end) {
        B.start = Math.min(B.start, A.start);
        // faux deletion (to get O(n) runtime, we'd need to O(1) delete, e.g. via linked list)
        A.start = -1;
      } else {
        break;
      }
    }
  }

  return ranges.filter((r) => r.start !== -1);
}

function part2(ranges: Range[]): number {
  ranges = mergeRanges(ranges);
  return ranges.reduce((acc, range) => acc + (range.end - range.start + 1), 0);
}

// buggy first try impl. see notes at top.
// function part1(ranges: Range[], nums: number[]):number {
//   ranges = ranges.sort((a, b) => a.end - b.end)
//   nums = nums.sort((a, b) => a - b);

//   let res = 0;
//   let i = 0, j = 0;
//   while (i < ranges.length && j < nums.length) {
//     const x = nums[j];
//     const start = ranges[i].start, end = ranges[i].end;
//     if (x < start) {
//       j++;
//     }
//     else if (x > end) {
//       i++;
//     }
//     else {
//       res++;
//       j++;
//     }
//   }
//   return res;
// }

// naive impl
function part1(ranges: Range[], nums: number[]): number {
  let res = 0;
  nums.forEach((num) => {
    for (let i = 0; i < ranges.length; i++) {
      if (num >= ranges[i].start && num <= ranges[i].end) {
        res++;
        break;
      }
    }
  });

  return res;
}

function part1fast(ranges: Range[], nums: number[]): number {
  ranges = ranges.sort((r1, r2) => r1.start - r2.start);
  nums = nums.sort((a, b) => a - b);

  let res = 0;
  let i = 0,
    j = 0;
  while (i < ranges.length && j < nums.length) {
    // case 1: x < r.start --> skip x
    // case 2: x > r.end   --> skip r
    // case 3: count x
    if (nums[j] < ranges[i].start) j++;
    else if (nums[j] > ranges[i].end) i++;
    else res++, j++;
  }

  return res;
}

function main() {
  // const input = readFileSync("2025-day5-input-ex.txt", "utf-8");
  const input = readFileSync("2025-day5-input.txt", "utf-8");
  const ranges: Range[] = [];
  const nums: number[] = [];
  input.split("\n").forEach((s: string) => {
    const [first, last] = s.split("-");
    if (last) {
      ranges.push({ start: Number(first), end: Number(last) });
    } else if (first) {
      nums.push(Number(first));
    }
  });
  // console.log(ranges);
  // console.log(mergeRanges(ranges));
  console.log(part1(ranges, nums));
  console.log(part1fast(ranges, nums));
  // console.log(part2(ranges));
}

main();
