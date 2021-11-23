"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var fs_1 = __importDefault(require("fs"));
var btoa_1 = __importDefault(require("btoa"));
var markdown_it_1 = __importDefault(require("markdown-it"));
var markdown_it_for_inline_1 = __importDefault(require("markdown-it-for-inline"));
var express_rate_limit_1 = __importDefault(require("express-rate-limit"));
var mysqlSetup_1 = require("../../../mysqlSetup");
var md = (0, markdown_it_1.default)({ html: false, xhtmlOut: false, breaks: true, langPrefix: '', linkify: true }).disable(['image', 'link']).use(markdown_it_for_inline_1.default, 'url_new_win', 'link_open', function (tokens, idx) {
    var _a = __read(tokens[idx].attrs.find(function (attr) { return attr[0] === 'href'; }), 2), attrName = _a[0], href = _a[1];
    if (href) {
        tokens[idx].attrPush(['target', '_blank']);
        tokens[idx].attrPush(['rel', 'noopener noreferrer']);
    }
});
var rlimit = (0, express_rate_limit_1.default)({ windowMs: 60000, max: 6 });
function post(app) {
    app.use('/v2/comments/post/:video', rlimit);
    app.use('/v2/comments/post/:video', express_1.default.json());
    app.post('/v2/comments/post/:video', function (req, res) {
        var users = fs_1.default.readdirSync('src/db/users');
        var comment = req.body.comment;
        var loginKey = req.body.loginKey;
        if (comment.length > 500) {
            return res.send({ error: { code: 3, message: 'Invalid message length!' } });
        }
        var user;
        for (var i = 0; i < users.length; i++) {
            var currentUser = JSON.parse(fs_1.default.readFileSync("src/db/users/".concat(users[i]), 'utf-8'));
            if (currentUser.loginKeys.includes(loginKey)) {
                user = currentUser;
                break;
            }
        }
        if (!user) {
            return res.status(401).send({ error: { code: 401, message: 'Unauthorized!' } });
        }
        var JSONComment = {
            episode: req.params.video,
            uid: user.id,
            comment: {
                plaintext: comment,
                html: plainTextToHTML(comment, req.params.video)
            },
            stats: {
                published: Date.now(),
                likes: 0,
                dislikes: 0
            }
        };
        var b64Comment = tob64(JSON.stringify(JSONComment));
        mysqlSetup_1.db.query("INSERT INTO comments (json) values ('".concat(b64Comment, "')"), function (err) {
            if (err)
                return res.send({ error: err });
            res.send({ status: 'success', comment: JSONComment });
        });
    });
}
exports.default = post;
function tob64(string) {
    return (0, btoa_1.default)(unescape(encodeURIComponent(string)));
}
function plainTextToHTML(plaintext, episode) {
    var timeReg = /(?:([0-5]?[0-9]):)?([0-5]?[0-9]):([0-5][0-9])/g;
    var html = md.render(plaintext);
    if (plaintext.match(timeReg)) {
        var matches = plaintext.match(timeReg);
        for (var i = 0; i < matches.length; i++) {
            var split = matches[i].split(':');
            var seconds = parseInt(split[split.length - 1]);
            seconds += parseInt(split[split.length - 2]) * 60;
            if (split.length === 3) {
                seconds += (parseInt(split[0]) * 60) * 60;
            }
            html = html.replace(matches[i], "<a href=\"/watch/?v=".concat(episode, "&t=").concat(seconds, "\">").concat(matches[i].replace(/:/g, '&colon;'), "</a>"));
        }
    }
    return html;
}
//# sourceMappingURL=post.js.map