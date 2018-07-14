---
title: QnA，一个 Hexo FAQ 主题
date: 2017-01-14 11:47:03
tags:
---

> 之前在 Gitbook 上创建了一个 FAQ 网站，但是 Gitbook 使用起来偏麻烦，而且主题不好看。预期创建一个 Gitbook 主题，不如创建一个 Hexo 主题，然后将网站部署到 Github 上。于是我便动手制作了这个主题。

> 这个主题的最初目的是为了服务这个网站 [Swift Newbie: 给 Swift 新手的知识库](http://chengkang.me/Swift-Newbie/)，对 Swift 学习感兴趣的同学可以点开看看，有意贡献的同学可以联系我 `hi@chengkang.me`。

> 项目主页：[《Theme QnA for Hexo》](https://github.com/cheng-kang/hexo-theme-qna)

![](https://raw.githubusercontent.com/cheng-kang/hexo-theme-qna/master/QnA.png)

为 Hexo 设计的『知识库』类主题。

<!--more-->

## 文档

- [Documentation English Version](./Documentation.md)

## 展示:

- [预览](http://chengkang.me/hexo-theme-qna/)
- [Swift Newbie: 给 Swift 新手的知识库](http://chengkang.me/Swift-Newbie/)


## 如何安装

### 安装

``` bash
$ git clone https://github.com/cheng-kang/hexo-theme-qna.git themes/QnA
```

### 启用

修改根目录中 `_config.yml` 的 `theme` 为 `QnA。`

### 更新

``` bash
cd themes/QnA
git pull
```

## 高级功能

### 发布到 Github

安装 Hexo 插件 [hexo-deployer-git](https://github.com/hexojs/hexo-deployer-git)。

``` bash
$ npm install hexo-deployer-git --save
```

编辑你 Hexo 博客根目录中的 `_config.yml` 文件。

``` yml
deploy:
  type: git
  repo: <repository url> # https://github.com/cheng-kang/hexo-theme-qna.git
  branch: [branch] # master
```

### 启用中文站内搜索

> QnA 默认只支持英文站内搜索。

安装 Hexo 插件 [hexo-generator-search](https://github.com/PaicHyperionDev/hexo-generator-search)。

``` bash
$ npm install hexo-generator-search --save
```

### 添加新页面

1. 添加一个新页面，例如：about 页面。改变页面内容请修改根目录下 source/about/index.md 文件。

  ``` bash
  $ hexo new page about
  ```

2. 编辑 theme/QnA 中的 `_config.yml`。

  ```yml

  menu:
    Home: /
    Archive: /archives
    # Add new page config here
    # Page Dispay Name: /pagename
    # e.g.
    About: /about
  ```
