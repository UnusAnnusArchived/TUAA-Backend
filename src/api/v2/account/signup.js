"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var crypto_1 = __importDefault(require("crypto"));
var fs_1 = __importDefault(require("fs"));
function signup(app) {
    app.use('/v2/account/signup', express_1.default.json());
    app.post('/v2/account/signup', function (req, res) {
        var users = fs_1.default.readdirSync('src/db/users');
        var body = req.body;
        if (body.email && body.username && body.password && body.confirmpassword) {
            if (body.password === body.confirmpassword) {
                var exists = false;
                for (var i = 0; i < users.length; i++) {
                    var user = JSON.parse(fs_1.default.readFileSync("src/db/users/".concat(users[i]), 'utf-8'));
                    if (user.email.toLowerCase() === body.email.toLowerCase()) {
                        exists = true;
                    }
                    else if (user.username.toLowerCase() === body.username.toLowerCase()) {
                        exists = true;
                    }
                }
                if (exists) {
                    res.send({ success: false, error: { code: 1, message: 'Account exists!' } });
                }
                else {
                    var salt = crypto_1.default.randomBytes(64).toString('hex');
                    var hash = crypto_1.default.scryptSync(body.password, salt, 64).toString('hex');
                    var id = crypto_1.default.randomBytes(16).toString('hex');
                    var user = {
                        id: id,
                        email: body.email,
                        username: body.username,
                        hash: hash,
                        salt: salt,
                        pfp: {
                            originalFilename: 'default.jpg',
                            filename: '/userdata/profilepics/default.jpg',
                            width: 256,
                            height: 256,
                            format: 'image/jpeg'
                        },
                        loginKeys: []
                    };
                    fs_1.default.writeFileSync("src/db/users/".concat(id, ".json"), JSON.stringify(user, null, 2));
                    res.send({ success: true, loginURI: '/v2/account/login' });
                }
            }
            else {
                res.send({ success: false, error: { code: 0, message: 'Passwords do not match!' } });
            }
        }
        else {
            res.send({ success: false, error: { code: 2, message: 'Missing info!' } });
        }
    });
}
exports.default = signup;
//# sourceMappingURL=signup.js.map