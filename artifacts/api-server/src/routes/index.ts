import { Router, type IRouter } from "express";
import healthRouter from "./health";
import housingRouter from "./housing";
import copilotRouter from "./copilot";
import translateRouter from "./translate";

const router: IRouter = Router();

router.use(healthRouter);
router.use(housingRouter);
router.use(copilotRouter);
router.use(translateRouter);

export default router;
