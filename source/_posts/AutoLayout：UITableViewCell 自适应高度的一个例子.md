---
title: AutoLayout：UITableViewCell 自适应高度的一个例子
date: 2016-03-19 23:51:24
categories:
- iOS
tags:
- iOS
- AutoLayout
- 九宫格
- 自适应高度
---
### 目的
我在模拟微博客户端。

要实现：
当一条微博包含 2-9 张图的时候，图片以九宫格形式展示（去除空白格子）。
当一条微博只包含一张图的时候，图片会比较大。

### AutoLayout：实现 一张大图 和 九宫格 的样式
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-19%20at%2010.55.31%20PM.png)

如图所示，九宫格图片为`Nine Pics`，底部按钮为`3-button-panel`（这个命名很奇怪我知道：D），单张大图为`One Pic`。

九宫格每张图的大小是 75px/75px，上下左右有 4px 的间距，所以总长宽为 233px/233px。

单张大图的长宽为 200px/200px。

先不管单张大图的`UIImageView`，将 view 里面其他元素通过 AutoLayout 设置好。九宫格的九张图片因为排布整齐，所以我直接用的一个 **stackview**。
设置`Nine Pics`和`3-button-panel`的间距为 8px。
<!--more-->
然后调整`One Pic`大小为合适大小，用 Constrains 束缚住。通过键盘把`One Pic`移动到和`Nine Pics`左上角对齐的位置。（移动位置为了看起来更直观。所有的约束不是由在`storyboard`上显示的位置决定的。）
将`One Pic`左、上设置成和`Nice Pics`一样的约束：左边 8px，上面 8px。

这个时候因为单张大图的高比九宫格的高小，所以看上去`One Pic`和`3-button-panel`的间距一定是大于 8px。

但是约束的神奇就是这样。

我们现在设置`One Pic`和`3-button-panel`的间距为 8px。

这个时候，在`3-button-panel`上就有两个上方的约束。

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-19%20at%2011.29.17%20PM.png)

当我们要显示单张大图的时候，通过代码隐藏九宫格`self.ninePicsView.hidden = true`。此时，`AutoLayout`就会忽略`3-button-panel`和`Nine Pics`之间的约束，而`3-button-panel`和`One Pic`之间的约束正常。

如图：
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-19%20at%2010.54.30%20PM.png)

### 九宫格图片数量变化时手动适应高度

九宫格图片数量不够时，当然是通过`hidden=true`隐藏多余的格子。

但是可能是由于我用的**stackview**，所以隐藏第三排或者第二排和第三排之后，整个 view 的高度并没有改变。（我没有尝试不用 stackview的情况，因为不想破坏辛辛苦苦做好的 storyboard ：D。等有时间我再新建一个项目试试。）

所以需要手动改一下。

方法是，建立一个 Constraint Outlet，根据情况修改它的值。

之前我们设置了`3-button-panel`和`Nine Pics`之间的距离是 8px。我们建立一个这样的 IBOutlet：`@IBOutlet weak var constraintButtonPanelAndNinePic: NSLayoutConstraint!`。这个时候，我们就可以通过代码来修改约束值。

比如当有 6 张图片时，
```
self.seventhPic.hidden = true
self.eighthPic.hidden = true
self.ninethPic.hidden = true
```
隐藏多余的格子，然后
```
self.constraintButtonPanelAndNinePic.constant = -75
```
这个时候，`3-button-panel`和`Nine Pics`的相对位置就正确了。

### 成果
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-19%20at%2010.54.30%20PM.png)
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-19%20at%2010.54.16%20PM.png)
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-19%20at%2011.49.07%20PM.png)
