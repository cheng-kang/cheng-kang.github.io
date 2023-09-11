---
title: 【译】JavaScript 命名空间
date: 1970-01-01 
categories:
- JavaScript
tags:
- JavaScript
- Namespace
- Namespacing
---
> Date: 2016-06-28 16:07:58

> 原文链接：[《JavaScript Namespacing》](http://peter.michaux.ca/articles/javascript-namespacing)

# JavaScript 命名空间

JavaScript 中有很多可以给你的对象安全分配命名空间的方法。这篇文章讨论我见过的普遍的实践。

## 前缀命名空间

如果命名空间的目的是避免冲突的话。下面这个系统，只要我们知道全局变量名前缀 *myApp_* 是唯一的，可以像其他系统一样避免命名空间冲突。

```
// add uniquely named global properties
var myApp_sayHello = function() {
  alert('hello');
};
var myApp_sayGoodbye = function() {
  alert('goodbye');
};

// use the namespace properties
myApp_sayHello();
```

C 语言程序经常使用前缀命名空间。在 JavaScript 的世界中，你可能会碰见 Macromedia 的 MM_ 方法，例如 MM_showHideLayers。

我认为前缀命名空间是 JavaScript 中最清楚明白的命名空间系统。（下面的对象命名空间策略在加入了 `this` 关键字后会导致困惑。）

前缀命名空间的确创建了很多全局对象。这对于前缀用来避免的命名空间冲突并不是什么问题。前缀命名空间的问题是，有些网页浏览器（例如 IE6）在有很多全局对象时表现很糟糕，就我所听说。我做了一些测试并且发现有一个 comp.lang.javascript 的小线程，不过我没有就这个话题研究彻底。

<!--more-->

## 单对象命名空间

当下，最流行的 JavaScript 命名空间实践是使用一个全局变量来引用一个对象。这个被引用的对象引用你的『真正的业务』，并且因为你的全局对象的命名独一无二，你的代码和其他人的代码就可以一起嗨皮地运行。

如果你确定这个世界上没有任何人用了这个全局变量名 *myApp*，那么你可以有这样的代码：

```
// define the namespace object
var myApp = {};

// add properties to the namespace object
myApp.sayHello = function() {
  alert('hello');
};
myApp.sayGoodbye = function() {
  alert('goodbye');
};

// use the namespace properties
myApp.sayHello();
```

当上面代码的最后一行执行时，JavaScript 解释器首先找到 *myApp* 对象，然后找到并调用这个对象的 *syaHello* 属性。

对象命名空间的一个问题是它会导致与面向对象消息传递混淆。这两者之间并没有明显的句法差异：

```
// 1
namespace.prop();

// 2
receiver.message();
```

更仔细地研究这个混淆，我们得出下面的命名空间想法。假设我们有以下库。

```
var myApp = {};

myApp.message = 'hello';

myApp.sayHello = function() {
  alert(myApp.message);
};
```

用这个库的代码可以随意进行写操作。

```
myApp.sayHello(); // works
  
var importedfn = myApp.sayHello;

importedfn(); // works
```

将这个和那个令人混淆的使用 `this` 的消息传递版本比较一下。

```
var myApp = {};

myApp.message = 'hello';

myApp.sayHello = function() {
  alert(this.message);
};
```

用这个库的代码可以随意进行写操作。

```
myApp.sayHello() // works because "this" refers to myApp object.

var importedfn = myApp.sayHello;

importedfn(); // error because "this" refers to global object.
```

这里面的要上的一课是，`this` 永远不能引用一个被作为命名空间的对象因为它肯能导致关于从命名空间引入标识符的混淆。这个问题是 `this` 在我的 [JavaScript Warning Words](http://peter.michaux.ca/article/7933) 列表中的原因之一。

（这也表明了库的 API 属性应该指向用一个方法，这样这些方法可以被导入其他命名空间。这个问题是在我的文章 [Lazy Function Definition Pattern](http://peter.michaux.ca/article/3556) 的评论中被指出的。懒惰方法定义可以在被隐藏在库中并且不是 API 的部分时安全使用。）

## 嵌套对象命名空间

嵌套对象命名空间是另一个普遍的实践，它扩展了对象命名空间的想法。你可能见过类似如下代码：

```
YAHOO.util.Event.addListener(/*...*/)
```

解决上面的代码需要解释器首先找到全聚德 *YAHOO* 对象，然后它的 *util* 对象，然后它的 *Event* 对象，然后找到并调用它的 *addListener* 属性。这样的话每次事件处理器绑定到一个 DOM 元素上花的功夫太多了，因此导入的概念开始被采用。

```
(function() {
  var yue = YAHOO.util.Event;
  yue.addListener(/*...*/);
  yue.addListener(/*...*/);
})();
```

如果你清楚 *YAHOO.util.Event.addListener* 方法不会用 `this` 关键字并且永远引用同一个方法，那么导入可以变得更加简洁。

```
(function() {
  var yuea = YAHOO.util.Event.addEventListener;
  yuea(/*...*/);
  yuea(/*...*/);
})();
```

我觉得当目的只是避免标识符冲突时，嵌套对象命名空间的复杂是不必要的。难道 Yahoo! 还觉得这些全局标识符 YAHOO_util_Event 和 YAHOO_util_Event_addEventListener 不够独特吗？

我认为使用嵌套对象命名空间的动机是要看起来和 Java 包命名传统一样，这在 Java 中开销不大。例如，在 Java 中你可能看到如下：

```
package mytools.text;

class TextComponent {
  /* ... */
}
```

一个这个类的完全合格的引用应该是 `mytools.text.TextComponent`。

下面是 Niemeyer 和 Knudsen （写）的 *Learning Java* 中包命名的描述：

> 包名是按层级构成的，使用点分隔的命名传统。包名组成成分给编译器和运行系统构成了独一无二的定位文件的路径。然而，它们并没在包之间创建其他的关系。并没有什么『subpackage』的说法，事实上，包命名空间是直接的，而非层级的。在包层级关系特定部分的包仅仅是因为习惯而有关联。比如，如果我们穿件了另一个叫做 *mytools.text.poetry* 的包（假设是为了跟诗有关的一些文字类），这些类并不是 *mytools.text* 包的一部分；它们没有包成员的访问权限。

嵌套命名空间的幻觉在 Perl 中也存在。在 Perl 中，嵌套包名由双冒号分隔开。你可以看到如下 Perl 代码：

```
package Red::Blue;
our $var = 'foo';
```

一个完全合格的上述变量引用应该是 *$Red::Blue::var*。

在 Perl 中，就像 Java，命名空间层级的主意只是方便程序员，而不是语言本身要求。Wall，Christiansen 和 Orwant 的 *Programming Perl* 解释道：

> 双冒号可被用于链接在包名 *$Red::Blue::var* 中标识符。这意味着 *$var* 属于包 *Red::Blue*。包 *Red::Blue* 跟可能存在的 *Red* 包或 *Blue* 包一点关系都没有。只是说，*Red::Blue* 和 *Red* 或者 *Blue* 之间的关系可能对于写代码或者使用这个程序的人有什么意义，但跟 Perl 没关系。（好吧，除了在现在的实现中，符号表 *Red::Blue* 刚好存在符号表 *Red* 中。但是 Perl 语言并没有直接利用过它。）

上述引用中最后备注暗示了 Perl 可能有和在 JavaScript 中使用嵌套命名空间对象一样的标识符冲突开销。如果 Perl 的实现改变了，这个开销就会消失。在 JavaScript 中，我肯定嵌套对象命名空间的开销永远不会消失因为 JavaScript 使用延迟绑定。

我并不认为 JavaScript 中的嵌套对象命名空间提供了任何大好处，不过如果不使用导入的话在运行时可能会开销非常大。

## 一个折中方案

如果单纯地前缀命名空间在某些浏览器中真的很慢，而嵌套命名空间的概念帮助在开发者脑中保持各事务的有序，那我认为上述 Yahoo! 的例子也可以这样写：

```
YAHOO.util_Event_addListener
```

或者用更多的全局名称：

```
YAHOO_util_Event.addListener
```

## 哪个维度的命名空间？

Perl 的 CPAN 模块是基于他们所做的事情进行命名空间管理的。例如，我写了一个这个命名空间里的模块：

```
JavaScript::Minifier
```

如果别人用同样的名字写他自己的模块，并且他不自知地通过某些模块依赖通过同一个名字使用 CPAN 模块，那么就会有冲突。

Java 程序员采用最冗长但当然也是最安全的方法。（Java 程序员似乎都想着在大型系统上运行的代码。）在 Java 中，包经常是基于**谁写的**和**做什么的**来命名。（*myFunc*风格的规范化。）『谁写的』部分甚至使用开发者自己的相对可以保证唯一性的名字。如果我写一个 Java 的 minifier，因为我有 michaux.ca 的域名，我可能用以下命名空间：

```
ca.michaux.javascript.minifier
```

在 JavaScript 中，经过这次讨论，可能这样写效率更高：

```
ca_michaux_javascript_minifier
```

因为 JavaScript 是以文本的形式服务的，这样的命名空间可能开销太大，因为增加了下载时间。Gzip 压缩会找到公共的字符串并用短字符串替换它们。如果 gzip 不可用的话那么就可以考虑使用导入了。

```
var ca_michaux_javascript_minifier = {};

(function() {
  var cmjm = ca_michaux_javascript_minifier;
  
  // refer to cmjm inside this module pattern
})();
```

我并不是说这些长的命名空间是绝对必须的，不过他们一定是避免命名空间冲突的最安全方法。

## 其他命名空间问题

标识符不仅在 JavaScript 资源中创建。一个表单的 name 属性也被加在 *document.forms* 对象上。像 *<form name="myCompany_login">* 这样命名是有意义的。

命名空间类名属性，比如 *<div class="myCompany_story”>*，可以在减少 CSS 命名空间冲突以及当 JavaScript 代码在通过类名搜索 DOM 元素时很有价值。

## 总结

我个人认为，任何像 *YAHOO.util.Event.addListener* 这样有点或者下划线的东西都是被冲突吓傻了的。它可以就是 *YUI.on*。Dojo 通过同样功能的 dojo.connect 提供了足够的保护，因为它有效地涵盖了命名空间『谁』和『做什么』的维度。没有人会在他们的右脑中会这样想并在 dojo 命名空间下写一个 JavaScript 库。Dojo 的开发人员也不会忘记他们已经有了一个 connect 方法并写另外一个。

如果我们能有一个网站来让程序员们保存他们的 JavaScript 全局标识符和下划线前缀，并且当 ECMAScipt4 发布了的时候也包括他们的包名，就好了：『JavaScript 命名空间登记处』。

JavaScript 是一个最小概念集的强大语言。即使 JavaScript 并没有专门为避免命名空间冲突设计的语言级支持，还是有很多解决问题的方法。并没有一个『正确』的答案。选一个你最喜欢的。

不过，无论你做什么，请记住别弄一个另外的全局 $ 标识符。

## 更多

[comp.lang.javascript discussion on namespacing](http://groups.google.com/group/comp.lang.javascript/browse_frm/thread/494e1757fa51fe3f)
