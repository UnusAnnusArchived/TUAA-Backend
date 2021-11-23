"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Multer = __importStar(require("multer"));
var sharp_1 = __importDefault(require("sharp"));
var fs_1 = __importDefault(require("fs"));
var crypto_1 = require("crypto");
var multer = Multer.default({ dest: 'src/db/userdata/profilepics' });
function changepfp(app) {
    app.post('/v2/account/changepfp', multer.single('pfp'), function (req, res) {
        var users = fs_1.default.readdirSync('src/db/users');
        var loginKey = req.body.loginKey;
        var user;
        for (var i = 0; i < users.length; i++) {
            var currentUser = JSON.parse(fs_1.default.readFileSync("src/db/users/".concat(users[i]), 'utf-8'));
            if (currentUser.loginKeys.includes(loginKey)) {
                user = currentUser;
                break;
            }
        }
        if (!user) {
            return res.send({ error: 'Not logged in!' });
        }
        (0, sharp_1.default)(req.file.path).metadata().then(function (imageMeta) {
            var pfpid = (0, crypto_1.randomBytes)(4).toString('hex');
            var size = 256;
            if (imageMeta.width < 256 && imageMeta.height < 256) {
                size = Math.max(imageMeta.width, imageMeta.height);
            }
            if (!fs_1.default.existsSync("src/db/userdata/profilepics/".concat(user.id))) {
                fs_1.default.mkdirSync("src/db/userdata/profilepics/".concat(user.id));
            }
            (0, sharp_1.default)(req.file.path).resize(size, size).toFile("src/db/userdata/profilepics/".concat(user.id, "/").concat(pfpid, ".jpg")).then(function () {
                fs_1.default.unlinkSync(req.file.path);
                fs_1.default.unlinkSync("src/db".concat(user.pfp.filename));
                user.pfp.originalFilename = req.file.originalname;
                user.pfp.filename = "/userdata/profilepics/".concat(user.id, "/").concat(pfpid, ".jpg");
                user.pfp.width = size;
                user.pfp.height = size;
                fs_1.default.writeFileSync("src/db/users/".concat(user.id, ".json"), JSON.stringify(user, null, 2));
                if (req.query.redirect) {
                    res.redirect(req.query.redirect);
                }
                else {
                    res.send({ status: 'success' });
                }
            });
        });
    });
}
exports.default = changepfp;
//# sourceMappingURL=changepfp.js.map