var Question = require('./questionModel.js');
var Q = require('q');

module.exports = {
	allQuestions: function(req, res, next) {
		var findAll = Q.nbind(Question.find, Question);

		findAll({})
			.then(function(questions) {
				console.log('lookin');
				console.log(questions);
				res.json(questions);
			})
			.fail(function(error) {
				next(error);
			});
	},
	newQuestion: function(req, res, next) {
		console.log('called');
		console.log(req.body);
		var topic = req.body.topic;
		var sprintName = req.body.sprintName;

		var createQuestion = Q.nbind(Question.create, Question);
		var findQuestion = Q.nbind(Question.findOne, Question);

		findQuestion({topic: topic, sprintName: sprintName})
			.then(function(match) {

				if (match) {
					res.send(match);
				} else {
					return;
				}
			}).then(function() {
				var newQuestion = {
					topic: topic,
					sprintName: sprintName,
					votes: {
						Usefulness: [0, 0],
						Expectations: [0, 0],
						Experience: [0, 0],
						Whatever: 0
					}
				}
				return createQuestion(newQuestion);
			})
			.then(function(createdQuestion) {
				if (createdQuestion) {
					res.json(createdQuestion);
				}
			})
			.fail(function(error) {
				next(error);
			})
	}

};
