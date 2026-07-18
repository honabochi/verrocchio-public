import { handleCapobottega } from "./capobottega.js";
import { handleWorkshopPlan } from "./workshop-plan.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/capobottega") {
      return handleCapobottega(request, env);
    }
    if (url.pathname === "/api/workshop-plan") {
      return handleWorkshopPlan(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
