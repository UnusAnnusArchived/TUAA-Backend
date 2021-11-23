"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var fs_1 = __importDefault(require("fs"));
function checkloginkey(app) {
    app.use('/v2/account/checkloginkey', express_1.default.json());
    app.post('/v2/account/checkloginkey', function (req, res) {
        var loginKey = req.body.loginKey;
        var users = fs_1.default.readdirSync('src/db/users');
        var isValid = false;
        for (var i = 0; i < users.length; i++) {
            var user = JSON.parse(fs_1.default.readFileSync("src/db/users/".concat(users[i]), 'utf-8'));
            if (user.loginKeys.includes(loginKey)) {
                //If the key is valid, send the client updated data in case it changed
                isValid = true;
                res.send({ isValid: isValid, user: { id: user.id, email: user.email, username: user.username, pfp: user.pfp } });
                break;
            }
        }
        if (!isValid) {
            res.send({ isValid: isValid });
        }
    });
}
exports.default = checkloginkey;
//# sourceMappingURL=checkloginkey.js.map