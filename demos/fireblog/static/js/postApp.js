var app = angular.module("postApp", ["firebase"]);


app.controller("BlogCtrl", ["$scope", "$firebaseObject",
  function($scope, $firebaseObject) {
  	var title = ''

    var ref = new Firebase("https://github-pages.firebaseio.com/1");
  	var obj = $firebaseObject(ref);
	obj.$loaded()
	  .then(function(data) {
	    console.log(data); // true

	  		$scope.blog = data;

	  })
	  .catch(function(error) {
	    console.error("Error:", error);
	  });


  }
]);