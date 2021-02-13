var db = require('./db');

let checkUserCount = "SELECT COUNT(slack_id) AS current_users, chat_id FROM kitchen_users WHERE in_kitchen = true GROUP BY chat_id;";
let upsert = "INSERT INTO kitchen_users(slack_id, in_kitchen) VALUES($1,$2) ON CONFLICT(slack_id) DO UPDATE SET in_kitchen=EXCLUDED.in_kitchen;";
let queryUsersWithKitchenStatus = "Select * from kitchen_users where in_kitchen = 1;"

module.exports = {
    upsertUser: (slackId, inKitchen) => {
        db.query(upsert, [slackId, inKitchen]);
    },
    queryUsersInRooms : function(callback){
        return db.query(checkUserCount, null, callback);
    },
    getUsersWithKitchenStatus : function (callback){
    	return db.query(queryUsersWithKitchenStatus, null, callback);
    }

}