'use strict';

/* App Module */

var fireblogApp = angular.module('fireblogApp', [
    'ngRoute',
    'firebase',
    
    'fireblogControllers',
    'fireblogServices',
    'fireblogFilters',
]);

fireblogApp.config(function($routeProvider) {
	$routeProvider.
		when('/', {
			templateUrl: '../template/blog-list.html',
			controller: 'BlogListCtrl'
		}).
		when('/p=:blogId', {
			templateUrl: '../template/blog-detail.html',
			controller: 'BlogDetailCtrl'
		}).
		when('/archive', {
			templateUrl: '../template/archive.html',
			controller: 'ArchiveCtrl'
		}).
		when('/cats', {
			templateUrl: '../template/cat-all.html',
			controller: 'CatAllCtrl'
		}).
		when('/cat=:catname', {
			templateUrl: '../template/cat-one.html',
			controller: 'CatOneCtrl'
		}).
		when('/tags', {
			templateUrl: '../template/tag-all.html',
			controller: 'TagAllCtrl'
		}).
		when('/tag=:tagname', {
			templateUrl: '../template/tag-one.html',
			controller: 'TagOneCtrl'
		}).
		when('/admin/login', {
			templateUrl: '../template/login.html',
			controller: 'LoginCtrl',
		}).
		when('/admin/config', {
			templateUrl: '../template/config.html',
			controller: 'ConfigCtrl',
			resolve: {
          		permission: function (AuthService) {
            		return AuthService.permissionCheck();
            	}
          	},
		}).
		when('/admin/archive', {
			templateUrl: '../template/archive.html',
			controller: 'ArchiveCtrl',
			resolve: {
          		permission: function (AuthService) {
            		return AuthService.permissionCheck();
            	}
          	},
		}).
		when('/admin/edit=:blogId', {
			templateUrl: '../template/blog-edit.html',
			controller: 'BlogEditCtrl',
			resolve: {
          		permission: function (AuthService) {
            		return AuthService.permissionCheck();
            	}
          	},
		}).
		when('/admin/post', {
			templateUrl: '../template/blog-post.html',
			controller: 'BlogPostCtrl',
			resolve: {
          		permission: function (AuthService) {
            		return AuthService.permissionCheck();
            	}
          	},
		}).
		otherwise({
			redirectTo: '/'
		});
});