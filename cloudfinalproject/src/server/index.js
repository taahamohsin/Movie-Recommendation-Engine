'use strict';

let path            = require('path'),
    express         = require('express'),
    bodyParser      = require('body-parser'),
    logger          = require('morgan'),
    redis           = require('redis'),
    session         = require('express-session'),
    mongoose        = require('mongoose'),
    dotenv          = require('dotenv'),
    RedisStore      = require('connect-redis')(session);

mongoose.Promise = global.Promise;
let port = process.env.PORT ? process.env.PORT : 8080;
let env = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';
let client=redis.createClient('6379', '18.218.10.212');
/**********************************************************************************************************/
client.on('ready',() => {
    console.log('\tRedis Connected.');
}).on('error', (err) => {
    console.log('Not able to connect to Redis.');
    process.exit(-1);
});
// Setup our Express pipeline
let app = express();
app.use(express.static(path.join(__dirname, '../../public')));
if (env !== 'test') app.use(logger('dev'));
app.engine('pug', require('pug').__express);
app.set('views', __dirname);
// Setup pipeline session support
const redisOptions = {
    host: '18.218.10.212',
    port: '6379'
};
app.use(session({
    name: 'session',
    store: new RedisStore(redisOptions),
    secret: 'ohhellyes',
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: '/',
        httpOnly: false,
        secure: false
    }
}));
// Finish pipeline setup
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, parameterLimit: 1000000 , limit: '50mb'}));
dotenv.config();
// Connect to mongoBD
let options = {
    useMongoClient: true
};

mongoose.connect("mongodb://13.58.73.141:27017/cloud", options)
    .then(() => {
        // Import our Data Models
        app.models = {
            MovieList: require('./models/movielist'),
            User: require('./models/user')
        };

        // Import our API Routes
        require('./api/v1/user')(app),
        require('./api/v1/session')(app)
        require('./api/v1/movies')(app)
        //TODO: add api routes for movielist

        // Give them the SPA base page
        app.get('*', (req, res) => {
            let preloadedState = req.session.user ? {
                    username: req.session.user.username,
                    primary_email: req.session.user.primary_email
                } : {};
            preloadedState = JSON.stringify(preloadedState).replace(/</g, '\\u003c');
            res.render('base.pug', {
                state: preloadedState
            });
        });
    }, err => {
        // console.log(err);
    });

    // let client=redis.createClient('6379','127.0.0.1');
    // client.on('ready',() => {
    //     console.log("\tRedis Connected.");
    //     callback();
    // }).on('error', (err) => {
    //     console.log("Not able to connect to Redis.");
    //     console.log(err);
    //     process.exit(-1);
    // });
/**********************************************************************************************************/

// Run the server itself
let server = app.listen(port, () => {
    console.log('Cloud final project app listening on ' + server.address().port);
});
