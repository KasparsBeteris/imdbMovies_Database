import { Database } from "../src/database";
import { minutes } from "./utils";

describe("Queries Across Tables", () => {
    let db: Database;

    beforeAll(async () => {
        db = await Database.fromExisting("06", "07");
    }, minutes(3));

    it(
        "should select top three directors ordered by total budget spent in their movies",
        async done => {
            const query = `SELECT directors.full_name as director,
                            (SELECT ROUND(SUM(movies.budget_adjusted),2) WHERE movie_directors.director_id = directors.id) as total_budget
                            FROM directors
                            INNER JOIN movie_directors ON movie_directors.director_id = directors.id
                            INNER JOIN movies ON movies.id = movie_directors.movie_id
                            GROUP BY full_name
                            ORDER BY total_budget DESC
                            LIMIT 3`;
            const result = await db.selectMultipleRows(query);

            expect(result).toEqual([
                {
                    director: "Steven Spielberg",
                    total_budget: 2173663066.68
                },
                {
                    director: "Ridley Scott",
                    total_budget: 1740157354.14
                },
                {
                    director: "Michael Bay",
                    total_budget: 1501996071.5
                }
            ]);

            done();
        },
        minutes(3)
    );

    it(
        "should select top 10 keywords ordered by their appearance in movies",
        async done => {
            const query = `SELECT keywords.keyword,
                            (SELECT COUNT(movie_keywords.keyword_id) WHERE movie_keywords.keyword_id = keywords.id) as count
                            FROM keywords
                            INNER JOIN movie_keywords ON movie_keywords.keyword_id = keywords.id
                            INNER JOIN movies ON movies.id = movie_keywords.movie_id
                            GROUP BY keyword
                            ORDER BY count DESC
                            limit 10`;
            const result = await db.selectMultipleRows(query);

            expect(result).toEqual([
                {
                    keyword: "woman director",
                    count: 411
                },
                {
                    keyword: "independent film",
                    count: 394
                },
                {
                    keyword: "based on novel",
                    count: 278
                },
                {
                    keyword: "sex",
                    count: 272
                },
                {
                    keyword: "sport",
                    count: 216
                },
                {
                    keyword: "murder",
                    count: 204
                },
                {
                    keyword: "musical",
                    count: 169
                },
                {
                    keyword: "biography",
                    count: 168
                },
                {
                    keyword: "new york",
                    count: 163
                },
                {
                    keyword: "suspense",
                    count: 157
                }
            ]);

            done();
        },
        minutes(3)
    );

    it(
        "should select one movie which has highest count of actors",
        async done => {
            const query = `SELECT movies.original_title,
                            (SELECT COUNT(movie_actors.actor_id) WHERE movie_actors.actor_id = actors.id) as count
                            FROM movies
                            INNER JOIN movie_actors ON movie_actors.movie_id = movies.id
                            INNER JOIN actors ON actors.id = movie_actors.actor_id
                            GROUP BY original_title
                            ORDER BY count DESC
                            limit 1`;
            const result = await db.selectSingleRow(query);

            expect(result).toEqual({
                original_title: "Hamlet",
                count: 20
            });

            done();
        },
        minutes(3)
    );

    it(
        "should select three genres which has most ratings with 5 stars",
        async done => {
            const query = `SELECT genres.genre,
            (SELECT COUNT(movie_ratings.movie_id)) as five_stars_count
     FROM genres
     INNER JOIN movie_genres ON movie_genres.genre_id = genres.id
     INNER JOIN movies ON movies.id = movie_genres.movie_id
     LEFT OUTER JOIN movie_ratings ON movie_ratings.movie_id = movies.id
     WHERE movie_ratings.rating = 5.0
     GROUP BY genre
     ORDER BY five_stars_count DESC
     limit 3
     
     `;
            const result = await db.selectMultipleRows(query);

            expect(result).toEqual([
                {
                    genre: 'Drama',
                    five_stars_count: 143663
                },
                {
                    genre: 'Thriller',
                    five_stars_count: 96265
                },
                {
                    genre: 'Comedy',
                    five_stars_count: 81184
                },
            ]);

            done();
        },
        minutes(3)
    );

    it(
        "should select top three genres ordered by average rating",
        async done => {
            const query = `SELECT genres.genre,
                            (SELECT ROUND(avg(movie_ratings.rating),2) ) as avg_rating
                            FROM genres
                            INNER JOIN movie_genres ON movie_genres.genre_id = genres.id
                            INNER JOIN movies ON movies.id = movie_genres.movie_id
                            LEFT OUTER JOIN movie_ratings ON movie_ratings.movie_id = movies.id
                            GROUP BY genre
                            ORDER BY avg_rating DESC
                            limit 3
                            `;
            const result = await db.selectMultipleRows(query);

            expect(result).toEqual([
                {
                    genre: 'Western',
                    avg_rating: 3.64
                },
                {
                    genre: 'Crime',
                    avg_rating: 3.62
                },
                {
                    genre: 'Animation',
                    avg_rating: 3.6
                },
            ]);

            done();
        },
        minutes(3)
    );

    it(
        "should select top three actors whose movies has the most revenues total",
        async done => {
            const query = `SELECT actors.full_name as actor,
                            (SELECT ROUND(SUM(movies.revenue_adjusted),0) WHERE movie_actors.actor_id = actors.id) as total_revenue
                            FROM actors
                            INNER JOIN movie_actors ON movie_actors.actor_id = actors.id
                            INNER JOIN movies ON movies.id = movie_actors.movie_id
                            GROUP BY full_name
                            ORDER BY total_revenue DESC
                            LIMIT 3`;
            const result = await db.selectMultipleRows(query);

            expect(result).toEqual([
                {
                    actor: "Harrison Ford",
                    total_revenue: 14585816585
                },
                {
                    actor: "Tom Hanks",
                    total_revenue: 10672385155
                },
                {
                    actor: "Tom Cruise",
                    total_revenue: 10558540809
                }
            ]);

            done();
        },
        minutes(3)
    );

    it(
        "should select directors name for a movie",
        async done => {
            const movieTitle = "Minions"; 
            const query = `SELECT directors.full_name as director
                            FROM directors
                            INNER JOIN movie_directors ON movie_directors.director_id = directors.id
                            INNER JOIN movies ON movies.id = movie_directors.movie_id
                            WHERE movies.original_title = "${movieTitle}"`;
                            
            const result = await db.selectMultipleRows(query);

            expect(result).toEqual([
                {
                    director: "Kyle Balda"
                },
                {
                    director: "Pierre Coffin"
                }
                
            ]);

            done();
        },
        minutes(3)
    );

    it(
        "should select directors name for movies who has revenue above 2000000000",
        async done => {
            const revenue = 2000000000; 
            const query = `SELECT directors.full_name as director,
                            movies.revenue
                            FROM directors
                            INNER JOIN movie_directors ON movie_directors.director_id = directors.id
                            INNER JOIN movies ON movies.id = movie_directors.movie_id
                            WHERE movies.revenue > ${revenue}`;
                            
            const result = await db.selectMultipleRows(query);

            expect(result).toEqual([
                {
                    director: "J.J. Abrams",
                    revenue: 2068178225
                },
                {
                    director: "James Cameron",
                    revenue: 2781505847
                }
                
            ]);

            done();
        },
        minutes(3)
    );
});
