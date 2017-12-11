/* Copyright G. Hemingway @2017 - All rights reserved */
"use strict";

let mongoose            = require('mongoose'),
    Schema              = mongoose.Schema;

/***************** Movie Model *******************/

/* Schema for individual movie */
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
})

/* Schema for overall list */
let MovieList = new Schema({
    recommendedMovies:  {   type: [Movie], required: true },
    favGenre:           {   type: String                },
    AvgRuntime:         {   type: Number                },
    favActor:           {   type: String                },
    favDirector:        {   type: String                },
    averageRating:      {   type: Number                }
});



MovieList.pre('validate', function(next) {
    next();
});

/***************** Registration *******************/

module.exports = mongoose.model('MovieList', MovieList);
