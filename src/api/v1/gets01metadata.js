"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var config_json_1 = require("../../config.json");
function gets01metadata(app) {
    app.get('/v1/gets01metadata', function (req, res) {
        var metadata = [];
        var s01 = fs_1.default.readdirSync("".concat(config_json_1.metadataPath, "/01"));
        for (var i = 0; i < s01.length; i++) {
            metadata.push(JSON.parse(fs_1.default.readFileSync("".concat(config_json_1.metadataPath, "/01/").concat(s01[i]), 'utf-8')));
        }
        res.setHeader('content-type', 'application/json');
        res.send(metadata);
    });
}
exports.default = gets01metadata;
//# sourceMappingURL=gets01metadata.js.map