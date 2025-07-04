import { Router } from "express";
import { prismaClient } from "../db";

const router =  Router();


router.get("/available", async (req, res) => {
  console.log("1 reached");
  const availableActions = await prismaClient.availableAction.findMany({});
  res.json({
    availableActions
  });
  console.log("res sended");
});


export const actionRouter = router;