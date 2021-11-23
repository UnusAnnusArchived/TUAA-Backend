"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var config_json_1 = require("../../../config.json");
function getallmetadata(app) {
    app.get('/swift/v1/getallmetadata', function (req, res) {
        var metadata = {
            specials: [],
            season1: []
        };
        var s00 = fs_1.default.readdirSync("".concat(config_json_1.metadataPath, "/00"));
        for (var i = 0; i < s00.length; i++) {
            metadata.specials.push(JSON.parse(fs_1.default.readFileSync("".concat(config_json_1.metadataPath, "/00/").concat(s00[i]), 'utf-8')));
        }
        var s01 = fs_1.default.readdirSync("".concat(config_json_1.metadataPath, "/01"));
        for (var i = 0; i < s01.length; i++) {
            metadata.season1.push(JSON.parse(fs_1.default.readFileSync("".concat(config_json_1.metadataPath, "/01/").concat(s01[i]), 'utf-8')));
        }
        res.send(metadata);
    });
}
exports.default = getallmetadata;
//# sourceMappingURL=getallmetadata.js.map