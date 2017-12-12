let    https           = require('https'),
       dotenv          = require('dotenv').config(),
       axios           = require('axios'),
       api_key         = "2da9192ee0949a9d883335aa3b52c6df"

module.exports = (app) => {

    app.get('/v1/movie/:title', function(req,res){
        let secondURL;
        // console.log(JSON.stringify(req.params))
        let prefix='https://api.themoviedb.org/3/'
        let url=prefix+'search/movie/?api_key='+api_key+"&query="+req.params.title;
        axios.get(url).then(function(res){
            secondURL=prefix+'movie/'+res.data.results[0].id+"?api_key="+api_key;
            console.log(secondURL)
        }
        ).then(()=>{
            axios.get(secondURL).then(
                function(res){
                    console.log(res.data.adult)
                }
            )
        })

        
});
        
        
       
    


};

