---
title: AutoLayout 中需要注意的点
date: 2016-04-07 00:41:14
categories:
- iOS
tags:
- iOS
- Swift
- AutoLayout
---
> 本文用于记录我在使用 AutoLayout 过程中遇到的一些需要注意的事情，一种是容易犯的错误，一种是我找不到原因的情况。
<!--more-->

### 容易犯的错误
1. 如果预览的样式和你预想的不一样，检查一下是不是忘记给作为背景的 view 添加约束（上下左右），可能有一个约束缺失，导致整体样式出错。


### 找不到原因的情况
1. 在 ScrollView 中通过 AutoLayout 设置 StackView 子视图不固定宽度时，需要设置和 superview Equal Widths，然后根据需要调整间距。否则子视图宽度约束设置不生效。如果出现其他 view 宽度不对劲的情况，也可以试着用 Equal Widths 解决。

	如图，分别为宽度不正常情况和使用 Eauql Widths 之后正常情况：
	
	![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-04-07%20at%2012.37.01%20AM.png)

	![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-04-07%20at%2012.37.31%20AM.png)
	