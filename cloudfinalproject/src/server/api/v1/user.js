/* Copyright G. Hemingway @2017 - All rights reserved */
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

            app.post('/v1/user/github', function(req, res) {
       
                let data={
                    "username":req.body.username,
                    "first_name":req.body.first_name,
                    "last_name":req.body.last_name,
                    "city":req.body.location,
                    "primary_email":req.body.primary_email,
                    "password":req.body.access_token
                }
                // Try to create the user
                let user = new app.models.User(data);
                console.log(JSON.stringify(user));
                user.save().then(
                    () => {
                        req.session.access_token=req.body.access_token;
                        res.status(201).send({
                            username:       data.username,
                            primary_email:  data.primary_email
                        });
                    }, err => {
                        console.log("IN THE SAD");
                        console.log(JSON.stringify(err));

                        // Error if username is already in use
                        if (err.code === 11000) {
                            if (err.message.indexOf('username_1') !== -1)
                                res.status(400).send({error: 'username already in use'});
                            if (err.message.indexOf('primary_email_1') !== -1)
                                res.status(400).send({error: 'email address already in use'});
                        }
                        // Something else in the username failed
                        else{
                            console.log("Something else failed");
                            console.log(JSON.stringify(err))
                            res.status(400).send({error: 'invalid username'});}
                    }
                );
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
            .populate('games')
            .exec()
            .then(
                user => {
                    if (!user) res.status(404).send({ error: `unknown user: ${req.params.username}` });
                    else {
                        // Filter games data for only profile related info
                        const filteredGames = user.games.map(game => Solitare.filterForProfile(game));
                        res.status(200).send({
                            username:       user.username,
                            primary_email:  user.primary_email,
                            first_name:     user.first_name,
                            last_name:      user.last_name,
                            city:           user.city,
                            games:          filteredGames
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

    app.post('/v1/auth', (req,res)=>{
        let code=req.body.code;
        console.log('CODE '+code);
        let client_id=process.env.CLIENT_ID;
        let client_secret=process.env.CLIENT_SECRET;
        let queryURL='/login/oauth/access_token?code='+code+"&client_id="+client_id+"&client_secret="+client_secret;
        console.log('PATH IS '+queryURL);
        const options = {
            hostname: 'github.com',
            port: 443,
            path: queryURL,
            method: 'POST'
        };

        const request = https.request(options, (response) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);

        response.on('data', (d) => {
            console.log('token '+d);
            return res.status(200).send(d);
        });    
     });

        request.on('error', (e) => {
            console.log(e);
            return res.status(404).send({error:e.toString()})
        });

        request.end();  
    });

    //     app.post('/v1/user/github', function(req, res) {
    //     // Schema for user info validation
    //     // let schema = Joi.object().keys({
    //     //     username:       Joi.string().lowercase().alphanum().min(3).max(32).required(),
    //     //     primary_email:  Joi.string().lowercase().email().required(),
    //     //     first_name:     Joi.string().allow(''),
    //     //     last_name:      Joi.string().allow(''),
    //     //     city:           Joi.string().default(''),
    //     //     password:       Joi.string().min(8).required()
    //     // });
    //     // Validate user input
           
    //             // Try to create the user
    //             let user = new app.models.User(data);
    //             user.save().then(
    //                 () => {
    //                     // Send the happy response back
    //                     res.status(201).send({
    //                         username:       data.username,
    //                         primary_email:  data.primary_email
    //                     });
    //                 }, err => {
    //                     // Error if username is already in use
    //                     if (err.code === 11000) {
    //                         if (err.message.indexOf('username_1') !== -1)
    //                             res.status(400).send({error: 'username already in use'});
    //                         if (err.message.indexOf('primary_email_1') !== -1)
    //                             res.status(400).send({error: 'email address already in use'});
    //                     }
    //                     // Something else in the username failed
    //                     else res.status(400).send({error: 'invalid username'});

    //                 }
    //             );
    //         }

    // });




};
