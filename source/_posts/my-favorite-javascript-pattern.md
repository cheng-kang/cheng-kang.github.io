---
title: 【译】我最喜欢的 JavaScript 设计模式
date: 1970-01-01 
categories:
- JavaScript
tags:
- JavaScript
- Design Pattern
---
> Date: 2016-07-02 10:50:25

> 原文链接：[My Favorite JavaScript Design Pattern](https://www.sitepoint.com/my-favorite-javascript-design-pattern/)

# 我最喜欢的 JavaScript 设计模式

我觉得聊一下我爱用的 JavaScript 设计模式应该很有意思。我是一步一步才定下来的，经过一段时间从各种来源吸收和适应直到达到一个能提供我所需的灵活性的模式。

让我给你看看概览，然后再来看它是怎么形成的：

```
function MyScript(){}
(function()
{

  var THIS = this;

  function defined(x)
  {
    return typeof x != 'undefined';
  }

  this.ready = false;

  this.init = function(
  {
    this.ready = true;
  };

  this.doSomething = function()
  {
  };   

  var options = {
      x : 123,
      y : 'abc'
      };

  this.define = function(key, value)
  {
    if(defined(options[key]))
    {
      options[key] = value;
    }
  };

}).apply(MyScript);
```

<!--more-->

如你在实例代码中看到的，整体框架是一个函数直接量（function literal）：

```
(function()
{
  ...

})();
```

函数直接量基本上就是一个自执行域，相当于定义一个有名的函数然后立即调用它：

```
function doSomething()
{
  ...
}

doSomething();
```

我最初开始使用函数直接量是为了`封装`——任何格式的任何脚本都可以被封装在那个闭包里，并且它有效地将它`密封`在私有域中，从而保护它不会与同一个域里的其它脚本或者数据冲突。在最后面的那一对括号就是在执行这个域，就像其它函数一样调用它。

但是如果，这个域通过使用 `Function.apply` 来执行而不是全局调用，这可以让它在一个可被外界引用的*特定命名*的域中执行。

因此通过结合二者——创建一个命名函数，然后在这个命名函数的域内执行一个函数直接量——我们就得到了一个一次性的可以构成任何脚本的基础的对象，它模拟了类似面向对象类的继承性质。

## 内在之美

看看第一个代码示例，你就能看到封闭域结构提供了什么样的灵活性。当然，这些你都可以在任何方法中做到，但是通过用这种方式包装起来，我们就有了一个可以和任何命名域联系起来的结构体。

我们可以创建多个这样的结构体，然后将它们和同一个域联系起来，这样它们之间全部可以共享它们的公开数据。

不过在共享公开数据的同事，每一个（结构体）也可以定义它自己的私有数据。下面是一个例子，在脚本的最上面：
```
var THIS = this;
```

我们创建了一个叫做 `THIS` 的私有变量，它指向这个函数域，并且可以在私有方法中使用——和用 `self = this` 来创建内部域是一样的招数。

通过同样方式声明的其他私有变量，如果他们定义常量数据的话，可以使用大写传统（不过用 `const` 而不是 `var` 来做声明的方式应该被避免，因为对它的支持不是很好）。

私有方法可以用来提供内部功能：

```
function defined(x)
{
  return typeof x != 'undefined';
}
```

然后我们可以创建其他实例或者外界可以访问的公开方法和属性：

```
this.ready = false;

this.init = function()
{
  this.ready = true;
};

this.doSomething = function()
{
};
```

我们也可以创建特殊的值——私有但是可以公开定义，在这个例子中是通过公开的 `define` 方法；它的参数可以根据数据需要再进行验证：

```
var options = {
  x : 123,
  y : 'abc'
  };

this.define = function(key, value)
{
  if(defined(options[key]))
  {
    options[key] = value;
  }
};
```

## 封装起来！

所有的这些特点让这个结构体对我非常有用。并且它封装在一个整洁、自我执行的单例中——一个容易引用、整合和使用的一次性对象。

所以你怎么想？这个模式眼熟吗，或者你有什么其他喜欢用的？
