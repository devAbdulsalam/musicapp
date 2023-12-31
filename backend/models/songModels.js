const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	songLink: {
		public_url: {
			type: String,
		},
		url: {
			type: String,
		},
	},
	likes: {
		type: Number,
		required: true,
	},
	artist: [
		{
			name: {
				type: String,
				required: true,
			},
			id: {
				type: mongoose.Schema.ObjectId,
				type: String,
				required: true,
			},
			avatar: {
				type: String,
				required: true,
			},
		},
	],

	language: {
		type: String,
		required: true,
	},
	coverPoster: {
		public_id: {
			type: String,
		},
		url: {
			type: String,
		},
	},
	uploaded: {
		type: Date,
		required: true,
	},
});

module.exports = mongoose.model('Song', songSchema);
