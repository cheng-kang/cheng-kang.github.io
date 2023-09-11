---
title: 【译】Swift2 中的错误处理：try，catch，do 以及 throw
date: 1970-01-01 
categories:
- iOS
tags:
- iOS
- Swift
- error
---
> Date: 2016-05-15 23:14:40

> 原文链接：[《Error handling in Swift 2: try, catch, do and throw》](https://www.hackingwithswift.com/new-syntax-swift-2-error-handling-try-catch)

如果你已经看了我那篇讨论 Swift2 中所有新东西的文章并且想了解更多关于新的错误处理系统的东西，这篇文章非常合适。简单来说，它已经被完全重写得现代化，快速和安全，并且除非你只使用 iOS API 的一小部分的话，你需要花些时间来学习一下。

如果你喜欢这篇文章，你可能也会想读读这些：
- [What's new in Swift 2.2?](https://www.hackingwithswift.com/swift2-2)
- [What's new in iOS 9?](https://www.hackingwithswift.com/ios9)
- [My free Swift tutorial series](https://www.hackingwithswift.com/)
- [Pre-order Pro Swift for just $20!](https://gum.co/proswift)


### 过去是怎样：NSError 和 NSErrorPointer

用于处理错误的历史方法是通过使用一个作为指针传递的 NSError 对象。在 Objective-C 中，它是 NSError*，但在 Swift 中你会看到 NSError？ 和 NSErrorPointer。

<!--more-->

当你调用一个可能失败的方法，你要传递一个空 NSError 作为参数，如果有问题的话这个参数就会被赋值。这让方法的返回值是你真正关心的那个数据。例如，在 Swift1.2 中，从硬盘加载一个 NSString 看起来是这样的：
```
var err: NSError?
let contents = NSString(contentsOfFile: filePath, encoding: NSUTF8StringEncoding, error: &err)

if err != nil {
    // uh-oh!
} 
```
这种编程风格在 Cocoa 中非常广泛，或者说至少：Swift2 完全不这么干，所以上面的代码要么要重写要么就移除掉。

至于为什么，有很多原因。例如，用上面的调用方法，很容易就忽略了错误，要么是没有检查 err 的值，要么是根本就没用 NSError 而是直接传递了一个 nil。

虽然 Swift2 中的新错误处理需要多费点功夫，但是它让程序员阅读起来清楚明白得多，它抛弃了那些复杂的东西例如用 & 来传递 NSError，并且它通过保证你捕获所有错误来给你更高的安全性。

### Swift2 中的方法：try，catch，do 以及 throw

当你导入一个 Swift1.2 项目到 Xcode7 时，你会被问道是否想要将它转换成最新的 Swift 语法。它并不能生成和你手写的一模一样的代码，但是它能帮你解决很大一部分工作，这样你就差不多确定要去使用它了。

在上面那个从文件中加载字符串的例子中，它会将其转化为 Swift2 版本：
```
let contents: NSString?
do {
    contents = try NSString(contentsOfFile: filePath, encoding: NSUTF8StringEncoding)
} catch _ {
    contents = nil
}
```
这里展示了五个你需要学习的新关键字其中三个。当然，严格来说有一个不新，不过它的用法是新的：do 之前使用在 do … while 循环中，不过为了避免混淆，在 Swift2 中，它已经被重命名为 repeat … while。

第四和第五个关键字是 throw 和 throws，我们现在来更深入地看看。

请创建一个新的 Xcode 项目，用单视图应用模板。随便命个名，随便选个目标设备 - 都没关系，因为我们这次不做任何跟视图有关的东西。

选择 ViewController.swift 并且添加这个新方法：
```
func encryptString(str: String, withPassword password: String) -> String {
    // complicated encryption goes here
    let encrypted = password + str + password
    return String(encrypted.characters.reverse())
}
```
这个方法会用传递进来的密码加密一个字符串。当然，它不会自动就这样做 - 这篇文章不是关于加密的，所以我的『加密』算法很悲剧：它将密码添加在输入的字符串前后，然后翻转这个字符串。你之后可以随意加上复杂的加密算法。

修改 viewDidLoad() 来调用这个方法：
```
let encrypted = encryptString("secret information!", withPassword: "12345")
print(encrypted)
```

你现在运行你的应用，你将看到在 Xcode 终端上打印出了『54321！noitamrofni terces54321』。很简单对吧。

但是有一个问题：假设你实际上设定了一个有意义的加密算法，你没办法阻止用户输入一个空字符串作为密码，或者输入明显的密码类似『password』，或者甚至尝试在没有任何可加密数据的情况下调用加密算法。

Swift2 来帮忙了：你可以告诉 Swift 当这个方法发现它自己处于一个不可接受的状态时，它可以抛出一个错误，例如如果密码是六位或者更少位。这些错误是由你定义的，然后 Swift 用某种办法来保证你捕获所有的错误。

首先，我们需要关键字 throws，你需要在定义你的方法时把它加在返回值前面，就像这样：
```
func encryptString(str: String, withPassword password: String) throws -> String {
    // complicated encryption goes here
    let encrypted = password + str + password
    return String(encrypted.characters.reverse())
}
``` 
一旦你这样做了，你的代码就会停止工作：添加 throws 命名让情况更糟了！不过它变糟了是因为一个好原因：Swift 中的 try/catch 系统被设计为对开发者清晰明了，这意味着你需要用关键字 try 标记所有可以抛出错误的方法，就像这样：
```
let encrypted = try encryptString("secret information!", withPassword: "12345")
```                   
…不过即使现在你的代码还是不能编译成功，因为你还没有告诉 Swift 当错误被抛出时要做什么。这就是关键字 do 和 catch 派上用场的地方：它们开始了一段可能运行失败的代码，并且处理那些失败。在我们的简单例子里，它可能看起来是这样：
```
do {
    let encrypted = try encryptString("secret information!", withPassword: "12345")
    print(encrypted)
} catch {
    print("Something went wrong!")
}  
```
这样所有的错误都没了，你的代码又可以运行了。不过目前为止它实际上还没有做任何有意思的事情，因为即使我们说 encryptString() 可能抛出一个错误，它从没有真正发生。

### 如何在 Swift2 中抛出错误

在你可以抛出一个错误之前，你需要制作一个你要抛出的可能错误的列表。在我们这个例子中，我们要组织人们提供空密码，短密码和明显密码，不过之后你可以扩展它。

要做到这些，我们需要创建一个枚举类型变量来代表我们错误的类型。这需要建立在内建的 ErrorType 枚举类型上，不过不管怎样都很简单。把这个加载 ViewController 类的前面：
```
enum EncryptionError: ErrorType {
    case Empty
    case Short
}
```
它定义了两个错误类型，然后我们可以马上开始用它们。因为它们是运行这个方法的前提条件，我们要用这个新关键字 guard 来使我们的意图清晰。

把这个放在 encryptString() 前面：
```
guard password.characters.count > 0 else { throw EncryptionError.Empty }
guard password.characters.count >= 5 else { throw EncryptionError.Short }
```
如果你现在运行应用，没有什么变化，因为我们在提供『12345』这个密码。不过如果你把它设置为一个空字符串，你会看到『Something went wrong！』在 Xcode 控制台打印出来了。

当然，有一个错误信息帮助不是很大 - 因为这个方法调用时有多种方式失败，并且我们希望给每一种情况提供一些有意义的信息。所以，把 viewDidLoad() 中的 try/catch 代码块改成这样：
```
do {
    let encrypted = try encryptString("secret information!", withPassword: "")
    print(encrypted)
} catch EncryptionError.Empty {
    print("You must provide a password.")
} catch EncryptionError.Short {
    print("Passwords must be at least five characters, preferably eight or more.")
} catch {
    print("Something went wrong!")
}
```
现在有了有意义的错误信息，我们的代码开始看起来更棒了。不过你可能注意到了，虽然我们已经捕获到了 .Empty 和 .Short 的情况，我们还需要第三个 catch 代码块。

### Swift2 要求详尽无遗的 try/catch 错误处理

如果你还记得的话，我说过『Swift 通过一些方式来保证你捕获到所有错误』，这里我们来说明清楚：我们已经能捕获所有我们定义的错误，但是 Swift 还希望我们定义一个一般的 catch all 来处理任何其他可能出现的错误。我们不用告诉 Swift 到底加密算法可能抛出哪种错误，只需要说明它会抛出某些错误，因此这个额外的 catch-all 代码块是必须的。

有一个不好的地方：如果你新增任何值给枚举类型，它会直接进到默认的 catch 代码块 - 你不会被要求为它提供任何代码。

我们将要给枚举类型加一个新的值来检测明显的密码。不过我们将要用 Swift 超强枚举类型这样我们可以返回一个带着错误类型的信息。因此，将 EncryptionError 枚举类型修改成这样：
```
enum EncryptionError: ErrorType {
    case Empty
    case Short
    case Obvious(String)
}
```
现在当你想要抛出一个 EncrytionError.Obvious 类型的错误是，你必须提供一个理由。
```
guard password != "12345" else { throw EncryptionError.Obvious("I've got the same passcode on my luggage!") }
```
显然你不想写无数个 guard 声明来过滤出明显的密码，不过如果你记得如何使用 UITextChecker 来做拼写检查的话，就很方便了。

这就是完整的 Swift 基本 do/try/throw/catch 例子。你可能觉得 try 声明没什么用，不过他是作为一个信号告诉开发者『这个调用可能失败』。这很重要：当一个 try 调用失败了，执行立刻跳转到 catch 代码块，因此如果你看到一个调用之前的 try，它标志着底下的代码可能不会被执行。

还有一个要说的事情就是，如果你知道一个调用就是不会失败你该怎么做。现在，很显然这是一个你需要根据情况来做的决定，不过如果你知道有一个方法绝对不可能调用失败或者如果它调用失败的你的代码就会完全崩溃，你可以使用 try! 来告诉 Swift。

当你使用关键字 try!，你不需要用 do/catch 来包裹你的代码，因为你在保证它永远不会失败。你只需要这样写：
```
let encrypted = try! encryptString("secret information!", withPassword: "12345")
print(encrypted)
```
使用关键字 try! 清楚地表达了你的意图：你知道理论上这个调用可能失败，但是你确定它在你的用例中不会失败。例如，如果你从你的应用包中的文件中加载内容，任何失败意味着你的应用包被损坏了或者不可用，所以你需要终止应用。

这就是所有关于 Swift2 中错误处理的东西。如果你想学习 Swift 是怎样处理 try/finally，你应该读读我这篇[关于关键词 defer 的文章](https://www.hackingwithswift.com/new-syntax-swift-2-defer)。