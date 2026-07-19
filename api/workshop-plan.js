import { runWebHandler } from "../worker/vercel-adapter.js";
import { handleWorkshopPlan } from "../worker/workshop-plan.js";

export default async function workshopPlan(request, response) {
  return runWebHandler(request, response, handleWorkshopPlan);
}
