"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handle500 = exports.handle404 = void 0;
function handle404(req, res) {
    res.status(404).send({ error: { number: 404, code: 'ERRNOTFOUND', message: '404 Not Found! The resource you are trying to access does not exist.' } });
}
exports.handle404 = handle404;
function handle500(err, req, res, next) {
    res.status(500).send({ error: { number: 500, code: 'ERRINTERNAL', message: '500 Internal Server Error! The server was unable to complete your request due to a configuration error.', stack: err.stack } });
}
exports.handle500 = handle500;
//# sourceMappingURL=handleErrors.js.map