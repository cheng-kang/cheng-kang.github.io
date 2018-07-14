---
title: Fire Blog 中文说明
date: 2016-03-18 12:51:29
categories:
- Tech
tags:
- fireblog
---
### 起源

`Github`提供了[Github Pages](https://pages.github.com/)服务，相当于为你提供了服务器空间和还算比较好看的域名（如： http://username.github.io, http://username.github.com），你可以利用它建立一个静态博客。

因为简单免费而且访问速度快（比我自己的阿里云快多了【翻白眼】），所以越来越多的人使用`Github Pages`搭建技术博客。

>注：也可以绑定自己的域名。

两个星期之前，自己才通过朋友的博客知道这个好东西。

官方提供`Jekyll`的支持,可以快速搭建不用到数据库的博客。用法是配置好之后，每次将写好的博客`markdown`文件上`push`到`github`里面。

不过当时也没过多在意，一是我自己有一个放在阿里云上的`wordpress`博客，二是觉得每次还要上传文件嫌麻烦。

直到有一天我在`Youtube`上看相声视频的时候给我推送了一个广告（不得不说广告投得蛮准的，很多时候我都把广告看完了，尤其是那个参加空军的广告：）女王，我要当兵），是一个在线数据库服务，叫`firebase`。

`firebase`提供免费的基础服务，可以通过`js`进行数据库操作。

我突然就想起来`Github Pages`如果用上这个，不就有数据库了吗。

于是决定用`angularjs`+`firebase`写一个博客框架，让不懂代码的朋友到时候只用`fork`下项目代码，用自己的`github`账号登录就可以创建好自己的博客。
<!--more-->
### 简介

名字叫`Fire Blog`。

1 从[项目主页](http://cheng-kang.github.com/fireblog)`fork`项目代码

2 修改`fork`下来的项目的项目名称为 `username.github.io`

3 等待一两分钟，访问刚刚设置的`https://username.github.io`

4 点击那个隐藏的后台登录入口

5 使用`Github`账号登录

6 按要求修改配置文件

7 `Tada！`然后你的博客就创建好了！

### 其他的话
我自己还没跟开源项目挂上过勾。

我想开源项目应该就是能够帮上别人，也希望有人一起来完善。

这个项目的本意就是这样。

希望`Fire Blog`成为大家的一个选择，也希望其他程序员来添砖加瓦、建议指正。