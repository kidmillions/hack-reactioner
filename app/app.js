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
	.factory('Vote', ['$http', function($http) {
		return {
			postVote: function(vote, question) {
				return $http({
					method: 'POST',
					url: '/api/question/' + question.topic + '/vote/',
					data: vote
				}).then(function(resp) {
					return resp;
				});
			},
			getVotes: function(question) {
				return $http({
     			 	method: 'GET',
      				url: '/api/question/' + question.topic + '/vote/',
    			})
    			.then(function(resp) {
      				return resp.data;
    			});
			}
		};
	}])


	.controller('voteCtrl', ['$scope', 'Socket', 'Vote', 'Question', function($scope, Socket, Vote, Question) {
		$scope.messages = [];

		//TODO: get votes so far, structured as below
		$scope.totalVote = {expectations: [0, 0],
							usefulness: [0, 0],
							experience: [0, 0],
							whatever: 0};

		$scope.getVotes = function(question, callback) {
			Vote.getVotes(question)
				.then(function(votes) {	
					$scope.totalVote = votes;
					callback();
				});
		};

		$scope.getLastQuestion = function(callback) {
			Question.getQuestions()
				.then(function(questions) {	
					$scope.currentQuestion = questions[questions.length - 1];
					callback($scope.currentQuestion);
				});
		};

		$scope.getLastQuestion(function(question) {		
				$scope.getVotes(question, function() {
					$scope.$emit('voteChange', $scope.totalVote);
				});
		});

		
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
			$scope.submitted = false;
			$scope.totalVote = {expectations: [0, 0],
							usefulness: [0, 0],
							experience: [0, 0],
							whatever: 0};
			$scope.$emit('voteChange', $scope.totalVote);
		});

		$scope.submitVote = function() {
			var vote = {
				expectations: [$scope.expectationup || 0, $scope.expectationdown || 0],
				usefulness: [$scope.usefulnessup || 0, $scope.usefulnessdown || 0],
				experience: [$scope.experienceup || 0, $scope.experiencedown || 0],
				whatever: $scope.whatever || 0
			};

			Vote.postVote(vote, $scope.currentQuestion);
			Socket.emit('send:vote', vote);
			Socket.emit('send:message', $scope.message);
			$scope.addVote(vote);
			$scope.messages.push($scope.message);
			$scope.submitted = true;
			$scope.$emit('voteChange', $scope.totalVote);
			//do not allow revote until new question
		};

		Socket.on('send:vote', function (vote) {
			console.log('received vote');
    		$scope.addVote(vote);
  		});

  		Socket.on('send:message', function(message) {
  			$scope.messages.push(message);
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
							fillColor: "rgba(69, 173, 63,0.5)",
				            strokeColor: "rgba(69, 173, 63,1)",
				            pointColor: "rgba(69, 173, 63,1)",
				            pointStrokeColor: "#fff",
				            pointHighlightFill: "#fff",
				            pointHighlightStroke: "rgba(69, 173, 63,1)",
				            data: [scope.totalVote.expectations[0], scope.totalVote.usefulness[0], scope.totalVote.experience[0], scope.totalVote.whatever]
						}, 
						{
           					label: "Negative",
            				fillColor: "rgba(162, 19, 28,0.5)",
            				strokeColor: "rgba(162, 19, 28,1)",
            				pointColor: "rgba(162, 19, 28,1)",
            				pointStrokeColor: "#E4DDDD",
            				pointHighlightFill: "#E4DDDD",
            				pointHighlightStroke: "rgba(162, 19, 28,1)",
				            data: [scope.totalVote.expectations[1], scope.totalVote.usefulness[1], scope.totalVote.experience[1]]
        				}
					]
				};
				var voteChart = new Chart(ctx).Radar(data, {
					pointLabelFontSize: 22,
					pointLabelFontFamily: 'Arial',
					pointLabelFontColor : "#E4DDDD",
					angleLineColor : "rgba(0,0,0,.7)"
				});

				var updateChart = function() {
					voteChart.datasets[0].points[0].value = scope.totalVote.expectations[0];
					voteChart.datasets[0].points[1].value = scope.totalVote.usefulness[0];
					voteChart.datasets[0].points[2].value = scope.totalVote.experience[0];
					voteChart.datasets[0].points[3].value = scope.totalVote.whatever;
					voteChart.datasets[1].points[0].value = scope.totalVote.expectations[1];
					voteChart.datasets[1].points[1].value = scope.totalVote.usefulness[1];
					voteChart.datasets[1].points[2].value = scope.totalVote.experience[1];
					voteChart.update();
				};

				Socket.on('send:vote', updateChart);
				scope.$on('voteChange', updateChart);
			}
		};
	});