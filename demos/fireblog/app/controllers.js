'use strict';

/* Controllers */

var fireblogControllers = angular.module('fireblogControllers', []);

fireblogControllers.controller('OptionCtrl', ['$scope', "OptionService", "AuthService",
    function ($scope, OptionService, AuthService){
        $scope.option =  OptionService.basic();
        $scope.AuthService = AuthService;

        $scope.option.$loaded().then(function () {
            $scope.l = CONFIG_LANG[$scope.option.language==undefined?"en":$scope.option.language];
        });


    }
]);

fireblogControllers.controller('BlogListCtrl', ['$scope', "BlogService", "OptionService",
	function ($scope, BlogService, OptionService){
        $scope.current_page = 1;
        $scope.count = 0;
        $scope.perpage = 10;
        
        $scope.blogs = BlogService.getAll();
        
        $scope.blogs.$loaded().then(function () {
            //to make sure that $scope.blogs is already loaded, otherwise length doesn't exist
            $scope.count = $scope.blogs.length;
        });
        
        $scope.totalPage = function() {
            //if $scope.count==0, means at this moment the data hasn't been loaded.
            return $scope.count==0?1:Math.ceil($scope.count/$scope.perpage);
        }
        
        //currentN is the number of articles of the current page.
        $scope.currentN = function() {
            var n = $scope.count - ($scope.current_page-1)*$scope.perpage;
            return n>=10?10:n;
        }
        
        $scope.hasPrev = function() {
            return $scope.current_page==1?false:true;
        }
        
        $scope.hasNext = function() {
            return $scope.totalPage()==$scope.current_page?false:true;
        }
        
        $scope.prevPage = function() {
            if(($scope.current_page--)<1){
                $scope.current_page = 1;
            }
        }
        
        $scope.nextPage = function() {
            if(($scope.current_page++)>$scope.totalPage()){
                $scope.current_page = $scope.totalPage();
            }
        }
        
        $scope.range = function(n) {
            return new Array(n);
        };
        
        $scope.BlogService = BlogService;
        
        var page_name = "HOME";
        var site_name = OptionService.setSiteTitle(page_name);
        OptionService.setCurrentNav("home");
    }
]);


fireblogControllers.controller('BlogDetailCtrl', ['$scope', "$location", "BlogService", "OptionService", "$sce", "$routeParams",
	function ($scope, $location, BlogService, OptionService, $sce, $routeParams){
        $scope.trustAsHtml = $sce.trustAsHtml;
        $scope.location = $location;
        $scope.blogs =  BlogService.getAll();

        $scope.toggleDuoshuoComments = function(container,blog){
            var el = document.createElement('div');//该div不需要设置class="ds-thread"
            el.setAttribute('data-thread-key', blog.$id);//必选参数
            el.setAttribute('data-url', $location.absUrl());//必选参数
            el.setAttribute('data-title', blog.title);//可选参数
            DUOSHUO.EmbedThread(el);
            $(container).html("");
            $(container).append(el);
        }
        
        $scope.blogs.$loaded().then(function () {
            $scope.blog = $scope.blogs.$getRecord($routeParams.blogId);
            var page_name = $scope.blog.title;
            var site_name = OptionService.setSiteTitle(page_name);
            OptionService.setCurrentNav("");
        });
    }
]);


