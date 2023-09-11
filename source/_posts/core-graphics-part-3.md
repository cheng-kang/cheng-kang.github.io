---
title: 【译】Core Graphics，第三部分：线
date: 1970-01-01 
tags:
- iOS
- Core Graphics
---
> Date: 2017-05-25 00:23:05

> 原文链接：[Core Graphics, Part 2: Contextually Speaking](https://www.bignerdranch.com/blog/core-graphics-part-three-lines/)
> 看看上一篇吧：[【译】Core Graphics, 第二部分：说说 context （上下文）](http://chengkang.me/2017/05/23/core-graphics-part-2/)

设想这样一条简单的线：就是连接两点的一条直像素序列。有一些有名的算法你可以用来自己做绘制，但是近些日子，我们有了工具箱来帮忙做繁杂的工作。在 Core Graphics 中，一条线就只是一种路径。路径对于许多 Core Graphics 的特性来说都是中心，下一回你会得知很多路径的信息。不过现在，先把线想成被描出轮廓（而非填充）的一系列线的片段。有一大堆普遍的 `GState` 参数能影响线（的颜色、宽度、阴影及形变），同样也有 GState 的值与绘制线有关。

你在这看到的所有线的图片都是用 GrafDemo 创建的。你可以在 [GitHub](https://github.com/markd2/GrafDemo) 上找到源码，这里使用的版本为”Release cg-pt3“。

<!--more-->
这就是 Lines 窗口的样子，左边是 Objective-C 的 NSView，右边是 Swift 的 NSView。

![](https://www.bignerdranch.com/assets/img/blog/2015/05/cg3-grafdemo-window.png)

回想一下，CG path 只是形状的描述。它们并不实际包含任何像素点。`GState` 控制着 path 实际上如何被渲染，在 view 里面、image 里面或者 PDF 里面也好，无论是被填充或者是描边。有四个 `GState` 属性专属于 stroked lines：Join，Miter Limit，End Cap 和 Dash。

## Join 的阴暗面

`line join` 这个属性控制着当线转角时发生的事情，并且通过以下枚举值来描述：

```
enum CGLineJoin {
    kCGLineJoinMiter       // default
    kCGLineJoinRound
    kCGLineJoinBevel
}
```

你可以通过以下调用来设置它：

```
CGContextSetLineJoin (context, kCGLineJoinMiter)
```

`miter join` （斜角连接）有一个凸出来的点。`round join` （圆角连接） 在链接的”膝关节“处有一个半圆，而 `bevel join` （斜切连接） 则是一个平的样子。

![](https://www.bignerdranch.com/assets/img/blog/2015/05/cg3-joinstyles.png)

那条中间的白线是给 Quartz 的那个理想的路径。蓝色部分是这个 path 在特定 `GState` 状态下被描的轮廓，`GState` 提供了轮廓颜色、线宽和线属性。

这个图有两个线段连接处。在一个 path 中的所有线段都是用同一个 `line join` 值，所以如果你想混搭 `join` 类型，你需要在 context 中设置 `line join`，然后画一组线，设置 `line join` 为另一个值，然后画另一组线。你无法在一个绘制操作中混搭。

## 秘诀就是 Limit

圆角连接和斜切连接有些无聊。端点就是个圆，或者拐角处被切掉了。不过，斜角连接是酷的。斜角连接画的那个突出的部分的长度是根据那两条线夹角变化的：

![](https://www.bignerdranch.com/assets/img/blog/2015/05/cg3-miterlimit-1.gif)

不过还是有一个问题——如果两条线的夹角非常锐的话，突出端可能变得相当长。有另外一个 GState 参数可以控制这个：Miter Limit。这是一个 CGFloat 值，它告诉 CG 什么时候该画这个突出斜角的东西，又或是该把这个连接处变成斜切的。

![](https://www.bignerdranch.com/assets/img/blog/2015/05/cg3-miterlimit-2.gif)

Miter Limit API 很简单，假设你知道这个值：

```
CGContextSetMiterLimit (context, 5.0);
```

当在决定是斜角还是斜切时，Quartz 用 GState 中的 line width 来除它准备绘制的斜角的长度。超过了 miter limit 就意味着”使用斜切连接“。因为斜角的长度与线宽成比例（线越宽斜角越长），miter limit 实际上就与线宽无关了——这个关系被解除了。只要你把你的绘制代码调整到有优秀的斜角/斜切行为，你就不用担心线宽变不变了。

## 嘿，嘿，他刚说了”屁股“

你不仅可以控制连接处怎么样，也可以控制线的开头和末端是如何。这里是三个 Line Cap 样式：

```
enum CGLineCap {
    kCGLineCapButt    // default
    kCGLineCapRound
    kCGLineCapSquare
}
```

这是一个改变 cap 样式的调用方法：

```
CGContextSetLineCap (context, kCGLineCapButt)
```

butt cap 不在线的末端画任何额外的东西。round cap 加上了一个半圆，square cap 则有一个半正方形在末端。这个额外部分的大小是和线宽成比例的。

![](https://www.bignerdranch.com/assets/img/blog/2015/05/cg3-capitation.png)

和 line join 样式一样，你不能在一条线上混搭 cap 样式。

## 冲破大风雪

line join 和 line cap 是从 PostScript 中继承来的，另一个很酷的属性也是：line dash。

line dash 是通过一个由”标记空间“的浮点数值组成的数组组指定的一个重复图形。元素零是这条虚线第一个部分的长度。元素一是要留的空白的大小。元素二是另一个线的长度，元素三是另一个空白，如此下去。这个模式一直循环到 CG （或者 PostScript）用光了这个数组的元素。

下面是一组线的组成部分的长度：

```
CGFloat lengths[] = { 12.0, 8.0, 6.0, 14.0, 16.0, 7.0 };
```

以及其相关的线的模式：

![](https://www.bignerdranch.com/assets/img/blog/2015/05/cg3-phase-1.png)

下面是用这个模式画的一条线：

![](https://www.bignerdranch.com/assets/img/blog/2015/05/cg3-phase-2.png)

这里使用了斜角连接样式。因此两个角都是斜角连接。那个消失的下方的连接处是虚线图形在原本连接处有一个空白区域造成的。

虚线图形在线的第一个点初固定了：

![](https://www.bignerdranch.com/assets/img/blog/2015/05/cg3-phase-3.gif)

每一个独立的图形区间都有末端 cap 属性在做用着，因此在有一个虚线图形以及 cap 或者 butt 末端 cap 时，cap 可能互相重叠而形成一条实线。

## Set Phasers to Stun

下面是你如何设置 line phase：

```
void CGContextSetLineDash (CGContextRef c,
                           CGFloat phase,
                           const CGFloat lengths[], size_t count)
```

你传入一个长度数组以及这个数组中元素的个数（并不是它的字节长度），同时还有一个 phase 值。这个 phase 值告诉 Quartz 从哪儿开始使用这个模式。你可以通过用不同的 phase 值调用 `SetLineDash` 让这个虚线动起来。

下面是同样一条线，仅仅是 phase 被改变时的样子：

![](https://www.bignerdranch.com/assets/img/blog/2015/05/cg3-phase-4.gif)

## 一个 Swift 化的分段星球

Swift 尤其便于制定线分段，你仅仅需要直接用一个 CGFloat 数组。

```
let phase = CGFloat(linePhaseSlider.floatValue)
let lengths = [
    dash0Slider.floatValue, space0Slider.floatValue,
    dash1Slider.floatValue, space1Slider.floatValue,
    dash2Slider.floatValue, space2Slider.floatValue
].map { CGFloat($0) }
CGContextSetLineDash (context, phase, lengths, lengths.count)
```

在 Objective-C 这一边，你需要用一个 NSNumbers 数组并且手动取出浮点值，或者维护一个 CGFloat 的 buffer。

简单说明一下：那个 floatValue 和 map 在一起是干什么的？这个数组需要是 CGFloat 类型。 NSSlider 并没有一种将其返回值表达成 CGFloat 的方式。一种选择是给 NSSlider 写一个 extension，用以将一个现有的 slider 值方法转换成 CGFloat。那样挺烦人的，并且你在和其他项目共享这段代码时得记得将它一起拖过来。你也可以将每一个每一个 slider floatValue 都转换了，不过那样就在视觉上很扰目，很难看清楚是哪一个 slider 在贡献它的值。通过获取一个 floatsValues 数组然后映射它们到 CGFloat，它仍然可读，并且 `CGContextSetLineDash` 得到了它想要的浮点类型。

## Construction Zone

Core Graphics 提供了一系列用于创建 line path 的调用方法。

及时我还没有谈到 path API，如果你曾用过 `NSBezierPath` 的话，第一种形式应该多少有点熟悉：移动到一个点，然后添加一个新点作为新线段的末端，组成一条连续的线。

```
CGMutablePathRef path = CGPathCreateMutable();

CGPathMoveToPoint (path, NULL, self.points[0].x, self.points[0].y);

for (NSInteger i = 1; i < kPointCount; i++) {
    CGPathAddLineToPoint (path, NULL, self.points[i].x, self.points[i].y);
}

CGContextAddPath (context, path);
CGContextStrokePath (context);
```

`self.points` 返回的是一个 CGFloat 指针指向一个包含四个 CGPoints 的 C 数组。

Swift 形式非常相似。`points` 是一个原生 Swift CGFloat 数组。

```
let path = CGPathCreateMutable()

CGPathMoveToPoint (path, nil, points[0].x, points[0].y)

for i in 1 ..< points.count {
    CGPathAddLineToPoint (path, nil, points[i].x, points[i].y)
}

CGContextAddPath (context, path)
CGContextStrokePath (context)
```

下一种形式用到资格 CGPoints 数组，并且在内部进行了如你所见过的相同类型的循环。这也得到一个 path。

```
CGMutablePathRef path = CGPathCreateMutable();

CGPathAddLines (path, NULL, self.points, kPointCount);

CGContextAddPath (context, path);
CGContextStrokePath (context);
```

Swift 实现也还是差不多：

```
let path = CGPathCreateMutable()

CGPathAddLines (path, nil, self.points, self.points.count)

CGContextAddPath (context, path)
CGContextStrokePath (context)
```

第三种画线方法是分别画出每一条线段。每一条线段有其自己的 end-cap，并且有相应的 line dash 应用在上面。在连接处不会有斜角连接出现，因为对 CG 来说并没有连接在一起的线。

```
for (NSInteger i = 0; i < kPointCount - 1; i++) {
    CGMutablePathRef path = CGPathCreateMutable();

    CGPathMoveToPoint (path, NULL, self.points[i].x, self.points[i].y);
    CGPathAddLineToPoint (path, NULL, self.points[i + 1].x, self.points[i + 1].y);

    CGContextAddPath (context, path);
    CGContextStrokePath (context);
}
```

Swift 当然也是几乎一模一样，除了循环结构：

```
for i in 0 ..< points.count - 1 {
    let path = CGPathCreateMutable()
    CGPathMoveToPoint (path, nil, points[i].x, points[i].y)
    CGPathAddLineToPoint (path, nil, points[i + 1].x, points[i + 1].y)

    CGContextAddPath (context, path)
    CGContextStrokePath (context)
}
```

最后一种形式也是绘制单独的线段。`CGContextStrokeLineSegements` 用到一个点对数组，并且以偶数点 X 作为开始到 X+1 作为结束画线段。因此，对于包含三个线段的，它从 0->1，2->3 以及 4->5 画线。GrafDemo 的数据并不是一个渐变形势，因此有一些数据重排的工作需要做。

Objective-C 这一边使用了一个堆栈缓冲区来维持这些点。如果有可能其大小变得巨大的话，使用动态大小的堆栈缓冲区时要当心。如果你预期有大量的点，可能要想着动态分配一些内存。

```
CGPoint segments[kPointCount * 2];
CGPoint *scan = segments;

for (NSInteger i = 0; i < kPointCount - 1; i++) {
    *scan++ = self.points[i];
    *scan++ = self.points[i + 1];
}

// Strokes points 0->1 2->3 4->5
CGContextStrokeLineSegments (context, segments, kPointCount * 2);
```

Swift 很相似，不过免除了要注意堆栈缓冲区的麻烦。

```
var segments: [CGPoint] = []

for i in 0 ..< points.count - 1 {
    segments += [points[i]]
    segments += [points[i + 1]]
}

// Strokes points 0->1 2->3 4->5
CGContextStrokeLineSegments (context, segments, segments.count)
```

## 表现

在进行总结之前的最后一点。Core Graphics 可以相当快，但它有一个问题就是在一个 path 中重叠线段的计算开销很高。当 Quartz 渲染一个 path，它不可能就说，”好吧，画这个线段。现在画这个线段。“而不管其他进程。想想一下你在画一个绿色半透明的线。如果你盲目的将线段互相画在其它各自之上，你可能会因为有一些图层的半透明绿色”颜料“重叠而得到深一些的颜色。在画一个线段之前，Quartz 需要搞清楚重叠的部分在哪一集不要重复绘制。

下面是将一组线作为一个 path 绘制或者作为多个线段绘制的效果：

![](https://www.bignerdranch.com/assets/img/blog/2015/05/cg3-overlap.png)

注意看看当你有一大堆互相重叠的线时的表现——重叠部分的计算成本（相对于所有其它 Quartz 的工作）是大于 O(N) 的并且当有大量线段是变得相当高昂。

## 下一次

都是关于 path 的。Path！Path！