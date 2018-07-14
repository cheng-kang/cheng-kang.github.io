---
title: AutoLayout：constraint active 和 UITableView 加载第一屏 cell 样式不正常的解决方法（九宫格再续）
date: 2016-03-23 20:32:15
categories:
- iOS
tags:
- iOS
- swift
- UITableView
- AutoLayout
---
### 多余的空白部分怎么办？

我用上一篇文章提到的更优方案修改了模拟微博的项目。

运行结果是这样的：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-23%20at%205.51.02%20PM.png)

？？？说好的解决了问题呢？？？
为什么图片被拉伸了？？？

**问题何在?**
回想一下，在之前的测试项目中，我没有给 button panel 设置底部和 superview 的约束，只是设定了固定高和上方与图片之间的约束，所以 button panel 飘上去了。而且由于 storyboard 里面约束设置不全面（superview 的底部没有与其中的 subview 建立约束），所以使用`estimatedHeightForRowAtIndexPath`的时候，整个 cell 都挤在了一起。

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-23%20at%208.29.38%20PM.png)

> 要使用`estimatedHeightForRowAtIndexPath`，一定得将约束设置全面。这个我以后再研究。

而在模拟微博项目中，我设置了 3-button-panel 和 superview 底部的约束（实际不是它们俩之间的约束，具体我应该会在另一篇文章来说，关于如何添加 cell 之间的空白。），约束设置全面了，3-button-panel 因此没有往上飘，而是 onePic 因为和 3-button-panel 之间的 8px 间距约束高度被拉伸。

**怎么办？**
上一次我学到了`constraint.priority`的用法。于是我想，是不是因为 onePic 高度约束优先级没有 onePic 和 3-button-panel 间距优先级高。

然后我添加了这一段代码：
```
@IBOutlet weak var onePicHeight: NSLayoutConstraint!

buttonPanelAndOnePicConstraint.priority = firstPic.hidden ? 999 : 250
onePicHeight.priority = 1000
```
就是当 onePic 出现的时候，将间距约束优先级设置为 999，而高度约束优先级设为 1000。结果如下：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-23%20at%206.07.21%20PM.png)

图片高度正常了。但是，onePic 和 3-button-panel 间距不正常了。

**问题何在??**

我又想起来之前提到的**hidden 只是隐身、不可见，不是完全消失**。
当显示 onePic 的时候，虽然九宫格的九张图全部设置为 hidden，它们仍然占着 superview 中的位置。因此出现了多余的间距。
然后我看到 StackOverflow 上面这个回答： [《enable-disable-auto-layout-constraints》](http://stackoverflow.com/questions/32218495/enable-disable-auto-layout-constraints)，知道了`constraint.active`。


### constraint active
> 官方文档：[NSLayoutConstraint: active](https://developer.apple.com/library/ios/documentation/AppKit/Reference/NSLayoutConstraint_Class/#//apple_ref/occ/instp/NSLayoutConstraint/active)

`constraint.active`对解决这个问题有什么帮助呢？

当我们用 AutoLayout 的时候，我们设置了各种约束，然后屏幕中的各种 view 按照约束被渲染出来。当 view 被隐藏时，约束并没有消失。因此隐藏的 view 仍占在之前的位置上。
而如果我们把这个 view 上绑定的所有约束都注销，它和其他 view 就没有关系了，也就不会继续占位。

所以要解决多余间距，我添加了这段代码：
```
//当第七张图隐藏的时候，把第七、八、九张图的约束全部注销。
//当然更全面的做法是把九宫格的所有图片的约束都注销。此处因为实际情况我可以偷个懒。
if seventhPic.hidden {
    seventhPicLeft.active = false
    seventhPicTop.active = false
    eighthPicLeft.active = false
    eighthPicTop.active = false
    ninethPicLeft.active = false
    ninethPicTop.active = false
}

```
运行看一看：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-23%20at%206.30.24%20PM.png)

0.0!!! 没有用吗？
往下滑一滑，发现！诶！下面的是正常的。再滑回去，第一个也正常了！

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-23%20at%206.31.39%20PM.png)

这说明刚才对问题的理解是正确的，解决方案也是正确的，只是存在一个小小的缺陷。

### 如何解决：UITableView 加载第一屏 cell 样式不正常
我在 StackOverflow 找到有人遇到相同的问题，部分问题描述是这样的：
> This works nicely for the cells that have yet to be scrolled to (as UITableViewAutomaticDimention is called upon scrolling to the cell) and all is well for those, **but not for the cells that are initially rendered onscreen after loading the data**.

That’s the problem.
And how to solve that!!!

我尝试了问题回答里面的所有方法都没有用。最后受提问者自己的回答（他提供了一种方法解决了自己的问题）启发，解决了问题 ：D。

**解决方法**是这样的：
在包含 UITableView 的 ViewController 中重写方法
```
override func viewDidAppear(animated: Bool) {
	tableView.reloadData()
}
```

**解释**

我觉得滑屏加载新的 cell 的时候，应该是在调用`reloadData()`（这里具体我还没探究清楚）或者加载部分 tableView 的 data。
当你滑屏的时候，其实就是在`viewDidAppear`之后`reloadData()`。
所以重写这个方法会有效果。

运行结果如图：
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-23%20at%206.42.30%20PM.png)

### 待解决：为什么第一屏的 cell 样式会不正常？

为什么第一屏的 cell 样式会不正常？

为什么在`viewDidLoad`或者`viewWillAppear`方法里面`reloadData()`没有效果？

另外`estimatedHeightForRowAtIndexPath`更明确的用法是什么？（我发现，当修复了之前的问题之后，注释掉重写的`heightForRowAtIndexPath`和`estimatedHeightForRowAtIndexPath` cell 的样式也是自适应的，label 显示也正常。）

下次继续。