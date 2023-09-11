---
title: UICollectionView 总结
date: 1970-01-01 
categories:
- iOS
tags:
- iOS
- Swift
- UICollectionView
---
> Date: 2016-04-13 07:13:54

>项目源码：[模拟凤凰新闻 Github 仓库](https://github.com/cheng-kang/iosDev/tree/master/FenghuangXinwen)


### 引语

昨天给自己布置这个作业之后，看完文档实践的过程中发现一片很棒的英文总结，于是翻译了一下。这篇总结会简单总结一下我翻译的那篇文章里的内容，以及基于模拟凤凰新闻客户端部分页面的一些 UICollectionView 使用总结。

文章主要是总结一些需要注意的内容，具体请看源码。实现的内容及对应文件包括：
- 同一个 section 内拖动 cell
	- 直接使用 UICollectionViewController（`TestCollectionViewController.swift`）
	- 在 UIViewController 中使用 UICollectionView（`EditTabsViewController.swift`）
- 不同 section 间拖动 cell（`Test.swift`）
- 不同 section 间点击移动 cell（`TabsViewController.swift`）
- 点击移除 cell（`EditTabsViewController.swift`）

主要内容如图：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_fenghuangxinwen-2.gif)

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_fenghuangxinwen-3.gif)

<!--more-->
### 《【译】UICollectionView 轻松重排》

这篇文章主要介绍了在 iOS9 之后 UICollectionView 自带的重新排列方法。

1. 如果直接使用 UICollectionViewController，通过重写`func collectionView(collectionView: UICollectionView,
    moveItemAtIndexPath sourceIndexPath: NSIndexPath,
    toIndexPath destinationIndexPath: NSIndexPath) `即可以实现拖动重排。
2. 如果是在 UIViewController 里面使用 UICollectionView，则需要自己添加一个 UILongPressGestureRecognizer，对应状态进行对应处理。

比较重要的几个方法是：
- func collectionView(collectionView: UICollectionView,
    moveItemAtIndexPath sourceIndexPath: NSIndexPath,
    toIndexPath destinationIndexPath: NSIndexPath)
- indexPathForItemAtPoint
- beginInteractiveMovementForItemAtIndexPath
- updateInteractiveMovementTargetPosition
- endInteractiveMovement
- cancelInteractiveMovement

**特别注意**

这个方法`func collectionView(collectionView: UICollectionView,
    moveItemAtIndexPath sourceIndexPath: NSIndexPath,
    toIndexPath destinationIndexPath: NSIndexPath)`,
- 重写这个方法之后，自带的拖动重排才能生效。
- 这个方法究竟有什么作用？这个方法是在 cell 位置变换之后触发的。它包含两个很有用的参数，被拖动的 cell 的初始 indexPath 和落点 indexPath。因为这个位置的变换只是视图的改变，这些 cell 背后的数据的 index 其实并没有受到影响。因此如果此时 reloadData() 会发现，格子位置又恢复了，但这不是我们想要的，在实际项目中我们希望移动后就一直保持那个位置，也就是说数据的 index 发生相应改变。这个方法就是方便我们处理数据的。具体请看之后内容中的例子。
- 另外这个方法只与通过交互移动 cell 事件有关。如果是直接调用移动 cell 的方法并不会触发这个方法。所以在类似凤凰新闻编辑订阅频道页面，”点击下面 section 中的频道，移动到上面的 section 中”，实现时需要在 didSelect 方法中添加对应修改数据源的代码。具体参看源码中`TabsViewController.swift`。

### 使用 UICollectionView 必做的事情

首先你的 UIViewController 要继承 UICollectionViewDataSource，UICollectionViewDelegate，UICollectionViewDelegateFlowLayout。

其次，记得绑定 delegate 和 datasource。

