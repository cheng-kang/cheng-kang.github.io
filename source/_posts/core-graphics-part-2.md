---
title: 【译】Core Graphics, 第二部分：说说 context （上下文）
date: 1970-01-01 
tags:
- iOS
- Core Graphics
---
> Date: 2017-05-24 16:20:19

> 原文链接：[Core Graphics, Part 2: Contextually Speaking](https://www.bignerdranch.com/blog/core-graphics-part-2-contextually-speaking/)
> 看看上一篇吧：[【译】Core Graphics，第一部分：序章](http://chengkang.me/2017/05/23/core-graphics-part-1/)

context （上下文）就是 Quartz 的核心：你需要按照某种规范来与当前的 Core Graphics context 交互以真正绘制东西，因此熟悉它、它做什么以及为什么它是这样的是有益处的。

Core Graphics 里面一个基础的操作是创建一个 path。Path 是形状的数学描述。一个 path 可以是一个矩形，或一个圆、一个牛仔帽，或者甚至是泰姬陵。Path 可以用颜色填充——就是说，这个 path 中的所有的点都被设置成特定的颜色。Path 也可以画出轮廓（outlined），或者说叫描边（stroked）。这就像是用一支美术钢笔在路径周围画出一个轮廓。下面分别是一个只画出了轮廓的、一个只填充颜色的和一个既填充了黄色由描蓝边的帽子：

![](https://www.bignerdranch.com/assets/img/blog/2014/12/hat-path.png)

<!--more-->

你可以看到，实际的轮廓可以变得非常复杂。它可以是一种特定的颜色。（轮廓）线也可以有虚线图案。可以用粗线条描边也可以用细线。线的末端可以是方的或圆的，等等等等。有很多种属性。

如果你仔细研读 Core Graphics API，你并不会看到某个方法调用使用了所有的这些设置：

```
CGStrokePath (path, fillColor, strokeColor, lineWidth, dashPattern, bloodType, endCap)
```

相反，仅仅是这样：

```
void CGContextStrokePath(CGContextRef c)
```

那，那些额外的值从哪儿来的？它们就从 context 中来。

## 一桶零碎

Context 维持着一堆关于绘制的全局状态，它们是一堆独立的值：

- current path
- current fill 和 stroke colors
- line width 和 pattern
- line cap 和 join (miter) styles
- alpha (transparency), antialiasing 和 blend mode
- shadows
- transformation matrix
- text atrributes （文字属性） (font, size, matrix)
- 一些冷僻的东西比如 line flatness 和 interpolation quality
- 以及更多

有很多状态量。Core Graphics 维持的状态量的全集并没有被写入文档，因此可能还有更多的设置项。不同种类的 context （比如，图片与 PDF）可能包含额外种类的数据。

不管什么时候当 Core Graphics 被告知要绘制什么东西时，比如“填充一条路径（path），”它都从当前的 context 中去找需要的那部分数据。根据 context 中包含什么，同样的一个代码序列可以有完全不同的结果。一方面，这很强大。一段泛型的绘制代码可以通过 context 改变得到不同的结果。另一方面，context 是一大堆全局状态，而全局状态很容易被无意中搞得乱七八糟。

比如说有这么一段代码：

```
draw orange square:
    set color to orange in the current context
    fill a rectangle
```

你将得到一个橙色正方形。现在假设你还要绘制一个桃心：

```
draw red valentine:
    set color to red in the current context
    fill a valentine
```

耶！一个红心。现在比如说你把画桃心的代码加到你的第一个方法里：

```
draw orange square:
    set color to orange in the current context
    draw red valentine
    fill a rectangle
```

你的矩形会是红色而不是橙色。为什么呢？绘制桃心的代码抢占了当前的绘制颜色。你填充矩形的时候那个颜色本来是橙色，但是现在是红的了。如何避免这样的 bug 呢？

有两种方式。一种是在改变状态之前将状态保存起来——如果你要改变全局颜色，保存现在的颜色，改变颜色，绘制，然后恢复之前的颜色。这样只有一两个参数的时候还行，但是如果你要改变很多的时候这个方法并不能扩大规模。还有一些设置项因为一些副作用被改变，因此你也得考虑它们。噢，然后其实在 Core Graphics 里是没法这么做的，因为根本没有当前 context 的 getter。抱歉咯。

## 这些桶的栈（context 栈）

另外一种方式是在改变任何东西前保存*完整*的 context。保存 context，改变颜色或者线宽，绘制，然后恢复完整的 context。Core Graphics API 提供了保存和恢复当前 context 设置的方法。这些设置叫做 graphics state，或者是 GState。事实上，它在背后维持着一个 GStates 栈。

当你保存了当前 context 的设置，它们被压入一个栈中。每一个 context 都有一个栈。当你恢复 graphics state，之前保存的 GState 从栈中弹出来并且编程 context 当前的值。将桃心绘制代码这样修改可以修复“橙色矩形是红色”的 bug：

```
draw red valentine:
    save graphics state
    set color to red in the current context
    fill a valentine
    restore graphics state
```

然后。完整的绘制调用序列是这个样子的：

```
    set color to orange in the current context
    save graphics state
    set color to red in the current context
    fill a valentine
    restore graphics state
    fill a rectangle
```

下面是 GState 的改变：

![](https://www.bignerdranch.com/assets/img/blog/2014/12/gstates.png)

## Core Graphics API

好了，在抽象层面还行，但是这些东西在你实际看到它时是什么样呢？并不完全如你所想。Core Graphics 是一个 Core Foundation 味道的 API。有很多 Core Foundation 的传统影响着 Core Graphics。最主要的古怪点在于 Core Foundation 对于用指针声明东西有一种莫名其妙的恐惧。结果就是用 Objective-C 中的 “Ref” 类型，比如 `CGContextRef` 或者 `CGColorRef`。这些其实是类型重定义之后隐藏了那颗星的指针。

以下是正确的：

```
CGContextRef currentContext = ....; // 实际上是个指针
```

以下不正确：

```
CGContextRef *currentContext = ...; // 指向指针的指针
```

你的绘制代码很少会创建它在其中绘制的 context，而是使用当前 context。你可以在 iOS 中这样获取当前 context：

```
CGContextRef context = UIGraphicsGetCurrentContext ();
```

在 Desktop Cocoa，OS X 10.10 之前，用：

```
CGContextRef context = [NSGraphicsContext.currentContext graphicsPort]
```

在 10.10 之后：

```
CGContextRef context = [NSGraphicsContext.currentContext CGContext]
```

## 画啊，朋友！

因为 CG API 是一个面对对象的 C API，方法都是根据它们所操作的“对象”命名的（比如，`CGColor` 或者 `CGContext`），并且方法的第一个参数如同 Objective-C 中的 reveiver。因此就是那个“对象”被这些调用改变。

例如，下面是一个画矩形轮廓的 CGContext 调用：

```
CGContextRef context = ...;  // 参照上方对应平台的调用
CGRect bounds = someView.bounds;
CGContextStrokeRect (context, bounds);
```

（想了解更多关于矩形的东西？这有两篇 [Part 1](https://www.bignerdranch.com/blog/rectangles-part-1/), [Part 2](https://www.bignerdranch.com/blog/rectangles-part-2/)关于它们的文章。）

`CGContextStrokeRect` 取 `CGContextRef` 作为第一个参数。这个方法的目的是画出一个特定矩形的轮廓。如果 context 是 image context，或者是用来在屏幕上渲染图形的 context，一个矩形这么多的像素会被设置成 context 当前的颜色（当前的线宽，样式，等等）。如果当前的 context 是 PDF context，那一些指令会被记录下来，在这个 PDF 将来被渲染的时候最终绘制出一个矩形。

## 清洁 Context 

是时候来点拟真代码了。GrafDemo 是一个将会包含越来越多涉及 CG 各方面 demo 的 app。你可以在 [GitHub](https://github.com/markd2/GrafDemo) 上找到源码。当前版本在这里 [Release cg-pt2](https://github.com/markd2/GrafDemo/releases/tag/release-cg-pt2)。

GrafDemo 包含一个绘制了一个在白色背景上由粗蓝线包围的绿色圆形的 NSView，整个 view 由细黑边包围。

![](https://www.bignerdranch.com/assets/img/blog/2014/12/good-vs-sloppy-drawing.png)

这段代码有两个版本：一个有良好的清洁的 GState，另一个没有。请注意在那个 sloppy 版本，蓝色粗线泄露并污染了边界。如果你实际运行这个程序，你会看到这两个 view 并排在一起。一个是 Objective-C 版本；另一个是 Swift 版本。

这个 view 的子类有一个 convenience 方法用来获取当前 context。这应该会让其转移到 iOS 时更简单：

```
- (CGContextRef) currentContext {
    return [NSGraphicsContext.currentContext graphicsPort];
} // 挡墙 context
```

这个 view 的 `drawRect` 实现单纯地设置了描边和填充颜色，期望他们能被背景和边缘绘制方法给用上：

```
- (void) drawSloppily {
    CGContextRef context = self.currentContext;

    CGContextSetRGBStrokeColor (context, 0.0, 0.0, 0.0, 1.0); // Black
    CGContextSetRGBFillColor (context, 1.0, 1.0, 1.0, 1.0); // White

    [self drawSloppyBackground];
    [self drawSloppyContents];
    [self drawSloppyBorder];

}
```

背景和边缘的方法非常直接明了：

```
- (void) drawSloppyBackground {
    CGContextFillRect (self.currentContext, self.bounds);
}

- (void) drawSloppyBorder {
    CGContextStrokeRect (self.currentContext, self.bounds);
}
```

他们都假设 context 是像 `drawRect` 设置的那样。但是！问题来了：

```
- (void) drawSloppyContents {
    CGContextRef context = self.currentContext;

    CGRect innerRect = CGRectInset (self.bounds, 20, 20);

    CGContextSetRGBFillColor (context, 0.0, 1.0, 0.0, 1.0); // Green
    CGContextFillEllipseInRect (context, innerRect);

    CGContextSetRGBStrokeColor (context, 0.0, 0.0, 1.0, 1.0); // Blue
    CGContextSetLineWidth (context, 6.0);
    CGContextStrokeEllipseInRect (context, innerRect);

}
```

注意颜色和线宽的改变。context 保持的是一些全局的状态，因此当前的填充和描边颜色，以及当前的线宽都被污染了。

## 把我压进去，把你弹出来

修复这个问题的方法就是在绘制内容前将 graphics context 压入栈。`CGContextSaveGState` 将当前的 graphics context、 state 的一份拷贝压入栈中。`CGContextRestoreGState` 从栈顶弹出并替换当前的 context。

下面是会保存 graphics state 的好一点的版本的内容绘制（代码）：

```
- (void) drawNiceContents {
    CGContextRef context = self.currentContext;

    CGContextSaveGState (context); {
        CGRect innerRect = CGRectInset (self.bounds, 20, 20);

        CGContextSetLineWidth (context, 6.0);

        CGContextSetRGBFillColor (context, 0.0, 1.0, 0.0, 1.0); // Green
        CGContextFillEllipseInRect (context, innerRect);

        CGContextSetRGBStrokeColor (context, 0.0, 0.0, 1.0, 1.0); // Blue
        CGContextStrokeEllipseInRect (context, innerRect);

    } CGContextRestoreGState (context);

}
```

通过简单地包裹保存、恢复就阻止了这个方法污染其他的方法。

一点关于花括号的事情：这是我个人在有一些平衡的调用时的假模假式，比如说在保存和恢复 GState，或者锁定和解锁互斥。这样非常清楚什么是处在保护中的，并且让它很清楚地能在一眼看下来时被发现有一个保护伞存在，这比一堆左对齐的代码容易看见得多。它们实际上并非 Core Graphics API 的一部分。

## Swift

好了，那 Swift 怎么样？GrafDemo 有平行的 Objective-C 实现和 Swift 实现，因此随便选择你要研读哪一段示例代码吧。

幸运的是，用 Swift 写的 CG 的代码和它在 Objective-C 中一样，只是没有了结尾的分号。下面是 sloppy 内容绘制在 Swift 中的样子。`currentContext` 是一个返回当前绘制 context 的属性（稍后更多细节）：

```
func drawSloppyContents() {
    let innerRect = CGRectInset(bounds, 20.0, 20.0)

    CGContextSetRGBFillColor (currentContext, 0.0, 1.0, 0.0, 1.0) // Green
    CGContextFillEllipseInRect (currentContext, innerRect)

    CGContextSetRGBStrokeColor (currentContext, 0.0, 0.0, 1.0, 1.0) // Blue
    CGContextSetLineWidth (currentContext, 6.0)
    CGContextStrokeEllipseInRect (currentContext, innerRect)
}
```

## Scope 的把戏

不幸的是，我的小把戏在 Swift 中不管用：未经修饰的花括号对变成了一个闭包并造成了语法错误。一种方法是通过创建一个包含这个闭包的函数，并且用它来包裹保存和恢复 context。这个方法如下：

```
private func saveGState(drawStuff: () -> ()) -> () {
    CGContextSaveGState (currentContext)
    drawStuff()
    CGContextRestoreGState (currentContext)
}
```

以及相关的用法：

```
func drawNiceContents() {
    saveGState {
        let innerRect = CGRectInset(self.bounds, 20.0, 20.0)

        CGContextSetRGBFillColor (self.currentContext, 0.0, 1.0, 0.0, 1.0) // Green
        CGContextFillEllipseInRect (self.currentContext, innerRect)

        CGContextSetRGBStrokeColor (self.currentContext, 0.0, 0.0, 1.0, 1.0) // Blue
        CGContextSetLineWidth (self.currentContext, 6.0)
        CGContextStrokeEllipseInRect (self.currentContext, innerRect)
    }
}
```

主要的缺点就是你必须使用 `self` 来在那个块里引用东西。我还没有决定是否要一直使用这个方法。

## 获取 Context

获取 `CGContext` 在 iOS 和 OS X 10.10（以及之后）中相当简单。谢天谢地，Swift 舍弃了类型中的 ”Ref“ 部分，因此你只需要 CGContext。下面是如何在 iOS 中获取当前 context：

```
let context = UIGraphicsGetCurrentContext()
```

`context` 是推断类型 CGContext？。它可以为 nil 因为有可能当前没有 context。Objective-C 中 `UIGraphicsGetCurrentContext()` 返回一个 `CGContextRef`，因此这个转换是非常容易的。

OS X 10.10 中给 `NSGraphicsContext` 添加了一个 `CGContext` 属性：

```
let context = NSGraphicsContext.currentContext?.CGContext
```

OS X 10.9 就没这么幸运。`NSGraphicsContext -graphicsPort` 的调用返回一个 `void*`。Swift 并没有让改变指针类型变得简单。下面是一个解决方案：

```
private var currentContext : CGContext? {
    get {
        // The 10.10 SDK provides a CGContext on NSGraphicsContext, but
        // that's not available to folks running 10.9, so perform this
        // violence to get a context via a void*.
        // iOS can just use UIGraphicsGetCurrentContext.

        let unsafeContextPointer = NSGraphicsContext.currentContext()?.graphicsPort

        if let contextPointer = unsafeContextPointer {
            let opaquePointer = COpaquePointer(contextPointer)
            let context: CGContextRef = Unmanaged.fromOpaque(opaquePointer).takeUnretainedValue()
            return context
        } else {
            return nil
        }
    }
}
```

简单来说，`unsafeContextPointer` 是一个 `UnsafeMutablePointer<Void>?`。如果它不为 nil，用一个 `COpaquePointer` 将其包裹起来。这只是为了你可以将它传入 `Unmanaged`。`Unmanaged` 可以使用这个指针的值，并且因为 `CGContext` 像 `NSObject` 一样有引用计数，使用 unretain 的值就将生命周期所有权转交给 ARC 了。`takeUnretained` 是说”嘿 ARC，这个值你管着吧。它现在是 unretain 的状态，并且可能在 autorelease 池放干时跑不见了。你想办法让它在需要的时候一直在吧。“

## 联盟中的 GState

这一次，你遇见了 Core Graphics context，这是一筐筐绘制属性。context 是一个不透明的结构，因此你并不知道里面潜藏着什么。也因为这个全局状态，以及有一些 Core Graphics 调用有副作用的事实（之后会看到，当 path 重新出现的时候），几乎不可能在改变绘制属性之前保存它们。

Core Graphics 有 graphics state 栈的概念，这也存在于 PostScript 中。你可以用 `CGContextSaveGState` 来将当前 graphics state 的一份拷贝压入栈并且可以通过 `CGContextRestoreGState` 弹出保存的状态有效地撤销任何对 context 的改变。有一些会污染 context 导致后续绘制出错的代码？用 Save/Restore 包裹把它起来。

Core Graphics 的代码在 Objective-C 和 Swift 中几乎一模一样。在 iOS 和 OS X 上业绩会一模一样，因此 Core Graphics 代码是在相对 Apple 生态系统中的其他部分中移植性相当好的。Swift 中唯一真正困难的是在 Mavericks 系统中从 Cocoa 将 `void*` 装换成 `CGContext` （基本上只是从内存地址 A 到内存地址 B 复制 4-8 位），因为 Swift 试图让程序员远离那些底层细节。如果你针对的是 Yosemite 及之后的版本，这就不是个问题了。

下一次：Lines！（是 Lines-爽-耶-开心-好玩-时间，而非 Lines-隐式-未展开的-可选值。）