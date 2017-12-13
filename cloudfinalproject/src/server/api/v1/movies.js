let    https           = require('https'),
       dotenv          = require('dotenv').config(),
       axios           = require('axios'),
       api_key         = "2da9192ee0949a9d883335aa3b52c6df"

module.exports = (app) => {

    app.get('/v1/movie/:title', function (req, res) {
        let secondURL;
        let prefix = 'https://api.themoviedb.org/3/'
        let url = prefix + 'search/movie/?api_key=' + api_key + "&query=" + req.params.title;
        axios.get(url).then(
            function (res) {
                secondURL = prefix + 'movie/' + res.data.results[0].id + "?api_key=" + api_key+"&append_to_response=credits";
            }
        ).then(() => {
            axios.get(secondURL).then(
                function (response) {
                    res.status(200).send({data: response.data});
                }
            )
        })
    });
    let recommend=(movies)=>{
        //compute average runtime
        let countMovies =0.0;
        let sumRuntime = 0;
        let sumRatings = 0;
        //genresFound is an array of json. the json corresponds to {id: , count}
        let genresFound = [];
        //actorsFound is an array of json. the json corresponds to {id, count}
        let actorsFound = [];
        let maxGenre = {genre: "", id: 0, count: 0};
        let maxActor = {name: "", id: 0, count: 0};
        movies.forEach(movie => {
            countMovies = countMovies + 1;
            sumRuntime = sumRuntime + movie.Runtime;
            sumRatings = sumRatings + movie.Rating;
            movie.Genres.forEach(genre => {
                if (genresFound.length === 0) {
                    genresFound.push({id: genre.id, count: 1});
                    maxGenre.genre = genre.name;
                    maxGenre.count = 1;
                    maxGenre.id=genre.id;
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
                                maxGenre.id=genre.id;
                            }
                        }
                        else {
                            //new genre so insert into array
                            genresFound.push({id: genre.id, count: 1});
                        }
                    })
                }

            });
            let cast = movie.Actors;
            for (let i = 0; i < 3; i++) {
                if (actorsFound.length === 0) {
                    actorsFound.push({id: cast[0].id, count: 1})
                    maxActor.name=cast[0].name;
                    maxActor.count=1;
                    maxActor.id=cast[0].id;
                }
                else {
                    actorsFound.forEach(a => {
                        if (cast[i].id === a.id) {
                            a.count = a.count + 1;
                            if (a.count > maxActor.count) {
                                maxActor.name = cast[i].name;
                                maxActor.count = a.count;
                                maxActor.id=a.id;
                            }
                        }
                        else {
                            actorsFound.push({id: cast[i].id, count: 1})
                        }
                    });
                }

            }

        });
        let avgRuntime = Math.floor(sumRuntime / countMovies);
        let avgRate = Math.floor(sumRatings / countMovies);
        //maxGenre should have the most frequently occuring genre
        //maxActor should have most frequent actor
        //https://api.themoviedb.org/3/
        //discover/movie?api_key=
        // 2da9192ee0949a9d883335aa3b52c6df
        // &language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&vote_count.gte=7&with_cast=3223&with_genres=28
        let prefix = 'https://api.themoviedb.org/3/'
        let url = prefix + 'discover/movie?api_key=' + api_key
            + "&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&vote_count.gte=" +
            avgRate+"&with_cast=" + maxActor.id + "&with_genres=" + maxGenre.id;
            console.log(url)
        axios.get(url).then(
            (list)=> {
                let movies = [];
                for (let i = 0; i < 5; i++) {
                    movies.push(list.data.results[i].title);
                    //pull actual data from the list
                }
                let r={recommendedMovies: movies, favGenre: maxGenre.genre, AvgRuntime: avgRuntime, favActor: maxActor.name, averageRating: avgRate};
                console.log(r)
                return r;
         })
    };
    //I'd imagine when we create a new movielist, we compute all this stuff
    //function that computes average runtime
    //function that computes average rating
    //function that returns the most frequently occuring genre
    //function that returns the most frequently actor (and another for director maybe)
    //this is the put request that will generate the new movielist
    app.put('/v1/movie/watch', (req, res) => {
        //get data from client
        app.models.User.findOne({username:req.session.user.username})
            .then((user)=>{
                if (user) {

                } else {

                }
                console.log(JSON.stringify(req.session.user))
                let curMovies=user.movies;
                req.body.movies.forEach(movie=>{
                    let actors=[];
                    for (let i=0; i<3; i++) {
                        actors.push({id: movie.cast[i].id, name:movie.cast[i].name, });
                    }
                    let genres=[];
                    movie.genres.forEach((genre)=>{
                        genres.push({id: genre.id, name: genre.name})
                    });
                    let cur={Title: movie.title, Runtime: movie.runtime, Genres:genres,
                        Actors: actors, Rating: movie.vote_average, HomePage: movie.homepage};
                    curMovies.push(cur);
                });
                let rec=recommend(curMovies);
                let query= {_id: req.session.user};
                app.models.User.findOneAndUpdate(query, {$set: {recomMovies: rec, movies: curMovies}})
                     .then(
                         ()=>{res.status(201).send({message: "HERE"})}
                     ).fail( ()=>{
                        console.log("error");
                        res.status(400).send({message: "AH"});
                    }
                )

        });



        //find one, that will give us the current movies array
        //we'll push to the movies arrays with the new ones
        //then we'll pass this new movies array to the recommend function
        //then we do the update

    })
}
