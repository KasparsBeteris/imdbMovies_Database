import _ from "lodash";
import { Database } from "../src/database";
import { minutes, Log } from "./utils";
import { escape } from "../src/utils";
import {
  MOVIE_GENRES,
  MOVIE_ACTORS,
  MOVIE_DIRECTORS,
  MOVIE_KEYWORDS,
  MOVIE_PRODUCTION_COMPANIES
} from "../src/table-names";
import {
  selectCount,
  selectMovieId,
  selectMovie,
  selectGenresByMovieId,
  selectActorsByMovieId,
  selectDirectorsByMovieId,
  selectKeywordsByMovieId,
  selectProductionCompaniesByMovieId
} from "../src/queries/select";
import { CsvLoader } from "../src/data/csv-loader";
import {
  GenreRow,
  ActorRow,
  DirectorRow,
  KeywordRow,
  ProductionCompanyRow
} from "../src/types";

const insertMovieGenres = (
  movieId: number,
  genres: string[],
  genreRows: GenreRow[]
): string => {
  return (
    `INSERT INTO movie_genres(movie_id, genre_id) values` +
      genres.map(genre => `('${movieId}', (SELECT id FROM genres where genre='${genre}'))`)
  );
};
const insertMovieActors = (
  movieId: number,
  actors: string[],
  actorRows: ActorRow[]
): string => {
  return (
    `INSERT INTO movie_actors(movie_id, actor_id) values` +
      actors.map(actor => `('${movieId}', (SELECT id FROM actors where full_name='${escape(actor)}'))`)
  );
};

const insertMovieDirectors = (
  movieId: number,
  directors: string[],
  directorRows: DirectorRow[]
): string => {
  return (
    `INSERT INTO movie_directors(movie_id, director_id) values` +
      directors.map(director => `('${movieId}', (SELECT id FROM directors where full_name='${escape(director)}'))`)
  );
};

const insertMovieKeywords = (
  movieId: number,
  keywords: string[],
  keywordRows: KeywordRow[]
): string => {
  return (
    `INSERT INTO movie_keywords(movie_id, keyword_id) values` +
      keywords.map(keyword => `('${movieId}', (SELECT id FROM keywords where keyword='${escape(keyword)}'))`)
  );
};

const insertMovieProductionCompanies = (
  movieId: number,
  productionCompanies: string[],
  productionCompanyRows: ProductionCompanyRow[]
): string => {
  return (
    `INSERT INTO movie_production_companies(movie_id, company_id) values` +
      productionCompanies.map(company => `('${movieId}', (SELECT id FROM production_companies where company_name='${escape(company)}'))`)
  );
};

