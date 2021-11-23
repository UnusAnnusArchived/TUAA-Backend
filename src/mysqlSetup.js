"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var mysql_1 = __importDefault(require("mysql"));
var config_json_1 = __importDefault(require("./config.json"));
exports.db = mysql_1.default.createPool(config_json_1.default.mysql);
//# sourceMappingURL=mysqlSetup.js.map