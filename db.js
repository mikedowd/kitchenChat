const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
    testMethod : function(){
        console.log("Imported successfully");
    },
    query: (text, params, callback) => {
      return pool.query(text, params, callback)
    },
}