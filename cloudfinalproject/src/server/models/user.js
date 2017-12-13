"use strict";

let crypto              = require('crypto'),
    mongoose            = require('mongoose'),
    Schema              = mongoose.Schema;

/***************** User Model *******************/

let Movie = new Schema({
    Title:      {   type: String, required: true     },
    Year:       {   type: Number    },
    Rated:      {   type: String    },
    Released:   {   type: String    },
    Runtime:    {   type: Number    },
    Genre:      {   type: String    },
    Director:   {   type: String    },
    Actors:     {   type: [String]  },
    Plot:       {   type: String    },
    Language:   {   type: [String]  },
    Country:    {   type: String    },
    Awards:     {   type: String    },
    PosterUrl:  {   type: String    }, // TODO: look into how images are stored as binary data in MongoDB
    Ratings:    {   type: Array     },
    Metascore:  {   type: Number    },
    imdbRating: {   type: Number    },
    imdbVotes:  {   type: Number    },
    imdbID:     {   type: Number    },
    Type:       {   type: String    },
    DVD:        {   type: Date      },
    BoxOffice:  {   type: String    },
    Production: {   type: String    },
    Website:    {   type: String    },
    Response:   {   type: Boolean   }
});

/* Schema for overall list */
let MovieList = new Schema({
    recommendedMovies:  {   type: [Movie], required: true },
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
    'movies':       [{ type: Movie }],
    'recomMovies':  {type: MovieList}
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
