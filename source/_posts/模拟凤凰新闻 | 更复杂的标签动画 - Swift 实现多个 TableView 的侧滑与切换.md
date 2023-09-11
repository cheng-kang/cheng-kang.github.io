---
title: 模拟凤凰新闻 | 更复杂的标签动画 - Swift 实现多个 TableView 的侧滑与切换
date: 1970-01-01
categories:
- iOS
tags:
- iOS
- Swift
- UISrollView
- UITableView
---

> Date: 2016-04-08 20:59:13

> 项目源码：[github 仓库：模拟凤凰新闻首页](https://github.com/cheng-kang/iosDev/tree/master/FenghuangXinwen)


> 下午逛 SegmentFault 时看到有人问如何实现凤凰新闻 app 首页效果，正好这两天在学习如何实现多个 TableView 的侧滑与切换，索性自己尝试一下。

### 目标和成果

如图：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_fenghuangxinwen-1.gif)

简单列一下关键点：
1. 跟随滑动
2. 点击事件
<!--more-->

### 总结
1. 凤凰新闻 app 里面下划线是在下面的 ScrollView 滚动动画结束之后才开始侧滑的，所以需要监听滚动是否结束。
	- 我刚开始想用 scrollViewDidEndScrollingAnimation，结果并不行。这个方法具体使用场景我还没搞清楚。
	- 应该使用 scrollViewDidEndDecelerating，当 ScrollView 停止减速的时候即动画结束的时候。
2. 刚开始忘记了点击事件，所以标签用的 UILabel，其实可以换成 UIButton。这样就能省去寻找位置那一步。不过感觉 UIButton 的样式调整也很麻烦。幸运的是 UILabel 默认样式（字体、字号）非常符合这个项目要求。
3. 不要忘记设置每个 ScrollView 的 delegate；不要忘记在 delegate 方法中判断当前是哪个 ScrollView

### 源码

