"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emails = exports.noReplyEmail = exports.mailer = void 0;
var nodemailer_1 = __importDefault(require("nodemailer"));
var fs_1 = __importDefault(require("fs"));
exports.mailer = nodemailer_1.default.createTransport(require('./config.json').smtp);
exports.noReplyEmail = 'noreply@unusannusarchive.tk';
exports.emails = {};
var dir = fs_1.default.readdirSync('emails');
for (var i = 0; i < dir.length; i++) {
    exports.emails[dir[i]] = {
        subject: fs_1.default.readFileSync("emails/".concat(dir[i], "/subject.txt"), 'utf-8'),
        text: fs_1.default.readFileSync("emails/".concat(dir[i], "/index.txt"), 'utf-8'),
        html: fs_1.default.readFileSync("emails/".concat(dir[i], "/index.html"), 'utf-8')
    };
}
function sendEmail(type, to, replaceFunction) {
    if (replaceFunction === void 0) { replaceFunction = function (string) { return string; }; }
    if (exports.emails[type]) {
        var email = exports.emails[type];
        return exports.mailer.sendMail({
            from: exports.noReplyEmail,
            to: to,
            subject: replaceFunction(email.subject, false),
            text: replaceFunction(email.text, false),
            html: replaceFunction(email.html, true)
        });
    }
    else {
        throw new Error('Email type does not exist!');
    }
}
exports.default = sendEmail;
//# sourceMappingURL=nodemailerSetup.js.map