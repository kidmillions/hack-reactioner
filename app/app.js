angular.module('hackReactioner', ['ngRoute'])
	.config(function($routeProvider) {
  		$routeProvider
    		.when('/index', {
      			templateUrl: '/templates/vote.html',
      			controller: 'voteCtrl'
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
	.controller('voteCtrl', ['$scope', 'Socket', function($scope, Socket) {

		$scope.currentQuestion;
		$scope.totalVote = {expectations: [0, 0],
							usefulness: [0, 0],
							experience: [0, 0],
							whatever: 0};

		
		$scope.addVote = function(vote) {
			$scope.totalVote.expectations[0] += vote.expectations[0];
			$scope.totalVote.expectations[1] += vote.expectations[1];
			$scope.totalVote.experience[0] += vote.experience[0];
			$scope.totalVote.experience[1] += vote.experience[1];
			$scope.totalVote.usefulness[0] += vote.usefulness[0];
			$scope.totalVote.usefulness[1] += vote.usefulness[1];
			$scope.totalVote.whatever += vote.whatever;
		};


		
		Socket.on('send:question', function(question) {
			console.log('new question arrived');
			$scope.currentQuestion = question;
		})


		$scope.submitVote = function() {
			var vote = {
				expectations: [$scope.expectationup || 0, $scope.expectationdown || 0],
				usefulness: [$scope.usefulnessup || 0, $scope.usefulnessdown || 0],
				experience: [$scope.experienceup || 0, $scope.experiencedown || 0],
				whatever: $scope.whatever || 0
			};

			//needs to also post to database

			Socket.emit('send:vote', vote);
			$scope.addVote(vote);
		};

		Socket.on('send:vote', function (vote) {
    		$scope.addVote(vote);
  		});
	}])
	.controller('questionCtrl', ['$scope', 'Question', 'Socket', function($scope, Question, Socket) {
		$scope.data = [];

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
	}])
	.directive('chartData', function(Socket) {
		return {
			restrict: 'E',
			scope: false,
			templateUrl: 'partials/chartdata.html',
			link: function(scope, element, attrs) {
				

				var ctx = document.getElementById("voteChart").getContext("2d");
				var data = {
					labels: ['Expectations', 'Usefulness', 'Experience', 'Whatever'],
					datasets: [
						{
							label: 'Positive',
							fillColor: "rgba(220,220,220,0.2)",
				            strokeColor: "rgba(220,220,220,1)",
				            pointColor: "rgba(220,220,220,1)",
				            pointStrokeColor: "#fff",
				            pointHighlightFill: "#fff",
				            pointHighlightStroke: "rgba(220,220,220,1)",
				            data: [scope.totalVote.expectations[0], scope.totalVote.usefulness[0], scope.totalVote.experience[0], scope.totalVote.whatever]
						}, 
						{
           					label: "Negative",
            				fillColor: "rgba(151,187,205,0.2)",
            				strokeColor: "rgba(151,187,205,1)",
            				pointColor: "rgba(151,187,205,1)",
            				pointStrokeColor: "#fff",
            				pointHighlightFill: "#fff",
            				pointHighlightStroke: "rgba(151,187,205,1)",
				            data: [scope.totalVote.expectations[1], scope.totalVote.usefulness[1], scope.totalVote.experience[1]]
        				}
					]
				};
				var voteChart = new Chart(ctx).Radar(data);

				Socket.on('send:vote', function(v) {	
					voteChart.datasets[0].points[0].value = scope.totalVote.expectations[0];
					voteChart.datasets[0].points[1].value = scope.totalVote.usefulness[0];
					voteChart.datasets[0].points[2].value = scope.totalVote.experience[0];
					voteChart.datasets[0].points[3].value = scope.totalVote.whatever;
					voteChart.datasets[1].points[0].value = scope.totalVote.expectations[1];
					voteChart.datasets[1].points[1].value = scope.totalVote.usefulness[1];
					voteChart.datasets[1].points[2].value = scope.totalVote.experience[1];
					voteChart.update();
				});
				
			}
		};
	});