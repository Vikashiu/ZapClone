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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const types_1 = require("../types");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../authMiddleware");
const zapRouter = (0, express_1.Router)();
const prismaClient = new client_1.PrismaClient();
zapRouter.post('/create', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("zap create Route");
    const body = req.body;
    //@ts-ignore
    const id = req.id;
    const parsedData = types_1.ZapCreateSchema.safeParse(body);
    console.log(parsedData);
    if (!parsedData.success) {
        res.status(411).json({
            message: "Incorrect inputs"
        });
        return;
    }
    const zapId = yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const zap = yield tx.zap.create({
            data: {
                TriggerId: "",
                userId: parseInt(id),
                actions: {
                    create: parsedData.data.actions.map((x, index) => ({
                        actionId: x.availableActionId,
                        sortingOrder: index,
                        metadata: x.actionMetadata
                    }))
                }
            }
        });
        const trigger = yield tx.trigger.create({
            data: {
                TriggerId: parsedData.data.availableTriggerId,
                zapId: zap.id
            }
        });
        yield tx.zap.update({
            where: {
                id: zap.id
            },
            data: {
                TriggerId: trigger.id
            }
        });
        return zap.id;
    }));
    res.json({
        zapId
    });
    return;
}));
zapRouter.get('/allzap', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("get all zap Route");
    //@ts-ignore
    const id = req.id;
    const zaps = yield prismaClient.zap.findMany({
        where: {
            userId: id
        },
        include: {
            actions: {
                include: {
                    type: true
                }
            }, trigger: {
                include: {
                    type: true
                }
            }
        }
    });
    console.log("zaps handler");
    res.json({
        zaps
    });
    console.log(zaps);
}));
zapRouter.get('/:zapId', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("get a zap Route");
    //@ts-ignore
    const id = req.id;
    const zapId = req.params.zapId;
    const zap = yield prismaClient.zap.findFirst({
        where: {
            id: zapId
        },
        include: {
            actions: {
                include: {
                    type: true
                }
            },
            trigger: {
                include: {
                    type: true
                }
            }
        }
    });
    res.json({
        zap
    });
}));
exports.default = zapRouter;
