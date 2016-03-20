'use strict';

/* Services */

var fireblogServices = angular.module('fireblogServices', []);

fireblogServices.factory("BlogService", ["$firebaseArray", "$firebaseObject",
    function($firebaseArray, $firebaseObject, ConfigService) {
        var cacheData;
        var allTags = {};
        var allCats = {};
        var tagMax = 1;
        var catMax = 1;
        var allBlogByTag = {};
        var allBlogByCat = {};

        function setAllTagsAndCats(cacheData){
            var tags;
            var cat;
            cacheData.$loaded().then(function () {
                for(var j=0;j<cacheData.length;j++){
                    if('tags' in cacheData[j]){
                        tags = cacheData[j].tags.split(" ");
                        for (var i=0; i<tags.length; i++){
                            if(tags[i]==""){
                                continue;
                            }
                            
                            if(tags[i] in allBlogByTag){
                                allBlogByTag[tags[i]][cacheData[j].$id] = cacheData[j].title;
                            }else{
                                allBlogByTag[tags[i]] = {};
                                allBlogByTag[tags[i]][cacheData[j].$id] = cacheData[j].title;
                            }
                            
                            if(tags[i] in allTags){
                                allTags[tags[i]]['count']++;
                                allTags[tags[i]]['id'].push(cacheData[j].$id);
                                
                                if(allTags[tags[i]]['count']>tagMax){
                                    tagMax = allTags[tags[i]]['count'];
                                }
                            }else{
                                allTags[tags[i]] = {'count':1, 'id': [cacheData[j].$id]};
                            }
                        }
                    }
                    
                    if('cat' in cacheData[j]){
                        cat = cacheData[j].cat;
                        
                        if(cat in allBlogByCat){
                            allBlogByCat[cat][cacheData[j].$id] = cacheData[j].title;
                        }else{
                            allBlogByCat[cat] = {};
                            allBlogByCat[cat][cacheData[j].$id] = cacheData[j].title;
                        }
                        
                        if(cat in allCats){
                            allCats[cat]['count']++;
                            allCats[cat]['id'].push(cacheData[j].$id);
                            
                            if(allCats[cat]['count']>catMax){
                                catMax = allCats[cat]['count'];
                            }
                        }else{
                            allCats[cat] = {'count':1, 'id': [cacheData[j].$id]};
                        }
                    }
                }
            });
        }
        
        function getData(){
            if(cacheData){
                return cacheData;
            }else{
                var ref = new Firebase("https://github-pages.firebaseio.com/users/"+CONFIG_UID+"/blogs");
                cacheData =  $firebaseArray(ref);
                
                // console.log(cacheData);
                setAllTagsAndCats(cacheData);
                
                return cacheData;
            }
        }
        
        function refreshData(){
            allTags = {};
            allCats = {};
            tagMax = 1;
            catMax = 1;
            allBlogByTag = {};
            allBlogByCat = {};
            var ref = new Firebase("https://github-pages.firebaseio.com/users/"+CONFIG_UID+"/blogs");
            cacheData =  $firebaseArray(ref);
            
            // console.log(cacheData);
            setAllTagsAndCats(cacheData);
        }
        
        function getObjectByID(id){
            var ref = new Firebase("https://github-pages.firebaseio.com/users/"+CONFIG_UID+"/blogs/"+id);
            return $firebaseObject(ref);
        }
        
        function getAllByTag(cacheData, tagname){
            var result = [];
            cacheData.$loaded().then(function () {
                if(tagname in allTags){
                    for(var i=0;i<allTags[tagname]['id'].length;i++){
                        result.push(cacheData.$getRecord(allTags[tagname]['id'][i]));
                    }
                }
                // console.log(result);
                return result;
            });
        }
        
        function getAllByCat(data, catname){
            var result = {};
            if(catname in allCats){
                for(var i=0;i<allCats[catname].id.length;i++){
                    var blog = data.$getRecord(allCats[catname]['id'][i]);
                    result[blog.$id] = blog.title;
                }
            }
            // console.log(result);
            return result;
        }

        return {
            getAll: function() {
                return getData();
            },
            getRecord: function(id) {
                return getData().$getRecord(id);
            },
            getObjectByID: function(id) {
                return getObjectByID(id);
            },
            getAllTags: function() {
                getData();
                return allTags;
            },
            getAllCats: function() {
                getData();
                // console.log(allCats);
                return allCats;
            },
            getAllByTag: function(tagname) {
                getData();
                return allBlogByTag;
            },
            getAllByCat: function(catname) {
                getData();
                return allBlogByCat;
            },
            getTagMax: function() {
                // console.log("tagMax:"+tagMax);
                return tagMax;
            },
            getCatMax: function() {
                // console.log("catMax:"+catMax);
                return catMax;
            },
            // 新增、修改文章内容后需要更新缓存数据
            refreshData: function() {
                return refreshData();
            }
        };
    }
]);


