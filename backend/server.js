import { createServer } from "node:http";
import { router } from "./routes/index.js";
import { sendJson } from "./server/index.js";

const PORT = Number(process.env.PORT) || 5000;

const server = createServer(async (req, res) => {
  try {
    return await router(req, res);
  } catch (error) {
    return sendJson(res, 500, {
      message: "Terjadi kesalahan server.",
      error: error.message
    });
  }
});

server.listen(PORT, () => {
  console.log(`SpendWise API berjalan di http://localhost:${PORT}`);
});