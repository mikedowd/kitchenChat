var db = require('./db');

let checkUserCount = "SELECT COUNT(slack_id) AS current_users, chat_id FROM kitchen_users WHERE in_kitchen = true GROUP BY chat_id;";
let queryUsersWithKitchenStatus = "Select slack_id, in_kitchen, chat_id from kitchen_users where in_kitchen = true;"
let upsert = "INSERT INTO kitchen_users(slack_id, in_kitchen, chat_id) VALUES($1,$2,null) ON CONFLICT(slack_id) DO UPDATE SET in_kitchen=EXCLUDED.in_kitchen, chat_id=null;";
let availableUsersNotChatting = "SELECT slack_id FROM kitchen_users WHERE in_kitchen = true AND chat_id is null;";
let updateUsers = "UPDATE kitchen_users SET chat_id=($1) WHERE slack_id IN ($2);";
let insertChat = "INSERT INTO kitchen_chats(dtCreated) VALUES(NOW()) RETURNING id;"

module.exports = {
    upsertUserWithStatus: (slackId, inKitchen, callback) => {
        console.log("upsertUserWithStatus");
        db.query(upsert, [slackId, inKitchen], callback);
    },
    queryUsersInRooms : function(callback){
        console.log("queryUsersInRooms");
        return db.query(checkUserCount, null, callback);
    },
    getUsersWithKitchenStatus : function (callback){
    	return db.query(queryUsersWithKitchenStatus, null, callback);
    },
    getAvailableUsersNotChatting : function (callback){
        console.log("getAvailableUsersNotChatting");
        return db.query(availableUsersNotChatting, null, callback);
    },
    updateUsersWithChatId : function(chatId, userIds, callback){
        console.log("updateUsersWithChatId chat id: ", chatId);
        db.query(updateUsers, [chatId,userIds.join(',')], callback);
    },
    addChat: function(callback){
        console.log("addChat");
        db.query(insertChat, null, callback);
    }
}