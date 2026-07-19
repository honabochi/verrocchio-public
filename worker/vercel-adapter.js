export async function runWebHandler(nodeRequest, nodeResponse, handler) {
  const body =
    nodeRequest.method === "GET" || nodeRequest.method === "HEAD"
      ? undefined
      : JSON.stringify(nodeRequest.body || {});
  const request = new Request(
    `https://${nodeRequest.headers.host || "verrocchio.local"}${nodeRequest.url}`,
    {
      method: nodeRequest.method,
      headers: nodeRequest.headers,
      body,
    },
  );
  const response = await handler(request, {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  });

  nodeResponse.status(response.status);
  response.headers.forEach((value, key) => nodeResponse.setHeader(key, value));
  nodeResponse.send(await response.text());
}
