import { Database } from "../src/database";
import { minutes } from "./utils";

describe("Update cells", () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.fromExisting("08", "09");
  }, minutes(3));

  it(
    "Should update the actors name",
    async done => {
      const actorsId = 163;
      const query = `UPDATE actors SET full_name = "Jack White" WHERE id = ${actorsId};`

      await db.selectSingleRow(query);
      
      const result = await db.selectSingleRow(`SELECT full_name as changed_name FROM actors WHERE id = ${actorsId}`);

      expect(result).toEqual({
        changed_name: "Jack White"
      });

      done();
    },
    minutes(10)
  );

  it(
    "Should update the review's created_time",
    async done => {
      const movieId = 5;
      const query = `UPDATE movies SET release_date = "2000-05-13 01:55:55" WHERE id = ${movieId};`

      await db.selectSingleRow(query);   

      const result = await db.selectSingleRow(`SELECT release_date as changed_time FROM movies WHERE id = ${movieId}`);

      expect(result).toEqual({
        changed_time: "2000-05-13 01:55:55"
      });

      done();
    },
    minutes(10)
  );
    
  it(
    "Should update the review's created_time",
    async done => {
      const query = `UPDATE movies SET popularity = "45" WHERE popularity > 20;`

      await db.selectMultipleRows(query);   

      const result = await db.selectMultipleRows(`SELECT original_title, popularity FROM movies WHERE popularity = 45`);

      expect(result).toEqual([
        {
          original_title: "Jurassic World",
          popularity: 45.0
        },
        {
          original_title: "Mad Max: Fury Road",
          popularity: 45.0
        },
        {
          original_title: "Interstellar",
          popularity: 45.0
        }
    ]);

      done();
    },
    minutes(10)
  );

});
