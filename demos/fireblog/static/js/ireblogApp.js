var fireblogApp = angular.module('fireblogApp', ['ngRoute', 'firebase']);

fireblogApp.config(function($routeProvider) {
	$routeProvider.
		when('/', {
			templateUrl: './template/blog-list.html',
			controller: 'BlogListCtrl'
		}).
		when('/p=:blogId', {
			templateUrl: './template/blog-detail.html',
			controller: 'BlogDetailCtrl'
		}).
		when('/edit=:blogId', {
			templateUrl: './template/blog-edit.html',
			controller: 'BlogEditCtrl'
		}).
		when('/post', {
			templateUrl: './template/blog-post.html',
			controller: 'BlogPostCtrl'
		}).
		otherwise({
			redirectTo: '/'
		});
});


fireblogApp.controller('BlogListCtrl', ['$scope', "$firebaseArray",
	function ($scope, $firebaseArray){
		var ref = new Firebase("https://github-pages.firebaseio.com/blogs");
	    $scope.blogs =  $firebaseArray(ref);
}]);


fireblogApp.controller('BlogDetailCtrl', ['$scope', "$firebaseObject", "$sce", "$routeParams",
	function ($scope, $firebaseObject, $sce, $routeParams){
        var ref = new Firebase("https://github-pages.firebaseio.com/blogs/"+$routeParams.blogId);
        $scope.trustAsHtml = $sce.trustAsHtml;
        $scope.blog =  $firebaseObject(ref);
}]);


fireblogApp.controller('BlogPostCtrl', ['$scope', "$firebaseArray", "$firebaseObject",
	function ($scope, $firebaseArray, $firebaseObject){
		$scope.title = "";
		$scope.newBlog = function() {
            var raw_content = $(editor.getElement('editor').body).html();
            var content = $($(editor.getElement('previewer').body).children()[0]).html();
            if( $scope.title != "" && raw_content != ""){
                var blogsRef = new Firebase("https://github-pages.firebaseio.com/blogs/");
                var date = new Date().getTime();
                var id = date;
                blogsRef.child(""+id).set({
                    title: $scope.title,
                    content: content,
                    raw_content: raw_content,
                    date: date,
                    description: ""
                });
                $scope.title = "";
                $(editor.getElement('editor').body).html("")
                $window.location.href = "#/p="+id
            }
	    };
}]);


fireblogApp.controller('BlogEditCtrl', ['$scope', "$firebaseArray", "$firebaseObject", "$sce", "$routeParams",
	function ($scope, $firebaseArray, $firebaseObject, $sce, $routeParams){
        var blogRef = new Firebase("https://github-pages.firebaseio.com/blogs/"+$routeParams.blogId);
        $scope.blog =  $firebaseObject(ref);
        console.log($firebaseObject(ref))
		$scope.title = $scope.blog.title;
        $(editor.getElement('editor').body).html($sce.trustAsHtml($scope.blog.raw_content))
		$scope.editBlog = function() {
            var raw_content = $(editor.getElement('editor').body).html();
            var content = $($(editor.getElement('previewer').body).children()[0]).html();
            if( $scope.title != "" && raw_content != ""){
                var date = new Date().getTime();
                blogRef.save({
                    title: $scope.title,
                    content: content,
                    raw_content: raw_content,
                    date: date,
                    description: ""
                });
                $scope.title = "";
                $(editor.getElement('editor').body).html("")
                $window.location.href = "#/p="+id
            }
	    };
}]);