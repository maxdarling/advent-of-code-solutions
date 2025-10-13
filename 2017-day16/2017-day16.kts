import java.io.File

// part one:
// - fairly simple. i had to think on how to "spin". note that spin could have been implemented naively as
// A = A[-x:] + A[:-x] and it would have been faster since n = 16. but i wanted the challenge.
// - you can also impl spin (a "right rotation") by doing 3 reversals: on [0:n), on [0:x] and on [x:n). fun to visualize.
// and the c++ 'std::rotate_right' is actually implemented like this. cool.
// part two:
// - first idea was wrong. a dance doesn't reduce to idx swaps because partner() will behave differently
// - my next idea then was to compute a bunch of dances and hope that there were some collisions, meaning there would
// be cycles. and there was! e.g. a 1980-len cycle. 10^9 % 1980 = 1000. and i can brute-force 1000 in a few seconds. easy!
//
// followup thought:
//i don't have a good intuition for why we should expect to find cycles. if each dance (i.e. permutation), were random, it would be 1/16! for a permutation to match a previous one. this is far too unlikely. yet i ran mine 10^5 times and yet found a distinct cycle (60 length). the odds (if random) of this are roughly 10^5 / 10^16 = 10^-9. i'm currently just assuming the problem was contrived to have a cycle.
//
//if so, that's not super satisfying IMO. it relies on meta-reasoning to solve the question: a smart solver would realize that the problem is intractable but hope that the judges are throwing the contestants a bone.
// - smart buddy florian (RC F1'25) agrees it's contrived.

var aThruP = listOf(
    "a", "b", "c", "d", "e", "f", "g", "h",
    "i", "j", "k", "l", "m", "n", "o", "p"
)
var arr = aThruP.toMutableList()
val PT1_SOLUTION = "olgejankfhbmpidc"

fun spin(x: Int) {
    // 0          n-x-1 | n-x       n-1
    // [................|...........]
    //
    // n-x     n-1 | 0              n-x-1
    // [...........|................]
    //
    // i -> 0
    // i+2 -> 1
    // ...
    // n-1 -> (n-1+x) % n

    // APPROACH #1
    // alg: leapfrog overwriting. move arr[i] to arr[j], then move arr[j] to arr[k], etc.
    // where each i->j is an x-sized hop (with wrapping)
    //
    // issue: makes the assumption that N % x != 0. I.e. the cycle length is not divisible by the
    // step size. when true, we visit all nodes. otherwise, we get caught in a cycle of length N / x.
    //
    // solution:
    // - remember your starting idx for cycle detection. when you complete a cycle, move to the adjacent one.
    if (x <= 0 || x >= arr.size) return

    var i = 0
    var startIdx = i
    var last = ""
    repeat(arr.size) {
        if (startIdx == i) { // if we completed a cycle, start exploring the next one
            i = (i + 1) % arr.size
            startIdx = i
            last = arr[i]
        }
        // write arr[i] to arr[j] (after remembering arr[j])
        val j = (i + x) % arr.size
        val temp = arr[j]
        arr[j] = last
        last = temp
        i = j
    }
}

fun exchange(i: Int, j: Int) {
    arr[i] = arr[j].also { arr[j] = arr[i] }
}

fun partner(a: String, b: String) {
    // note: this is O(n), but n is small so it's not worth worrying about.
    // otherwise i'd consider maintaining a lookup table of char -> idx.
    val i = arr.indexOf(a)
    val j = arr.indexOf(b)
    exchange(i, j)
}

fun performDance(ops: List<String>) {
    ops.forEach {
        val op = it[0]
        val args = it.slice(1 until it.length).split("/")
        when (op) {
            's' -> spin(args[0].toInt())
            'x' -> exchange(args[0].toInt(), args[1].toInt())
            'p' -> partner(args[0], args[1])
        }
    }
}

fun main() {
    val ops = File("input.txt").readText().split(",")

    repeat(1) {
        performDance(ops)
    }

    // <part 2: looking for cycles>
    // val seenOrders = mutableMapOf<String, Int>()
    // val allOrders = mutableListOf<String>()
    // for (i in 0..100000) {
    //     val lastOrder = arr.joinToString("")
    //     if (!seenOrders.containsKey(lastOrder)) {
    //         seenOrders[lastOrder] = i
    //     } else {
    //         val j = seenOrders[lastOrder]!!
    //         println("CYCLE! length ${i-j} from $j to $i")
    //         println("$j : ${allOrders[j]}")
    //         println("$i : $arr")
    //     }
    //     allOrders.add(lastOrder)
    //     performDance(ops)
    // }

    val res = arr.joinToString(separator = "")
    println("Final result (actual):")
    println(res)
    println("Final result (expected):")
    println(PT1_SOLUTION)
    println("\nSTATUS = ${if (res == PT1_SOLUTION) "CORRECT" else "WRONG"}")
}

main()

/*
-- (WRONG SOLUTION FOR PT. 2) --

PART TWO: what's the result after 1billion dances?

ideas:
- too inefficient to run the simulation 1billion times. instead, the net result of a full dance should be expressible in O(16) swaps.
- i could come up with a swap order by hand... wouldn't be that bad.
- what is a smarter solution to this i wonder??
- btw: you can then compound this idea. find the net effect of 2 swaps, four, etc.

START VS. END
0  |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |  9  |  10 |  11 |  12 |  13 |  14 |  15 |
a  |  b  |  c  |  d  |  e  |  f  |  g  |  h  |  i  |  j  |  k  |  l  |  m  |  n  |  o  |  p  |

14 |  11 |  6  |  4  |  9  |  0  |  13 |  10 |  5  |  7  |  1  |  12 |  15 |  8  |  3  |  2  |
o  |  l  |  g  |  e  |  j  |  a  |  n  |  k  |  f  |  h  |  b  |  m  |  p  |  i  |  d  |  c  |

//    val b = 1;
//    val N = 1
//    repeat(N) { _ ->
//        // steps:
//        // 1. compute the net effect of all dances thus far, represented simply by index swaps,
//        // where the number of dances so far is b^(i-1) for 0 <= i < N
//        // 2. apply the swapping b-1 times. now the total dances affected is b^(i-1) + (b-1)*b^(i-1) = b^i.
//        val idxSwaps = aThruP.mapIndexed { i, c -> Pair(i, arr.indexOf(c)) }.toMap()
//        repeat(b - 1) {
//            arr = arr.mapIndexed { i, c -> Pair(idxSwaps[i], c) }
//                .sortedBy { it.first }
//                .map { it.second }
//                .toMutableList()
//        }
//    }
}

 */

