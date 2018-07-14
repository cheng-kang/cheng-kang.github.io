---
title: UISearchBar（一）修改背景层和输入框层的背景颜色和边框颜色
date: 2016-03-19 20:51:09
categories:
- iOS
tags: 
- iOS
- AutoLayout
- UISearchBar
- color
---
> 在模仿微博 iOS 客户端的时候，希望将首页上方的搜索框做成和它一样的**整体浅灰色背景+输入框白色背景**，发现直接使用`IBOutlet`建立连接修改`bordercolor`或者`borderwidth`没有用。所以研究了一下如何修改`UIsearchBar`相关的颜色。

> 另外：发现原来微博客户端首页上面的 search bar 大概就是一个图片按钮【白眼】。

因为微博客户端首页上面的 search bar 高度很小，自己尝试修改没成功，于是 google 了一下。

[《StackOverflow: Can the height of the UISearchbar TextField be modified?》](http://stackoverflow.com/questions/30858969/can-the-height-of-the-uisearchbar-textfield-be-modified) 中提到一种方案：
```
override func viewDidAppear(animated: Bool) {
    super.viewDidAppear(animated)
    for subView in searchBar.subviews  {
        print(subView)
        for subsubView in subView.subviews  {
            print(subsubView)
            if let textField = subsubView as? UITextField {
								textField.font = UIFont.systemFontOfSize(20)
            }
        }
    }

}
```

> 把这个函数放在`viewDidAppear`会不会有点问题？是不是放在`viewWillAppear`比较好？

才发现 search bar 的结构很复杂。
<!--more-->
我加了两行打印，把子视图简单地打印出来。得到的结果：
```
<UIView: 0x7fb6204a09c0; frame = (390 0; 195 25); autoresize = RM+BM; gestureRecognizers = <NSArray: 0x7fb622479cf0>; layer = <CALayer: 0x7fb6204806e0>>
<UIView: 0x7fb622122760; frame = (0 0; 320 44); clipsToBounds = YES; autoresize = W+H; layer = <CALayer: 0x7fb622120180>>
<UISearchBarBackground: 0x7fb622123340; frame = (0 0; 320 44); opaque = NO; userInteractionEnabled = NO; layer = <CALayer: 0x7fb622123800>>
<UISearchBarTextField: 0x7fb622124bf0; frame = (8 8; 304 28); text = ''; clipsToBounds = YES; opaque = NO; layer = <CALayer: 0x7fb622120290>>
```

不去深究，简而言之，在它的第二层子视图(subview)中至少包含了一个`UIView`和一个`UiTextField`，分别是 search bar 的背景视图和文本输入框。

Search bar 的样式就是它们定义的。所以我们对它们进行修改就能达到目的。

### 试验
假设： @IBOutlet weak var searchBar: UISearchBar!
- searchBar.tintColor: 设置输入框光标颜色
- searchBar.barTintColor: 设置外层背景颜色

我通过下面的代码，试着给各种背景、边框设置不同颜色，得到的效果如图。
```
override func viewWillAppear(animated: Bool) {
    for subView in searchBar.subviews  {
        for subsubView in subView.subviews  {
            if let bg = subsubView as? UIView {
                bg.backgroundColor = UIColor.whiteColor()
                bg.layer.backgroundColor = UIColor.orangeColor().CGColor
                bg.layer.borderColor = UIColor.redColor().CGColor
                bg.layer.borderWidth = 1
            }
            if let textField = subsubView as? UITextField {
                textField.backgroundColor = UIColor.blueColor()
                textField.layer.borderColor = UIColor.greenColor().CGColor
                textField.layer.borderWidth = 1
            }
        }
    }
    
    searchBar.barTintColor = UIColor.yellowColor()
    searchBar.tintColor = UIColor.blackColor()
}

```
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-19%20at%207.57.34%20PM.png)
可以看到，红色、蓝色、绿色、黑色和黄色产生了效果。

### 如何使 borderwidth 和 backgroundColor 生效
有一个问题是：

