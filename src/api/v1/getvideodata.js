"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var config_json_1 = require("../../config.json");
function getvideodata(app) {
    app.get('/v1/getvideodata/:video', function (req, res, next) {
        var split = req.params.video.toLowerCase().split('.');
        var season = split[0].replace('s', '');
        var episode = split[1].replace('e', '');
        var path = "".concat(config_json_1.metadataPath, "/").concat(season, "/").concat(episode, ".json");
        if (fs_1.default.existsSync(path)) {
            res.setHeader('content-type', 'application/json');
            res.send(fs_1.default.readFileSync(path, 'utf-8'));
        }
        else {
            return next();
        }
    });
}
exports.default = getvideodata;
//# sourceMappingURL=getvideodata.js.map