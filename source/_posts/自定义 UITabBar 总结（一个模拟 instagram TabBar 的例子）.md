---
title: 自定义 UITabBar 总结（一个模拟 instagram TabBar 的例子）
date: 2016-03-31 23:48:38
categories:
- iOS
tags:
- iOS
- Swift
- UITabBar
- UITabBatItem
- UITabBarController
- UITabBarControllerDelegate
---
> 项目 github 仓库：[模拟 instagram](https://github.com/cheng-kang/iosDev/tree/master/Instagram)

### 引语

我在练习 iOS 开发。

碰到了跟 TabBar 有关的东西，希望自己尽量对 TabBar 的使用了解清楚而不是直接复制粘贴，所以整体研究一番，在此总结。

内容主要跟 TabBar 的样式修改有关，涉及到一点点点击事件。文中提到的诸如`比较重要的方法`、`比较重要的属性`的重要性均是相对本文内容而言。

要实现的结果如图：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-31%20at%208.46.56%20PM.png)

其中，点击中间按钮时，不激活那个 tab 页，而是执行自定义的任务。（因为 instagram 中间那个按钮功能就是和其他的不一样嘛。）

### 相关文档
首先，敬上四篇相关文档：
- [UITabBarController Class Reference](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITabBarController_Class/)
- [UITabBarControllerDelegate Protocol Reference](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITabBarControllerDelegate_Protocol/index.html#//apple_ref/occ/intf/UITabBarControllerDelegate)
- [UITabBar Class Reference](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITabBar_Class/index.html#//apple_ref/occ/cl/UITabBar)
- [UITabBarItem Class Reference](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITabBarItem_Class/index.html#//apple_ref/occ/cl/UITabBarItem)
<!--more-->
### UITabBarController、UITabBarControllerDelegate、UITabBar 和 UITabBarItem

> 先来一点没那么有趣的东西：D。

**UITabBarController**
当你使用 UITabBarController 的时候，你可以新建一个类继承 UITabBarController 来管理你的 TabBar 及相关事件。

UITabBarController 包含许多属性，与本文相关的比较重要的几个属性是：
- delegate：一个 UITabBarControllerDelegate 对象，用于追踪和处理一些 TabBar 事件。
- tabBar： 一个 UITabBar 对象，直接一点说就是你在屏幕上看到的那个 TabBar。
- viewControllers：每个 Tab 页面对应的 viewController 组成的列表。可以通过排列顺序值获取对应 viewController，比如第一个 tab 的 viewController 为：self.viewControllers[0]。

**UITabBarControllerDelegate**
一个比较重要的方法：
- `override func tabBarController(_ tabBarController: UITabBarController, shouldSelectViewController viewController: UIViewController) -> Bool`
用于决定被选中的 tab 是否激活。当返回值是 false 时，保留在之前的 tab 页面；当返回值是 true 时，激活当前选中的 tab 页面。
 
**UITabBar**

几个重要的属性：
 - items：一个 UITabBarItem 列表，即每一个 tab 按钮对象组成的列表。
 - selectedItem：当前被选中的 TabBarItem。
 - tintColor：覆盖被选中的 TabBarItem 图片的颜色。（默认为蓝色。就是选中时图标的颜色。）
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-31%20at%208.43.26%20PM.png)
- barTintColor：整个 TabBar 的背景颜色。

**UITabBarItem**

几个重要的方法和属性：
- 初始化方法（init(…)）。可以通过 init 方法新建 TabBarItem，并赋予指定初始值，比如图片、图片颜色、选中状态时的图片及颜色、tag 值等等。
- badgeValue：看图。通过设置这个值可以直接得到这个效果，我觉得挺有意思的，很省事的样子。
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-31%20at%208.39.12%20PM.png)
- selectedImage：TabBarItem 被选中时显示的图片，默认和未选中状态图片一样。

### TabBar 基本样式的设置

我目前的看法是，**能用 storyboard 解决的一定不用代码**。所以基本样式设置全部在 storyboard 完成。

**TabBar**

选中 TabBar，打开右侧的属性面板。

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-31%20at%208.58.59%20PM.png)
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen_Shot_2016-03-31_at_8_59_09_PM.png)

