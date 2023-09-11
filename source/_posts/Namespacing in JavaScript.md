---
title: 【译】JavaScript 中的命名空间
date: 1970-01-01 
categories:
- JavaScript
tags:
- JavaScript
- Namespacing
- Namespace
---
> Date: 2016-06-21 21:59:30

> 原文链接： [Namespacing in JavaScript](https://javascriptweblog.wordpress.com/2010/12/07/namespacing-in-javascript/)

# JavaScript 中的命名空间

全局变量应该由有系统范围相关性的对象们保留，并且它们的命名应该避免含糊并尽量减少命名冲突的风险。在实践中，这意味着你应该避免创建全局对象，除非它们是绝对必须的。

不过，恩，这些你早都知道了……

所以你对此是怎么做的？传统方法告诉我们，最好的消除全局策略是创建少数作为潜在模块和子系统的实际命名空间的全局对象。我将探索几种有关命名空间的方式，并以我基于 [James Edwards](http://www.brothercake.com/) 最近的一篇文章得到的一个优雅、安全和灵活的解决方案结束。
<!--more-->
## 静态命名空间

我用`静态命名空间`作为那些命名空间标签实际上硬编码的解决方案的涵盖性术语。是的，你可以将一个命名空间重新分配给另一个，不过新的命名空间将会引用和旧的那一个同样的对象。

### 1.通过直接分配

最基础的方法。这样非常冗长，并且如果你还想重命名这些命名空间，你就有得活儿干了。不过它是安全和清楚明白的。

```
var myApp = {}
myApp.id = 0;
myApp.next = function() {
    return myApp.id++;  
}
myApp.reset = function() {
    myApp.id = 0;   
}
window.console && console.log(
    myApp.next(),
    myApp.next(),
    myApp.reset(),
    myApp.next()
); //0, 1, undefined, 0 
```

你也可以通过使用`this`引用兄弟属性来使将来的维护更轻松一些，不过这有一点冒险因为没有什么能阻止你的那些命名空间里的方法被重新分配。

```
var myApp = {}
myApp.id = 0;
myApp.next = function() {
    return this.id++;   
}
myApp.reset = function() {
    this.id = 0;    
}
myApp.next(); //0
myApp.next(); //1
var getNextId = myApp.next;
getNextId(); //NaN whoops!
```

### 2.使用对象字面量

现在我们只需要引用命名空间名一次，因此之后改变名字更简单了一些（假设你还没反复引用这个命名空间）。仍有一个危险是`this`的值可能会抛出一个『惊喜』 - 不过假设在一个对象字面结构里定义的对象不会被重新分配相对安全一点。

```
var myApp = {
    id: 0,
    next: function() {
        return this.id++;   
    },
    reset: function() {
        this.id = 0;    
    }
}
window.console && console.log(
    myApp.next(),
    myApp.next(),
    myApp.reset(),
    myApp.next()
) //0, 1, undefined, 0
```

### 3.模块模式

我发现自己最近用`模块模式`更多。逻辑被一个方法包装从全局域隔离开了（通常是自调用的），它返回一个代表这个模块公开接口的对象。通过立即调用这个方法并分配结果给一个命名空间变量，我们就锁住了这个命名变量中模块的 API。此外，任何没有包括在返回值中的变量将永远保持私有，只对引用他们的公开方法可见。

```
var myApp = (function() {
    var id= 0;
    return {
        next: function() {
            return id++;    
        },
        reset: function() {
            id = 0;     
        }
    };  
})();   
window.console && console.log(
    myApp.next(),
    myApp.next(),
    myApp.reset(),
    myApp.next()
) //0, 1, undefined, 0  
```

如上对象字面量例子，命名空间名字可以轻易更换，不过还有额外优势：对象字面量是四班的 - 它全是关于属性分配，没有支持逻辑的空间。此外，所有属性必须被初始化，并且属性值无法轻易跨对象引用（因此，比如，内部闭包就不可能使用了）。模块模式没有任何上述约束，并且给我们额外的隐私福利。

## 动态命名空间

我们也可以将这一节称为`命名空间注入`。命名空间由一个直接引用方法包装`内部`的代理代表 - 这意味着我们不再需要打包分配给命名空间的返回值。这让命名空间定义变得更灵活并且让拥有多个存在于独立命名空间中（或者甚至在全局上下文中）的模块的独立实例。动态命名空间支持模块模式的全部特征并附加直观和可读性强的优势。

### 4.提供命名空间参数

在这里我们只是将命名空间作为参数传给自调用方法。变量`id`是私有的，因为他并没有被分配给`context`。

```
var myApp = {};
(function(context) { 
    var id = 0;
    context.next = function() {
        return id++;    
    };
    context.reset = function() {
        id = 0;     
    }
})(myApp);  
window.console && console.log(
    myApp.next(),
    myApp.next(),
    myApp.reset(),
    myApp.next()
) //0, 1, undefined, 0  
```

我们甚至可以把`context`设置给全局对象（通过一个字的改变！）。这是库主们的巨大财富 - 他们可以将他们的特性包装在一个自调用函数中，然后让用户来决定它们是不是全局的（John Resig 在他写 JQuery 时就是一个这个理论的早期采用者）。

```
var myApp = {};
(function(context) { 
    var id = 0;
    context.next = function() {
        return id++;    
    };
    context.reset = function() {
        id = 0;     
    }
})(this);   
window.console && console.log(
    next(),
    next(),
    reset(),
    next()
) //0, 1, undefined, 0  
```

### 5.用`this`作为命名空间代理

[James Edwads](http://www.brothercake.com/) 最近发布的一篇文章激起了我的兴趣。[《My Favorite JavaScript Design Patter》](http://blogs.sitepoint.com/2010/11/30/my-favorite-javascript-design-pattern/) 显然被很多评论者误解了，他们认为他可能也是借助于模块模式。这篇文章宣传了多种技术（可能导致了读者的迷惑），但是在它的核心部分是一点我已经修改并呈现为一个命名空间工具的很天才的东西。

这个模式的美就在于它仅仅是按照这个语言被设计的方式使用 - 不多不少、不投机也不取巧。此外因为命名空间是通过`this`关键字（它在给定的执行上下文中是不变的）注入的，它不可能被意外修改。

```
var myApp = {};
(function() {
    var id = 0;
 
    this.next = function() {
        return id++;    
    };
 
    this.reset = function() {
        id = 0;     
    }
}).apply(myApp);    
 
window.console && console.log(
    myApp.next(),
    myApp.next(),
    myApp.reset(),
    myApp.next()
); //0, 1, undefined, 0
```

更棒的是，`apply`（以及`call`） API 提供了与上下文和参数天然的隔离 - 因此给模块创建者传递附加参数非常干净。下面的例子表明了这一点，并且展示了如何独立于多个命名空间来运行模块。

```
var subsys1 = {}, subsys2 = {};
var nextIdMod = function(startId) {
    var id = startId || 0;
    this.next = function() {
        return id++;    
    };
    this.reset = function() {
        id = 0;     
    }
};
nextIdMod.call(subsys1);    
nextIdMod.call(subsys2,1000);   
window.console && console.log(
    subsys1.next(),
    subsys1.next(),
    subsys2.next(),
    subsys1.reset(),
    subsys2.next(),
    subsys1.next()
) //0, 1, 1000, undefined, 1001, 0
```

当然如果我们如果我们需要一个全局 id 生成器，非常简单……

```
nextIdMod();    
window.console && console.log(
    next(),
    next(),
    reset(),
    next()
) //0, 1, undefined, 0
```

这个我们作为例子使用的 id 生成器工具并没有表现出这个模式的全部潜力。通过包裹一整个库和使用`this`关键字作为命名空间的替身，我们使得用户在任何他们选择的上下文中运行这个库很轻松（包括全局上下文）。

```
//library code
var protoQueryMooJo = function() {  
    //everything
}
//user code
var thirdParty = {};
protoQueryMooJo.apply(thirdParty);
```

## 其他的考虑

我希望避免命名空间嵌套。它们很难追踪（对人和电脑都是）并且它们会让你的代码因为一些乱七八糟的东西变得很多。如 [Peter Michaux](http://michaux.ca/articles/javascript-namespacing) 指出的，深度嵌套的命名空间可能是那些视图重新创建他们熟悉和热爱的长包链的老派 Java 开发者的遗产。

通过 .js 文件来固定一个单独的命名空间也是可以的（虽然只能通过命名空间注入或者直接分配每一个变量），不过你应该对依赖谨慎些。此外将命名空间绑定到文件上可以帮助读者更轻易弄清整个代码。

因为 JavaScript 并没有正式的命名空间结构，所以有很多自然形成的方法。这个调查只详细说明了其中的一部分，可能有更好的技术我没有发现。我很乐意知道它们。

## 更多文章

James Edwards： [My Favorite JavaScript Design Pattern](http://blogs.sitepoint.com/2010/11/30/my-favorite-javascript-design-pattern/)
Peter Michaux: [JavaScript Namespacing](http://michaux.ca/articles/javascript-namespacing)