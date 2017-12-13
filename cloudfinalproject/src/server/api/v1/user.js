"use strict";

let Joi             = require('joi'),
    https           = require('https'),
    dotenv          = require('dotenv').config();

const validatePassword = password => {
    // Validate password more
    if (!password.match(/[0-9]/i)) {
        return { error: '"password" must contain at least one numeric character' };
    }
    else if (!password.match(/[a-z]/)) {
        return { error: '"password" must contain at least one lowercase character' };
    }
    else if (!password.match(/\@|\!|\#|\$|\%|\^/i)) {
        return { error: '"password" must contain at least one of: @, !, #, $, % or ^' };
    }
    else if (!password.match(/[A-Z]/)) {
        return { error: '"password" must contain at least one uppercase character' };
    }
};

module.exports = (app) => {

    /*
     * Create a new user
     *
     * @param {req.body.username} Display name of the new user
     * @param {req.body.first_name} First name of the user - optional
     * @param {req.body.last_name} Last name of the user - optional
     * @param {req.body.city} City user lives in - optional
     * @param {req.body.primary_email} Email address of the user
     * @param {req.body.password} Password for the user
     * @return {201, {username,primary_email}} Return username and others
     */
    app.post('/v1/user', function(req, res) {
        // Schema for user info validation
        let schema = Joi.object().keys({
            username:       Joi.string().lowercase().alphanum().min(3).max(32).required(),
            primary_email:  Joi.string().lowercase().email().required(),
            first_name:     Joi.string().allow(''),
            last_name:      Joi.string().allow(''),
            city:           Joi.string().default(''),
            password:       Joi.string().min(8).required()
        });
        // Validate user input
        Joi.validate(req.body, schema, { stripUnknown: true }, (err, data) => {
            if (err) {
                const message = err.details[0].message;
                res.status(400).send({ error: message });
            } else {
                // Deeper password validation
                const pwdErr = validatePassword(data.password);
                if (pwdErr) {
                    console.log(`User.create password validation failure: ${pwdErr.error}`);
                    res.status(400).send(pwdErr);
                    return;
                }
                // Try to create the user
                let user = new app.models.User(data);
                user.save().then(
                    () => {
                        // Send the happy response back
                        res.status(201).send({
                            username:       data.username,
                            primary_email:  data.primary_email
                        });
                    }, err => {
                        // Error if username is already in use
                        if (err.code === 11000) {
                            if (err.message.indexOf('username_1') !== -1)
                                res.status(400).send({error: 'username already in use'});
                            if (err.message.indexOf('primary_email_1') !== -1)
                                res.status(400).send({error: 'email address already in use'});
                        }
                        // Something else in the username failed
                        else res.status(400).send({error: 'invalid username'});

                    }
                );
            }
        });
    });

    /*
     * See if user exists
     *
     * @param {req.params.username} Username of the user to query for
     * @return {200 || 404}
     */
    app.head('/v1/user/:username', (req, res) => {
        app.models.User.findOne({ username: req.params.username.toLowerCase() })
            .then(
                user => {
                    if (!user) res.status(404).send({ error: `unknown user: ${req.params.username}` });
                    else res.status(200).end();
                }, err => {
                    console.log(err);
                    res.status(500).send({ error: 'server error' });
                }
            );
    });

    /*
     * Fetch user information
     *
     * @param {req.params.username} Username of the user to query for
     * @return {200, {username, primary_email, first_name, last_name, city, games[...]}}
     */
    app.get('/v1/user/:username', (req, res) => {
        app.models.User.findOne({ username: req.params.username.toLowerCase() })
            .exec()
            .then(
                user => {
                    if (!user) res.status(404).send({ error: `unknown user: ${req.params.username}` });
                    else {
                        res.status(200).send({
                            username:       user.username,
                            primary_email:  user.primary_email,
                            first_name:     user.first_name,
                            last_name:      user.last_name,
                            city:           user.city,
                            recomMovies:    user.recomMovies
                        });
                    }
                }, err => {
                    console.log(err);
                    res.status(500).send({ error: 'server error' });
                }
            );
    });

   /*
     * Update a user's profile information
     *
     * @param {req.body.first_name} First name of the user - optional
     * @param {req.body.last_name} Last name of the user - optional
     * @param {req.body.city} City user lives in - optional
     * @return {204, no body content} Return status only
     */
    app.put('/v1/user', (req, res) => {
        if (!req.session.user) {
            res.status(401).send({ error: 'unauthorized' });
        } else {
            let schema = Joi.object().keys({
                first_name: Joi.string().allow(''),
                last_name: Joi.string().allow(''),
                city: Joi.string().allow(''),
            });
            Joi.validate(req.body, schema, {stripUnknown: true}, (err, data) => {
                if (err) {
                    const message = err.details[0].message;
                    console.log(`User.update validation failure: ${message}`);
                    res.status(400).send({error: message});
                } else {
                    const query = { username: req.session.user.username };
                    app.models.User.findOneAndUpdate(query, {$set: data}, {new: true})
                        .then(
                            user => {
                                req.session.user = user;
                                res.status(204).end();
                            }, err => {
                                console.log(`User.update logged-in user not found: ${req.session.user.id}`);
                                res.status(500).end();
                            }
                        );
                }
            });
        }
    });

    //I'd imagine when we create a new movielist, we compute all this stuff
    //function that computes average runtime
    //function that computes average rating
    //function that returns the most frequently occuring genre
    //function that returns the most frequently actor (and another for director maybe)
    //this is the put request that will generate the new movielist
    app.put('/v1/user/:username/movie/recommend', (req, res) => {
        //get data from client
        let movies = req.body.movies;
        //compute average runtime
        let countMovies = 0;
        let sumRuntime = 0;
        let sumRatings = 0;
        //genresFound is an array of json. the json corresponds to {id: , count}
        let genresFound = [];
        //actorsFound is an array of json. the json corresponds to {id, count}
        let actorsFound = [];
        let maxGenre = {genre: "", count: 0};
        let maxActor = {name: "", count: 0};
        movies.forEach(movie => {
            countMovies = countMovies + 1;
            sumRuntime = sumRuntime + movie.runtime;
            sumRatings = sumRatings + movie.vote_average;
            movie.genres.forEach(genre => {
                if (genresFound.length === 0) {
                    genresFound.push({id: genre.id, count: 1});
                    maxGenre.genre = genre.name;
                    maxGenre.count = 1;
                }
                else {
                    genresFound.forEach(g => {
                        if (genre.id === g.id) {
                            //found a genre again so update count
                            g.count = g.count + 1;
                            //if found a new max
                            if (g.count > maxGenre.count) {
                                maxGenre.genre = genre.name;
                                maxGenre.count = g.count;
                            }
                        }
                        else {
                            //new genre so insert into array
                            genresFound.push({id: genre.id, count: 1});
                        }
                    })
                }

            });
            let cast = movie.credits.cast;
            for (let i = 0; i < 3; i++) {
                if (actorsFound.length === 0) {
                    actorsFound.push({id: cast[0].id, count: 1})
                }
                else {
                    actorsFound.forEach(a => {
                        if (movie.credits.cast[i].id === a.id) {
                            a.count = a.count + 1;
                            if (a.count > maxActor.count) {
                                maxActor.name = cast[i].name;
                                maxActor.count = a.count;
                            }
                        }
                        else {
                            actorsFound.push({id: cast[i].id, count: 1})
                        }
                    });
                }

            }

        });
        let avgRuntime = sumRuntime / countMovies;
        let avgRate = sumRatings / countMovies;
        //maxGenre should have the most frequently occuring genre
        //maxActor should have most frequent actor

        //how to know which user. parameter? body?
        let query= {username: req.params.username};
        let r={recommendedMovies: [], favGenre: maxGenre.genre, AvgRuntime: avgRuntime, favActor: maxActor.name, averageRating: avgRate};
        app.models.User.findOneAndUpdate(query, { $set: {recomMovies: r}, $push: {movies: {$each: m}}})
        //send some kind of status
    })

};