- 一般都不用修改 item Positioning，默认是居中均匀分布，应该符合大部分需求。
- Translucent 半透明度可以根据需要勾选。像微博的客户端就是半透明的，而instagram 不是。
- 没有特别需求的话，可以直接在这里设置 Image Tint。我们这个例子在代码里面设置。
- Style：系统提供了 Default 默认的白色背景和可选的 Black 黑色背景。可根据需要选择。如图：


**TabBarItem**

选中 tab 页面的 viewController 底部的 tab 图标。右侧的属性面板如图：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-31%20at%209.20.49%20PM.png)

先看下面的：
- Title：就是在图标下显示的文字。可以为空，可以通过 Title Position 调整位置。
- Image：图标的图片。
- Tag：当前 TabBarItem 的标志，设置一个值方便在代码里找到对应的 TabBarItem。
- Enabled：没什么好说的：）

然后是这些：
- Badge：就是之前提到过的红点。可以在这里设置一个初始值。
- System Item：一些系统自带的 Tab 图标，根据需要自行取用。一般还是用自己的图吧。
- Selected Image：tab 被选中的时候的图片。
- Title Postition：设置 title 的位置。
可以如图设置`水平偏移`和`垂直偏移`。

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-31%20at%209.28.11%20PM.png)

**值得注意的是：水平偏移对图标有影响，垂直偏移对图标没有影响。**效果如图，红线是我自己加的一条中线，用于对比。

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-31%20at%209.28.19%20PM.png)

One more thing :)

属性面板右边有一个设置尺寸的面板：
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-31%20at%209.34.25%20PM.png)
在这里可以设置图标的偏移量，从而修改图标的位置。

因为默认图标在 Title上面，位置偏高，就算没有 Title 图标也在那个位置。所以当我们不用 Title 的时候，像 instagram，需要调整图标的位置，让它看起来居中一点。

一种是直接在面板设置，一种是用代码设置。
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-31%20at%209.40.26%20PM.png)
```
tabBarItem.imageInsets = UIEdgeInsetsMake(6, 0, -6, 0);
```
对比效果如图：
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-31%20at%209.40.45%20PM.png)

**注意：top 和 bottom 要设置成相反数，不然点击 tab 图标时 image 的大小会一直改变！！！**
如图：
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_tabbar-1.gif)

**一个建议**

有时候需要调整图标的大小，不建议用代码修改或者视图通过 image inset 来修改。

建议做图标的时候，就在图标周围留白。比如 75px 的图片，其中上下左右各留白 20px，这样图标就小了。

另外，根据 Apple 制定的标准，tab 图标准备 3 个尺寸，分别是 75 px（@3x），55px（@2x）和25px。

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-31%20at%2011.40.42%20PM.png)

### TabBar 个性化样式设置要求（大家好，重点要开始了：D）

经过之前一些简单的步骤，你将得到如图效果：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-31%20at%209.50.54%20PM.png)

记得将五个 TabBarItem 的 tag 设置为 0 - 5，方便以后。

但是我们要实现的不是这么简单。

**要求：**
- 选中 TabBarItem 背景颜色为黑色。
- 未选中 TabBarItem 背景颜色为某种灰色。
- 选中 TabBarItem 图标颜色为白色。
- 未选中 TabBarItem 图标颜色为某种灰色。
- 中间按钮始终背景颜色为某种蓝色、图标颜色为白色。

### 如何在 UITabBarController 中修改样式

新建一个 Cocoa Touch Class，取名叫`MainTabBarViewController`，继承 UITabBarController。去 storyboard 把作为入口的那个 UITabBarController 的类修改为`MainTabBarViewController`。

这个时候，我们就可以在`MainTabBarViewController`中对 TabBar 进行修改了。

