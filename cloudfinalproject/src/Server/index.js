let path            = require('path'),
    express         = require('express'),
    bodyParser      = require('body-parser'),
    logger          = require('morgan'),
    session         = require('express-session'),
    mongoose        = require('mongoose');

mongoose.Promise = global.Promise;
let port = process.env.PORT ? process.env.PORT : 8080;
let env = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';
let app = express();
// app.use(express.static(path.join(__dirname, '../../public')));
if (env !== 'test') app.use(logger('dev'));
app.engine('pug', require('pug').__express);
app.set('views', __dirname);
// Setup pipeline session support
app.use(session({
    name: 'session',
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to mongoBD
let options = {
    useMongoClient: true
};
mongoose.connect('mongodb://group5:password@ds129946.mlab.com:29946/assignment6', options)
    .then(() => {
        console.log('\t MongoDB connected');

        // Import our Data Models
        app.models = {
            MovieList: require('./models/movielist'),
            User: require('./models/user')
        };

        // Import our API Routes 
        //TODO: add API routes when developed
        // require('./api/v1/game')(app);
        // require('./api/v1/user')(app);
        // require('./api/v1/session')(app);

        // Give them the SPA base page
        // app.get('*', (req, res) => {
        //     let preloadedState = req.session.user ? {
        //         username: req.session.user.username,
        //         primary_email: req.session.user.primary_email
        //     } : {};
        //     preloadedState = JSON.stringify(preloadedState).replace(/</g, '\\u003c');
        //     res.render('base.pug', {
        //         state: preloadedState
        //     });
        // });
    }, err => {
        console.log(err);
    });

let server = app.listen(port, () => {
    console.log('Cloud app listening on ' + server.address().port);
});