describe("Insert Relationship Data", () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.fromExisting("04", "05");
    await CsvLoader.load();
  }, minutes(3));

  it(
    "should insert genre relationship data",
    async done => {
      const movies = await CsvLoader.movies();
      const genreRows = (await db.selectMultipleRows(`select id from genres`)) as GenreRow[];
      const moviesByImdbId = _.groupBy(await CsvLoader.movies(), "imdbId");

      for (const imdbId of Object.keys(moviesByImdbId)) {
        const movieId = (await db.selectSingleRow(selectMovieId(imdbId)))
          .id as number;
        const genres = movies.find(it => it.imdbId === imdbId)!.genres;
        if (genres.length > 0) {
          await db.insert(insertMovieGenres(movieId, genres, genreRows));
        }
      }

      const count = await db.selectSingleRow(selectCount(MOVIE_GENRES));
      expect(count.c).toBe(26832);

      const movie = await db.selectSingleRow(selectMovie("tt0884328"));
      expect(movie.original_title).toBe("The Mist");

      const genres = await db.selectMultipleRows(
        selectGenresByMovieId(movie.id as number)
      );
      expect(genres).toEqual([
        { genre: "Science Fiction" },
        { genre: "Thriller" },
        { genre: "Horror" }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should insert actor relationship data",
    async done => {
      const movies = await CsvLoader.movies();
      const actorRows = (await db.selectMultipleRows(`select * from actors`)) as ActorRow[];
      const moviesByImdbId = _.groupBy(await CsvLoader.movies(), "imdbId");

      for (const imdbId of Object.keys(moviesByImdbId)) {
        const movieId = (await db.selectSingleRow(selectMovieId(imdbId)))
          .id as number;
        const actors = movies.find(it => it.imdbId === imdbId)!.cast;
        if (actors.length > 0) {
          await db.insert(insertMovieActors(movieId, actors, actorRows));
        }
      }

      const count = await db.selectSingleRow(selectCount(MOVIE_ACTORS));
      expect(count.c).toBe(52319);

      const movie = await db.selectSingleRow(selectMovie("tt0080707"));
      expect(movie.original_title).toBe("The Exterminator");

      const actors = await db.selectMultipleRows(
        selectActorsByMovieId(movie.id as number)
      );
      expect(actors).toEqual([
        { full_name: "Christopher George" },
        { full_name: "Steve James" },
        { full_name: "Samantha Eggar" },
        { full_name: "Robert Ginty" },
        { full_name: "Tony DiBenedetto" }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should insert director relationship data",
    async done => {
      const movies = await CsvLoader.movies();
      const directorRows = (await db.selectMultipleRows(`select * from directors`)) as DirectorRow[];
      const moviesByImdbId = _.groupBy(await CsvLoader.movies(), "imdbId");

      for (const imdbId of Object.keys(moviesByImdbId)) {
        const movieId = (await db.selectSingleRow(selectMovieId(imdbId)))
          .id as number;
        const directors = movies.find(it => it.imdbId === imdbId)!.directors;
        if (directors.length > 0) {
          await db.insert(insertMovieDirectors(movieId, directors, directorRows));
        }
      }

      const count = await db.selectSingleRow(selectCount(MOVIE_DIRECTORS));
      expect(count.c).toBe(11840);

      const movie = await db.selectSingleRow(selectMovie("tt0072856"));
      expect(movie.original_title).toBe("Death Race 2000");

      const directors = await db.selectMultipleRows(
        selectDirectorsByMovieId(movie.id as number)
      );
      expect(directors).toEqual([{ full_name: "Paul Bartel" }]);

      done();
    },
    minutes(3)
  );

  it(
    "should insert keyword relationship data",
    async done => {
      const movies = await CsvLoader.movies();
      const keywordRows = (await db.selectMultipleRows(`select * from keywords`)) as KeywordRow[];
      const moviesByImdbId = _.groupBy(await CsvLoader.movies(), "imdbId");

      for (const imdbId of Object.keys(moviesByImdbId)) {
        const movieId = (await db.selectSingleRow(selectMovieId(imdbId)))
          .id as number;
        const keywords = movies.find(it => it.imdbId === imdbId)!.keywords;
        if (keywords.length > 0) {
          await db.insert(insertMovieKeywords(movieId, keywords, keywordRows));
        }
      }

      const count = await db.selectSingleRow(selectCount(MOVIE_KEYWORDS));
      expect(count.c).toBe(37303);

      const movie = await db.selectSingleRow(selectMovie("tt2820852"));
      expect(movie.original_title).toBe("Furious 7");

      const keywords = await db.selectMultipleRows(
        selectKeywordsByMovieId(movie.id as number)
      );
      expect(keywords).toEqual([
        { keyword: "car race" },
        { keyword: "speed" },
        { keyword: "revenge" },
        { keyword: "suspense" },
        { keyword: "car" }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should insert production companies relationship data",
    async done => {
      const movies = await CsvLoader.movies();
      const productionCompanyRows = (await db.selectMultipleRows(`select * from production_companies`)) as ProductionCompanyRow[];
      const moviesByImdbId = _.groupBy(await CsvLoader.movies(), "imdbId");

      for (const imdbId of Object.keys(moviesByImdbId)) {
        const movieId = (await db.selectSingleRow(selectMovieId(imdbId)))
          .id as number;
        const productionCompanies = movies.find(it => it.imdbId === imdbId)!
          .productionCompanies;
        if (productionCompanies.length > 0) {
          await db.insert(
            insertMovieProductionCompanies(
              movieId,
              productionCompanies,
              productionCompanyRows
            )
          );
        }
      }

      const count = await db.selectSingleRow(
        selectCount(MOVIE_PRODUCTION_COMPANIES)
      );
      expect(count.c).toBe(23146);

      const movie = await db.selectSingleRow(selectMovie("tt0133046"));
      expect(movie.original_title).toBe("Teaching Mrs. Tingle");

      const productionCompanies = await db.selectMultipleRows(
        selectProductionCompaniesByMovieId(movie.id as number)
      );
      expect(productionCompanies).toEqual([
        { company_name: "Dimension Films" },
        { company_name: "Interscope Communications" },
        { company_name: "Konrad Pictures" }
      ]);

      done();
    },
    minutes(3)
  );
});
