---
title: Swift 实现多个 TableView 的侧滑与切换（模拟 instagram 系列）
date: 1970-01-01 
categories:
- iOS
tags:
- iOS
- Swift
- UITableView
- UIScrollView
---
> Date: 2016-04-06 02:50:01

> 关键词：Swift，实现多个 TableView 的侧滑与切换，在 ScrollView 中嵌套多个 TableView，一个页面显示两个 tableview…

### 目标与成果

如图：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_instagram-3.gif)

### 思路

将多个 TableView 放在 ScrollView 里面，将 ScrollView Paging 设置为 Enabled，实现多个 TableView 的侧滑与切换。

上方的 tab 标签跟随 ScrollView.offset.x 进行动画，蓝条为单独绘制的一个长方形 UIView。

通过 UIButton 的 IBAction 中的动画，实现点击 tab 标签滑动到对应 TableView。
<!--more-->
### 解决方案

1. storyboard

添加一个 UIView，高度设置为 30px，上左右与 superview 间距为 0。在里面放置两个 UIButton。将两个 UIButton 组合成 StackView，设置 StackView 上下左右与 superview 间距为 0，设置 Distribution 为 Fill Equally。

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-04-06%20at%202.08.00%20AM.png)

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-04-06%20at%202.09.54%20AM.png)

在 storyboard 创建好 ScrollView 和两个 TableView。在 TableView 中创建好 TableViewCell 模板，并且将对应的类和 reuse identifier 设置好（当然你可以新建 xib 文件，然后在代码里设置 reuse identifier）。两个 TableView 应该是 ScrollView 的子视图。

**如果你是在 storyboard 里面给 TableView 添加 Prototype Cells，记得给每个 TableView 添加各自的 Prototype Cells。如果只给其中一个添加 Prototype Cells，那么另一个不会自动添加 reuse identifier。在 cellForRowAtIndexPath 方法中，对未添加 Prototype Cells 的 TableView 调用 dequeReusableCellWithIdentifier 时会报错，因为那个 TableView 本来就没有嘛。**

设置 ScrollView 的约束，本项目为下左右间距均为 0，上间距为 1（用于显示上边 tab 标签栏的阴影）。

TableView 的约束不用设置，因为我们要在代码中给他们重新定位。

设置好各个 Prototype Cell 的约束。

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-04-06%20at%202.08.21%20AM.png)

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-04-06%20at%201.53.58%20AM.png)

2. FourthViewController.swift（对应的 viewController）