然后是：
- func numberOfSectionsInCollectionView(collectionView: UICollectionView) -> Int
- collectionView(collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int
- collectionView(collectionView: UICollectionView, cellForItemAtIndexPath indexPath: NSIndexPath) -> UICollectionViewCell

有需要的话用上：
- func collectionView(collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAtIndexPath indexPath: NSIndexPath) -> CGSize
- func collectionView(collectionView: UICollectionView, viewForSupplementaryElementOfKind kind: String, atIndexPath indexPath: NSIndexPath) -> UICollectionReusableView 

**特别注意**

当你在 storyboard 设置了使用 header 或者 footer 或者两者都用的时候，记得添加对应的内容在 viewForSupplementaryElementOfKind 里面。例如：
```
func collectionView(collectionView: UICollectionView, viewForSupplementaryElementOfKind kind: String, atIndexPath indexPath: NSIndexPath) -> UICollectionReusableView {
    
    if kind == UICollectionElementKindSectionHeader {
        let header = collectionView.dequeueReusableSupplementaryViewOfKind(kind, withReuseIdentifier: "TabSectionHeader", forIndexPath: indexPath) as! TabSectionHeader
        return header
    } else {
        let footer = collectionView.dequeueReusableSupplementaryViewOfKind(kind, withReuseIdentifier: "TabSectionFooter", forIndexPath: indexPath)
        return footer
    }
}
    
```
个人对这个方法的设计持怀疑态度，觉得像 UITableView 那样分离开会更好。（又或许是我理解不够深刻吧。）

记得设置 reuseIdentifier。

### 插入、移动、删除 cell 以及 cell 总数的问题

UICollectionView 是在生成 cell 的时候，先通过 numberOfItemsInSection 获得 cell 数量，然后一个一个生成添加在视图中。

你可通过这些方法来插入、移动、删除 cell：

- insertItemAtIndexPaths
- moveItemAtIndexPath
- deleteItemsAtIndexPaths

比如，当来自服务器的数据更新了，新增或者减少了一个数据，我们可以想到有两种情况：
1. 通过 reloadData() 将整个 UICollectionView 更新。
2. 只在对应的位置插入或删除对应的那一个 cell。

用第一种方法是没有任何问题的。问题在第二种方法。

当我们直接通过 insertItemAtIndexPaths 或者 deleteItemsAtIndexPaths 添加或删除 cell 时，UICollectionView 中的 cell 数量发生变化了。貌似没问题？如果你尝试滑动一下屏幕，你会发现程序崩溃了。你会看到类似下面的报错：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-04-13%20at%206.20.09%20AM.png)

原因在于，当 UICollectionView 进行任何的更新时，包括局部更新，都会检查 numberOfItemInSection 方法返回的值和当前 UICollectionView 中实际包含的 cell 数量。如果二者不一致就会报错。

**特别注意**

UICollectionView 中实际包含的 cell 数量在下一次更新前 collection view 视图前一定要和 numberOfItemInSection 的返回值一直。

所以我们在新增或者删除 cell 之后，记得要修改对应的数据源。（当然在实际项目中应该不会忘记。）

**插入、移动、删除 section 类似**

### 不同 section 间拖动 cell

项目中的 Test.swift 是关于不同 section 间拖动 cell 的例子。

基本原理和在一个 section 内拖动 cell 一样，都是调用那几个方法。

**第一点**

需要注意的还是上面提到的记得修改对应数据源，否则第二次拖动就会报错。因为此时两个 section 内 cell 数量和 numberOfItemInSection 返回值不一样了。

**第二点**

请看一下两个实现方法：

一，『原始』方法
```
func longPressGestureRecognizerAction(sender: UILongPressGestureRecognizer) {
    switch sender.state {
    case .Began:
        let location = sender.locationInView(self.collectionView)
        let indexPath = self.collectionView.indexPathForItemAtPoint(location)
        self.originalSectionIndex = (indexPath?.section)!
        self.interactiveItem = self.collectionView.cellForItemAtIndexPath(indexPath!)
        self.collectionView.beginInteractiveMovementForItemAtIndexPath(indexPath!)
        break
    case .Changed:
        let location = sender.locationInView(self.collectionView)
        print(location)
        let indexPath = self.collectionView.indexPathForItemAtPoint(location)
        print(indexPath)
        self.collectionView.updateInteractiveMovementTargetPosition(location)
    case .Ended:
        self.collectionView.endInteractiveMovement()
        let currentSectionIndex = (self.collectionView.indexPathForCell(self.interactiveItem)?.section)!
        self.sections[currentSectionIndex]++
        self.sections[self.originalSectionIndex]--
    default:
        self.collectionView.cancelInteractiveMovement()
        break
    }
}
```
二，借助自带方法的简便方法
```
func collectionView(collectionView: UICollectionView, moveItemAtIndexPath sourceIndexPath: NSIndexPath, toIndexPath destinationIndexPath: NSIndexPath) {
    self.sections[destinationIndexPath.section]++
    self.sections[sourceIndexPath.section]--
}

func longPressGestureRecognizerAction(sender: UILongPressGestureRecognizer) {
    switch sender.state {
    case .Began:
        guard let selectedIndexPath = self.collectionView.indexPathForItemAtPoint(sender.locationInView(self.collectionView)) else {
            break
        }
        self.collectionView.beginInteractiveMovementForItemAtIndexPath(selectedIndexPath)
        break
    case .Changed:
        self.collectionView.updateInteractiveMovementTargetPosition(sender.locationInView(self.collectionView))
        break
    case .Ended:
        self.collectionView.endInteractiveMovement()
    default:
        self.collectionView.cancelInteractiveMovement()
        break
    }
}
```
第一个方法定义了两个全局变量`var originalSectionIndex = 0`和`var interactiveItem:UICollectionViewCell!`来记录初始位置和正在进行移动的 cell。

而第二个方法，通过使用`func collectionView(collectionView: UICollectionView, moveItemAtIndexPath sourceIndexPath: NSIndexPath, toIndexPath destinationIndexPath: NSIndexPath)`，直接就可以使用开始和结束位置 indexPath。非常方便。

所以当然一定要用第二种方法。