import { Router, type IRouter } from "express";
import healthRouter from "./health";
import propertiesRouter from "./properties";
import enquiriesRouter from "./enquiries";

const router: IRouter = Router();

router.use(healthRouter);
router.use(propertiesRouter);
router.use(enquiriesRouter);

export default router;
