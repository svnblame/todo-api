var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
	var user = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		salt: {
			type: DataTypes.STRING
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7, 100]
			},
			set: function(value) {
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}
		}
	}, {
		hooks: {
			beforeValidate: function(user, options) {
				// convert user.email to lowercase if it is a string
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		},
		classMethods: {
			authenticate: function(body) {
				return new Promise(function(resolve, reject) {
					if (typeof body.email !== 'string' || typeof body.password !== 'string') {
						return reject();
					}

					user.findOne({
						where: {
							email: body.email
						}
					}).then(function(user) {
						if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
							return reject();
						}
						// All went well, resolve with the user object
						resolve(user);
					}, function(e) {
						reject();
					});
				});
			},
			findByToken: function(token) {
				return new Promise(function(resolve, reject) {
					try {
						// verify token has not been modified and is valid
						var decodedJWT = jwt.verify(token, 'qwerty098');
						// decrypt the data
						var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123!@#*');
						var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

						user.findById(tokenData.id).then(function(user) {
							if (user) {
								resolve(user);
							} else {
								// user.id does not exist
								reject();
							}
						}, function(e) {
							// findById() failed: possible database error
							reject();
						});
					} catch (e) {
						// try failed: token not in valid format
						reject();
					}
				});
			}
		},
		instanceMethods: {
			toPublicJSON: function() {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'updatedAt', 'createdAt');
			},
			generateToken: function(type) {
				// Return encrypted user information inside of a secret token

				if (!_.isString(type)) {
					return undefined;
				}

				try {
					// get user's data for a given id ...
					var stringData = JSON.stringify({
						id: this.get('id'),
						type: type
					});
					// ... and encrypt it
					var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#*').toString();
					// sign the token
					var token = jwt.sign({
						token: encryptedData
					}, 'qwerty098');

					return token;
				} catch (e) {
					return undefined;
				}
			}
		}
	});
	return user;
};