fireblogControllers.controller('BlogPostCtrl', ['$scope', "OptionService", "BlogService", "$window",
	function ($scope, OptionService, BlogService, $window){
        $scope.allCats = BlogService.getAllCats();
        $scope.allTags = BlogService.getAllTags();
        
		$scope.title = "";
		$scope.cat = "";
		$scope.tags = "";
		$(editor.getElement('editor').body).html("");
		$($(editor.getElement('previewer').body).children()[0]).html("");
        
        $scope.selectCat = function(catname) {
            $scope.cat = catname;
        }
        
        $scope.addTag = function(tagname) {
            $scope.tags += " "+tagname;
        }
        
        $scope.clearCat = function() {
            $scope.cat = $scope.cat.split(' ')[0].toUpperCase();
        }
        
        $scope.clearTags = function() {
            $scope.tags = $.trim($scope.tags.toLowerCase());
        }
        
		$scope.newBlog = function() {
            var raw_content = $(editor.getElement('editor').body).html();
            editor.preview();
            var content = $($(editor.getElement('previewer').body).children()[0]).html();
            if( $scope.title != "" && raw_content != ""){
                var blogsRef = new Firebase("https://github-pages.firebaseio.com/users/"+CONFIG_UID+"/blogs/");
                var date = new Date().getTime();
                var id = date;
                
                $scope.clearTags();
                $scope.clearTags();
                var cat = $scope.cat==""?"uncategorized":$scope.cat;
                var tags = $scope.tags;
                blogsRef.child(""+id).set({
                    title: $scope.title,
                    content: content,
                    raw_content: raw_content,
                    date: date,
                    snippet: "",
                    cat: cat,
                    tags: tags,
                });
                $scope.title = "";
                $(editor.getElement('editor').body).html("")
				$($(editor.getElement('previewer').body).children()[0]).html("");
                BlogService.refreshData();
                $window.location.href = "#/p="+id
            }
	    };
        
        var page_name = "NEW";
        var site_name = OptionService.setSiteTitle(page_name);
        OptionService.setCurrentNav("");
    }
]);


fireblogControllers.controller('BlogEditCtrl', ['$scope', "OptionService", "BlogService", "$window", "$firebaseObject", "$sce", "$routeParams",
	function ($scope, OptionService, BlogService, $window, $firebaseObject, $sce, $routeParams){
        var blogRef = new Firebase("https://github-pages.firebaseio.com/users/"+CONFIG_UID+"/blogs/"+$routeParams.blogId);
        var blog =  $firebaseObject(blogRef);
        
        $scope.title = "";
        $scope.cat = "";
        $scope.tags = "";
        $scope.allCats = BlogService.getAllCats();
        $scope.allTags = BlogService.getAllTags();
        
        $scope.selectCat = function(catname) {
            $scope.cat = catname;
        }
        
        $scope.addTag = function(tagname) {
            $scope.tags += " "+tagname;
        }
        
        $scope.clearCat = function() {
            $scope.cat = $scope.cat.split(' ')[0].toUpperCase();
        }
        
        $scope.clearTags = function() {
            $scope.tags = $scope.tags==undefined?"":$.trim($scope.tags.toLowerCase());
        }
        
		blog.$loaded()
		  .then(function(data) {
	  		$scope.blog = data;
			$scope.title = $scope.blog.title;
			$scope.cat = $scope.blog.cat;
			$scope.tags = $scope.blog.tags;
	        $(editor.getElement('editor').body).html(data.raw_content);

		  })
		  .catch(function(error) {
		    console.error("Error:", error);
		  });
        
		$scope.editBlog = function() {
            var raw_content = $(editor.getElement('editor').body).html();
            editor.preview();
            var content = $($(editor.getElement('previewer').body).children()[0]).html();
            if( $scope.title != "" && raw_content != ""){
                var date = new Date().getTime();
                
                $scope.clearCat();
                $scope.clearTags();
                var cat = $scope.cat==""?"UNCATEGORIZED":$scope.cat;
                var tags = $scope.tags;
                blog.title = $scope.title;
                blog.content = content;
                blog.raw_content = raw_content;
                blog.date = date;
                blog.cat = cat;
                blog.tags = tags;
                blog.$save();
                $(editor.getElement('editor').body).html("");
                BlogService.refreshData();
                $window.location.href = "#/p="+blog.$id;
            }
	    };
        
        var page_name = "EDIT";
        var site_name = OptionService.setSiteTitle(page_name);
        OptionService.setCurrentNav("");
    }
]);


fireblogControllers.controller('CatAllCtrl', ['$scope', "BlogService", "OptionService",
	function ($scope, BlogService, OptionService){
        $scope.cats = BlogService.getAllCats();
//        $scope.catMax = BlogService.getCatMax();
        $scope.BlogService = BlogService;
        
        var page_name = "CATEGORIES";
        var site_name = OptionService.setSiteTitle(page_name);
        OptionService.setCurrentNav("cats");
    }
]);

