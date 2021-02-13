var db = require('./db');

let checkUserCount = "SELECT COUNT(slack_id) AS current_users, chat_id FROM kitchen_users WHERE in_kitchen = true GROUP BY chat_id;";
let queryUsersWithKitchenStatus = "Select slack_id, in_kitchen, chat_id from kitchen_users where in_kitchen = true;"
let upsert = "INSERT INTO kitchen_users(slack_id, in_kitchen, chat_id) VALUES($1,$2,null) ON CONFLICT(slack_id) DO UPDATE SET in_kitchen=EXCLUDED.in_kitchen, chat_id=null;";

module.exports = {
    upsertUserWithStatus: (slackId, inKitchen) => {
        db.query(upsert, [slackId, inKitchen]);
    },
    queryUsersInRooms : function(callback){
        return db.query(checkUserCount, null, callback);
    },
    getUsersWithKitchenStatus : function (callback){
    	return db.query(queryUsersWithKitchenStatus, null, callback);
    }

}