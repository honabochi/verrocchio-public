import { handleCapobottega } from "./capobottega.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/capobottega") {
      return handleCapobottega(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
