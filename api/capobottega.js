import { runWebHandler } from "../worker/vercel-adapter.js";
import { handleCapobottega } from "../worker/capobottega.js";

export default async function capobottega(request, response) {
  return runWebHandler(request, response, handleCapobottega);
}