首先来试验一下。

```
import UIKit

class MainTabBarViewController: UITabBarController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        //设置 tabBar 图标选中时的颜色
        self.tabBar.tintColor = UIColor.whiteColor()
        //遍历全部 tabBarItem，设置 badege 值
        for one in self.tabBar.items! {
            one.badgeValue = "100"
        }
        
    }
}
```

WOW。好酷。

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-31%20at%2010.01.19%20PM.png)

- ~~选中 TabBarItem 图标颜色为白色。~~ 达成√！！
- ~~未选中 TabBarItem 图标颜色为某种灰色。~~ 达成√！！

然后还顺便尝试了设置 badge 值。

### 如何通过代码设置单个 TabBarItem 背景颜色

之前提到过 barTintColor 这个属性。通过`self.tabBar.barTintColor = UIColor().greyColor()`就可以把背景设置为灰色了。但是这并没有完成被选中 TabBarItem 背景颜色变为黑色的要求。

事实上，**并没有直接设置单个 TabBarItem 背景颜色的方法**。

**解决方案**

重写 viewDidAppear 方法和 didSelectItem 方法。didSelectItem 是每当有 tabBarItem 被选中时执行的函数。
```
import UIKit

class MainTabBarViewController: UITabBarController {

		//定义一个用于存储背景层 view 的列表
    var tabBarItemBgViews: [UIView] = []
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.tabBar.tintColor = UIColor.whiteColor()
        for it in self.tabBar.items! {
            it.badgeValue = "100"
        }
        
    }
    
    override func viewDidAppear(animated: Bool) {
		    //初始化需要用到的尺寸数值
        let ITEM_WIDTH = self.tabBar.frame.width / 5
        let ITEM_HEIGHT = CGFloat(49)
        
        //初始化 tab bar item 背景层
        for one in self.tabBar.items! {
            let vw = UIView()
            vw.backgroundColor = UIColor(red: 37/255, green: 29/255, blue: 42/255, alpha: 1)
            vw.frame = CGRectMake(ITEM_WIDTH * CGFloat(one.tag), 0, ITEM_WIDTH, ITEM_HEIGHT)
            self.tabBarItemBgViews.append(vw)
            //将背景层插入到 index 为 1 的位置，这样背景层就在图标下面。记住这个 1 就好了：）
            tabBar.insertSubview(vw, atIndex: 1)
        }
        
        //修改第一个 item 的背景色为选中状态颜色
        self.tabBarItemBgViews[0].backgroundColor = UIColor.blackColor()
        
        //自定义中间按钮样式
        self.tabBarItemBgViews[2].backgroundColor = UIColor(red: 17/255, green: 86/255, blue: 136/255, alpha: 1)
    }
    
    override func tabBar(tabBar: UITabBar, didSelectItem item: UITabBarItem) {
	    //当选中的 TabBarItem 不是中间那个时，改变背景颜色
	    if item.tag != 2 {
	        for one in tabBar.items! {
			        //将当前被选中的 TabBarItem 背景颜色设置为黑色
	            if one.tag == item.tag {
	                self.tabBarItemBgViews[one.tag].backgroundColor = UIColor.blackColor()
	            } else {
	                //将其他 TabBarItem 背景颜色设置为灰色
					        self.tabBarItemBgViews[one.tag].backgroundColor = UIColor(red: 37/255, green: 29/255, blue: 42/255, alpha: 1)
	            }
	        }
	        
	        //将中间 TabBarItem 的背景颜色重置为蓝色
	        self.tabBarItemBgViews[2].backgroundColor = UIColor(red: 17/255, green: 86/255, blue: 136/255, alpha: 1)
	    } 
	}

}
```
通过上面的代码，得到了：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-31%20at%2010.14.04%20PM.png)

**解释：为什么是重写 viewDidAppear 方法而不是 viewDidLoad**

如果把上面那段代码写在`viewDidLoad`方法中，会出现如下情况：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_tabbar-2.gif)

