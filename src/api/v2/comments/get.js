"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var atob_1 = __importDefault(require("atob"));
var mysqlSetup_1 = require("../../../mysqlSetup");
var fs_1 = __importDefault(require("fs"));
function get(app) {
    app.get('/v2/comments/get/:video', function (req, res) {
        var from = parseInt(req.query.from) || 0;
        var to = parseInt(req.query.to) || 20;
        var comments = [];
        mysqlSetup_1.db.query("SELECT * FROM `comments`", function (err, rows) {
            if (err)
                return res.send({ error: err });
            for (var i = 0; i < rows.length; i++) {
                try {
                    var comment = JSON.parse(fromb64(rows[i].json));
                    if (comment.episode == req.params.video) {
                        comments.push(comment);
                    }
                }
                catch (err) {
                    console.error('Error converting base64 to JSON!');
                }
            }
            var parsedComments = [];
            for (var i = 0; i < comments.length; i++) {
                if (typeof comments[i] === 'object') {
                    try {
                        var fulluser = JSON.parse(fs_1.default.readFileSync("src/db/users/".concat(comments[i].uid || comments[i].user.id, ".json"), 'utf-8'));
                        var user = {
                            id: fulluser.id,
                            username: fulluser.username,
                            pfp: fulluser.pfp
                        };
                        comments[i].user = user;
                        parsedComments.push(comments[i]);
                    }
                    catch (err) {
                        console.error(err);
                        var user = {
                            id: comments[i].uid,
                            username: 'Error Getting User Data!',
                            pfp: {
                                filename: '/userdata/profilepics/default.jpg',
                                format: 'image/jpeg',
                                width: 256,
                                height: 256,
                                originalFilename: 'default.jpg'
                            }
                        };
                        comments[i].user = user;
                        parsedComments.push(comments[i]);
                    }
                }
            }
            var sortType = 'latest';
            if (req.query.sort === 'oldest') {
                sortType = 'oldest';
            }
            else if (req.query.sort === 'rating') {
                sortType = 'rating';
            }
            if (sortType === 'latest') {
                parsedComments.sort(function (a, b) {
                    if (a.stats.published > b.stats.published) {
                        return -1;
                    }
                    else if (a.stats.published < b.stats.published) {
                        return 1;
                    }
                    else if (a.stats.published === b.stats.published) {
                        return 0;
                    }
                });
            }
            else if (sortType === 'oldest') {
                parsedComments.sort(function (a, b) {
                    if (a.stats.published > b.stats.published) {
                        return 1;
                    }
                    else if (a.stats.published < b.stats.published) {
                        return -1;
                    }
                    else if (a.stats.published === b.stats.published) {
                        return 0;
                    }
                });
            }
            else if (sortType === 'rating') {
                parsedComments.sort(function (a, b) {
                    var ratingA = a.stats.likes - a.stats.dislikes;
                    var ratingB = b.stats.likes - b.stats.dislikes;
                    if (ratingA > ratingB) {
                        return -1;
                    }
                    else if (ratingA < ratingB) {
                        return 1;
                    }
                    else if (ratingA === ratingB) {
                        if (a.stats.published > b.stats.published) {
                            return -1;
                        }
                        else if (a.stats.published < b.stats.published) {
                            return 1;
                        }
                        else if (a.stats.published === b.stats.published) {
                            return 0;
                        }
                    }
                });
            }
            var limitedComments = [];
            for (var i = from; i < to; i++) {
                if (parsedComments[i]) {
                    limitedComments.push(parsedComments[i]);
                }
            }
            res.send(limitedComments);
        });
    });
}
exports.default = get;
function fromb64(b64) {
    return decodeURIComponent(escape((0, atob_1.default)(b64)));
}
//# sourceMappingURL=get.js.map