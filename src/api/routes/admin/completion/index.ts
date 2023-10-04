import { wrapHandler } from "@medusajs/utils";
import { Router } from "express";
import productDescriptionsCompletion from "./product-descriptions";
import { authenticate } from "@medusajs/medusa";

const router = Router();

export default (adminRouter: Router) => {
  adminRouter.use("/completion/product-descriptions", router);
  adminRouter.use("/completion/product-descriptions", authenticate());

  router.post("/", wrapHandler(productDescriptionsCompletion));
};