可以看到，第一个 TabBarItem 没有图标，而且点击无效。

简单来说，在`viewDidLoad`的时候，页面的那些视图大概还没准备好，所以插入的时候会有错误。包括写在`viewWillAppear`中也会出现同样问题。

所以记得重写`viewDiaAppear`。

**两个问题**
1. 打开 app 的时候，中间按钮图标颜色不是白色。（当然这是因为我们上面代码里面没有设置。）
2. 点击中间按钮，进入了对应的 tab 页面，如图。（这不是我们希望的。）
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-31%20at%2010.24.06%20PM.png)

### 如何修改 TabBarItem 样式

初一想，在`viewDidAppear`结尾加上这段代码就可以：
```
//将 tabBar 包含的 tabBarItem 中的第二个修改为自定义的一个 UITabBarItem
//使用原本设置的图片，原本设置的 tag 值，并将图片设置为使用原图片。
//imageWithRenderingMode(.AlwaysOriginal)，稍后详细解释
self.tabBar.items![2] = UITabBarItem(title: nil, image: self.tabBarItem.image?.imageWithRenderingMode(.AlwaysOriginal), tag: self.tabBarItem.tag)
//修改偏移量，让图标居中
self.tabBar.items![2].imageInsets = UIEdgeInsetsMake(6, 0, -6, 0)
```
编译也没有问题。但是运行的时候报错了。

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-31%20at%2010.38.58%20PM.png)

**需要注意：不能直接在 tab bar controller 里面修改 tab bar item 的属性**

> 文档原文是这样说的：
> ”You should never access the tab bar view of a tab bar controller directly. To configure the tabs of a tab bar controller, you assign the view controllers that provide the root view for each tab to the `viewControllers` property.”
> 这里我觉得 tab bar view 可能说得不够清楚，应该是 tab bar item view。

可能有同学会对上面我们增加背景有疑问。那难道不是修改 tab bar item 吗？

并不是。上面我们其实是给 TabBar 增加子视图，并定位到各个 TabBarItem 背后，看起来像是在给 TabBarItem 添加背景。并没有直接修改 TabBarItem。

**解决方案**

如文档所说，我们应该在对应的 viewController 里面去操作。

到我们之前应该创建好了的`ThirdViewController.swift`里面，写一个用于修改第三个 TabBarItem 样式的函数。
```
import UIKit

class ThirdViewController: UIViewController, UITabBarControllerDelegate {

    override func viewDidLoad() {
        super.viewDidLoad()
        
    }

    func initTabBarItem() {
        //将该 TabBarItem 替换为一个新的
        self.tabBarItem = UITabBarItem(title: nil, image: self.tabBarItem.image?.imageWithRenderingMode(.AlwaysOriginal), tag: self.tabBarItem.tag)
        //设置偏移量
        self.tabBarItem.imageInsets = UIEdgeInsetsMake(6, 0, -6, 0)
    }
}
```
然后回到`MainTabBarViewController.swift`。加上这两句：
```
let vc = self.viewControllers![2] as! ThirdViewController
vc.initTabBarItem()
```
`viewDidAppear`方法现在应该如下：
```
override func viewDidAppear(animated: Bool) {
    let ITEM_WIDTH = self.tabBar.frame.width / 5
    let ITEM_HEIGHT = CGFloat(49)
    
    //初始化 tab bar item 背景层
    for one in self.tabBar.items! {
        let vw = UIView()
        vw.backgroundColor = UIColor(red: 37/255, green: 29/255, blue: 42/255, alpha: 1)
        vw.frame = CGRectMake(ITEM_WIDTH * CGFloat(one.tag), 0, ITEM_WIDTH, ITEM_HEIGHT)
        self.tabBarItemBgViews.append(vw)
        tabBar.insertSubview(vw, atIndex: 1)
    }
    
    //修改第一个 item 的背景色为选中状态颜色
    self.tabBarItemBgViews[0].backgroundColor = UIColor.blackColor()
    
    //自定义中间按钮样式
    self.tabBarItemBgViews[2].backgroundColor = UIColor(red: 17/255, green: 86/255, blue: 136/255, alpha: 1)
    //获取第三个 TabBarItem 对应的 viewController，然后调用修改样式函数
    let vc = self.viewControllers![2] as! ThirdViewController
    vc.initTabBarItem()
}
```
这里我们用到了之前提到的`UITabBarController`的`viewControllers`属性，通过下标获取到对应的`viewContrller`，然后调用里面的函数，完成样式修改。

