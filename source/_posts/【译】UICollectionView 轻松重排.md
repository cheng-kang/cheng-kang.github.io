---
title: 【译】UICollectionView 轻松重排
date: 1970-01-01 
categories:
- iOS
tags:
- iOS
- Swift
- UICollectionView
---

> Date: 2016-04-12 23:38:28

> 原文链接：[UICollectionViews Now Have Easy Reordering](http://nshint.io/blog/2015/07/16/uicollectionviews-now-have-easy-reordering/)

> 原本打算总结一下 UICollectionView 的一些用法，看到一篇比较好的文章，所以直接翻译了。翻译得比较生硬，见谅。


我超喜欢`UICollectionView`。相比`UITableView`，它容易自定义得多。现在我使用甚至使用 collection view 比使用 table view 还要频繁了。在 iOS9 中，它开始支持使用起来很简单的重排。在之前是不可能直接重排的，而且实现起来很麻烦。让我们一起来看看 API。你可以在 [Github](https://github.com/nshintio/uicollectionview-reordering) 上找到对应的 Xcode 项目。

最简单的实现重排是通过使用`UICollectionViewController`。它现在有一个新的属性叫做`installsStandardGestureForInteractiveMovement`，作用是添加手势（gestures）来重排 cells。这个属性默认值为`True`，这意味着要使用它我们只需要重写一个方法。
```
func collectionView(collectionView: UICollectionView,
    moveItemAtIndexPath sourceIndexPath: NSIndexPath,
    toIndexPath destinationIndexPath: NSIndexPath) {
    // move your data order
    // 可以留空
}
```
当前的 collection view 判定 items 可以被移动，因为`moveItemAtIndexPath`被重写了。

![](http://nshint.io/images/uicollectionview-reordering/1.gif)

<!--more-->

当我们希望在一个简单的`UIViewController`中使用 collection view 时，会麻烦一点。我们也要实现之前提到的`UICollectionViewDataSource`方法，不过我们需要重写`installsStandardGestureForInteractiveMovement`。不用担心，也很简单。`UILongPressGestureRecognizer`是一种持续性的手势识别器并且完全支持拖动。
```
override func viewDidLoad() {
    super.viewDidLoad()

            longPressGesture = UILongPressGestureRecognizer(target: self, action: "handleLongGesture:")
        self.collectionView.addGestureRecognizer(longPressGesture)
}

    func handleLongGesture(gesture: UILongPressGestureRecognizer) {

        switch(gesture.state) {

        case UIGestureRecognizerState.Began:
            guard let selectedIndexPath = self.collectionView.indexPathForItemAtPoint(gesture.locationInView(self.collectionView)) else {
                break
            }
            collectionView.beginInteractiveMovementForItemAtIndexPath(selectedIndexPath)
        case UIGestureRecognizerState.Changed:
            collectionView.updateInteractiveMovementTargetPosition(gesture.locationInView(gesture.view!))
        case UIGestureRecognizerState.Ended:
            collectionView.endInteractiveMovement()
        default:
            collectionView.cancelInteractiveMovement()
        }
    }
```
我们保存了在 long press gesture 中不活的被选中的 index path 并且基于它是否有值决定允不允许拖动手势生效。然后，我们根据手势状态调用一些新的 collection view 方法。

- `beginInteractiveMovementForItemAtIndexPath(indexPath: NSIndexPath)`：开始指定位置 cell 的交互移动。
- `updateInteractiveMovementTargetPosition(targetPosition: CGPoint)`：更新交互移动对象的位置
- `endInteractiveMovement()`：在你结束拖动手势之后结束交互移动
- `cancelInteractiveMovement()`：取消交互移动

这些让搞定拖动手势非常容易。

![](http://nshint.io/images/uicollectionview-reordering/2.gif)

效果和标准的`UICollectionViewController`一样。很酷对吧，不过更酷的是我们可以将我们自定义的 collection view layout 应用到重排中去。看看下面在简单的瀑布视图中的交互移动。

![](http://nshint.io/images/uicollectionview-reordering/3.gif)

嗯，看起来不错，不过如果我们不想在移动的时候改变 cell 大小呢？选中的 cell 大小应该在交互移动时保持一致。这是可以实现的。`UICollectionViewLayout`也有一些其他的方法来负责重排。
```
func invalidationContextForInteractivelyMovingItems(targetIndexPaths: [NSIndexPath],
    withTargetPosition targetPosition: CGPoint,
    previousIndexPaths: [NSIndexPath],
    previousPosition: CGPoint) -> UICollectionViewLayoutInvalidationContext

func invalidationContextForEndingInteractiveMovementOfItemsToFinalIndexPaths(indexPaths: [NSIndexPath],
    previousIndexPaths: [NSIndexPath],
    movementCancelled: Bool) -> UICollectionViewLayoutInvalidationContext
```
前一个在目标 indexPath 和之前的 indexPath 之间进行移动时调用。另一个类似，不过是在移动结束之后调用。有了这些我们就可以通过一些小手段达到我们的要求。
```
internal override func invalidationContextForInteractivelyMovingItems(targetIndexPaths: [NSIndexPath],
    withTargetPosition targetPosition: CGPoint,
    previousIndexPaths: [NSIndexPath],
    previousPosition: CGPoint) -> UICollectionViewLayoutInvalidationContext {

    var context = super.invalidationContextForInteractivelyMovingItems(targetIndexPaths,
        withTargetPosition: targetPosition, previousIndexPaths: previousIndexPaths,
        previousPosition: previousPosition)

    self.delegate?.collectionView!(self.collectionView!, moveItemAtIndexPath: previousIndexPaths[0],
        toIndexPath: targetIndexPaths[0])

    return context
}
```
解决方案非常清晰。获取正在移动的 cell 之前和目标 index path。然后调用`UICollectionViewDataSource`来移动这些 item。

![](http://nshint.io/images/uicollectionview-reordering/4.gif)

不用怀疑，collection view 重排是一个非常棒的更新。UIKit 工程师干得太棒了！：）






















