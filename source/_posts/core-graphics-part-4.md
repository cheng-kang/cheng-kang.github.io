---
title: 【译】Core Graphics，第四部分：Path！Path！
date: 2017-05-29 21:18:57
tags:
- iOS
- Core Graphics
---

> 原文链接：[Core Graphics, Part 4: A Path! A Path!](https://www.bignerdranch.com/blog/core-graphics-part-4-a-path-a-path/)
> 看看上一篇吧：[【译】Core Graphics，第三部分：线](http://chengkang.me/2017/05/23/core-graphics-part-3/)

在 Core Graphics 中，一个 `path` 就是对某种形状的一步一步的描述。它可以是一个圆、一个正方形、一个桃心、一个字频柱状图或者可能是一个笑脸。它并不包含任何诸如像素颜色、线宽或渐变这样的信息。路径主要是用于绘制——将其用颜色填充或者描边——用颜色描出轮廓。你之前看到的各种 [`GState`](https://www.bignerdranch.com/blog/core-graphics-part-2-contextually-speaking/) 参数控制着 path 如何被绘制，包括例如 line join 和 dash pattern 在内的所有[线属性](https://www.bignerdranch.com/blog/core-graphics-part-three-lines/)。

这一次让你看看 path 是什么组成的。下一次你会看到一些用 path 能做的远非简单绘制的很酷的东西。

<!--more-->

虽然一个 path 代表了一个理想图形的配方，它需要被渲染出来才能被人真正看到。每一个 Core Graphics context 都尽其可能将 path 渲染出来。当绘制一个位图时，任何曲线和斜线都是反锯齿化的。这意味着使用阴影来欺骗眼睛使其一位这个形状是平滑的即使它是由方形像素点组成的。当在打印机上绘制时，同样的事情发生着，不过用的是极其小的像素点。当绘制 PDF 时，path 大部分仅仅是原位防止，因为 Core Graphics 绘制模型和 PDF 绘制模型基本是一样的。PDF 引擎（例如 Preview 或者 Adobe Acrobat）会去渲染那些 PDF path 而非 Core Graphics 引擎。

你可以试试 [GrafDemo](https://github.com/markd2/grafdemo) 里面的 path。大多数这里的截图都来自 GrafDemo 里的 Path 部分、Arcs 以及 All The Parts 窗口。

## 路径元素

一个 path 就是由一些被称之为*元素*的原始形状（曲线、弧和直线）连接起来的一系列点。你可以想象每一个元素是给一个专门的拿着铅笔的机器人的一个指令。你告诉这个机器人要提起铅笔并移动到笛卡尔平面的一个点，但是不要留下任何 印记。你可以告诉这个机器人去把铅笔落下来然后从当前的点到一个新点间画点什么。有五种基本的路径元素：

*Move to Point*——移动当前的点到一个新的位置但不画任何东西。机器人抬起铅笔并且移动它的手臂。

*Add Line To Point*——从当前点到一个新点间添加一条线。机器人将铅笔落下来并画出一条直线。以下是一次*移动到点*（左下方）和其后的两次*添加线到点*：

```
path.move(to: startPoint)
path.addLine(to: nextPoint)
path.addLine(to: endPoint)
```

![](https://www.bignerdranch.com/assets/img/blog/2017/02/apath-moveto---x----158-132x---.gif)

*添加二次曲线到点 Add Quad Curve To Point*——通过一个控制点，从当前点到一个新点间添加一条二次曲线。机器人落下了铅笔并在绘制一条曲线。这条线并不是直接划到那个控制点——相反这个控制点影响着（线的）形状。控制点离曲线越远，形状就越极端。

```
path.move(to: firstPoint)
path.addQuadCurve(to: endPoint, control: controlPoint)
```

![](https://www.bignerdranch.com/assets/img/blog/2017/02/apath-quadcurve---x----155-130x---.gif)

*Add Curve To Point*——通过两个控制点，从当前点到新点添加一条三次[贝塞尔曲线](https://vimeo.com/106757336)。和二次曲线一样，控制点影响着这条线该如何画。二次曲线无法自身形成一个环，但是贝塞尔曲线可以。如果你曾在 Photoshop 或者 Illustrator 中使用过钢笔工具，你就和贝塞尔曲线打过交道了。

```
path.move(to: firstPoint)
path.addCurve(to: endPoint,
              control1: firstControl,
              control2: secondControl)
```

![](https://www.bignerdranch.com/assets/img/blog/2017/02/apath-beziercurve---x----155-130x---.gif)

*Close Subpath*——从当前点到路径的第一个点间添加一条直线。更确切地说，最近的那个 move-to-point （的点）。你会希望闭合一个路径而非添加一条线到起始位置。根据你如何计算这些点，累积的浮点化整可能使得计算出的终点和起始点不一样。以下（代码）可以绘制一个三角形：

```
path.move(to: startPoint)
path.addLine(to: nextPoint)
path.addLine(to: endPoint)
path.closeSubpath()
```

![](https://www.bignerdranch.com/assets/img/blog/2017/02/apath-closed-path---x----145-132x---.gif)

注意这个名字是 *Close Subpath*。通过执行一次 move-to 操作，你可以创建一个包含分离部分的路径，例如这个在我们 [Advanced iOS bootcamp](https://www.bignerdranch.com/training/courses/advanced-ios-bootcamp/) 中新练习题里的一个柱状图。这些柱形都是用一个路径绘制的。这个路径被用来给它们上色，并且描出轮廓以清楚地区别各个柱形。

![](https://www.bignerdranch.com/assets/img/blog/2017/02/apath-infographic---x----462-298x---.png)

## 那样做方便吗？

简单的图形用那仅有的五个基本路径元素去生成的话（代码、过程）可能会变得很冗长。Core Graphics （或者说 CG）提供了一些简便方法来添加常见的形状，比如矩形、椭圆或者一个圆角矩形。

```
let squarePath = CGPath(rect: rect1, transform: nil)
let ovalpath = CGPath(ellipseIn: rect2, transform: nil)
let roundedRectanglePath = CGPath(roundedRect: rect3,
                                  cornerWidth: 10.0,
                                  cornerHeight: 10.0,
                                  transform: nil)
```

这些方法使用了一个 *transform* 对象作为它们最后一个参数。你会在之后的文章中看到更多关于 transform 的东西，因此暂时只传个 nil 就行了。以上的方法（`CGPath(rect:tranform:)`、`CGPath(ellipseIn:transform:)`和`CGPath(roundedRect:cornerWidth:cornerHeight:transform:)`）生成了这些形状：

![](https://www.bignerdranch.com/assets/img/blog/2017/02/apath-conveniences---x----860-230x---.png)

同样也还有一些可以让你用一个就能创建更复杂的路径的方法，例如多个矩形或者多个椭圆、多个线段或者一整个别的路径。

## Noah 的 ARCtangent

你也可以加一点弧在里面，就是一个圆形边的部分。用哪一个取决于你手上握着什么值。

*Arc*——需要给定你想要的弧所在的那个圆的圆心、它的半径以及起始和终止角度（用弧度表示）。那个圆从起始角度到终止角度之间的那一段将会被绘制。弧的终点成为了当前点。以下代码绘制了左边的线，外加一个圆：

```
path.move(to: startPoint)
path.addLine(to: firstSegmentPoint)
path.addArc(center: centerPoint,
            radius: radius,
            startAngle: startAngle,
            endAngle: endAngle,
            clockwise: clockwise)
```

![](https://www.bignerdranch.com/assets/img/blog/2017/02/apath-arc---x----217-262x---.gif)

*Relative Arc*——这个与正常的弧类似。需要给定圆心、半径和起始角度。但并不是要给定一个终止角度，而是你要说明要从起始角度往前或者往后画多少个弧度：

```
path.move(to: startPoint)
path.addLine(to: firstSegmentPoint)
path.addRelativeArc(center: centerPoint,
                    radius: radius,
                    startAngle: startAngle,
                    delta: deltaAngle)
```

![](https://www.bignerdranch.com/assets/img/blog/2017/02/apath-relative-arc---x----217-262x---.gif)

*Arc to Point*——这个就有点奇怪了。你需要给定圆半径和两个控制点。在后台呢，当前的店会和第一个控制点连接，然后与第二个控制点形成一个角度。这些线接下来被用于构建一个有着给定半径并正切于这些线的圆。我将这种弧称作 “Arc to Point” 是因为其底层的 C API 名字叫 `CGContextAddArcToPoint`。

```
path.move(to: startPoint)
path.addLine(to: firstSegmentPoint)
path.addArc(tangent1End: tangent1Point,
            tangent2End: tangent2Point,
            radius: radius)
```

![](https://www.bignerdranch.com/assets/img/blog/2017/02/apath-arc-to-point---x----217-192x---.gif)

我在试着想出一个这个方法的好的应用场景时，朋友 [Jeremy W. Sherman](https://www.bignerdranch.com/about/the-team/jeremy-sherman/) 想到一个很酷的应用：如果你想做一个曲面的交叉影线时可能比较有用，想想“给一把剑的顶部加一点阴影”——你可以重复同样的正切并且改变半径来画一些离顶部越来越远的弧。

你可能已经注意到了这些弧的方法可以用直线段来连接圆弧。用前两个弧方法来创建一个新的路径是不会创建这个连接用的线段的。Arc to point 可能会包含那个初始的部分。

## Path vs Context 操作

有两种在代码里创建路径的方法。第一种方式是告诉 context：“嘿，创建一个新的 path” 并开始累积 path 元素。这个 path 在你描边或者填充时就消失了。没了。拜拜了。这个 path 也并没有被保存或者可以在你保存恢复 GState 的时候恢复——它实际上并不是 GState 的一部分。每一个 context 只有一个在用状态的 path。

一下是当前 context 被用于构建和描边一个 path 时的例子：

```
let context = UIGraphicsGetCurrentContext()
context.beginPath()
context.move(to: controlPoints[0])
context.addQuadCurve(to: controlPoints[1], control: controlPoints[2])
context.strokePath()
```

这些对于那些一次性的只创建一次、用一次然后被遗忘的 path 非常棒。

你也可以创建一个新的 `CGMutablePath` path 对象（一个 `CGPath` 类型的 mutable 子类，与 `NSArray / NSMutableArray` 间的关系类似）并在其中累积 path 组件。这是一个你可以一直用的实例。要用一个 path 对象绘制的话，你要将这个 path 添加到 context 中然后执行描边与/或填充操作：

```
let path = CGMutablePath()
path.move(to: controlPoints[0])
path.addQuadCurve(to: controlPoints[1], control: controlPoints[2])

context.addPath(path)
context.strokePath()
```

对于你常用的形状（比如卡片游戏里的那一套图标），你可能希望创建一个红心 path 和一个方片 path 一次然后用它们一次次绘制。

## 如何创建？

那么你如何才能创建出有用又有趣的 path 呢，比如心形或者笑脸？一个方法是做好数学功课并计算出点、线、曲线和弧需要怎么走。

另一个方法就是用软件工具。有一些可以让你画形状的的应用，然后返回给你一堆可以直接粘贴到你的应用中的 CG 代码。同时也有一些可以将其他形式数据（例如来自 Illustrator的、PDF 或者 SVG）转换成 path 的库。我在给 [Protocols part 2: Delegation](https://www.bignerdranch.com/blog/protocols-part-2-delegation/) 准备的 world demo app 中的可点击地图中使用了 SVG。

## 路径，结构

Core Graphics 路径是不透明数据类型。你先累积路径元素然后在 context 中渲染它。为了了解内部情况，使用 `CGPath` 的 `apply(info:function:)` 方法来遍历路径组件。你可以提供一个被每一个路径元素重复调用的方法（在 Swift 中你可以用闭包）。（你可以忽略 info 参数通过传 `nil`。这是在 Swift Core Graphics API 底下的 C API 的一个延续。在 C 里面你需要提供一个方法并传递任何你需要在里面使用到的对象。用闭包的话你就只需要用你需要的那些。）

也因为其对 C 的继承，这个传进来的方法或闭包是一个 `UnsafePointer<CGPathElement>`。这是一个指向内存中 `CGPathElement` 的指针。你需要通过 `pointee` 来引用那个指针以得到实际的 `CGPathElement`。这个 path 元素有一个用于表现其类型的枚举值，还有一个指向一个指针数组里的第一个 `CGPoint` 的 `UnsafeMutablePointer<CGPoint>`。你需要自己去搞清楚你可以从那个数组里面安全读取多少指针。

下面是一个 `CGPath` 扩展，它可以让一个 path 倾倒出其内容。你也可以从这个 [gist](https://gist.github.com/markd2/7bd2a5e2969b000f296828b3bcbf49f8) 中找到这段代码。

```
import CoreGraphics

extension CGPath {
    func dump() {
        self.apply(info: nil) { info, unsafeElement in
            let element = unsafeElement.pointee

            switch element.type {
            case .moveToPoint:
                let point = element.points[0]
                print("moveto - \(point)")
            case .addLineToPoint:
                let point = element.points[0]
                print("lineto - \(point)")
            case .addQuadCurveToPoint:
                let control = element.points[0]
                let point = element.points[1]
                print("quadCurveTo - \(point) - \(control)")
            case .addCurveToPoint:
                let control1 = element.points[0]
                let control2 = element.points[1]
                let point = element.points[2]
                print("curveTo - \(point) - \(control1) - \(control2)")
            case .closeSubpath:
                print("close")
            }
        }
    }
}
```

打印出之前创建那个 arc to point 图片的 path 展示出这条弧是一系列 curveTo 操作及连接用的直线：

```
path.move(to: startPoint)
path.addLine(to: firstSegmentPoint)
path.addArc(tangent1End: tangent1Point,
            tangent2End: tangent2Point,
            radius: radius)
path.addLine(to: secondSegmentPoint)
path.addLine(to: endPoint)
```

```
moveto - (5.0, 91.0)      // explicit code
lineto - (72.3, 91.0)     // explicit code
lineto - (71.6904767391754, 104.885702433811)   // added by addArc
curveTo - (95.5075588575432, 131.015122621923)
        - (71.0519422129889, 118.678048199439)
        - (81.7152130919145, 130.376588095736)
curveTo - (113.012569145714, 124.955236840146)
        - (101.903264013406, 131.311220082842)
        - (108.168814214539, 129.14221144167)
lineto - (129.666666666667, 91.0) // explicit code
lineto - (197.0, 91.0)   // explicit code
```

即使是一个用 `CGPath(ellipseIn:transform:)` 创建的“简单的”椭圆也有些复杂：

```
curveTo - (62.5, 107.0) - (110.0, 86.4050984922165) - (88.7335256169627, 107.0)
curveTo - (15.0, 61.0) - (36.2664743830373, 107.0) - (15.0, 86.4050984922165)
curveTo - (62.5, 15.0) - (15.0, 35.5949015077835) - (36.2664743830373, 15.0)
curveTo - (110.0, 61.0) - (88.7335256169627, 15.0) - (110.0, 35.5949015077835)
```

## 之后

这一次你看到了创建一个 path、绘制它以及其中发生的一切。还有很多你可以用 path 做的事情，下次继续。