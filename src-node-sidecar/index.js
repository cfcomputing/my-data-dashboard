// const express = require('express')
// const app = express()
// const port = 8080;

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// process.stdout.write('trying to setup server');
// try {
// app.listen(port, () => {
//   process.stdout.write(`Example app listening on port ${port}`)
// });
// } catch (e) {
//   process.stdout.write('error setting up server');
// }

// const args = JSON.parse(process.argv[2]);

// process.stdout.write(`Hello from node land! args.foo => ${args.foo}`);

const tingodb = require("tingodb");

const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const tmp = os.tmpdir();
const Engine = tingodb();
const dbPath = `${tmp}/tingodb`;

if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath);
}

(async () => {
  const db = new Engine.Db(dbPath, {});
  const collection = db.collection("my_first_collection");
  await collection.insertMany([
    {
      name: "hi",
    },
    {
      rando: "foo",
    },
  ]);
  const { error, results } = await collection
    .find({ name: "hi" })
    .toArrayAsPromise();
  
  process.stdout.write(JSON.stringify({
    total: results.length,
    error, 
    results, 
    dbPath,
  }));
})();