效果如图：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-31%20at%2010.54.50%20PM.png)

- ~~中间按钮始终背景颜色为某种蓝色、图标颜色为白色。~~ 达成√！！

但是点击中间的按钮还是会进入对应的 tab 页面。下下部分继续解决这个问题。

### imageWithRenderingMode（稍微详细的介绍）

> 官方文档：[imageWithRenderingMode:](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIImage_Class/#//apple_ref/occ/instm/UIImage/imageWithRenderingMode:)

UIImage 自身有一个方法是 imageWithRenderingMode()。
有三个可选值：
- .Automatic
- .AlwaysOriginal：保持原样
- .AlwaysTemplate：留住图片的样板，忽略原图颜色。（比如设置为 tabBarItem.image 的图片，默认是渲染模式（rendering mode）是 .AlwaysTemplate，只保留了形状，默认是灰色。）

如果想让 tabBarItem.image 的颜色保持原图颜色，就要用一个 RenderingMode 为 .AlwaysOriginal 的图片替换。也就是上面用到的那种方式。

### 如何自定义 TabBarItem 点击事件，UITabBarControllerDelegate

之前提到， `override func tabBarController(_ tabBarController: UITabBarController, shouldSelectViewController viewController: UIViewController) -> Bool`，用于决定被选中的 tab 是否激活。当返回值是 false 时，保留在之前的 tab 页面；当返回值是 true 时，激活当前选中的 tab 页面。

我们要做的是，当被选中的是第三个 tab 时，保留之前的 tab 页面。

思路就是这样，怎么做呢？

**1.设置 UITabBarControllerDelegate**
```
class MainTabBarViewController: UITabBarController, UITabBarControllerDelegate {

    var tabBarItemBgViews: [UIView] = []
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.tabBar.tintColor = UIColor.whiteColor()
        for it in self.tabBar.items! {
            it.badgeValue = "100"
        }
        
        self.delegate = self
        
    }
```
给`MainTabBarViewController`类添加`UITabBarControllerDelegate`委托，并在`viewDidLoad`中将自己的 delegate 设置为自己。

这个时候我们就可以在`MainTabBarViewController`中实现`UITabBarControllerDelegate`中的方法来监控和响应事件。

重写如下方法：
```
func tabBarController(tabBarController: UITabBarController, shouldSelectViewController viewController: UIViewController) -> Bool {
    if viewController.tabBarItem.tag == 2 {
		    print(viewController.tabBarItem.tag)
        return false
    } else {
        return true
    }
}
```
当被选中 tabBarItem.tag 等于 2 时，即为中间按钮时，返回 false，保留之前的 tab 页面；否则切换到新页面。

效果如图：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_tabbar-3.gif)

其中`print()`方法是用来演示，我们可以在这里做一些其他的事情，比如像 instagram 一样弹出拍照页面。具体实现可以参考我之前的模拟微博项目。之后我也会继续完成模拟 instagram 项目，到时候也可以在我 github 看到。

如图，当点击中间按钮时，打印出了tag值。

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-31%20at%2011.25.41%20PM.png)

### 结束

以上就是对自定义 TabBar 样式以及一点点事件相关的总结。

希望对大家有帮助。

因为我也是刚开始自学 iOS 开发，遇到很多问题需要花很长时间去找答案。所以希望能写出一些有意义的总结，和其他初学者分享，减少大家找不到解决方案的烦恼。

：D