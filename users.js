var db = require('./db');

let upsert = "INSERT INTO kitchen_users(slack_id, in_kitchen) VALUES($1,$2) ON CONFLICT('slack_id') DO UPDATE SET in_kitchen=EXCLUDED.in_kitchen;";

module.exports = {
    upsertUser: (slackId, inKitchen) => {
        db.query(upsert, [slackId, inKitchen]);
    }
}