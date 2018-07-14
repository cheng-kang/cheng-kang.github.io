---
title: 仿微博 iOS 客户端 TabBar 中间按钮
date: 2016-03-30 02:02:07
categories:
- iOS
tags:
- iOS
- Swift
- UITabBar
---
> [模仿微博客户端项目源码](https://github.com/cheng-kang/iosDev/tree/master/Weibo)

我在模仿微博 iOS 客户端。如图：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-30%20at%201.05.03%20AM%20copy.png)

微博客户端 TabBar 中间按钮和其他按钮不一样，一个是样式不一样，一个是点击事件不一样。

### 思路

第一个想法其实是建一个 UITabBarController 的子类，自定义 TabBar 的样式，但是因为还没学习过，所以这次希望另找一个办法。

第二个想法是用一个 button 覆盖 TabBar 中间按钮。无非就是在代码里新建一个`UIButton`，用`CGRectMake()`定位。

### 一个错误的尝试
<!--more--> 
有了上面的思路，我就在首页的 ViewController 中的`viewDidLoad()`方法中添加了如下代码：
```
	//100px 高宽随便设置用来测试的。
	let postBtn = UIButton()
	postBtn.frame = CGRectMake(self.view.frame.width/2 - 50, self.view.frame.height - 100, 100, 100)
	postBtn.setBackgroundImage(UIImage(named: "post_btn"), forState: .Normal)
	self.view.addSubview(postBtn)
```
结果如图：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-30%20at%201.16.31%20AM.png)

**两个问题**
- 按钮被什么东西挡住了？
- 这个按钮添加在首页的 View 里面，所以只有首页有，其他 tab 怎么办？每个 tab 写一个吗？

**问题一**

在 Tabbed Application，底部始终有一个在最上层的 TabBar。每一个 tab 页面的 view 都在 TabBar 下面，所以在 tab 页面的 view 中在 TabBar 所在的位置添加子 subview，subview 会被盖住。

所以思路二行不通了吗？

**问题二**

重复一点代码倒没什么，不过有没有办法避免呢？

### 解决方案

我发现作为 Initial View Controller 的这个 Tab Bar View Controller 也可以添加一个自定义的 ViewController。

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-30%20at%201.31.34%20AM2.png)

于是我新建了一个 UITabBarController 的子类。在`viewDidLoad()`中添加了 button。下面的代码是调整过 button 大小位置后的最终代码。
```
//  TabBarViewController.swift
import UIKit

class TabBarViewController: UITabBarController {

    override func viewDidLoad() {
        super.viewDidLoad()
        
        //  初始化一些要用到的参数
        let WINDOW_HEIGHT = self.view.frame.height
        let TAB_HEIGHT = self.tabBar.frame.height
        let GRID_WIDTH = self.view.frame.width / 5
        let MARGIN_X = CGFloat(2)
        let MARGIN_Y = CGFloat(5)
        let BTN_WIDTH = TAB_HEIGHT - MARGIN_X * 2
        let BTN_HEIGHT = TAB_HEIGHT - MARGIN_Y * 2
        
        //  遮罩层，用于遮挡原本的 TabBarItem
        let modalView = UIView()
        modalView.frame = CGRectMake(GRID_WIDTH * 2, WINDOW_HEIGHT - TAB_HEIGHT, GRID_WIDTH, TAB_HEIGHT)
        self.view.addSubview(modalView)
        
        //  添加自定义按钮
        let postBtn = UIButton()
        postBtn.frame = CGRectMake(GRID_WIDTH * 2 + (GRID_WIDTH - BTN_WIDTH) / 2, WINDOW_HEIGHT - TAB_HEIGHT + MARGIN_Y, BTN_WIDTH, BTN_HEIGHT)
        postBtn.setBackgroundImage(UIImage(named: "post_btn"), forState: .Normal)
        self.view.addSubview(postBtn)
        
        //  给按钮添加事件
        postBtn.addTarget(self, action: "postButtonClicked:", forControlEvents: .TouchUpInside)
    }
}
```
效果如图：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-30%20at%201.05.03%20AM.png)

### 解释

**对于问题一**

因为是直接在 TabBarController 的 view 上添加 subview，所以按钮正常显示。

**对于问题二**

因为 TabBar 是所有 tab 页面公用的，所以不用在每个页面单独添加按钮。

**遮罩层的作用**

因为自定义按钮的大小没有覆盖 TabBar 中间 item 的大小，所以点击边缘部分会进入对应的 tab 页面。而微博客户端这个按钮点击后，应该是出现如下页面，而非进入 tab 页。所以用遮罩层挡住那个 TabBar item。

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_weibo-1.gif)

**自定义按钮的点击事件**

这个加号按钮点击完之后应该是出现一个半透明视图，包含一些按钮。所以我在最后给按钮添加了一个点击事件，负责完成显示新视图及其中的动画。

如果对这个半透明视图和其中动画的实现有兴趣，可以到我 github 下载源码看看。因为都是最基本的 Animation，所以可能不会单独写一篇分享。

> [模拟微博客户端 github 仓库](https://github.com/cheng-kang/iosDev/tree/master/Weibo)

个人觉得值得注意的是，我的解决方案是：这个半透明视图在第一次出现之后就保存在 TabBarViewController 的类成员变量里，之后的关闭和再显示只是将视图的 alpha 值在 0 和 1 之间切换。

说不定也会总结一次。因为实现过程中踩到一些跟 Animation 有关的坑，比如**有些属性变换是立即执行的，不能用动画渐变实现**。

基本的 Animation 知识，建议去看 [@林永坚Jake ](http://weibo.com/yongjianlin) 在慕课网发布的 [iOS-动画入门](http://www.imooc.com/learn/392) 和 [iOS-动画进阶](http://www.imooc.com/learn/395)。

