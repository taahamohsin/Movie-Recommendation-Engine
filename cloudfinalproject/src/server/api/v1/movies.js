let    https           = require('https'),
       dotenv          = require('dotenv').config(),
       request         = require('request'),
       api_key         = "2da9192ee0949a9d883335aa3b52c6df"

module.exports = (app) => {

    app.get('/v1/movie/:title', function(req,res){
        let movieID;
        // console.log(JSON.stringify(req.params))
        let prefix='https://api.themoviedb.org/3/'
        let url=prefix+'search/movie/?api_key='+api_key+"&query="+req.params.title;
        request.get({
            url:url
        },
        (err,res,body)=>{
            if(res)console.log(JSON.stringify(res.body.results))
            movieID=res.body;
        }
        ).pipe(
            request.get({
                url:prefix+'movie/'+movieID+"?api_key="+api_key
            },
            (err, res, body)=>{
                // console.log(JSON.stringify(res))
            }
            )
        )
    });


};

