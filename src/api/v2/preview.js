"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var config_json_1 = require("../../config.json");
function getvidpreviews(app) {
    app.get('/v2/preview/:video', function (req, res, next) {
        function genTime(seconds) {
            return new Date(seconds * 1000).toISOString().substr(11, 8);
        }
        var split = req.params.video.toLowerCase().split('.');
        var season = split[0].replace('s', '');
        var episode = split[1].replace('e', '');
        var path = "".concat(config_json_1.metadataPath, "/").concat(season, "/").concat(episode, ".json");
        if (fs_1.default.existsSync(path)) {
            var metadata_1 = JSON.parse(fs_1.default.readFileSync(path, 'utf-8'));
            (0, node_fetch_1.default)("https://cdn.unusann.us/".concat(season, "/").concat(episode, "/previews/length.txt")).then(function (response) {
                var status = response.status;
                response.text().then(function (text) {
                    res.setHeader('Content-Type', 'text/vtt');
                    if (!metadata_1.previewSprites) {
                        if (status == '200') {
                            (0, node_fetch_1.default)("https://cdn.unusann.us/".concat(season, "/").concat(episode, "/previews/sprite.jpg")).then(function (spriteRes) {
                                var previewLength = parseInt(text);
                                var vttText = 'WEBVTT\n\n';
                                if (spriteRes.status == 200) {
                                    for (var i = 0; i < previewLength; i++) {
                                        vttText += "".concat(i + 1, "\n").concat(genTime(i * 4), ".000 --> ").concat(genTime((i * 4) + 4), ".000\nhttps://cdn.unusann.us/").concat(season, "/").concat(episode, "/previews/sprite.jpg#xywh=").concat(158 * (i), ",0,159,90\n\n");
                                    }
                                }
                                else {
                                    for (var i = 0; i < previewLength; i++) {
                                        var previewStr = "".concat(i + 1).padStart(8, '0');
                                        vttText += "".concat(i + 1, "\n").concat(genTime(i * 4), ".000 --> ").concat(genTime((i * 4) + 4), ".000\nhttps://cdn.unusann.us/").concat(season, "/").concat(episode, "/previews/").concat(previewStr, ".jpg\n\n");
                                    }
                                }
                                res.send(vttText);
                            });
                        }
                        else {
                            res.send('WEBVTT\n\n');
                        }
                    }
                    else {
                        var vttText = 'WEBVTT\n\n';
                        var previewLength = parseInt(text);
                        for (var i = 0; i < previewLength; i++) {
                            var currentSprite = "https://cdn.unusann.us/".concat(season, "/").concat(episode, "/previews/sprite01.jpg");
                            var currentSpriteX = 0;
                            for (var ps = 0; ps < metadata_1.previewSprites.length; ps++) {
                                if (metadata_1.previewSprites[ps].length > (i)) {
                                    currentSprite = metadata_1.previewSprites[ps].src;
                                    currentSpriteX = ((i) - metadata_1.previewSprites[ps].length) + metadata_1.previewSprites[0].length;
                                    break;
                                }
                            }
                            vttText += "".concat(i + 1, "\b").concat(genTime(i * 4), ".000 --> ").concat(genTime((i * 4) + 4), ".000\n").concat(currentSpriteX, "#xywh=").concat(158 * currentSpriteX, ",0,158,90\n\n");
                        }
                        res.send(vttText);
                    }
                });
            });
        }
        else {
            return next();
        }
    });
}
exports.default = getvidpreviews;
//# sourceMappingURL=preview.js.map