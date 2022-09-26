const { Schema, model } = require('mongoose');
const SALT_WORK_FACTOR = 10;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
	name: {
		type: String,
		//required: true
	},
	email: {
		type: String,
		required: true
	},
	username: {
		type: String,
		//required: true
	},
	password: {
		type: String,
		required: true
	},
	picture: {
		type: String,
		required: true
	},
	blocked: {
		required: true,
		type: Boolean,
		default: false
	},
	formations: [{
		name : {
			type: String,
		},
		institution: {
			type: String,
		},
		start: {
			type: Date,
		},
		finish: {
			type: Date,
		},
		description: {
			type: String,
		},
	}],
	experiences: [{
		role: {
			type: String,
		},
		company: {
			type: String,
		},
		start: {
			type: Date,
		},
		finish: {
			type: Date,
		},
		description: {
			type: String,
		},
	}],
},
{ timestamps: true }
);

UserSchema.pre('save', async function (next) {
	var user = this;

	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();
	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) return next(err);
        
		// hash the password using our new salt
		bcrypt.hash(user.password, salt, function(err, hash) {
			if (err) return next(err);
			// override the cleartext password with the hashed one
			user.password = hash;
			next();
		});
	});
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if (err) return cb(err);
		cb(null, isMatch);
	});
};

module.exports = model('User', UserSchema, 'users');
