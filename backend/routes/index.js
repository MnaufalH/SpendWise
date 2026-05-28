import {
  createTransaction,
  createWallet,
  deleteTransaction,
  deleteWallet,
  getCategories,
  getTransactions,
  getWallets,
  updateTransaction,
  updateWallet
} from "../controllers/index.js";

import { sendJson } from "../server/index.js";

export const router = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const parts = pathname.split("/").filter(Boolean);

  if (req.method === "OPTIONS") {
    return sendJson(res, 204, {});
  }

  if (req.method === "GET" && pathname === "/") {
    return sendJson(res, 200, {
      message: "Welcome to SpendWise Backend API"
    });
  }

  if (req.method === "GET" && pathname === "/health") {
    return sendJson(res, 200, {
      message: "SpendWise API is running."
    });
  }

  if (req.method === "GET" && parts[0] === "categories") {
    const type = url.searchParams.get("type");

    return getCategories(req, res, type);
  }

  if (parts[0] === "wallets") {
    const walletId = parts[1];

    if (req.method === "GET" && !walletId) {
      return getWallets(req, res);
    }

    if (req.method === "POST" && !walletId) {
      return createWallet(req, res);
    }

    if ((req.method === "PUT" || req.method === "PATCH") && walletId) {
      return updateWallet(req, res, walletId);
    }

    if (req.method === "DELETE" && walletId) {
      return deleteWallet(req, res, walletId);
    }

    return sendJson(res, 405, {
      message: "Method wallet tidak didukung."
    });
  }

  if (parts[0] === "transactions") {
    const transactionId = parts[1];

    if (req.method === "GET" && !transactionId) {
      return getTransactions(req, res);
    }

    if (req.method === "POST" && !transactionId) {
      return createTransaction(req, res);
    }

    if ((req.method === "PUT" || req.method === "PATCH") && transactionId) {
      return updateTransaction(req, res, transactionId);
    }

    if (req.method === "DELETE" && transactionId) {
      return deleteTransaction(req, res, transactionId);
    }

    return sendJson(res, 405, {
      message: "Method transaksi tidak didukung."
    });
  }

  return sendJson(res, 404, {
    message: "Endpoint tidak ditemukan."
  });
};