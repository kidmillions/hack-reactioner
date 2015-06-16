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
						UsefulnessUp: 0,
						ExpectationsUp: 0,
						ExperienceUp: 0,
						UsefulnessDown: 0,
						ExpectationsDown: 0,
						ExperienceDown: 0,
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
			});
	},
	findQuestion: function (req, res, next, topic) {
	  var findQuestion = Q.nbind(Question.findOne, Question);
	  findQuestion({topic: topic})
	    .then(function (question) {
	      if (question) {
	        req.question = question;
	        next();
	      } else {
	        next(new Error('Question not found'));
	      }
	    })
	    .fail(function (error) {
	      next(error);
	    });
	},
	addVote: function(req, res, next) {
		var question = req.question;
		question.votes.ExpectationsUp += req.body.expectations[0];
		question.votes.ExpectationsDown += req.body.expectations[1];
		question.votes.ExperienceUp += req.body.experience[0];
		question.votes.ExperienceDown += req.body.experience[1];
		question.votes.UsefulnessUp += req.body.usefulness[0];
		question.votes.UsefulnessDown += req.body.usefulness[1];
		question.votes.Whatever += req.body.whatever;
		question.save(function (err, savedQuestion) {
      		if (err) {
        		next(err);
      	} else {
        	res.send(savedQuestion);
      	}
    	});
	},
	allVotes: function(req, res, next) {
		var question = req.question;
		var votes = {
			expectations: [question.votes.ExpectationsUp, question.votes.ExpectationsDown],
			experience: [question.votes.ExperienceUp, question.votes.ExperienceDown],
			usefulness: [question.votes.UsefulnessUp, question.votes.UsefulnessDown],
			whatever: question.votes.Whatever
		}
		res.json(votes);
	}

};
