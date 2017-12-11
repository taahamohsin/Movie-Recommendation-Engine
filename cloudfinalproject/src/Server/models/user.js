/**
 * Created by Edwin on 12/10/2017.
 */
let crypto              = require('crypto'),
    mongoose            = require('mongoose'),
    Schema              = mongoose.Schema;

const makeSalt = () => (
    Math.round((new Date().valueOf() * Math.random())) + ''
);

const encryptPassword = (salt, password) => (
    crypto.createHmac('sha512', salt).update(password).digest('hex')
);

const reservedNames = ['password'];

let User = new Schema({
    'username':     { type: String, required: true, index: { unique: true } },
    'primary_email':{ type: String, required: true, index: { unique: true } },
    'first_name':   { type: String, default: '' },
    'last_name':    { type: String, default: '' },
    'city':         { type: String, default: '' },
    'hash':         { type: String, required: true },
    'salt':         { type: String, required: true },
    'profile':      { type: Schema.Types.ObjectId, ref: 'MoveList' }
});
User.path('primary_email').validate(function(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}, 'malformed address');
User.virtual('password').set(function(password) {
    this.salt = makeSalt();
    this.hash = encryptPassword(this.salt, password);
});
User.method('authenticate', function(plainText) {
    return encryptPassword(this.salt, plainText) === this.hash;
});
User.pre('save', function(next) {
    // Sanitize strings
    this.username       = this.username.toLowerCase();
    this.primary_email  = this.primary_email.toLowerCase();
    this.first_name     = this.first_name.replace(/<(?:.|\n)*?>/gm, '');
    this.last_name      = this.last_name.replace(/<(?:.|\n)*?>/gm, '');
    this.city           = this.city.replace(/<(?:.|\n)*?>/gm, '');
    next();
});
module.exports = mongoose.model('User', User);