全部代码如下：
```
//
//  FourthViewController.swift
//  Instagram
//
//  Created by Ant on 3/31/16.
//  Copyright © 2016 Ant. All rights reserved.
//

import UIKit

class FourthViewController: UIViewController, UITableViewDataSource, UITableViewDelegate, UIScrollViewDelegate {

    @IBOutlet weak var tableViewLeft: UITableView!
    @IBOutlet weak var tableViewRight: UITableView!
    @IBOutlet weak var tabPanel: UIView!
    @IBOutlet weak var followBtn: UIButton!
    @IBOutlet weak var youBtn: UIButton!
    @IBOutlet weak var scrollView: UIScrollView!
    
    let scrollBar = UIView()
    var notifications: [Notification] = []
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        //创建模拟数据
        let notification1 = Notification(from: "CHENGKANG", fromAvatar: UIImage(named: "IMG_8040")!, to: "Deer", toAvatar: UIImage(named: "test")!, type: "like", images: [UIImage(named: "test")!, UIImage(named: "test")!, UIImage(named: "test")!, UIImage(named: "test")!, UIImage(named: "test")!, ], date: "3天前")
        let notification2 = Notification(from: "CHENGKANG", fromAvatar: UIImage(named: "IMG_8040")!, to: "Deer", toAvatar: UIImage(named: "test")!, type: "like", images: [UIImage(named: "test")!], date: "3天前")
        
        //添加模拟数据
        self.notifications.append(notification1)
        self.notifications.append(notification2)
        
        //初始化要用到的参数
        let WIDTH = self.view.frame.width
        let HEIGHT = self.view.frame.height - 60 - 30 - 49
        
        //设置 tab 标签面板底部阴影
        self.tabPanel.layer.shadowColor = COLOR_GREY.CGColor
        self.tabPanel.layer.shadowRadius = 0.5
        self.tabPanel.layer.shadowOffset = CGSizeMake(0, 0.5)
        self.tabPanel.layer.shadowOpacity = 1
        
        //添加 tab 标签面板底部蓝条
        self.view.addSubview(self.scrollBar)
        self.scrollBar.backgroundColor = COLOR_LIGHT_BLUE
        self.scrollBar.frame = CGRectMake(0, 87, WIDTH / 2, 3)
        
        //初始化按钮颜色
        self.followBtn.setTitleColor(COLOR_LIGHT_BLUE, forState: .Normal)
        
        //设置 scrollView delegate
        self.scrollView.delegate = self
        
        //设置 tableViewLeft delegate，并消除多余分割线
        self.tableViewLeft.delegate = self
        self.tableViewLeft.dataSource = self
        self.tableViewLeft.tableFooterView = UIView()
        
        //设置 tableViewRight delegate，并消除多余分割线
        self.tableViewRight.delegate = self
        self.tableViewRight.dataSource = self
        self.tableViewRight.tableFooterView = UIView()

        //设置 scrollView contentSize
        self.scrollView.contentSize = CGSizeMake(WIDTH * 2, HEIGHT)
        //设置两个 tableView 大小位置
        self.tableViewLeft.frame = CGRectMake(8, 0, WIDTH - 16, HEIGHT)
        self.tableViewRight.frame = CGRectMake(WIDTH + 8, 0, WIDTH - 16, HEIGHT)
    }
    
    func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        return 1
    }
    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        //可以通过判断当前 tableView 是否与某一个 TableView 相同来给定对应内容
//        if tableView == self.tableViewRight {
//            if self.notifications[indexPath.row].images.count == 1 {
//                let cell = LikeWithPicCell()
//                cell.initCell(self.notifications[indexPath.row])
//                return cell
//            } else {
//                let cell = LikeWithPicsCell()
//                cell.initCell(self.notifications[indexPath.row])
//                return cell
//            }
//        }
        
        if self.notifications[indexPath.row].images.count == 1 {
            let cell = tableView.dequeueReusableCellWithIdentifier("LikeWithPicCell") as! LikeWithPicCell
            cell.initCell(self.notifications[indexPath.row])
            return cell
        } else {
            let cell = tableView.dequeueReusableCellWithIdentifier("LikeWithPicsCell") as! LikeWithPicsCell
            cell.initCell(self.notifications[indexPath.row])
            return cell
        }
    }
    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        
        if tableView == self.tableViewRight {
            //此处 -1 是为了让展示内容有区分，因为用的相同数据
            return self.notifications.count - 1
        }
        
        return self.notifications.count
    }
    
    func tableView(tableView: UITableView, heightForRowAtIndexPath indexPath: NSIndexPath) -> CGFloat {
        return UITableViewAutomaticDimension
    }
    
    func tableView(tableView: UITableView, estimatedHeightForRowAtIndexPath indexPath: NSIndexPath) -> CGFloat {
        return UITableViewAutomaticDimension
    }
    
    func scrollViewDidScroll(scrollView: UIScrollView) {
        //判断当前 scrollView 是我们项目中的 ScrollView 而非那两个 tableView
        if scrollView == self.scrollView {
            //改变 scrollBar x 坐标，达成同步滑动效果。
            let offsetX = scrollView.contentOffset.x
            self.scrollBar.frame = CGRectMake(offsetX / 2, 87, self.view.frame.width / 2, 3)
            
            //对应修改 btn 文字颜色
            if offsetX > self.view.frame.width / 2 {
                self.followBtn.setTitleColor(UIColor.blackColor(), forState: .Normal)
                self.youBtn.setTitleColor(COLOR_LIGHT_BLUE, forState: .Normal)
            } else {
                self.followBtn.setTitleColor(COLOR_LIGHT_BLUE, forState: .Normal)
                self.youBtn.setTitleColor(UIColor.blackColor(), forState: .Normal)
            }
        }
    }
    @IBAction func followBtnPressed(sender: UIButton) {
        //点击按钮时，通过动画移动到对应 tableView
        UIView.animateWithDuration(0.3, delay: 0, options: [.CurveEaseInOut], animations: { () -> Void in
            self.scrollView.contentOffset.x = 0
            }, completion: nil)
    }
    
    @IBAction func youBtnPressed(sender: UIButton) {
        //点击按钮时，通过动画移动到对应 tableView
        UIView.animateWithDuration(0.3, delay: 0, options: [.CurveEaseInOut], animations: { () -> Void in
            self.scrollView.contentOffset.x = self.view.frame.width
            }, completion: nil)
    }

}

```

在这个项目中，我懒所以两个 TableView 用的相同的 Prototype Cell 和同一组数据，然后在返回第二个 TableView cell 个数时 -1，好在显示时区分二者。

### 需要注意的几点

1. 当在一个 ViewController 里面包含多个 TableView 的时候，使用 TableView Delegate 提供的方法时，可以通过判断参数 tableView 是否与项目中对应 TableView 相同来执行对应操作。如上面代码中提到的：
```
func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    
    if tableView == self.tableViewRight {
        //此处 -1 是为了让展示内容有区分，因为用的相同数据
        return self.notifications.count - 1
    }
    
    return self.notifications.count
}
```

2. 同上，有多个 scrollView 时，同样方法判定当前是哪个 scrollView。
3. UITableView 为 UIScrollView 的子类。如果添加了 scrollView delegate，不进行判断的话，可能会出现上下滑动 tableView 时触发 scrollViewDidScroll 方法，导致在第二页时上下滑动时 tab 标签切换到第一个标签。
3. 不要忘记设置 scrollView.delegate
4. 不要忘记设置 scrollView.contentSize
5. 通过设置空白 tableFooterView 为空白 UIView，消除多余分割线。