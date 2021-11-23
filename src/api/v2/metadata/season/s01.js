"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var config_json_1 = require("../../../../config.json");
function all(app) {
    app.get('/v2/metadata/season/s01', function (req, res) {
        var metadata = [];
        var s01 = fs_1.default.readdirSync("".concat(config_json_1.metadataPath, "/01"));
        for (var i = 0; i < s01.length; i++) {
            metadata.push(JSON.parse(fs_1.default.readFileSync("".concat(config_json_1.metadataPath, "/01/").concat(s01[i]), 'utf-8')));
        }
        res.setHeader('content-type', 'application/json');
        res.send(metadata);
    });
}
exports.default = all;
//# sourceMappingURL=s01.js.map