"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const types_1 = require("../types");
const db_1 = require("../db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../types/config");
const authMiddleware_1 = require("../authMiddleware");
const userRouter = (0, express_1.Router)();
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6eyJpZCI6MSwibmFtZSI6InZpa1MiLCJlbWFpbCI6ImV4YW1wbGVAZ21haWwuY29tIiwicGFzc3dvcmQiOiIxMjM0In0sImlhdCI6MTc1MTQ1OTQ0Mn0.Uz_Ia4eo9S-FDlwOGlHAwC18s99S-pBKxq_MWOnIQpo
userRouter.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("signup Route");
    const body = req.body;
    console.log("hi");
    console.log(body);
    const parsedData = types_1.SignupData.safeParse(body);
    if (!parsedData.success) {
        return res.status(411).json({
            message: "incorrect inputs"
        });
    }
    const userExists = yield db_1.prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username
        }
    });
    if (userExists) {
        return res.status(403).json({
            message: "user already exists"
        });
    }
    const user = yield db_1.prismaClient.user.create({
        data: {
            email: parsedData.data.username,
            password: parsedData.data.password,
            name: parsedData.data.name,
        }
    });
    const userId = user.id;
    const token = jsonwebtoken_1.default.sign({
        userId
    }, config_1.JWT_PASSWORD);
    res.json({
        token: token
    });
}));
userRouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("signin Route");
    const body = req.body;
    const parsedData = types_1.SigninData.safeParse(body);
    if (!parsedData.success) {
        res.status(411).json({
            message: "Incorrect inputs"
        });
        return;
    }
    const user = yield db_1.prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username,
            password: parsedData.data.password,
        }
    });
    if (!user) {
        res.status(403).json({
            message: "sorry credential are incorrect"
        });
    }
    // else return the token
    const id = user === null || user === void 0 ? void 0 : user.id;
    const token = jsonwebtoken_1.default.sign({ id }, config_1.JWT_PASSWORD);
    res.json({
        token: token
    });
}));
userRouter.get('/', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("get user Route");
    //@ts-ignore
    const id = req.id;
    const user = yield db_1.prismaClient.user.findFirst({
        where: {
            id
        },
        select: {
            name: true,
            email: true
        }
    });
    res.json({
        user
    });
}));
exports.default = userRouter;
