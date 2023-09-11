---
title: 【译】哥们儿，我的方法哪儿去了？
date: 1970-01-01 
tags:
- iOS
- Swift
---
> Date: 2017-05-25 20:09:58

> 原文链接：[Dude, Where's my Call?](https://www.bignerdranch.com/blog/dude-wheres-my-call/)

想象有一天你正在给 Swift 编译器喂一些看起来无害的代码。

```
// xcrun -sdk macosx swiftc -emit-executable cg.swift

import CoreGraphics

let path = CGPathCreateMutable()
CGPathMoveToPoint(path, nil, 0.0, 23.0)
```

然后一个冲击波打来：

```
cg.swift:7:12: error: 'CGPathCreateMutable()' has been replaced by 'CGMutablePath.init()'
<unknown>:0: note: 'CGPathCreateMutable()' has been explicitly marked unavailable here
cg.swift:8:1: error: 'CGPathMoveToPoint' has been replaced by instance method 'CGMutablePath.moveTo(_:x:y:)'
<unknown>:0: note: 'CGPathMoveToPoint' has been explicitly marked unavailable here
```

它们哪儿去了？被重命名了。

<!--more-->

Swift 3 一个重大的特性就是由 Swift-Evolution 提议 [SE-0005 (Better Translation of Objective-C APIs Into Swift)](https://github.com/apple/swift-evolution/blob/master/proposals/0005-objective-c-name-translation.md) 和 [SE-0006 (Apply API Guidelines to the Standard Library)](https://github.com/apple/swift-evolution/blob/master/proposals/0006-apply-api-guidelines-to-the-standard-library.md) 带来的”超级重命名“，这次超级重命名重命名了 C 和 Objective-C API 中的一些方法以给它们一种更 Swift 的感觉。Xcode 里面有一个移植器会将你的 Swift 2 代码转换成新的风格。它会执行很多机械的改变，给你留一些由于其他语言改变需要扫尾的工作，例如[移除 C 的 for 循环](https://github.com/apple/swift-evolution/blob/master/proposals/0007-remove-c-style-for-loops.md)。

有一些重命名相当轻微，比如 NSView 中的这个：

```
// Swift 2
let localPoint = someView.convertPoint(event.locationInWindow, fromView: nil)

// Swift 3
let localPoint = someView.convert(event.locationInWindow, from: nil)
```

在这里 `Point` 从方法名里移除了。你知道自己正在处理一个 point，所以没必要重复这一事实。`fromView` 重命名为了 `from` 因为 `View` 只是提供了冗余的类型信息，并没有让这个调用更清楚。

其他的改变更大一些，比如 Core Graphics：

```
// Swift 2 / (Objective-C)
let path = CGPathCreateMutable()
CGPathMoveToPoint (path, nil, points[i].x, points[i].y)
CGPathAddLineToPoint (path, nil, points[i + 1].x, points[i + 1].y)
CGContextAddPath (context, path)
CGContextStrokePath (context)

// Swift 3
let path = CGMutablePath()
path.move (to: points[i])
path.addLine (to: points[i + 1])

context.addPath (path)
context.strokePath ()
```

喔噢。这变化太大了。这个 API 现在看起来就是让人喜欢的 Swift 风格 API 而不是旧式的 C API。Apple 在 Swift 里面完全改变了 Core Graphics API （还有 GCD）以让它们更好用。你在 Swift 3 里不能再用老式的 CG C 风格的 API，因此你需要开始习惯新的风格。我已经将 GrafDemo （我这些 [Core Graphics](http://chengkang.me/2017/05/23/core-graphics-part-1/) 博文的示例程序） 在自动翻译器中跑过（两次）了。你可以在这个 [pull](https://github.com/markd2/GrafDemo/pull/17/files) 请求中看到 Swift 3 第一个版本前后的变化，在这个 [pull](https://github.com/markd2/GrafDemo/pull/18/files) 请求中看到 Xcode8b6 的 Swift 3 版本前后变化。

## 他们干什么了？

Core Graphics API 就是一堆全局变量和全局自由方法。就是说，方法并不是直接和某些比如说类或者结构体这样的实例绑定的。用 `CGContextAddArcToPoint` 来操作 `CGContext` 仅仅是一个传统，不过你传进去一个 `CGColor` 也不会有人拦着你。无非就是会在运行时爆炸而已。只是在 C 风格的面向对象你才有一个隐晦类型作为第一个参数传过去，作为某种神奇饼干。`CGContext*` 方法需要一个 `CGContextRef`。`CGColor*` 方法需要一个 `CGColorRef`。

通过一些编译器的魔法，Apple 将这些隐晦引用转成了类，并且添加了一些方法给这些类以将其映射到 C API。当编译器看到类似这样的东西时：

```
let path = CGMutablePath()
path.addLines(between: self.points)
context.addPath(path)
context.strokePath()
```

实际上，在背后，正在发出这一系列调用：

```
let path = CGPathCreateMutable()
CGPathAddLines(path, nil, self.points, self.points.count)
CGContextAddPath(context, path)
CGContextStrokePath(context)
```

## “新的”类

以下是已经接受 Swift 3.0 治疗的常见的隐晦类型 （忽略了一些专用的类型比如 `CGDisplayMode` 或者 `CGEvent`），还有一两个作为代表的方法：

- `CGAffineTransform - translateBy(x:30, y:50), rotate(by: CGFloat.pi / 2.0)`
- `CGPath / CGMutablePath - contains(point, using: evenOdd), .addRelativeArc(center: x, radius: r, startAngle: sa, delta: deltaAngle)`
- `CGContext - context.addPath(path), context.clip(to: cgrectArray)`
- `CGBitmapContext (folded in to CGContext) - let c = CGContext(data: bytes, width: 30, height: 30, bitsPerComponent: 8, bytesPerRow: 120, space: colorspace, bitmapInfo: 0)`
- `CGColor - let color = CGColor(red: 1.0, green: 0.5, blue: 0.333, alpha: 1.0)`
- `CGFont - let font = CGFont("Helvetica"), font.fullName`
- `CGImage - image.masking(imageMask), image.cropping(to: rect)`
- `CGLayer - let layer = GCLayer(context, size: size, auxilaryInfo: aux), layer.size`
- `CGPDFContext (folded in to CGContext) / CGPDFDocument - context.beginPDFPage(pageInfo)`

`CGRect` 和 `CGPoint` 在 Swift 3 之前早已有了一些很不错的扩展。

## 怎么做到的？

编译器有一个内置的语法转换器，它将 Objective-C 的明明风格转换成更 Swift 些的形式。去掉重复的单词和那些仅仅是重复类型信息的单词。还去掉了一些之前是在方法调用左括号之前的单词并将它们移到括号里面作为参数标签。通过这样自动清理了一大堆调用方法。

当然，人类喜欢搞一些微妙复杂的言辞，因此在 Swift 编译器里有一个允许手动重写自动翻译器翻译的部分的机制。这是具体的实现了（别在输出产品时依靠他们），不过他们提供了深入了解用于让现存 API 出现在 Swift 中所做的那些工作的机会。

其中一个涉及到的机制是 ”overlay“，它是当你引入一个框架或者 C 库时编译器引用的第二个库。[Swift Lexicon](https://raw.githubusercontent.com/apple/swift/master/docs/Lexicon.rst) 将 overlay 形容为”当库在系统中不发被修改时在系统中增强和扩大这个库“。一些一直都存在很棒的 `CGRect` 和 `CGPoint` 扩展，例如`someRect.divide(30.0, fromEdge: .MinXEdge)`，怎么来的？他们来自 overlay。工具链想啊”噢，我看到你在链接 Core Graphics。让我再加点方便方法吧。“

还有另外一个机制，[apinotes](https://github.com/apple/swift/tree/master/apinotes)，特别是 [CoreGraphics.apinotes](https://github.com/apple/swift/blob/master/apinotes/CoreGraphics.apinotes)，一字一词地控制着 Core Graphics 中地命名和可见性。

例如，在 Swift 中像 `CGRectMake` 这样用来初始化基础结构体的调用没有作用，因为已经有它们的初始化方法了。所以就让这些调用方法不可用了：

```
# The below are inline functions that are irrelevant due to memberwise inits
- Name: CGPointMake
  Availability: nonswift
- Name: CGSizeMake
  Availability: nonswift
- Name: CGVectorMake
  Availability: nonswift
- Name: CGRectMake
  Availability: nonswift
```

然后还有其他的映射——如果你在 Swift 中看到这个，那就调用那个方法：

```
# The below are fixups that inference didn't quite do what we wanted, and are
# pulled over from what used to be in the overlays
- Name: CGRectIsNull
  SwiftName: "getter:CGRect.isNull(self:)"
- Name: CGRectIsEmpty
  SwiftName: "getter:CGRect.isEmpty(self:)"
```


如果编译器看到了比如 `rect.isEmpty()` 这样的东西，它会发送一个请求给 `CGRectIsEmpty`。

以下还是一些方法和功能的重命名：

```
# The below are attempts at providing better names than inference
- Name: CGPointApplyAffineTransform
  SwiftName: CGPoint.applying(self:_:)
- Name: CGSizeApplyAffineTransform
  SwiftName: CGSize.applying(self:_:)
- Name: CGRectApplyAffineTransform
  SwiftName: CGRect.applying(self:_:)
```

当编译器看到 `rect.applying(transform)`，它就知道调用 `CGRectApplyAffineTransform`。

编译器只能自动重命名 Objective-C API，因为其遵循良好的系统命名法。C API （比如 Core Graphics）需要通过 overlay 和 apinote 来实现。

## 你能做什么

你可以通过 `NS_SWIFT_NAME` 做一些类似 apinote 机制的事情。你可以用这个宏来注释 C/Objective-C 头文件，表示在 Swift 里要用那个名字。编译器会对你的 `NS_SWIFT_NAME` 采用同样的替换（”如果看到 X，就调用 Y“）。

例如，这是一个 Intents(Siri) 框架中的调用：

```
- (void)resolveWorkoutNameForEndWorkout:(INEndWorkoutIntent *)intent
                         withCompletion:(void (^)(INSpeakableStringResolutionResult *resolutionResult))completion
     NS_SWIFT_NAME(resolveWorkoutName(forEndWorkout:with:));
```

从 Objective-C 中调用它的话看起来是这样：

```
NSObject<INEndWorkoutIntentHandling> *workout = ...;

[workout resolveWorkoutNameForEndWorkout: intent  withCompletion: ^(INSpeakableStringResolutionResult) {
     ...
}];
```

而在 Swift 中是这样：

```
let workout: INEndWorkoutIntentHandling = ...
workout.resolveWorkoutName(forEndWorkout: workout) {
    response in
    ...
}
```

`NS_SWIFT_NAME`，和 Objective-C 中的轻量级泛型，nullability 注释，以及 Swift 编译器中的自动 Objective-C API 重命名一起，可以让你立刻有一种接口都回到 Swift 世界中的感觉。

使用自制的 overlay 和 apinote 是可以的，但那些原本是在 Swift 和 Apple 的 SDK 结合在一起时用的。你可以在你自己的框架中分发 apinote，但是 overlay 需要从 Swift 编译器树中编译。

为了自己创建更 Swift 的 API，你必须尽可能地做好头文件旁听（比如添加 nullability 注释和 NS_SWIFT_NAME），然后在你的项目中放一些 Swift 文件来伪造 overlay 以覆盖任何多余情况。这些 ”overlay” 文件在有 ABI 稳定性前都需要作为源文件传送。

轻掠过 iOS 10 头文件，看起来新的 API 喜欢用 `NS_SWIFT_NAME`，而老一点的更久远一些的 API 用 apinote。这样有一些道理因为这些头文件是在不同 Swift 版本中共享的，而给更久远的头文件可能添加新的 `NS_SWIFT_NAME` 可能会在编译器未改变的情况下破坏当前的代码。而且，apinote 可以由编译器团队或者社区成员添加，而头文件的改变需要拥有这个头文件的团队的注意。而那个团队可能已经准备好正要发布他们的功能了。

## 它好吗？

Swift 3 版本的 Core Graphics 绝对是更优秀更加 Swift 化。老实说，我也想在 Objective-C 上这样用。你可能因此失掉一些可 Google 性，并且需要当你在 Stack Overflow 的文章或者网上的教程中看到现有的 CG 代码时做一些脑内转换。不过那也不必这些日子普通的 Swift 代码所需的脑力运动多多少。

有一些由于 CG 类似 OO 本质及其如何进入 Swift 中带来的 API 的不协调。在这个 `CoreGraphics.apinotes` 中：

```
- Name: CGBitmapContextGetWidth
  SwiftName: getter:CGContext.width(self:)
- Name: CGPDFContextBeginPage
  SwiftName: CGContext.beginPDFPage(self:_:)
```

`CGBitmapContext` 和 `CGPDFContext` 方法都被 `CGContext` 偷去了。这意味着你可以对任何 `CGContext` 要它的宽度，或者叫它开始一个 PDF 页面。如果你找一个非位图 context 要它的宽，你会得到这样的运行时错误：

```
<Error>: CGBitmapContextGetWidth: invalid context 0x100e6c3c0.
If you want to see the backtrace, please set CG_CONTEXT_SHOW_BACKTRACE environmental variable.
```

因此即使这个 API 非常 Swift 化了，编译器并不能捕获某些类型的 API 错用。Xcode 会高高兴兴地给你其实实际上不合适的方法补全。某种意义上来说，C API 更安全一点，因为 `CGBitmapContextGetWidth` 很清楚地告诉你它要的是一个位图 context 即使第一个参数从技术上来说就还是一个 `CGContextRef`。我希望这仅仅是一个 bug （[rdar://27626070](https://openradar.appspot.com/radar?id=6161102635270144)）。

如果你想了解更多想超级重命名以及像 NS_SWIFT_NAME 这样的工具，看看这个吧 [WWDC 2016 Session 403 - iOS API Design Guidelines](https://developer.apple.com/videos/play/wwdc2016/403/)。

