---
title: AutoLayout：constraint priority 约束优先级（九宫格续，一个更优方案）
date: 1970-01-01 
categories:
- iOS
tags:
- AutoLayout
- iOS
- constraint priority
---
> Date: 2016-03-20 22:49:31

> 这两个项目的源码均在我的 github，如有需要直接下载下来试一试。
> - [模仿微博客户端](https://github.com/cheng-kang/iosDev/tree/master/Weibo)
> - [自适应高度测试用项目](https://github.com/cheng-kang/iosDev/tree/master/Dynamic%20Table%20View%20Test)

之前因为觉得麻烦，没有在那个项目里面尝试把九宫格图片分别作为九个`UIImageView`来处理（而非一个`StackView`）。这次我新建了一个项目，来尝试这种情况。

依然是九宫格格子长宽 75px/75px，单张大图长宽 200px/200px。

效果如下图。用了一些不同的颜色让各个 view 更明显。因为我用的图片背景都是白色，所以我把单张大图右移了一些以示区分。右边那一块白色就是单张大图。（上下两块区域的文字位置没调好，但这不是重点：D）

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-20%20at%208.33.20%20PM.png)
<!--more-->
### 相同的高度？

一看图就能发现，单张大图和九宫格是一样高的。

我用`print(onePic.frame.height)`单张大图高度打印下来看，结果是 200.0。没有问题。

难道是九宫格变小了？`print(firstImg.frame.height)`结果是 75.0。也没问题。

打印没成功，于是我测量了一下截图中九宫格和单张大图的高度，结果两者都是 233px。**这说明单张大图被拉伸了。**

然后我突然想起`print(onePic.image.size.height)`，打印出来结果是 233.0。图片果然被拉伸了。

之后我又检查了一下上次的截图，发现上次的单张大图一样被拉伸到九宫格的高度。

**原因：**

这次的模拟是重现上次的解决方案，只是将`StackView`换成了 9 个独立的`UIImageView`。

还是保持了底部的 button panel 与 onePic 和九宫格的间距都是 8px。（这次因为是分离的九个`UIImageView`，所以设置的是 button panel 和第九章图片的距离为 8px， ninethPic）

问题应该就是出在这里。当 button panel 与 onePic 之间存在这个 8px 的约束时，`AutoLayout`忽略了设定在 onePic 上固定高宽 200px 的约束，拉伸图片，使它满足和 button panel 的间距为 8px。

> 因为我也是刚接触 AutoLayout 不久，所以不清楚这样的情况是不是在文档里面已经写明了，还是这只是一个实际中发生的情况需要我们以后注意。

### hidden 只是隐身、不可见，不是完全消失

上一篇文章最后一部分是：九宫格图片数量变化时手动适应高度。

当时觉得是因为我用的`StackView`才导致隐藏下两排格子之后整个 view 的高度没有改变。现在我觉得我错了。

真正的原因应该是，**hidden 只是隐身、不可见，不是完全消失**。这意味着，虽然设置了图片为`hidden`，但其实它还是在那里占位的。所以整个 cell 里面的各种约束、子视图间的相对位置不会改变。

那怎么让九宫格的高度在格子隐藏之后变小，使得底下的 button panel 可以向上自适应呢？

第一个办法是上一篇文章中提到的通过修改`constraint.constant`。

另一个办法我们下面来说。

### constraint priority
  
为了让隐藏的 view 彻底消失，我赶紧 google 一下。

在这个问题（[《AutoLayout with hidden UIViews?》](http://stackoverflow.com/questions/19561269/autolayout-with-hidden-uiviews)）的回答中找到了有趣的 constraint priority。

被采纳的答案用的是提到过的第一个办法。

得票第二的回答提到了另一种办法。
> The solution of using a constant 0 when hidden and another constant if you show it again is functional, but it is unsatisfying if your content has a flexible size. You'd need to measure your flexible content and set a constant back. This feels wrong, and has issues if content changes size because of server or UI events.
> I have a better solution.
> The idea is to set the a 0 height rule to have high priority when we hide the element so that it takes up no autolayout space.

他提到如果你的内容大小是可变化的，那么修改`constraints.constant`会很麻烦。这一点我很赞同。

而更好的办法就是设置 **constraint priority**。

官方文档：
-  [NSLayoutConstraint](https://developer.apple.com/library/ios/documentation/AppKit/Reference/NSLayoutConstraint_Class/#//apple_ref/occ/instp/NSLayoutConstraint/priority)
-  [UILayoutPriorityRequired](https://developer.apple.com/library/ios/documentation/AppKit/Reference/NSLayoutConstraint_Class/#//apple_ref/c/econst/UILayoutPriorityRequired)

简单来说，你可以给约束设置优先级，它的值在 0 - 1000 之间，优先极高的会先被满足。

比如拿我现在这个例子来说，现在有 button panel - onePic 和 button panel - ninethPic 两个 8px 间距的约束，分别对应的`IBOutlet`是`bpAndOnePic`以及`bpAndNinethPic`。假如我们如下设置：

```
bpAndOnePic.priority = 1000
bpAndNinethPic.priority = 250
```
那么`AutoLayout`会优先满足 button panel 和 onePic 之间的约束，效果如图：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-20%20at%2010.10.32%20PM.png)

可以看到 button panel 跑到上面去了。单张大图大小正常了。

### 实现自动向上适应

九宫格的九张图片对应的`IBOutlet`分别为 firstPic、secondPic、thirdPic、fourthPic…ninethPic；单张大图为 onePic；底部 button panel 为 buttonPanel。

添加 buttonPanel 分别和 onePic、firstPic、fourthPic 以及 seventhPic 之间的 8px 上边距约束。

bpAndOnePic 是 button panel 和单张大图之间的约束；bpAndFirstPic 是 button panel 和九宫格第一张图之间的约束，bpAndFourthPic.priority 和 bpAndSeventhPic.priority 与之类似。（因为是九宫格，所以高度由每排第一张图存不存在决定。）



有了 constraint priority，我们可以这样设置：

```
bpAndOnePic.priority = firstPic.hidden ? 1000 : 250
bpAndFirstPic.priority = fourthPic.hidden && seventhPic.hidden && !firstPic.hidden ? 1000 : 250
bpAndFourthPic.priority = !fourthPic.hidden && seventhPic.hidden ? 1000 : 250
bpAndSeventhPic.priority = !seventhPic.hidden ? 1000 : 250
```
**情况分析**
1. 如果九宫格第一排第一张图片隐藏了，说明现在是在展示单张大图（微博没有附加图片的情况我们在这里不考虑）。这时`bpAndOnePic.priority`等于 1000，而`bpAndSeventhPic.priority`，`bpAndFourthPic.priority`，`bpAndFirstPic.priority`都等于 250。`bpAndOnePic.priority`优先级最高，所以如下图：
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-20%20at%2010.33.17%20PM.png)
2. 如果只有第三排的三张图片隐藏，那么`bpAndOnePic.priority`、`bpAndSeventhPic.priority`和`bpAndFirstPic.priority`等于 250，而`bpAndFourthPic.priority`等于 1000。`bpAndFourthPic.priority`优先级最高，如下图：
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-20%20at%2010.33.47%20PM.png)

其他情况在此不一一列举。


这样既解决了单张大图被拉伸的问题，又实现了九宫格图片数量变化时候的向上适应。

### 待解决：多余的空白部分怎么办？

可以从上面的截图上看到，当内容变化的时候，cell 的高度并没有变化，所以下方有空白。

之前模仿微博客户端的项目中，我用了：
```
func tableView(tableView: UITableView, heightForRowAtIndexPath indexPath: NSIndexPath) -> CGFloat {
    return UITableViewAutomaticDimension
}

func tableView(tableView: UITableView, estimatedHeightForRowAtIndexPath indexPath: NSIndexPath) -> CGFloat {
    return UITableViewAutomaticDimension
}
```
它帮我自动去除了空白部分。

我尝试加上这两个函数在这个项目中，结果是：
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-20%20at%2010.42.02%20PM.png)

所以下一步我会去搞清楚这个自动计算重新设置高度具体是怎么回事，解决掉多余的空白部分。
（另外，我感觉这跟我之前的项目 cell 里包含了 textField 有关 = =）


**为很丑的例子 ui 道歉 = =**