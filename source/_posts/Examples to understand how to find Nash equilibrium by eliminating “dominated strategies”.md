---
title: Examples to understand how to find Nash equilibrium by eliminating “dominated strategies”
date: 2017-01-18 17:14:22
tags:
- Game Theory
- Dominated Strategies
---

This is a summarization of contents from two different sources. It aims at helping people (at least myself) to understand what `dominated strategies` are and especially what **weakly dominated strategy** is.

## Definition

Suppose *si* and *s’i* are two strategies for player *i* in a normal form game.

We say *s’i* is **strictly dominated** by *si* if, for every choice of strategies of the other players, *i*’s payoff from choosing *si* is `strictly greater than` *i*’s payoff from choosing *s’i*.

We call *s’i* dominated strategy and *si* dominant strategy.

We say *s’i* is **weakly dominated** by *si* if, for every choice of strategies of the other players, *i*’s payoff from chossing *si* is `at least as great as` *i*’s payoff from choosing *s’i*.

<!--more-->
## Remarks
1. If a unique strategy remains for the player, we call this the player’s dominant strategy.
2. If a unique strategy remains for all players, we call this strategy profile a dominant
strategy equilibrium.
3. A dominant strategy equilibrium is a Nash equilibrium. And we can eliminate
dominated strategies without losing any Nash equilibria.
4. If the iterated elimination of weakly dominated strategies leaves exactly one strategy
for each player, the resulting strategy profile is a Nash equilibrium. **However some Nash equilibria can be discarded this way.**

## Example of eliminating strictly dominated strategies

|            |   | Agent2 |        |       |
|   :----:   |:-:| :----: | :----: | :---: |
|            |   | L      | C      |  R    |
| **Agent1** | T | 73, 25 | 57, 42 | 66,32 |
|            | M | 80, 26 | 35, 12 | 32,54 |
|            | B | 28, 27 | 63, 31 | 54,29 |


L can be eliminated since it is strictly dominated by R, and then M can be eliminated since it is strictly dominated by both T and B, and then R can be eliminated since it is strictly dominated by C. Now Agent1 will choose B, which will result in a payoff of **63, 31**.

## Example of eliminating weakly dominated strategies

|           |      |Agent2|      |
|:---------:| :--: | :--: | :--: |
|           |      | L    |  R   | 
| **Agent1**| T    | 1, 1 | 0, 0 |
|           | M    | 1, 1 | 2, 1 |
|           | B    | 0, 0 | 2, 1 |

This example illustrates the difficulties that may occur when eliminating weakly dominated strategies.

The actions that survive iterated elimination of weakly dominated strategiescan depend on the order in which the actions are eliminated.

1. For example, T can be eliminated since it is weakly dominated by M,and then L can be eliminated since it is weakly dominated by R. Now, agent2 will choose action R, which will result in a payoff of **(2, 1)** for which ever action agent 1 selects.

2. On the other hand, action B could have been eliminated first since it is weakly dominated by M, and then R could have been eliminated since it is weakly dominated by L. Now, the payoff is **(1, 1)** for which ever action agent 1 selects.


# References

[1][Leading fromStrength: Eliminating Dominated Strategies](http://tuvalu.santafe.edu/~jkchoi/ch2_a.pdf)

[2][Weakly Dominated Strategies](https://cs.uwaterloo.ca/~klarson/teaching/F08-886/WeaklyDominatedStrats.pdf)