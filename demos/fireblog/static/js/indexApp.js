var app = angular.module("indexApp", ["firebase"]);

app.factory("allBlogs", ["$firebaseArray",
  function($firebaseArray) {
    var ref = new Firebase("https://github-pages.firebaseio.com/");
    console.log($firebaseArray(ref))
    return $firebaseArray(ref);
  }
]);

app.controller("BlogsCtrl", ["$scope", "allBlogs",
  function($scope, allBlogs) {

    $scope.blogs = allBlogs;
    console.log(allBlogs)
  }
]);