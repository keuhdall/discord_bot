const fs = require('fs');
let adminlist_s = "";
try {
    adminlist_s = fs.readFileSync("./adminlist.json", "utf8");
} catch (e) {
    adminlist_s = "[]";
}

module.exports = {
    adminRoles : JSON.parse(adminlist_s),
    niggerTab : [],
    killConfirm : [],
    musicQueues : {}
}