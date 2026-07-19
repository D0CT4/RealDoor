import { Router, type IRouter } from "express";
import healthRouter from "./health";
import housingRouter from "./housing";
import copilotRouter from "./copilot";
import ragExtractRouter from "./ragExtract";
import translateRouter from "./translate";
import lihtcRouter from "./lihtc";

const router: IRouter = Router();

router.use(healthRouter);
router.use(housingRouter);
router.use(ragExtractRouter);
router.use(copilotRouter);
router.use(translateRouter);
router.use(lihtcRouter);

export default router;