```
//
//  ViewController.swift
//  FenghuangXinwen
//
//  Created by Ant on 4/8/16.
//  Copyright © 2016 Ant. All rights reserved.
//

import UIKit

class ViewController: UIViewController, UIScrollViewDelegate {
    
    @IBOutlet weak var tabScrollView: UIScrollView!
    @IBOutlet weak var contentScrollView: UIScrollView!
    
    let tabLine = UIView() //tab 标签下划线
    let TAB_LINE_HEIGHT = CGFloat(2) //tab 标签下划线高度
    let tabTitles = [
        "头条",
        "推荐",
        "娱乐",
        "财经",
        "自媒体",
        "凤凰卫视",
        "科技",
        "良品",
        "美女",
        "军事",
        "体育",
        "历史",
        "汽车",
        "时尚",
        "房产",
        "FUN来了",
        "段子",
        "萌物",
    ] //tab 标签标题
    
    var tabLbls: [UILabel] = [] //tab 标签对应的 UILabl
    
    //定义要用到的颜色及 RGB 值差，用于颜色变化
    let TEXT_COLOR_NORMAL = UIColor(red: 115/255, green: 120/255, blue: 134/255, alpha: 1)
    let TEXT_COLOR_ACTIVE = UIColor(red: 245/255, green: 67/255, blue: 66/255, alpha: 1)
    let TEXT_COLOR_NORMAL_RED = CGFloat(115)
    let TEXT_COLOR_NORMAL_GREEN = CGFloat(120)
    let TEXT_COLOR_NORMAL_BLUE = CGFloat(134)
    let TEXT_COLOR_ACTIVE_RED = CGFloat(245)
    let TEXT_COLOR_ACTIVE_GREEN = CGFloat(67)
    let TEXT_COLOR_ACTIVE_BLUE = CGFloat(66)
    let TEXT_COLOR_RED_DIF = CGFloat(130)
    let TEXT_COLOR_GREEN_DIF = CGFloat(-53)
    let TEXT_COLOR_BLUE_DIF = CGFloat(-68)
    let TAB_LINE_COLOR = UIColor(red: 245/255, green: 67/255, blue: 66/255, alpha: 1)
    
    let MARGIN = CGFloat(20) //tab 标签左右间距
    
    var currentTabIndex = 0 //当前 tab 标签 index
    var currentTabX = CGFloat(20) //当前 tab 标签 x 坐标，方便定位
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        //设置 scrollView delegate
        tabScrollView.delegate = self
        contentScrollView.delegate = self
        
        //初始化视图内容
        initView()
    }
    
    func initView() {
        //定义一些常量方便使用
        let TABSCROLLVIEW_HEIGHT = self.tabScrollView.frame.height //tabScrollview 高度
        let LABEL_Y = TABSCROLLVIEW_HEIGHT / 2 - 5 // 每个 tab 标签的 y 坐标
        
        //生成 tab 标签，添加到 tabScrollview 并设置大小位置
        for var i = 0; i < self.tabTitles.count; i++ {
            let tabLbl = UILabel()
            tabLbl.text = tabTitles[i]
            tabLbl.textColor = self.TEXT_COLOR_NORMAL
            tabLbl.sizeToFit()
            tabLbls.append(tabLbl)
            
            self.tabScrollView.addSubview(tabLbl)
            
            if i > 0 {
                tabLbl.center = CGPointMake( self.MARGIN + self.tabLbls[i-1].center.x + self.tabLbls[i-1].frame.width / 2 + tabLbl.frame.width / 2 , LABEL_Y)
            } else {
                tabLbl.center = CGPointMake( self.MARGIN + tabLbl.frame.width / 2, LABEL_Y)
            }
            
            //顺便生成并添加每个 tab 页面对应的 view。用于测试。
            let tabContentView = UIView()
            self.contentScrollView.addSubview(tabContentView)
            tabContentView.backgroundColor = UIColor.whiteColor()
            tabContentView.frame = CGRectMake(self.view.frame.width * CGFloat(i), 0, self.view.frame.width, self.contentScrollView.frame.height)
            let labelInContent = UILabel()
            labelInContent.text = tabTitles[i]
            labelInContent.sizeToFit()
            tabContentView.addSubview(labelInContent)
            labelInContent.center = CGPointMake(tabContentView.frame.width / 2, tabContentView.frame.height / 2 - 100)
        }
        self.contentScrollView.contentSize = CGSizeMake(self.view.frame.width * CGFloat(self.tabLbls.count), self.contentScrollView.frame.height) //设置 contentScrollView 内容大小
        
        //计算并设置 tabScrollView 内容大小
        var TABVIEW_WIDTH = CGFloat(0)
        for tabLbl in self.tabLbls {
            TABVIEW_WIDTH += self.MARGIN + tabLbl.frame.width
        }
        TABVIEW_WIDTH += self.MARGIN
        self.tabScrollView.contentSize = CGSizeMake(TABVIEW_WIDTH, 40)
        
        //默认选中第一个标签
        self.tabLbls[0].textColor = self.TEXT_COLOR_ACTIVE
        self.currentTabIndex = 0
        self.currentTabX = self.tabLbls[0].frame.origin.x
        
        //添加 tab 标签下划线
        //设置位置有一个没搞清楚的问题：不知为何 y 坐标设为 TABSCROLLVIEW_HEIGHT - self.TAB_LINE_HEIGHT 时，下划线看不见
        self.tabScrollView.addSubview(self.tabLine)
        self.tabLine.backgroundColor = TAB_LINE_COLOR
        self.tabLine.frame = CGRectMake(MARGIN, TABSCROLLVIEW_HEIGHT - 5, self.tabLbls[0].frame.width, self.TAB_LINE_HEIGHT)
    }
    
    func scrollViewDidScroll(scrollView: UIScrollView) {
        //当 contentScrollView 滚动时
        if scrollView == self.contentScrollView {
            let index = scrollView.contentOffset.x / self.view.frame.width //获取当前页面 index
            
            if floor(index) == index {
                self.currentTabIndex = Int(index)
                self.currentTabX = self.tabLbls[self.currentTabIndex].frame.origin.x
            }
            
            //阻止第一页和最后一页越界滚动
            let MIN_X = CGFloat(0)
            let MAX_X = scrollView.contentSize.width - self.view.frame.width
            let CONTENT_OFFSET_X = scrollView.contentOffset.x
            
            if CONTENT_OFFSET_X < MIN_X {
                scrollView.contentOffset.x = MIN_X
            } else if CONTENT_OFFSET_X > MAX_X {
                scrollView.contentOffset.x = MAX_X
            } else {
                //当没有越界时，执行『动画』
                
                //初始化一些要用到的值
                let isLeft = index < CGFloat(self.currentTabIndex)
                let nextTabIndex = isLeft ? self.currentTabIndex - 1 : index == CGFloat(self.currentTabIndex) ? self.currentTabIndex : self.currentTabIndex + 1 //下一个标签 index
                let currentTabWidth = self.tabLbls[self.currentTabIndex].frame.width //当前标签宽度
                let nextTabWidth = self.tabLbls[nextTabIndex].frame.width //下一个标签宽度
                let widthDif = nextTabWidth - currentTabWidth //两个标签宽度差
                let distance = self.MARGIN + (isLeft ? self.tabLbls[nextTabIndex].frame.width : currentTabWidth) //下划线需要滑动的距离
                var offsetPercentage = index - CGFloat(self.currentTabIndex) //当前偏移百分比
                //如果滑动超过一页，将偏移百分比设置为 ±1，避免多余动画
                if offsetPercentage < -1 {
                    offsetPercentage = -1
                }
                
                if offsetPercentage > 1 {
                    offsetPercentage = 1
                }
                
                //改变标签底部横线位置和长度
                self.tabLine.frame = CGRectMake(currentTabX + distance * offsetPercentage, self.tabLine.frame.origin.y, currentTabWidth + widthDif * abs(offsetPercentage), self.tabLine.frame.height)
                
                //改变颜色
                self.tabLbls[nextTabIndex].textColor = UIColor(red: (TEXT_COLOR_NORMAL_RED + TEXT_COLOR_RED_DIF * abs(offsetPercentage)) / 255, green: (TEXT_COLOR_NORMAL_GREEN + TEXT_COLOR_GREEN_DIF * abs(offsetPercentage)) / 255, blue: (TEXT_COLOR_NORMAL_BLUE + TEXT_COLOR_BLUE_DIF * abs(offsetPercentage)) / 255, alpha: 1)
                self.tabLbls[self.currentTabIndex].textColor = UIColor(red: (TEXT_COLOR_ACTIVE_RED - TEXT_COLOR_RED_DIF * abs(offsetPercentage)) / 255, green: (TEXT_COLOR_ACTIVE_GREEN - TEXT_COLOR_GREEN_DIF * abs(offsetPercentage)) / 255, blue: (TEXT_COLOR_ACTIVE_BLUE - TEXT_COLOR_BLUE_DIF * abs(offsetPercentage)) / 255, alpha: 1)
            }
        }
    }
    
    func scrollViewDidEndDecelerating(scrollView: UIScrollView) {
        if scrollView == self.contentScrollView {
            let TWO_WORD_WIDTH = CGFloat(34) //两个字标签的宽度。这个间距其实是根据自己需求随便设置的。
            
            //当标签左边被遮挡时，调整 tabScrollView x 轴偏移量
            if self.tabLine.frame.origin.x < self.tabScrollView.contentOffset.x {
                UIView.animateWithDuration(0.4, delay: 0, options: [.CurveEaseInOut], animations: { () -> Void in
                    self.tabScrollView.contentOffset.x = self.tabLine.frame.origin.x - self.MARGIN
                    }, completion: nil)
            }
            
            //当下划线 x 坐标在 tabScrollView 中部之后时，调整 tabScrollView x 轴偏移量
            if self.tabLine.frame.origin.x > self.tabScrollView.frame.width / 2 && self.currentTabIndex + 1 < self.tabLbls.count - 3 {
                UIView.animateWithDuration(0.4, delay: 0, options: [.CurveEaseInOut], animations: { () -> Void in
                    self.tabScrollView.contentOffset.x = self.tabLine.frame.origin.x - self.MARGIN - TWO_WORD_WIDTH
                    }, completion: nil)
            }
            
            //当标签右边被遮挡时，调整 tabScrollView x 轴偏移量
            if self.tabLine.frame.origin.x + self.tabLine.frame.width + self.MARGIN > self.tabScrollView.contentOffset.x + self.tabScrollView.frame.width{
                UIView.animateWithDuration(0.4, delay: 0, options: [.CurveEaseInOut], animations: { () -> Void in
                    self.tabScrollView.contentOffset.x += (self.tabLine.frame.origin.x + self.tabLine.frame.width + self.MARGIN) - (self.tabScrollView.contentOffset.x + self.tabScrollView.frame.width) + self.MARGIN
                    }, completion: nil)
            }
        }
    }
    
    @IBAction func tabScrollViewTapped(sender: UITapGestureRecognizer) {
        let location = sender.locationInView(self.tabScrollView) //获取当前点击事件在 tabScrollView 里的坐标
        
        //循环找到点击的是哪一个标签，找到时执行方法
        for var i = 0; i < self.tabLbls.count; i++ {
            if CGRectContainsPoint(self.tabLbls[i].frame, location) {
                self.tabLbls[self.currentTabIndex].textColor = TEXT_COLOR_NORMAL
                self.tabLbls[i].textColor = TEXT_COLOR_ACTIVE
                self.currentTabIndex = i
                self.currentTabX = self.tabLbls[self.currentTabIndex].frame.origin.x
                
                self.contentScrollView.contentOffset.x = self.view.frame.width * CGFloat(i)
                
                break
            }
        }
    }
}


```