"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var fs_1 = __importDefault(require("fs"));
function logout(app) {
    app.use('/v2/account/logout', express_1.default.json());
    app.post('/v2/account/logout', function (req, res) {
        var users = fs_1.default.readdirSync('src/db/users');
        var postInfo = {
            id: req.body.id,
            loginKey: req.body.loginKey
        };
        var hasAccount = false;
        for (var i = 0; i < users.length; i++) {
            var user = JSON.parse(fs_1.default.readFileSync("src/db/users/".concat(users[i]), 'utf-8'));
            if (user.id == postInfo.id) {
                hasAccount = true;
                var index = user.loginKeys.indexOf(postInfo.loginKey);
                user.loginKeys.splice(index, 1);
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
exports.default = logout;
//# sourceMappingURL=logout.js.map