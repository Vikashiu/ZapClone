"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./types/config");
function authMiddleware(req, res, next) {
    const token = req.headers.authorization;
    console.log("hi from authentication");
    console.log(token);
    try {
        const payload = jsonwebtoken_1.default.verify(token, config_1.JWT_PASSWORD);
        console.log(payload);
        //@ts-ignore
        req.id = payload.id;
        next();
    }
    catch (e) {
        res.status(403).json({
            message: "You are not logged in"
        });
        return;
    }
}
