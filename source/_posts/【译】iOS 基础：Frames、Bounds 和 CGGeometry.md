---
title: 【译】iOS 基础：Frames、Bounds 和 CGGeometry
date: 1970-01-01 
categories:
- iOS
tags:
- iOS
- CGGeometry
- frame
- bounds
---

> Date: 2016-03-26 19:35:02

> 原文：[《iOS Fundamentals: Frames, Bounds, and CGGeometry》](http://code.tutsplus.com/tutorials/ios-fundamentals-frames-bounds-and-cggeometry--cms-21196)
> 程康，2016 年 3 月 26 日

如果你习惯支持点语法的语言，要搞清楚`CGPoint`、`CGSize`和`CGRect`并不难。不过编程式定位视图或者编写绘图代码一般都很长，因此变得很难读明白。

在这个教程里，我希望能澄清一些对 frames 和 bounds 的误解，并且介绍一下**CGGeometry**，它是一个结构体、常量和功能的集合，能让你更轻松地运用`CGPoint`，`CGSize`和`CGRect`。

### 1.数据类型

如果你刚开始接触 iOS 或者 OS X 开发，你可能会想`CGPoint`、`CGSize`和`CGRect`到底是什么。CGGeometry Reference 定义了一系列几何图元（geometric primitives）或者说结构，我们现在关注的是其中的`CGPoint`、`CGSize`和`CGRect`。

大多数人应该知道，`CGPoint`是定义了坐标系中一个点的 C 结构体。这个坐标系的原点在 iOS 的左上方以及 OS X 的左下方。换句话说，纵轴方向在 iOS 和 OS X 上不一样。

`CGSize`是另一个简单的 C 结构体，它定义了一个宽度值（width）和高度值（height）。`CGRect`包含一个`origin`（原点）字段、一个`CGPoint`和一个`size`（大小）字段，即一个`CGSize`。`origin`（原点）和`size`（大小）字段一起决定了一个矩形的位置和大小。

CGGeometry Reference 也定义了其他类型，例如`CGFloat`和`CGVector`。`CGFloat`就是一个`float`（单精度浮点型）或者`double`(双精度浮点型)的`typedef`（类型重定义），是哪一种取决于应用运行的机器结构是 32 位还是 64 位。
<!--more-->
### 2.Frames 和 Bounds

第一个要搞清楚的是一个视图的`frame`和`bounds`之间的区别，因为这困扰着很多 iOS 入门开发者。不过这个区别也不复杂。

在 iOS 和 OS X 中，一个应用有多个坐标系。比如，在 iOS 中应用窗口定位在屏幕的坐标系，而窗口的每一个子视图定位在窗口的坐标系。换句话说，一个视图的子视图总是定位在该视图的坐标系中。

**Frames**

如文档中说的，视图的`frame`是一个结构体，即一个`CGRect`,它定义了这个视图的大小和它在父视图中的位置，或者说父视图坐标系中的位置。看看下面的图应该就能明白了。

![](https://cms-assets.tutsplus.com/uploads/users/41/posts/21196/image/figure-1.jpg)

**Bounds**

视图的`bounds`属性定义了这个视图的大小和它在自身坐标系中的位置。这意味着大多数情况下一个视图的 bounds 的原点都是`{0,0}`，如下图。视图的`bounds`对于绘制这个视图很重要。

![](https://cms-assets.tutsplus.com/uploads/users/41/posts/21196/image/figure-2.jpg)

当视图的`frame`属性被修改时，视图的`center`和`bounds`属性二者或者其一也同时被改变。

### CGGeometry Reference 

**方便的取值方法**
之前提到过，CGGeometry Reference 是一个让运用坐标和矩形更方便的结构体、常量和方法的集合。你可能碰到过类似的下面的代码片段：
```
CGPoint point = CGPonitMake(self.view.frame.origin.x + self.view.frame.size.width, self.view.frame.origin.y + self.view.frame.size.height);
```
这样的片段不尽难阅读，而且过于冗长。我们可以用在 CGGeometry Reference 中定义的两个方便的方法重写这段代码。
```
CGRect frame = self.view.frame;
CGPoint point = CGPointMake(CGRectGetMaxX(frame), CGRectGetMaxY(frame));
```
为了简化之前那段代码，我们把视图的`frame`储存到一个叫`frame`的变量中，并且使用了`CGRectGetMaxX`和`CGRectGetMaxY`两个方法。这两个方法的方法名解释了自己的功能。

CGGeometry Reference 定义了返回一个矩形 x 轴坐标、y 轴坐标最小和最大值以及这个矩形中心坐标的方法。另外两个方便的取之方法是`CGRectGetWidth
`和`CGRectGetHeight`。

**创建结构体**

当要创建`CGPoint`、`CGSize`和`CGRect`时，大多数人都用`CGPointMake`或者类似的方法。这些方法也被定义在 CGGeometry Reference 中。虽然它们的实现非常简单，它们特别有用并且让你少写一些代码。例如，`CGRectMake`是这样实现的：
```
CGRectMake(CGFloat x, CGFloat y, CGFloat width, CGFloat height)
{
	CGRect rect;
	rect.origin.x = x; rect.origin.y = y;
	rect.size.width = width; rect.size.height = height;
	return rect;
}
```

**修改矩形**

以上提到过的方法都是 iOS 开发者熟知的，它们减少了我们的代码量并且让它们可读性增加。不过，CGGeometry Reference 也定义了一切其他大家不太了解的方法。比如 CGGeometry Reference 定义了一堆修改`CGRect`结构的方法。让我们来看看其中一些。

**`CGRectUnion`**
`CGRectUnion`接受两个`CGRect`结构体作为参数并且返回一个能够包含这两个矩形的最小矩形。听起来可能没什么，我相信你也可以用几行代码轻松实现这个功能，不过 CGGeometry 做的是给你提供一些方法让你的代码更干净、可读性更强。

如果你把下面代码片段加到一个 view controller 的`viewDidLoad`方法中，你将在模拟器中看到如下结果。那个灰色的矩形就是使用`CGRectUnion`的结果。
```
// CGRectUnion
CGRect frame1 = CGRectMake(80.0, 100.0, 150.0, 240.0);
CGRect frame2 = CGRectMake(140.0, 240.0, 120.0, 120.0);
CGRect frame3 = CGRectUnion(frame1, frame2);
 
UIView *view1 = [[UIView alloc] initWithFrame:frame1];
[view1 setBackgroundColor:[UIColor redColor]];
 
UIView *view2 = [[UIView alloc] initWithFrame:frame2];
[view2 setBackgroundColor:[UIColor orangeColor]];
 
UIView *view3 = [[UIView alloc] initWithFrame:frame3];
[view3 setBackgroundColor:[UIColor grayColor]];
 
[self.view addSubview:view3];
[self.view addSubview:view2];
[self.view addSubview:view1];
```
![](https://cms-assets.tutsplus.com/uploads/users/41/posts/21196/image/figure-3.jpg)

**`CGRectDivide`**

另一个有用的方法是`CGRectDivide`，它帮你把一个给定矩形分割成两个。看看下面的代码和截图来了解它是怎么运作的。
```
// CGRectDivide
CGRect frame = CGRectMake(10.0, 50.0, 300.0, 300.0);
CGRect part1;
CGRect part2;
CGRectDivide(frame, &part1, &part2, 100.0, CGRectMaxYEdge);
 
UIView *view1 = [[UIView alloc] initWithFrame:frame];
[view1 setBackgroundColor:[UIColor grayColor]];
 
UIView *view2 = [[UIView alloc] initWithFrame:part1];
[view2 setBackgroundColor:[UIColor orangeColor]];
 
UIView *view3 = [[UIView alloc] initWithFrame:part2];
[view3 setBackgroundColor:[UIColor redColor]];
 
[self.view addSubview:view1];
[self.view addSubview:view2];
[self.view addSubview:view3];
```
![](https://cms-assets.tutsplus.com/uploads/users/41/posts/21196/image/figure-4.jpg)

如果你不使用`CGRectDivide`来计算红色和橙色矩形的话，你可能要多谢几十行代码。不信你就试试。

**比较和包含**

用下面六个方法来比较几何结构和检查包含关系非常简单。
- `CGPointEqualToPoint`
- `CGSizeEqualToSize`
- `CGRectEqualToRect`
- `CGRectIntersectsRect`
- `CGRectContainsPoint`
- `CGRectContainsRect`

CGGeometry Reference 还有一些其他宝贝，比如`CGPointCreateDictionaryRepresentation`可以用来将一个 CGPoint 结构体转换为一个 `CGDictionaryRef`，`CGRectIsEmpty`可以用来检查一个矩形的宽高是否都为零。更多详情请看[《CGGeometry Reference 文档》]()。

### 4.福利：打印日志

在 Xcode 控制台打印日志如果没有一些辅助方法的话很麻烦。幸运的是，UIKit 框架定义了一些让它变得很方便的方法。我天天用它们。看看下面的代码片段来了解它们是如何工作。并没有什么奇特的。
```
CGPoint point = CGPointMake(10.0, 25.0);
CGSize size = CGSizeMake(103.0, 223.0);
CGRect frame = CGRectMake(point.x, point.y, size.width, size.height);
NSLog(@"\n%@\n%@\n%@", NSStringFromCGPoint(point), NSStringFromCGSize(size), NSStringFromCGRect(frame));
```
还有一些方便打印仿射变换（affine transforms）（`NSStringFromCGAffineTransform`）、边缘插入（`NSStringFromUIEdgeInsets`）、偏移（`NSStringFromUIOffset`）等的日志的方便方法。

### 总结

iOS SDK 包含了大量开发者们不了解的宝贝。我希望我给你们讲明白了 CGGeometry Reference 的实用性。一旦你开始使用它的那些方法，你就会开始问自己，以前没用它怎么活过来的。