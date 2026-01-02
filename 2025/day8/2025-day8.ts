/* run via `npx tsx <file>

** PART 1 **
problem:
- given a set of 3D points, iteratively connect the two closest points - connected points form a "circuit". Make 1000 connections (counting
points already in circuit).
- goal: return the product of the sizes of the largest 3 circuits.

alg ideas:
- how do we sort pairs of points based on distance? imagine 1D. naive sol is comparing each point to every other.
O(N^2). another way to think of it is a graph, and we are looking at length of each of the O(N^2) edges.
Can that be faster? Well, there are ~N^2 of them in the first place, so maybe not.


** PART 2 **
prob:
- keep applying the merging procedure from part 1 until the graph is connected (by an edge e).
return e1.x * e2.x

alg:
- straightforward impl based on part 1.

bugs:
- when merging sets, i forgot to update the map for each point in s1 and s2 to point to the new set s.
i was thinking too abstractly and forgot a "tedious" impl step.
- i moved s.add(x/y) after the map update loop, thinking it was harmless. but the former must come before,
for the case when either x or y is not part of s1 or s2, i.e they're empty. another classic case of
thinking in terms of the higher level (the math of sets in this case, thinking x and y belong to their
own set initially) and missing the mechanics of the implementation.
- part 2 stop condition: again an empty set issue. my set size sum math didn't account for undefined
sets (they should be counted as size 1). i was envisioning the last 2 sets being merged and so thought
they would be sets for sure, but it could be a set and a set-less point. ugh. luckily the N=20 example
failed on this so I caught it quickly!
  - in hindsight, i could have avoided this slightly complicated undefined set handling if i
  initialized my set of sets to a 1-set for each point. i don't know why i didn't do this. it's the better
  FP way to go, i feel. but perhaps i thought it's less efficient. asymptotically it's not. but perhaps
  since I thought N=1000 << # of points, it'd be wasteful. hmm. food for thought. next time i'll try to
  remember to err on the side of clean invariants at the expense of O(1) slowdowns. at the very least i
  should be thinking about the tradeoff.

edit: cool golf solution from Max L at RC:
  p = [[int(s) for s in l.split(",")] for l in open("f").readlines()]
  f = lambda i, j: sum((p[i][k] - p[j][k])**2 for k in range(3))
  g = range(len(p))
  c = sorted([(-f(i, j), i, j) for i in g for j in range(i + 1, len(p))])
  while len(set(g)) > 1:
      (_, i, j) = c.pop()
      g = [g[i] if x == g[j] else x for x in g]
  print(p[i][0] * p[j][0])

this took me a while to figure out! i and j are node numbers. and g is the key: for any i, g[i] is
the number of the set that node i belongs to. initially each node is in a set by itself. each time
you process an edge, you convert all nodes that node j is curently in a set with to the set that
i is currently part of.
here's a nice short example:
  i: 4, j: 6, g: [0, 1, 2, 3, 4, 5, 4]
  i: 4, j: 5, g: [0, 1, 2, 3, 4, 4, 4]
  i: 1, j: 5, g: [0, 1, 2, 3, 1, 1, 1]   <-- the 1 "captures" all the 4s!
  i: 1, j: 4, g: [0, 1, 2, 3, 1, 1, 1]
  i: 2, j: 3, g: [0, 1, 2, 2, 1, 1, 1]
  i: 0, j: 3, g: [0, 1, 0, 0, 1, 1, 1]
  i: 2, j: 6, g: [0, 0, 0, 0, 0, 0, 0]
what a cool way to represent clusters in a graph!

chatGPT edit: i should check out kruskal's algorithm for finding minimum spanning trees. i recall
this name from college but don't remember anything else.
*/

import { readFileSync } from "fs";

type Point = [number, number, number];

function dist(x: Point, y: Point): number {
  return Math.sqrt(x.map((e, i) => (e - y[i]) ** 2).reduce((p, e) => p + e, 0));
}

function part1And2(points: Point[], N: number, k: number, part2: boolean) {
  const edges: { dist: number; x: Point; y: Point }[] = [];

  // enumerate edges and sort by dist
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      edges.push({
        dist: dist(points[i], points[j]),
        x: points[i],
        y: points[j],
      });
    }
  }
  edges.sort((a, b) => a.dist - b.dist);

  // construct circuits from top N shortest edges
  const m: Map<Point, Set<Point>> = new Map();
  const circuits: Set<Set<Point>> = new Set();
  for (let i = 0; i < N; i++) {
    const { x, y } = edges[i];
    let s1 = m.get(x);
    let s2 = m.get(y);

    // part 2: detect when we connect the last 2 sets
    if (
      part2 &&
      (s1?.size ?? 1) + (s2?.size ?? 1) === points.length &&
      s1 !== s2
    ) {
      return x[0] * y[0];
    }

    // merge nullable sets :^)
    // (nice code golf, but very inefficient to reconstruct sets when either of s1/s2 is null)
    if (s1) circuits.delete(s1);
    if (s2) circuits.delete(s2);
    const s = new Set([...(s1 ?? []), ...(s2 ?? [])]);
    s.add(x);
    s.add(y);
    for (const point of s) {
      m.set(point, s);
    }
    circuits.add(s);
  }

  // find top K largest circuits
  const lengths: number[] = Array.from(circuits)
    .map((s) => s.size)
    .sort((a, b) => b - a);
  return lengths.slice(0, k).reduce((p, e) => p * e, 1);
}

function main() {
  // const input = readFileSync("2025-day8-input-ex.txt", "utf-8");
  // const N = 10,
  //   k = 3;
  const input = readFileSync("2025-day8-input.txt", "utf-8");
  const N = 1000,
    k = 3;
  const points: Point[] = input
    .split("\n")
    .map((s: string) => s.split(",").map(Number));

  // console.log(part1And2(points, N, k, false));
  console.log(part1And2(points, points.length ** 2, -1, true));
}

main();
