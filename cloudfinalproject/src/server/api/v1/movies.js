let    https           = require('https'),
       dotenv          = require('dotenv').config(),
       request         = require('request'),
       api_key         = process.env.API_KEY;

module.exports = (app) => {

    app.get('/v1/movie', function(req,res){
        console.log(JSON.stringify(req.body))
        let url='https://api.themoviedb.org/4/movie/search?api_key='+api_key+"&query="+req.body.title;

        console.log(url)
        request.get({
            url:url

        },
        (err,res,body)=>{
            console.log(JSON.stringify(err)+"\n"+JSON.stringify(res)+"\n"+JSON.stringify(body));

        }
        );
    });


};

