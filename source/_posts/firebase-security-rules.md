---
title: Firebase 安全与规则
date: 1970-01-01 
tags:
- Firebase
---
> Date: 2017-09-30 21:08:37

> 原文链接：[Firebase Security & Rules](https://howtofirebase.com/firebase-security-rules-88d94606ce4a)

Firebase 是一个可以从任意建立连接了的客户端访问的云数据库。因为任意客户端都可以连接到任意 Firebase [数据库]，你**必须**制定安全规则来保护你的数据。写不好恰当的安全规则会让你暴露在攻击中。不过别着急！你马上就能学到帮你紧紧锁住你的数据的全部知识了。

保持安全规则简洁。安全规则可能变得过于复杂，并很快变得不受控制如果你的数据结构不够设计充分的话。这篇文章展示了一些“最佳”实践。估计你会讲其略作修改就用到你的生产应用中去……如果你选择采用这些模式，记得仔细想想背后的含义就行。确保在你开始搞事之前，读了整篇文章以及[安全规则文档](https://firebase.google.com/docs/database/security/)全文。

<!-- more -->

## 安全规则是基于节点的

安全规则由一个单独的 JSON 对象管理，你可以在你的实时数据库控制台编辑或者使用 Firebase CLI [来编辑]。还有一个额外惊喜，如果你的规则格式错误的话，控制台和 CLI 会给你警告。

规则对象开始是这样：

```
{ 
 "rules": 
  { 
    ".read": false,
    ".write": false
  }
}
```

这个 JSON 对象的根节点必须命名为 `rules`。`rules` 节点默认不可读写。上面的立即显式地设置了 `.read` 和 `.write` 为 `false`，但是留个空白的规则也会有同样的效果。

## 级联规则

Firebase 级联规则是这样的：授予一个父母节点读写权限会同时授予其所有子节点读写权限。

再说一遍。

Firebase 级联规则是这样的：授予一个父母节点读写权限会同时授予其所有子节点读写权限。

这里有个巨大的“坑”，即使是对于有经验的 Firebase 用户来说也是这样。让我们回顾一下为什么 Firebase 这样来处理，以及我们可以如何绕过这个限制。

首先，Firebase 本质上要求这样的一种行为。如果你在 Firebase 里面查询一个节点，你将得到其*所有*的子节点。Firebase 非常注重性能表现，它不会花时间来在每一个子节点上套用规则并且做出可能的从父母节点移除的动作。那样会大大影响其表现。

第二，你可以通过根据你的权限结构来结构化你的数据以轻易地避免这些级联规则的问题。将你的数据嵌套在这样命名的高级别的节点中，比如 “admin”、“userReadable”、“userWritable” 或者 “userOwned”。将有着类似安全需求的对象分组在高级别节点下会有效地降低你需要维护的安全规则数量。

**关于验证规则小窍门：**我们之后会谈到验证规则。验证规则用于阻止用于父母节点写权限的用户写入其子节点。这样的话，当你授予了写权限给 `userOwned/preferences/{uid}`，你可以编写一条验证规则，比如说 `userOwned/preferences/{uid}/isAdmin`，这样就可以阻止用户更新 `isAdmin` 这个子节点。

这种方法会带来一些后果，基本上任何在 `userOwned/preferences/{uid}` 的 `ref.set()` 的操作都会失败，因为你不能重写 `isAdmin` 这个子节点...你需要使用 `ref.update()` 来单独更新每一个子节点。将 `isAdmin` 节点移到你的数据结构的其他本就是用户可读不可写的部分会比较轻松。你可以将其命名为 `userReadable/preferences/{uid}/isAdmin`。

## 示例数据结构

我们将使用以下数据结构来继续剩下的内容：

```
{
  "users": {
    "kanyesUID": {
      "name": "Kanye West",
      "email": "kwest@gmail.com"
    },
    "taylorsUID": {
      "name": "Taylor Swift",
      "email": "tswift@gmail.com"
    },
    "seacrestsUID": {
      "name": "Ryan Seacrest",
      "email": "rseacrest@gmail.com",
      "isAdmin": true
    }
  },
  "userReadable": {
    "tweets": {
      "kanyesUID": {
        "aPushKey": {
          "text": "Imma let you finish, but..."
        },
        "bPushKey": {
          "text": "Queen B shoulda received this award..."
        }
      }
    },
    "retweets": {
      "taylorsUID": {
        "cPushKey": {
          "key": "aPushKey",
          "text": "Imma let you finish, but..."
        },
        "dPushKey": {
          "key": "bPushKey",
          "text": "Queen B shoulda received this award..."
        }
      }
    }
  },
  "userWriteable": {
    "tweetQueue": {
      "taylorsUID": {
        "text": "I 💕 you all like Kanye 💕's Kanye"
      }
    }
  },
  "userOwned": {
    "preferences": {
      "kanyesUID": {
        "loveKanye": true
      },
      "taylorsUID": {
        "listenToHaters": false
      }
    }
  }
}
```

这些数据有四个顶级节点：

1. users
2. userReadable
3. userWriteable
4. userOwned

我们有两个用户：

1. Kanye West
2. Taylor Swift

`users` 节点包含了基础的用户数据，在这个例子中就是邮箱地址。我们设想当 Kanye 登陆了我们的 app，他的 uid 是 `kanyesUID`。类似的，Taylor 得到了这个 uid `taylorsUID`。这些 UID 会组成我们安全模型的基础。

首先，来让每个用户数据`用户可读`...

```
{
 "rules": {
    "users": {
      "$uid": {
        ".read": "auth.uid == $uid"
      }
    }
  }
}
```

我们在根节点 `rules` 上加了一个 `users` 节点。任何直接写在 `users` 节点下面的规则会被应用到所有其子节点中...但是我们并不想在 `users` 节点上设置规则。我们希望给每一个独立的用户基于其 uid 设置规则，因此我们创建了一个通配节点，`$uid`。我们可以随意命名通配节点，只要其开始字符是 `$`。最佳实践是给他们命名一些描述性的东西，因此我们将这个通配节点命名为 `$uid`，因为每个用户都将保存在其 uid 下。

通配节点应用于所有其他没有明确指出的节点上。有点糊涂了？看看这个。

```
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth.uid == $uid"
      },
      "taylorsUID": {
        ".read": "auth.uid == 'taylorsUID'",
        ".write": "auth.uid == 'taylorsUID'"
      }
    }
  }
}
```

看到我们干了啥吗？我们仅赋予了 `$uid` 节点 `.read` 权限，但是我们给了 Taylor 这个用户 `.read` 和 `.write` 权限。

你可能在想 `auth.uid == $uid` 是什么意思。当用户通过 Firebase Authentication 认证成功时，这个用户会从系统获得一个 uid，它可以通过 `auth.uid` 访问到。因此当 Kanye 在系统中认证时，他的 `auth.uid` 等于 `kanyesUID`。我们可以将 `auth.uid` 和 `$uid` 比较来授予用户对他们自己节点的读权限，但对其他节点无权限。也可以直接和字符串比较：`".read": "auth.uid == 'taylorsUID'"`。

## 索引子键来加快查询

设想我们的 app 在进行这样一个查询：

```
ref.child('users').orderByChild('email').equalTo('kwest@gmail.com').once('value', callback);
```

我们在要求 firebase 来从 `users` 节点中搜索一个 `email` 节点为 `kwest@gmail.com` 的子节点。根据我们数据库的大小，这可能是一个非常巨量且缓慢的查询，因此 Firebase 给我们提供了指定子节点的高性能索引。在这个例子中，我们希望 Firebase 通过 `email` 这个子节点索引所有用户。做法很简单，`".indexOn": "email"`。如下：

```
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth.uid == $uid",
        ".indexOn": [
          "email"
        ]
      }
    }
  }
}
```

如果我们还要索引其他子节点，比如说 `users/{$user}/username`，我们的规则就这么写 `".indexOn": ["email", "username"]`。

## 遍历树以获取细节权限

让我们将这个设想的类似 twitter 的 app 的第三个用户称为： Ryan Seacrest。Ryan 的账号是管理员账号。注意到了他的用户账号里的 `"isAdmin": true` 属性了吗？

```
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth.uid == $uid || root.child('users').child(auth.uid).child('isAdmin').val() == true",
        ".write": "root.child('users').child(auth.uid).child('isAdmin').val() == true",
        ".indexOn": [
          "email"
        ]
      }
    }
  }
}
```

用户们仍然可以读取他们自己的账户数据，不过我们刚刚给所有有 `isAdmin` 标识的用户赋予了读写权限。用于检测这个标识的规则是 `root.child(‘users’).child(auth.uid).child(‘isAdmin’).val()`。`root` 对象代表我们的 Firebase 的根节点。接着我们调用 `.child('nodeName')` 来向下找到我们的认证过的用户的 `isAdmin` 节点。看到了是怎么使用 `auth.uid` 来深入到这个认证用户的吗？是，这样做很聪明。它同时也悄悄地让任何没有认证的用户访问失败，这样这些节点就安全了。

还有一点要注意：我们在一个节点上调用 `.val()` 来获取它的值。这让人想起我们是如何使用 Firebase JavaScript SDK 来处理数据快照，应该看起来很熟悉吧。

另外一点：还有别的遍历树的方式。我们可以调用 `data.parent().child(auth.uid).val()` 来从我们正在保护的节点往上走到 `users` 再往下走。这个方法会很实用，但是从 `root` 开始遍历会更可靠，因为 `root` 对于我们 app 的任何部分都是一样的。为了安全，还是用 `root` 吧。

## 使用 Bolt 规则编译器来 streamline 你的规则

到目前我们一直在直接修改我们的规则 JSON 对象。这没有问题，但是它可能总是在重复复制粘贴操作。Firebase 团队也已经疲于复制粘贴，于是写了一个和 [firebase-tools](https://github.com/firebase/firebase-tools) CLI 结合来让规则更容易写的编译器。

你需要通过 `npm install -g firebase-bolt` 安装 Bolt 并且在你的项目根目录创建一个命名为类似 `security-rules.bolt` 的文件。然后你可以执行 `firebase-bolt sevurity-rules.bolt`，它会编译你的 Bolt 规则到一个新的文件并命名为 `firebase-rules.json`。生成的 JSON 可能会比我们之前写的 JSON 更啰嗦，但是 Bolt 语法很好用精炼。详见 [Bolt language reference](https://github.com/firebase/bolt/blob/master/docs/language.md)。

```
function isUser (auth, userKey) {
  return uid == userKey;
}

function isAdmin (auth) {
  return root.child('users').child(auth.uid).child('isAdmin').val() == true;
}

path /users/{uid} {
  read() { isUser(auth, uid) || isAdmin(auth) }
  write() { isAdmin(auth) }
  index() { ["email"] }
}

path /userReadable/{objectType}/{uid} {
  read() { isUser(auth, uid) || isAdmin(auth) }
  write() { isAdmin(auth) }
}

path /userWriteable/{objectType}/{uid} {
  read() { isAdmin(auth) }
  write() { isUser(auth, uid) || isAdmin(auth) }
}

path /userOwned/{objectType}/{uid} {
  read() { isUser(auth, uid) || isAdmin(auth) }
  write() { isUser(auth, uid) || isAdmin(auth) }
}
```

请注意我们是怎样写在顶部的两个方法的：`isUser(auth, uid)` 和 `isAdmin(auth)`。这些方法不是必须的，但是超级有用。它们让我们可以在我们的规则中重用一些逻辑。

下一个部分有一堆 `path` 块。使用 `/[nodeName]/` 来通配你的路径。这些通配值在这些 path 的范围内都是可用的，因此你可从 `/userReadable/objectType/uid` 获取 `uid`，并传给 `read() { isUser(auth, uid) || isAdmin(auth) }`。

## 根据读写权限来结构化你的数据

你可能注意到了有三个顶级节点被命名为：

- userReadable
- userWriteable
- userOwned

上一节中我们授予了用户读权限给 `userReadable` 的子节点、写权限给 `userWriteable` 的子节点以及完整的读写权限给 `userOwned` 的子节点。

这是只一个随意的数据结构…我们可以将这三个节点命名为随便什么。不过命名为描述性的名字会更好。接着我们用了通配路径（`path/userReadable/objectType/uid`）来给一组一组的对象应用规则。

现在我们不需要给我们创建的每一类对象都编写规则。我们只需要将这些对象嵌套在恰当的权限节点下就好了。例如：

```
{
  "rules": {
    "userOwned": {
      "preferences": {
        "kanyesUID": {
          "loveKanye": true
        },
        "taylorsUID": {
          "listenToHaters": false
        }
      }
    }
  }
}
```

`userOwned` 节点有对所有在匹配的用户 uid 下的对象的读写权限。因此只有 Kanye 可以访问 `/userOwned/preferences/kanyesUID`，并且 Kanye 有完整的读写权限。

要记得我们可以通过制定另一条匹配路径规则来重写统配规则，例如：

```
path /userOwned/{objectType}/{uid} {
 read() { isUser(auth, uid) || isAdmin(auth) }
  write() { isUser(auth, uid) || isAdmin(auth) }
}
path /userOwned/grammyNominations/taylorsUID {
  read() { true }
  write() { uid == kanyesUID }
}
```

第二条规则重写了 `/userOwned/{objectType}/uid` 并仅授予 Kanye 对于 Taylor’s Grammy Nominations 的写权限。同时也让这个列表全世界可读，因此任何网站或者用户都可以通过 `https://<some firebase>.firebaseio.com/userOwned/grammyNominations/taylorsUID.json` 来获取这个列表。

## 保证安全性的同时验证你的数据

`read()`、`write()` 以及 `index()` 覆盖了大多数使用情况，但有时候你可能需要更多对于要写入的数据的更细节的控制。

Bolt 允许你创建可以在多节点间重用的数据类型。

```
path /userOwned/preferences/{uid} is Preferences;
type Preferences {
 validate() { this.excuse.length < 20 && this.respectRating < 5 }
  useAutotune: Boolean,
  excuse: String,
  respectRating: Number
}
```

请注意，我们可以将验证规则和 `validate()` 混合在一起。

你也可以将类型和读写权限混合：

```
path /userOwned/preferences/{uid} is Preferences {
 read() { isUser(auth, uid) }
 write() { isUser(auth, uid) }
}
type Preferences {
  validate() { this.excuse.length < 20 && this.respectRating < 5 }
  useAutotune: Boolean,
  excuse: String,
  respectRating: Number
}
```

## 别名规则

目前为止我们仅仅使用了 `read()`、`write()`、`index()` 和 `validate()`，但是 Bolt 支持其它三个功能：

- create()
- update()
- delete()

这些方法都是 `write()` 的别名，因此他们不能和 `write()` 一起混合到同一个 `path` 块。它们创建了分别仅适用于新建、更新或者删除操作的 `write()` 规则。下面的示例是如果你想要给用户权限创建对象但是不能编辑或者删除，`create()` 会生成处理这种情况的 `write()` 规则。

```
path /dropbox/{objectType}/{uid} {
 create() { isUser(auth, uid) }
  read() { isAdmin(auth) }
}
 
path /editable/{objectType}/{uid} {
  update() { isUser(auth, uid) }
  read() { isAdmin(auth) }
}
 
path /deleteable/{objectType}/{uid} {
  delete() { isUser(auth, uid) }
  read() { isAdmin(auth) }
}
```

## 部署你的规则

有两种方式：

1. 执行 `firebase-bolt my-rules-file.bolt` 来创建 `my-rules-files.json`，然后你可以复制粘贴到你的实时数据库规则控制台。
2. 执行 `firebase-tools init` 来创建你的 `firebase.json` 托管文件，然后在 `database.rules` 创建一个节点来指向你的 `.bolt` 或者 ‘.json’ 规则文件。接着运行 `firebase deploy --only rules` 来通过命令行部署你的规则。

我们稍后会谈到 `firebase.json` 这个选项。现在，看看下面这个 `firebase.sjon` 例子并且留意 `database.rules` 这个节点。它指向了一个记录了我的 bolt 规则的叫做 `database.rules.bolt` 的文件。如果这个文件被命名为 `database.rules.json`，firebase 会知道我的规则是 JSON 格式，不过因为我命名了为 `.bolt`，它会在上传其到我的 Firebase 云上之前自动将其传给 `firebase-bolt` 编译器进行编译。

```
// Eample firebase.json
{
  "database": {
    "rules": "database.rules.bolt"
  },
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "/app/**/*",
        "destination": "/index.html"
      }
    ],
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  },
  "functions": {
    ".source": "functions"
  }
}
```


## 练习

差不多就这样了。

具体练习见原文吧 ：D。




























