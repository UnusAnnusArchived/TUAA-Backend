"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var crypto_1 = __importDefault(require("crypto"));
var fs_1 = __importDefault(require("fs"));
var nodemailerSetup_1 = __importDefault(require("../../../nodemailerSetup"));
function login(app) {
    app.use('/v2/account/login', express_1.default.json());
    app.post('/v2/account/login', function (req, res) {
        var _a;
        console.log(res.getHeaders());
        var users = fs_1.default.readdirSync('src/db/users');
        var postInfo = {
            username: req.body.username.toLowerCase(),
            password: req.body.password,
            sendEmail: ((_a = req.body.sendEmail) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'true'
        };
        var isEmail = false;
        if (postInfo.username.includes('@'))
            isEmail = true;
        var validUser = false;
        var loginKey;
        for (var i = 0; i < users.length; i++) {
            var user = JSON.parse(fs_1.default.readFileSync("src/db/users/".concat(users[i]), 'utf-8'));
            if (postInfo.username === user[isEmail ? 'email' : 'username'].toLowerCase()) {
                var genHash = crypto_1.default.scryptSync(postInfo.password, user.salt, 64).toString('hex');
                if (user.hash === genHash) {
                    loginKey = crypto_1.default.randomBytes(8).toString('hex');
                    user.loginKeys.push(loginKey);
                    fs_1.default.writeFileSync("src/db/users/".concat(user.id, ".json"), JSON.stringify(user, null, 2));
                    validUser = user;
                }
                break;
            }
        }
        if (validUser) {
            res.send({
                isValid: true,
                loginKey: loginKey,
                user: {
                    id: validUser.id,
                    email: validUser.email,
                    username: validUser.username,
                    pfp: validUser.pfp
                }
            });
            if (postInfo.sendEmail === 'true') {
                (0, nodemailerSetup_1.default)('newLogin', validUser.email, function (string, isHTML) {
                    if (isHTML === void 0) { isHTML = false; }
                    validUser = validUser; // (because ts is being weird)
                    var str = string.replace(/{{ user.email }}/g, validUser.email).replace(/{{ user.pfp.filename }}/g, validUser.pfp.filename);
                    if (isHTML) {
                        str = str.replace(/{{ user.username }}/g, validUser.username.replace(/ /g, '&nbsp;'));
                    }
                    else {
                        str = str.replace(/{{ user.username }}/g, validUser.username);
                    }
                    return str;
                });
            }
        }
        else {
            res.send({ isValid: false });
        }
    });
}
exports.default = login;
//# sourceMappingURL=login.js.map