p = [[int(s) for s in l.split(",")] for l in open("2025-day8-golf-input.txt").readlines()]
f = lambda i, j: sum((p[i][k] - p[j][k]) ** 2 for k in range(3))
c = sorted([(-f(i, j), i, j) for i in range(len(p)) for j in range(i + 1, len(p))])
g = list(range(len(p)))
while len(set(g)) > 1:
    (_, i, j) = c.pop()
    g = [g[i] if x == g[j] else x for x in g]
    print(f"i: {i}, j: {j}, g: {g}")
print(p[i][0] * p[j][0])