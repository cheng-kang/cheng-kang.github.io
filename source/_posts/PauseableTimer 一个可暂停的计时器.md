---
title: Pauseable Timer 一个可暂停的计时器
date: 1970-01-01 
tags:
- Swift
- iOS
---
> Date: 2017-01-05 15:31:35

> 项目主页: [PauseableTimer Github Repository](https://github.com/cheng-kang/PauseableTimer)
> 英文介绍： [Pauseable Timer](http://chengkang.me/2017/01/04/Pauseable%20Timer/)

PauseableTimer 是一个用 Swift 写的可暂停的计时器。

有时候我们需要暂停计时器，但是这个功能在 Timer(Swift3) 中并没有被实现。因此，经过一些失败的尝试，我创建了这个可以暂停的计时器，希望对你也有用。

![](https://raw.githubusercontent.com/cheng-kang/PauseableTimer/master/PauseableTimer-1.gif)

<!--more-->

## 如何使用
1. 创建一个计时器 Timer

	```
	e.g.
	let timer = Timer.scheduledTimer(timeInterval: 10, target: self, selector: aSelector, userInfo: nil, repeats: true)
	```

2. 创建一个可暂停的计时器 PauseableTimer，并将之前创建的 Timer 作为参数传入 

	```
	e.g.
	let pauseableTimer = PauseableTimer(timer: timer)
	```

3. 暂停 然后 重新开始！

	```
	e.g.
	pauseableTimer.pause()
	pauseableTimer.resume()
	```

**注意**

- 如果用于初始化 PauseableTimer 的 Timer 不是通过 scheduledTimer 方法初始化的或没有被加入到 RunLoop 中，那么你需要手动将它加入到 RunLoop 中。你可以这样做，`RunLoop.current.add(timer, forMode: .commonModes)`。
- 如果你需要操作用于初始化 PauseableTimer 的 Timer 或者需要获取它的属性，请使用 PauseableTimer 的 `timer` 属性。就像这样，`pauseableTimer.timer.firedate = Date()`。
- `invalidate()` 方法是为便于手动让 timer 失效而创建的。

## 介绍
PauseableTimer 并没有重新实现 Swift 中的 Timer，而是将 Timer 作为一个属性然后在它的帮助下实现了 暂停 的功能。

这个功能的原理受到 [NSTimer 总结1(包括计时器不准的解决)](http://www.jianshu.com/p/e554a164d0da) 的启发。 

主要思想是 `当你需要暂停的时候，将 Timer 的 firedate 设置为一个无法达到的日期（这样计时器会一直等待，感觉起来就像是暂停了 :D）；当你需要重新开始的时候，将 firedate 设置回原来的时间（这样计时器就可以『照常』触发）`。 

简单聪明！

你可能注意到了加了引号的『照常』。事实上，这个方法可能无法达到你的期望，因为

1.  Firedate 过期了。

	```
	e.g.
	现在的时间是 2017.01.04 10:25。
	原本的 firedate 是 2017.01.04 10:30。
	你现在暂停了这个计时器，并且在十分钟后（2017.01.04 10:35）重新开始。这时，计时器已经错过了它预计的 firedate（2017.01.04 10:30）。
	然而，如果这个计时器已经在 RunLoop 当中的话，当你在 2017.01.04 10:35 将 firedate 设置回 2017.01.04 10:30 时，计时器会立即触发一次。
	```

2. 我们希望计时器继续等待剩下的等待时间。

	```
	e.g.
	现在的时间是 2017.01.04 10:25:00。
	计时器的 timeInterval 是 60 秒。现在计时器被加入到 RunLoop，它应该在 60 秒后触发，也就是在 2017.01.04 10:26:00。
	然后你因为某种原因在 10 秒后暂停了它，也就是在 2017.01.04 10:25:10。你在 2017.01.04 10:25:50 的时候重新开始了计时器。
	不过，你仍然希望它是在设置好后，等待 60 秒再触发，不管暂停的那段时间。所以它应该再等待 50 秒，然后在 2017.01.04 10:26:40 触发。
	```

完美的解决方案应该是满足以上所述三种情况的（另一种情况是我们不在乎原始 firedate 是否过期）。不过，这个项目目前只解决了第二个情况，因为这是我在其他项目中所遇到的需要解决的问题。

未来我可能会继续这个小项目，然后将每一种情况的解决方案都完善起来。