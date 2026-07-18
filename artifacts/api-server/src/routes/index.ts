import { Router, type IRouter } from "express";
import healthRouter from "./health";
import housingRouter from "./housing";
import copilotRouter from "./copilot";

const router: IRouter = Router();

router.use(healthRouter);
router.use(housingRouter);
router.use(copilotRouter);

export default router;
