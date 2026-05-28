import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DATA_PATH = join(process.cwd(), "userData.json");

export const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });

  res.end(JSON.stringify(payload));
};

export const readBody = async (req) => {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString();

  if (!rawBody) {
    return {};
  }

  return JSON.parse(rawBody);
};

export const readUserData = async () => {
  const file = await readFile(DATA_PATH, "utf8");
  return JSON.parse(file);
};

export const writeUserData = async (data) => {
  await writeFile(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
};