---
title: 实现 instagram 底部弹出菜单的一个例子（模拟 instagram 系列）
date: 2016-04-03 23:51:08
categories:
- iOS
tags:
- iOS
- Swift
---
### 目标和成果
instagram 截图如下：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_IMG_8669.PNG)

成果如下：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_instagram-1.gif)

要实现的内容：
1. 黑色半透明遮罩层
2. 弹出动画
3. 点击取消按钮或者背景菜单收回

### 思路

应该是有一种跟 UIPresentationController 有关的解决方法，但是我还不会，所以这次不用。

之前在模拟微博的项目里也用到了弹出层，所以我想这次也义勇和上次同样的方式，在 TabBarController 里面添加 subview。

但有两点不同：
1. 上次是点击 tabBarItem 来执行弹出，这次要点击第一个 tab 页里的按钮。怎么样让 TabBarController 得到消息？
2. 上次弹出的按钮是独立的，这次弹出的菜单和指定的图片有关。所以需要有一个标志记录当前点击的是哪一张图片的 more 按钮。
<!--more-->
### 解决方案 Part.1 创建菜单视图

在 storyboard 拖进一个 ViewController，添加好内容，设置好约束。如图：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-04-03%20at%2011.25.13%20PM.png)

注意，这个 ViewController 的 root view 要讲背景设置为 黑色、透明度 30%，以模拟遮罩层。

新建一个视图文件 BottomMenuView.swift，继承 UIViewController。修改刚才新建的 ViewController 类为 BottomMenuView，并设置 StoryboardID 为”BottomMenu”。

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-04-03%20at%2011.49.49%20PM.png)

关联好 IBOutlet 对象和点击事件。
```
import Foundation
import UIKit

class BottomMenuView: UIViewController {

    @IBOutlet weak var menuBgView: UIView!
    @IBOutlet weak var reportBtn: UIButton!
    @IBOutlet weak var shareToFacebookBtn: UIButton!
    @IBOutlet weak var tweetBtn: UIButton!
    @IBOutlet weak var copyURLBtn: UIButton!
    @IBOutlet weak var noticeBtn: UIButton!
    @IBOutlet weak var dismissBtn: UIButton!
    @IBOutlet weak var buttonPanel: UIView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    override func viewDidAppear(animated: Bool) {
        //这里是设置颜色、按钮边框形状。
        let maskPathAllCorner = UIBezierPath(roundedRect: noticeBtn.bounds,
            byRoundingCorners: [.BottomLeft, .BottomRight, .TopLeft, .TopRight],
            cornerRadii: CGSize(width: 5, height: 5.0))
        let maskPathTopCorner = UIBezierPath(roundedRect: noticeBtn.bounds,
            byRoundingCorners: [.TopLeft, .TopRight],
            cornerRadii: CGSize(width: 5, height: 5.0))
        let maskPathBottomCorner = UIBezierPath(roundedRect: noticeBtn.bounds,
            byRoundingCorners: [.BottomLeft, .BottomRight],
            cornerRadii: CGSize(width: 5, height: 5.0))
        let shapeAllCorner = CAShapeLayer()
        shapeAllCorner.path = maskPathAllCorner.CGPath
        let shapeTopCorner = CAShapeLayer()
        shapeTopCorner.path = maskPathTopCorner.CGPath
        let shapeBottomCorner = CAShapeLayer()
        shapeBottomCorner.path = maskPathBottomCorner.CGPath
        
        reportBtn.layer.mask = shapeTopCorner
        noticeBtn.layer.mask = shapeBottomCorner
        dismissBtn.layer.mask = shapeAllCorner
    }
    @IBAction func bgTapped(sender: UITapGestureRecognizer) {
        //给背景 view 添加一个点击事件
        //当点击时，让菜单收回
    }
    @IBAction func dismissBtnPressed(sender: UIButton) {
		    //点击事件，当点击时，让菜单收回
    }
}

```

在 TabBarViewController.swift 中，修改 viewDidLoad 方法：
```
override func viewDidLoad() {
    super.viewDidLoad()
    
    self.tabBar.tintColor = UIColor.whiteColor()
    for it in self.tabBar.items! {
        it.badgeValue = "100"
    }
    
    self.delegate = self
    
    //找到对应视图，并添加为 TabBarView 的子视图。子视图默认 alpha 值为0。
    //这样每次只用修改 alpha 值来显示和隐藏，不用重新添加子视图。
    self.bottomMenu = self.storyboard?.instantiateViewControllerWithIdentifier("BottomMenu") as! BottomMenuView
    self.bottomMenu.modalTransitionStyle = .CoverVertical
    self.view.addSubview(self.bottomMenu.view)
    self.bottomMenu.view.alpha = 0
}
```


### 解决方案 Part.2 给 TabBarController 传递消息

因为 more 按钮在 tab 页的 viewController 里面，我们暂时没办法直接执行 TabBarController 里面的函数，或者对它的 view 进行操作，所以要想个办法发送通知。

发送通知当然是用 NSNotification。

**发送显示菜单通知**

在 firstViewController （即第一个 tab 页的 controller）中添加 more 按钮点击事件，在里面发送一个通知。
```
@IBAction func moreButtonPressed(sender: UIButton) {
	NSNotificationCenter.defaultCenter().postNotification(NSNotification(name: "ShowBottomMenu", object: sender.tag))
}
```
在这个通知里面，object 是当前按钮的 tag 值。这是在每个 cell 初始化的时候，给当前 cell 的每个 button 的 tag 赋值为当前图片的 id，保证之后能够判断每个点击事件来自哪个 cell/图片。

**发送收回菜单通知**

回到 BottomMenuView.swift，在两个点击事件添加发送通知：
```
@IBAction func bgTapped(sender: UITapGestureRecognizer) {
    NSNotificationCenter.defaultCenter().postNotification(NSNotification(name: "DismissBottomMenu", object: nil))
}
@IBAction func dismissBtnPressed(sender: UIButton) {
    
    NSNotificationCenter.defaultCenter().postNotification(NSNotification(name: "DismissBottomMenu", object: nil))
}
```

**接收通知**

在 TabBarViewController.swift 的 viewDidLoad 方法中添加一下两行用于接收通知：
```
NSNotificationCenter.defaultCenter().addObserver(self, selector: "showBottomMenu:", name: "ShowBottomMenu", object: nil)
NSNotificationCenter.defaultCenter().addObserver(self, selector: "dismissBottomMenu:", name: "DismissBottomMenu", object: nil) 
```

经过上面的步骤，TabBarViewController 就能接收到显示或者收回底部菜单的通知了。然后我们可以在自定义的函数里面编写显示和隐藏的动画。

### 解决方案 Part.3 显示/收回菜单动画

这部分很简单啦。

```
func showBottomMenu(notification: NSNotification) {
    //获取当前 section id
    let tag = notification.object as! Int
    print(tag)
    
    self.bottomMenu.buttonPanel.frame.origin.y = self.view.frame.height
    UIView.animateWithDuration(0.3) { () -> Void in
        self.bottomMenu.view.alpha = 1
        self.bottomMenu.buttonPanel.frame.origin.y = self.view.frame.height - self.bottomMenu.buttonPanel.frame.height
    }
}

func dismissBottomMenu(notification: NSNotification) {
    print(notification.object)
    UIView.animateWithDuration(0.3) { () -> Void in
        self.bottomMenu.view.alpha = 0
        self.bottomMenu.buttonPanel.frame.origin.y = self.view.frame.height
    }
}
```
在 showBottomMenu 方法中，获取到了一个 tag 值，这个是留着将来编写对应的菜单按钮点击事件的。