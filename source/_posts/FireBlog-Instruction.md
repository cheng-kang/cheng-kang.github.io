---
title: FireBlog Instruction
date: 2016-03-18 12:47:49
categories:
- Tech
tags:
- fireblog
---
### Why

`Github` offers the wonderful [Github Pages](https://pages.github.com/) service. With it, you don’t need to worry about server or domain name(you can have customed domain name like: http://username.github.io, http://username.github.com）. It’s super convenient to set up a static blog based on the service.

Since it’s easy, free and fast, more and more people start to use this service.

>P.S. You can also use your own domain name.

Two weeks ago, I noticed the magic `Github Pages` supprisingly.

There is official support for `Jekyll`, by which you could easily set up a blog without database. You need to push the markdown file of your blog to your git repository.

I didn’t pay much attention to it though. After all I have my own `wordpress` blog on Ali Cloud and hate the idea of manually pushing .md files everytime.

Then one day I was pused a ad about `fireblog` when I was watching video on `Youtube`.

`firebase` offers a basic free service, by which you could operate on the database by `js`.

And it suddenly came to me that I could combine this with `Github Pages`.

So I decided to write a blog framework based on `Github Pages`, `AngularJS` and `firebase`. If I succeed, then people with no idea about programming will be able to set up their own blogs by just `forking` the project and logging in with their `Github` account.

### Intro

It’s named `Fire Blog`。
<!--more-->
1 `fork` the source code from [the project home page](http://cheng-kang.github.com/fireblog)

2 change the name of the project you’ve `forked` to `username.github.io`

3 drink your coffee and visit `https://username.github.io`

4 click that ‘hidden’ login-page entry button

5 log in with your `Github` account

6 edit the `config.js` file as instructed

7 `Tada！` Here is your blog!

### From the author
I myself have never owned an open source project.

A open source project must be one that helps those who need and gets help from those who are willing to share.

And this is what I want to achieve with this project.

I sincerely hope that `Fire Blog` is a good choice for you, and that you are happy to refine or correct it.