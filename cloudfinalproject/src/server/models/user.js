"use strict";

let crypto              = require('crypto'),
    mongoose            = require('mongoose'),
    Schema              = mongoose.Schema;

/***************** User Model *******************/
let Actor = new Schema({
    id:         { type: Number},
    name:       { type: String}
});
let Genre = new Schema({
    id:         { type: Number},
    name:       { type: String}
});
let Movie = new Schema({
    Title:      {   type: String     },
    Runtime:    {   type: Number      },
    Genres:      {   type: [Genre]    },
    Actors:      {   type: [Actor]    },
    Rating:    {   type: Number    },
    HomePage:   {   type: String  }
});
let RecomMovie=new Schema({
    title:      { type: String},
    score:      { type: Number}
})
/* Schema for overall list */
let MovieList = new Schema({
    recommendedMovies:  {   type: [RecomMovie]              },
    favGenre:           {   type: String                },
    AvgRuntime:         {   type: Number                },
    favActor:           {   type: String                },
    averageRating:      {   type: Number                }
});

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
    'movies':       { type: [Movie], default: [] },
    'recomMovies':  {type: MovieList, default: {recommendedMovies: [], favGenre: "", AvgRunTime: 0, favActor: "", averageRating: 0}}
});

User.path('username').validate(function(value) {
    if (!value) return false;
    if (reservedNames.indexOf(value) !== -1) return false;
    return (value.length > 5 && value.length <= 16 && /^[a-zA-Z0-9]+$/i.test(value));
}, 'invalid username');

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

/***************** Registration *******************/

module.exports = mongoose.model('User', User);
