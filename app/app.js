angular.module('hackReactioner', ['ngRoute'])
	.config(function($routeProvider) {
  		$routeProvider
    		.when('/index', {
      			templateUrl: '/templates/question.html',
      			controller: 'questionCtrl'
    		})
    		.when('/all', {
    			templateUrl: '/templates/allQuestions.html', 
    			controller: 'questionCtrl'
    		})
    		.when('/admin', {
    			templateUrl: '/templates/admin.html',
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
					return resp;
				});
			}
		};
	}])
	.factory('Socket', function ($rootScope) {
  		var socket = io.connect();
  		return {
    		on: function (eventName, callback) {
      			socket.on(eventName, function () {  
        			var args = arguments;
        			$rootScope.$apply(function () {
          				callback.apply(socket, args);
        			});
      			});
    		},
    		emit: function (eventName, data, callback) {
      			socket.emit(eventName, data, function () {
        			var args = arguments;
        			$rootScope.$apply(function () {
          				if (callback) {
            				callback.apply(socket, args);
          				}
        			});
      			});
    		}
  		};
	})
	.controller('questionCtrl', ['$scope', 'Question', 'Socket', function($scope, Question, Socket) {
		$scope.data = [];
		$scope.votes = [];
		$scope.question = {};
		// $scope.currentQuestion = $scope.data[$scope.data.length - 1];


		$scope.getQuestions = function() {
			Question.getQuestions()
				.then(function(questions) {	
					$scope.data = questions;
				});
		};
  
  		$scope.getQuestions();


		$scope.postQuestion = function(question) {
			Question.postQuestion(question);
			Socket.emit('send:question', question);
			$scope.question = {};
			$scope.getQuestions();
		};

		Socket.on('send:question', function(question) {
			console.log('new question arrived');
			$scope.currentQuestion = question;
		})


		$scope.submitVote = function() {
			var vote = {
				Expectations: [$scope.expectationup || 0, $scope.expectationdown || 0],
				Usefulness: [$scope.usefulnessup || 0, $scope.usefulnessdown || 0],
				Experience: [$scope.experienceup || 0, $scope.experiencedown || 0],
				Whatever: $scope.whatever || 0
			};

			//needs to also post to database

			Socket.emit('send:vote', vote);
			console.log(vote);
			return vote;
		};

		Socket.on('send:vote', function (vote) {
			console.log('heard it');
    		$scope.votes.push(vote);
  		});

	}])
	.directive('chartData', function() {
		return {
			restrict: 'E',
			scope: {
				data: '='
			},
			templateUrl: 'partials/chartdata.html',
		};
	});