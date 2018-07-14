---
title: Firebase 实时数据库开发最佳实践
date: 2017-10-14 08:43:51
tags:
- Firebase
---

> 原文链接：[Best Practices for Firebase Realtime Database Development](https://medium.com/@CodeAndBiscuits/best-practices-for-firebase-realtime-database-development-14e8fd133d44)

> 此文非全文翻译，一些可以省略的话就省略掉了。

## 读文档！

Firebase 的文档和示例都非常友好易懂。有问题找文档。有空的话请通读全文。

另外还有一个很有用的博客，以下是其中几篇对我们很重要的文章：

- [Group Security in the Firebase Database](https://firebase.googleblog.com/2016/10/group-security-in-firebase-database.html)
- [Queries, Part 1: Common SQL Queries Converted for Firebase](https://firebase.googleblog.com/2013/10/queries-part-1-common-sql-queries.html)
- [Best Practices: Arrays in Firebase](https://firebase.googleblog.com/2014/04/best-practices-arrays-in-firebase.html)

## 推论：”无模式”（schema-less）不意味着无脑！

有一个普遍的误解是面向文档的数据库对于数据结构不重视。恰恰相反，**它们更需要注意数据结构**。

好的规划能让所有的软件组件都有最好的性能，这已经没啥可多说的了。不过在 SQL 数据库中，通常是通过 `joining more tables`、`doing sub-queries` 或者 `doing bulk data updates` 来修复规划中的错误。由于 Firebase 中并不存在这些概念，因此还是花些时间来设计你的数据模型并提前处理好这些问题。你会庆幸自己这么做了的。

还有啊，记得读文档。

<!-- more -->

## Ref 和简单的查询都很“廉价”

在 Firebase 中，一个 “ref” 就像一个对数据的指针。你可能本能地就像将其缓存或者用其他方式管理好它们，但是在现有的 Firebase 客户端库中你没必要这么做。它们仅仅就是对数据对象的 URL 引用的包装而已，并且其提供的事件回调每个监听器也只能访问一次。如果你需要在两个不同的地方引用同一个对象，就用两个 ref 去引用。根本没有额外“花销”哦。

数据查询也是一样的。从 SQL 数据库转过来的假货已经习惯了用尽可能少的查询语句来查询更多的对象以减少来回的时间、查询成本。在扁平化数据结构里来说，就是把一些数据复制到多个位置以达到一次请求获取到所有所需数据的目的。

在 Firebase 中，这样就大错特错了。一是基于 key/ref 的查询被非常好地优化过了，并且 Firebase 为其提供了大规模的横向扩展。我们在性能测试中发现，Firebase 在有更多小型数据查询时性能更好。即使是移除一些不必要的查询字段都可以带来可观的性能提升。

Firebase 的大规模横向可扩展性是一个很重要的特性。它不是仅仅“有很好”。它应该作为你 app 设计中的一个重要工具。

## 避免数组

Firebase 文档里面已经提到了这个话题。完全正确。请避免它们。

## Firebase 没有时间数据类型

Firebase 没有时间数据类型，并且不支持倒序排序。你可以自己将时间转换成时间戳以数字形式存放，并且将其负数作为排序标识一同存储。利用这个排序标识值可以实现倒序查询。

## 它并不是万能的

好好利用 Firebase 的长处。不要用它去解决每一个问题。以下是一些 Firebase 不能做的：

- 作为搜索引擎。它有一些基本的操作比如前缀匹配，但也就这些了。如果你需要全功能的搜索，去用 ELK，Algolia 等等吧。
- 作为 API 栈。Firebase 的 Cloud Functions 看起来很棒，但它还处于 Beta 时期。如果你的 app 比 to-do list 应用复杂的话，还是规划规划如何做服务器端的可信任代码执行吧。
- A reporting engine. You may still want to leverage a relational database when you need to slice/dice/filter/mutate/munge/etc your data.
- 用于全离线应用。它提供了离线功能，但始终还是需要先连上云。

## Set 还是 Update

SET 和 UPDATE 之间存在着巨大的差别。它影响着如果 key 还不存在时会发生什么，特别是在复杂对象里面的 key。请务必留意。

## FirebaseUI 超级棒！

噢，我必须要提到，针对各个平台都有一些 FirebaseUI 同类的项目。它们对于建立一个展示 Firebase 数据集中的对象列表的表格真是好用到爆。

去了解一下 FirebaseUI 吧。