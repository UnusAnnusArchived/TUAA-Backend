"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var fs_1 = __importDefault(require("fs"));
function logoutall(app) {
    app.use('/v2/account/logoutall', express_1.default.json());
    app.post('/v2/account/logoutall', function (req, res) {
        var users = fs_1.default.readdirSync('src/db/users');
        var postInfo = {
            id: req.body.id
        };
        var hasAccount = false;
        for (var i = 0; i < users.length; i++) {
            var user = JSON.parse(fs_1.default.readFileSync("src/db/users/".concat(users[i]), 'utf-8'));
            if (user.id == postInfo.id) {
                hasAccount = true;
                user.loginKeys = [];
                fs_1.default.writeFileSync("src/db/users/".concat(users[i]), JSON.stringify(user, null, 2));
                res.send({ status: 'success' });
                break;
            }
        }
        if (!hasAccount) {
            res.send({ status: 'error', error: 'Account does not exist!' });
        }
    });
}
exports.default = logoutall;
//# sourceMappingURL=logoutall.js.map