fireblogControllers.controller('CatOneCtrl', ['$scope', "BlogService", "OptionService", "$routeParams",
	function ($scope, BlogService, OptionService, $routeParams){
        $scope.cats = BlogService.getAllByCat();
        $scope.catname = $routeParams.catname;

        $scope.years = {};
        
        var page_name = $routeParams.catname;
        var site_name = OptionService.setSiteTitle(page_name);
        OptionService.setCurrentNav("");
    }
]);

fireblogControllers.controller('TagAllCtrl', ['$scope', "BlogService", "OptionService",
	function ($scope, BlogService, OptionService){
        $scope.tags = BlogService.getAllTags();
//        $scope.tagMax = BlogService.getTagMax();
        $scope.BlogService = BlogService;
        
        var page_name = "TAGS";
        var site_name = OptionService.setSiteTitle(page_name);
        OptionService.setCurrentNav("tags");
    }
]);

fireblogControllers.controller('TagOneCtrl', ['$scope', "BlogService", "OptionService", "$routeParams",
	function ($scope, BlogService, OptionService, $routeParams){
        $scope.tags = BlogService.getAllByTag($routeParams.tagname);
        $scope.tagname = $routeParams.tagname;

        $scope.years = {};
        
        var page_name = $routeParams.tagname;
        var site_name = OptionService.setSiteTitle(page_name);
        OptionService.setCurrentNav("");
    }
]);

fireblogControllers.controller('ArchiveCtrl', ['$scope', "BlogService", "OptionService",
	function ($scope, BlogService, OptionService){
        $scope.blogs = BlogService.getAll();

        $scope.years = {};
        
        $scope.deleteBlog = function(blog) {
            $scope.blogs.$remove(blog);
        }

        var page_name = "ARCHIVES";
        var site_name = OptionService.setSiteTitle(page_name);
        OptionService.setCurrentNav("archives");
    }
]);

fireblogControllers.controller('ConfigCtrl', ['$scope', "$window", "AuthService", "OptionService", "$firebaseObject",
    function ($scope, $window, AuthService, OptionService, $firebaseObject){
        $scope.OptionService = OptionService;
        var basic = OptionService.basic();

        // var ref = new Firebase("https://github-pages.firebaseio.com/users/"+CONFIG_UID+"/options/basic");
        // var basic =  $firebaseObject(ref);



        basic.$loaded().then(function(data){
            $scope.sitename = basic.sitename;
            $scope.username = basic.username;
            $scope.motto = basic.motto;
            $scope.navbar_text = basic.navbar_text;
            $scope.github = basic.github;
            $scope.facebook = basic.facebook;
            $scope.twitter = basic.twitter;
            $scope.weibo = basic.weibo;
            $scope.weibo_link = basic.weibo_link;
            $scope.language = basic.language;
        });

        $scope.AuthService = AuthService;

        $scope.editBasicOption = function() {

            basic.sitename = $scope.sitename;
            basic.username = $scope.username;
            basic.motto = $scope.motto;
            basic.navbar_text = $scope.navbar_text;
            basic.language = $scope.language=="zh"||$scope.language=="en"?$scope.language:"en";
            // basic.github = $scope.github;
            basic.facebook = $scope.facebook;
            basic.twitter = $scope.twitter;
            basic.weibo = $scope.weibo;
            basic.weibo_link = $scope.weibo_link;

            basic.$save().then(function(ref) {
                ref.key() === basic.$id; // true
                alert("Website Configs Updated!");
            }, function(error) {
              console.log("Error:", error);
            });
        }
        
        var page_name = "CONFIG";
        var site_name = OptionService.setSiteTitle(page_name);
        OptionService.setCurrentNav("config");
    }
]);

fireblogControllers.controller('LoginCtrl', ['$scope', "$window", "AuthService", "OptionService",
    function ($scope, $window, AuthService, OptionService){
        $scope.isLoggedIn = AuthService.isLoggedIn();
        $scope.AuthService = AuthService;

        if($scope.isLoggedIn){
            $window.location.href = "#/";
        }

        
        var page_name = "LOGIN";
        var site_name = OptionService.setSiteTitle(page_name);
        OptionService.setCurrentNav("");
    }
]);