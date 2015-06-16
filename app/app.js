angular.module('hackReactioner', ['ngRoute'])
	.config(function($routeProvider) {
  		$routeProvider
    		.when('/index', {
      			templateUrl: 'app/auth/index.html',
      			controller: 'questionCtrl'
    })
    .otherwise({
      redirectTo: '/index'
    });

	})
	.factory('Question', ['$http', function($http) {
		return {
			getQuestions: function() {
				return $http({
     			 	method: 'GET',
      				url: '/api/question',
    			})
    			.then(function(resp) {
    				console.log(resp.data);
      				return resp.data;
    			});
			},
			postQuestion: function(question) {
				return $http({
					method: 'POST',
					url: '/api/question',
					data: question
				}).then(function(resp) {
					return console.log('posted new question: ', resp);
				});
			}
		};
	}])
	.controller('questionCtrl', ['$scope', 'Question', function($scope, Question) {
		$scope.data = {};
		$scope.question = {};


		$scope.getQuestions = function() {
			Question.getQuestions()
				.then(function(questions) {	
					$scope.data = questions;
				});
		};
  
  		$scope.getQuestions();


		$scope.postQuestion = function(question) {

			Question.postQuestion(question);
			$scope.question = {};
			$scope.getQuestions();
		};


	}])
	.directive('chartData', function() {
		return {
			restrict: 'E',
			scope: {
				data: '='
			},
			templateUrl: 'partials/chartdata.html',
		};
	})