fireblogServices.factory("OptionService", ["$firebaseObject",
    function($firebaseObject, ConfigService) {
        var cacheBasic;
        
        function getBasic(){
            if(cacheBasic){
                return cacheBasic;
            }else{
                var ref = new Firebase("https://github-pages.firebaseio.com/users/"+CONFIG_UID+"/options/basic");
                cacheBasic =  $firebaseObject(ref);
                
                return cacheBasic;
            }
        }

        return {
            basic: function() {
                return getBasic();
            },
            setSiteTitle: function(page_name) {
                var basic = getBasic();
                basic.$loaded().then(function () {
                    $('title').text(page_name+" - "+basic.sitename);
                });
            },
            setCurrentNav: function(page_name) {
                $("#home_link").css("font-size","12px");
                $("#archives_link").css("font-size","12px");
                $("#cats_link").css("font-size","12px");
                $("#tags_link").css("font-size","12px");
                $("#config_link").css("font-size","12px");
                
                $("#"+page_name+"_link").css("font-size","20px");
            }
        };
    }
]);

fireblogServices.factory("AuthService", ["$q", "$window", "$location", "$firebaseObject", "$firebaseAuth",
    function($q, $window, $location, $firebaseObject, $firebaseAuth) {
        var isLoggedIn = false;
        var uid = '';

        var ref = new Firebase("https://github-pages.firebaseio.com/");
        var authObj = $firebaseAuth(ref);

        init();

        function init() {
            authObj.$onAuth(authDataCallback);
            if(authObj.$getAuth()){
                isLoggedIn = true;
            }
        }

        function authDataCallback(authData) {
            if(authData){
                // console.log("User "+authData.uid+" is logged in with "+authData.provider);
                uid = authData.uid;
                if(CONFIG_UID == "" || uid == CONFIG_UID){
                    isLoggedIn = true;
                    var user = $firebaseObject(ref.child('users').child(authData.uid));
                    user.$loaded().then(function(){
                        // console.log(user);
                        // console.log("the username:"+user.name);
                        if(user.name == undefined){
                            var timestamp = new Date().getTime();

                            var newUser = {};
                            newUser['name'] = authData.github.username;
                            newUser['blogs'] = {};
                            newUser['blogs'][""+timestamp+""] = {};
                            newUser['blogs'][""+timestamp+""]['title'] = "My First Blog";
                            newUser['blogs'][""+timestamp+""]['snippet'] = "";
                            newUser['blogs'][""+timestamp+""]['cat'] = "UNCATEGORIZED";
                            newUser['blogs'][""+timestamp+""]['tag'] = "";
                            newUser['blogs'][""+timestamp+""]['content'] = "<p>HELLO WORLD!!!\n\n</p>\n<p>Welcome to My <code>Blog</code>!!!</p>\n";
                            newUser['blogs'][""+timestamp+""]['raw_content'] = "HELLO WORLD!!!<div><br><div>Welcome to My `Blog`!!!</div></div>";
                            newUser['blogs'][""+timestamp+""]['date'] = timestamp
                            newUser['options'] = {};
                            newUser['options']['basic'] = {};
                            newUser['options']['basic']['username'] = "新用户";
                            newUser['options']['basic']['sitename'] = "MY FIRE BLOG";
                            newUser['options']['basic']['motto'] = "Let's make some noise.";
                            newUser['options']['basic']['navbar_text'] = "NEW USER";
                            newUser['options']['basic']['language'] = "en";
                            newUser['options']['basic']['github'] = authData.github.username;
                            newUser['options']['basic']['facebook'] = "";
                            newUser['options']['basic']['twitter'] = "";
                            newUser['options']['basic']['weibo'] = "";
                            newUser['options']['basic']['weibo_link'] = "";


                            user.$ref().set(newUser);
                            // console.log(user);
                        }
                    });
                }else{
                    alert("你不是这个网站的主人！");
                }
            }else{
                // console.log("User is logged out.");
                isLoggedIn = false;
                uid = "";
            }
        }
        
        function logout() {
            ref.unauth();
            $location.path('/');
        }

        function firebaseAuthLogin(provider) {
            authObj.$authWithOAuthPopup(provider).then(function(authData){
                // console.log("Authenticated successfully with provider "+provider+" with payload:",authData);
                uid = authData.uid;
                $location.path('/admin/archives');
            }).catch(function(error){
                // console.error("Authentication failed:",error);
                uid = "";
            });
        }

        function githubLogin(){
            firebaseAuthLogin('github');
        }

        return {
            isLoggedIn: function() {
                return isLoggedIn;
            },
            getUid: function() {
                return uid;
            },
            githubLogin: function() {
                githubLogin();
            },
            logout: function() {
                logout();
            },
            permissionCheck: function() {
                var deferred = $q.defer();

                if (isLoggedIn) {
                    if(CONFIG_UID != "" && uid != CONFIG_UID){
                        deferred.reject();
                    }else{
                        deferred.resolve();
                    }
                } else {
                    deferred.reject();
                    $location.path('/admin/login');
                }

                return deferred.promise;
            },
        };
    }
]);