- 必须设置`borderwidth`，否则自定义的`bordercolor`和`backgroundColor`都不会生效。

比如注释掉`borderwidth`：
```
override func viewWillAppear(animated: Bool) {
    for subView in searchBar.subviews  {
        for subsubView in subView.subviews  {
            if let bg = subsubView as? UIView {
                bg.backgroundColor = UIColor.whiteColor()
                bg.layer.backgroundColor = UIColor.orangeColor().CGColor
                bg.layer.borderColor = UIColor.redColor().CGColor
                //bg.layer.borderWidth = 1
            }
            if let textField = subsubView as? UITextField {
                textField.backgroundColor = UIColor.blueColor()
                textField.layer.borderColor = UIColor.greenColor().CGColor
                //textField.layer.borderWidth = 1
            }
        }
    }
    
    searchBar.barTintColor = UIColor.yellowColor()
    searchBar.tintColor = UIColor.blackColor()
}

```
![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-19%20at%207.54.24%20PM.png)
会发现**红色**和**绿色**不见了。

### 背后的 view
**仔细看**
这个时候在文本输入框的角落出现了橙色。

这说明，searchBar 的子视图中，除了一个作为整体背景的`UIView`和文本输入框之外，还有一个和文本输入框相同大小的`UIView`。

所以我把文本输入框的背景色设置为`clearColor`，然后得到下图：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-19%20at%208.10.51%20PM.png)

> 这个 view 具体作用是什么，之后再来和另外几个一起一个一个弄清楚。

### 另一个问题：当 searchBarStyle 为 UISearchBarStyle.Minimal 时
`searchBarStyle`默认为`Prominent`，你可以自己修改为`Minimal`，它的样式更简洁。

但是，当我切换成`Minimal`之后，结果变成这样了：

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-19%20at%208.15.12%20PM.png)

可以看到，`searchBar.barTintColor = UIColor.yellowColor()`没有生效。

暂时不知道为什么，我猜是`Apple`故意设置的不允许修改。


### 默认的黑色边框
当我把 search bar 背景颜色设置为我想要的浅灰色之后，又一个问题出现了。

居然有默认的边框。而且我取色看了一下，在背景颜色不同时，边框颜色值还不一样……

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-19%20at%208.45.34%20PM.png)

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-19%20at%208.46.09%20PM.png)

我尝试设置`borderwidth`为`0`，可是边框依旧显示。（不信你试试：D ）

所以我猜这可能是，当 search bar 没有边框的时候自动添加的强制性边框，用于和其他元素区别吧。

不过刚才已经找到修改边框颜色的方法了。所以用上面的方法修改即可，记得设置`borderWidth`。

这里也有一点要注意：

因为上面我们并没有把每个`UIView`单独拿出来进行操作，而是遍历子视图里的所有`UIView`修改边框，这就导致包含的`textField`边框也被修改为背景层的边框颜色。假如我们自定义的`textField`边框颜色和背景层边框颜色不一样，那么这就不是我们想要的。记得在`if let bg = subsubView as? UIView`后面再执行`if let textField = subsubView as? UITextField`。
```
override func viewWillAppear(animated: Bool) {
        for subView in searchBar.subviews  {
            print(subView)
            for subsubView in subView.subviews  {
                print(subsubView)
                if let bg = subsubView as? UIView {
                    bg.layer.borderColor = UIColor(red: 242/250, green: 242/250, blue: 242/250, alpha: 1).CGColor
                    bg.layer.borderWidth = 1
                }
                if let textField = subsubView as? UITextField {
                    textField.layer.borderWidth = 0
                }
            }
        }
        searchBar.barTintColor = UIColor(red: 242/250, green: 242/250, blue: 242/250, alpha: 1)
    }
```
### 最后附一张我的截图 : D

![](http://7u2sl0.com1.z0.glb.clouddn.com/ios_Screen%20Shot%202016-03-19%20at%208.27.49%20PM.png)

-----

**如有错误，望指正。**
**如有更优方案，望赐教。**

