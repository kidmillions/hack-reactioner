var mongoose = require('mongoose');


var QuestionSchema = new mongoose.Schema({
	topic: String,
	sprintName: String,
	votes: {
		UsefulnessUp: Number,
		ExpectationsUp: Number,
		ExperienceUp: Number,
		UsefulnessDown: Number,
		ExpectationsDown: Number,
		ExperienceDown: Number,
		Whatever: Number
	}
});


module.exports = mongoose.model('Question', QuestionSchema);
