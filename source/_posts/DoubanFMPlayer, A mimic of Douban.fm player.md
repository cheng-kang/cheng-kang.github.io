---
title: DoubanFMPlayer, A mimic of Douban.fm player
date: 1970-01-01 
tags:
---
> Date: 2017-02-03 22:31:30

> Project Page: [https://github.com/cheng-kang/DoubanFMPlayer](https://github.com/cheng-kang/DoubanFMPlayer)

A mimic of Douban.fm player on [Douban.fm](https://douban.fm/). *Also a Flex practice project.*

You can use it on your website or **embed it in your Hexo theme**.

## Showcase
Click [here](http://chengkang.me/DoubanFMPlayer/) to check live demo.
### Dark Theme (the color of the player is dark, used in light color web page)
![](https://raw.githubusercontent.com/cheng-kang/DoubanFMPlayer/master/DBFMPlayer-1.gif)

### Light Theme (the color of the player is light, used in dark color web page)
![](https://raw.githubusercontent.com/cheng-kang/DoubanFMPlayer/master/DBFMPlayer-2.gif)

<!--more-->

## Usage

Feel free to download source code from `/src` folder.

Alternatively, use the cdn I've set up:
```
dbfmplayer.js: http://7u2sl0.com1.z0.glb.clouddn.com/dbfmplayer.js
dbfmplayer.css: http://7u2sl0.com1.z0.glb.clouddn.com/dbfmplayer.css
```
    
    
### 1. Use it on your website
1. Add any numbers of `dbfmplayer` tag to your HTML file.
    ```
    <dbfmplayer 
        title="茜さす 帰路照らされど…" 
        singer="椎名林檎"
        album="https://img1.doubanio.com/lpic/s2722629.jpg"
        music="http://mr3.doubanio.com/ff7730a714d4e3ecbf3f5854f6154532/0/fm/song/p1033017_128k.mp4"
    ></dbfmplayer>
    ```
    You **must** set `title`, `singer`, `album` and `music` attributes of your `dbfmplayer` tags.
    
    - `title`: name of the music
    - `singer`: name of the singer/musician
    - `album`: URL of a picture related to this music (both absolute URL or relative URL)
    - `music`: URL of the music (both absolute URL or relative URL)
    
    **Optional** attributes are `theme` and `loop`.
    
    - `theme`: "dark" or "light". Default theme is "dark", which is suitable for light color background web pages; theme "light" is suitable for dark color background web pages.
    - `loop`: "true" or "false". Default value is "false". If `loop` is set to "true", the music will loop after it ends.
    - `autoplay`: "true" or "false". Default value is "false". If `autoplay` is set to "true", the music will automatically start when it's loaded.
    
    You can set `loop` and `autoplay` to "true" in a convenient way:
    ```
    <dbfmplayer 
        title="茜さす 帰路照らされど…" 
        singer="椎名林檎"
        album="https://img1.doubanio.com/lpic/s2722629.jpg"
        music="http://mr3.doubanio.com/ff7730a714d4e3ecbf3f5854f6154532/0/fm/song/p1033017_128k.mp4"
        loop
        autoplay
    ></dbfmplayer>
    ```
2. Add the following script to your HTML file.

    ```
    <script type="text/javascript">
        (function() { // DON'T EDIT BELOW THIS LINE
        var d = document, s = d.createElement('script');
        s.src = 'http://7u2sl0.com1.z0.glb.clouddn.com/dbfmplayer.js';
        (d.head || d.body).appendChild(s);
        })();
    </script>
    ```
    
### 2. Embed it in your Hexo theme

1. Add the following script to your layout file for **Post** (or anywhere else you want):

    ```
    <script type="text/javascript">
        (function() { // DON'T EDIT BELOW THIS LINE
        var d = document, s = d.createElement('script');
        s.src = 'http://7u2sl0.com1.z0.glb.clouddn.com/dbfmplayer.js';
        (d.head || d.body).appendChild(s);
        })();
    </script>
    ```
2. Now users can add music to their page by adding the `dbfmplayer` tag to their articles (markdown files) by following [1.1 Add any numbers of `dbfmplayer` tag to your HTML file.](#1-use-it-on-your-website). 

## Acknowledgements

Most SVG icons come from [Iconmoon.io](https://icomoon.io/).

Designed by [Douban.fm](https://douban.fm).

## Copyright
**All copyright of the design belongs to who creates it.** 

Any copyright issue, please contact [hi@chengkang.me](mailto:hi@chengkang.me).


<dbfmplayer 
    title="茜さす 帰路照らされど…" 
    singer="椎名林檎"
    album="https://img1.doubanio.com/lpic/s2722629.jpg"
    music="http://mr3.doubanio.com/ff7730a714d4e3ecbf3f5854f6154532/0/fm/song/p1033017_128k.mp4"
    theme="dark"
    loop
    autoplay
></dbfmplayer>
