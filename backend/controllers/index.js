import { randomUUID } from "node:crypto";
import { readBody, readUserData, sendJson, writeUserData } from "../server/index.js";

const expenseCategories = [
  "Makanan",
  "Transportasi",
  "Belanja",
  "Tagihan",
  "Pendidikan",
  "Kesehatan",
  "Hiburan",
  "Lainnya"
];

const incomeCategories = [
  "Gaji",
  "Bonus",
  "Hadiah",
  "Investasi",
  "Lainnya"
];

const createId = (prefix) => {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
};

const isValidNumber = (value) => {
  return Number.isFinite(Number(value));
};

const changeWalletAmount = (wallets, walletName, amount) => {
  let isWalletFound = false;

  const updatedWallets = wallets.map((wallet) => {
    if (wallet.name !== walletName) {
      return wallet;
    }

    isWalletFound = true;

    return {
      ...wallet,
      amount: wallet.amount + amount
    };
  });

  return {
    isWalletFound,
    updatedWallets
  };
};

const validateTransactionPayload = (body, transactionId) => {
  const type = body.type?.trim();
  const descript = body.descript?.trim();
  const amount = Math.abs(Number(body.amount));
  const category = body.category?.trim() || "";
  const date = body.date?.trim();
  const wallet = body.wallet?.trim();

  if (!type || !["Pemasukan", "Pengeluaran"].includes(type)) {
    return {
      error: "Jenis transaksi harus Pemasukan atau Pengeluaran."
    };
  }

  if (!descript || !date || !wallet) {
    return {
      error: "Deskripsi, tanggal, dan wallet wajib diisi."
    };
  }

  if (!isValidNumber(body.amount) || amount <= 0) {
    return {
      error: "Amount harus berupa angka lebih dari 0."
    };
  }

  if (type === "Pengeluaran" && !expenseCategories.includes(category)) {
    return {
      error: "Category pengeluaran tidak valid."
    };
  }

  if (type === "Pemasukan" && category && !incomeCategories.includes(category)) {
    return {
      error: "Category pemasukan tidak valid."
    };
  }

  const finalAmount = type === "Pemasukan" ? amount : -amount;

  return {
    transaction: {
      id: transactionId || createId("trc"),
      type,
      descript,
      amount: finalAmount,
      category,
      date,
      wallet
    }
  };
};

export const getCategories = async (req, res, type) => {
  const categories = type === "Pemasukan" ? incomeCategories : expenseCategories;

  return sendJson(res, 200, {
    data: categories
  });
};

export const getWallets = async (req, res) => {
  const userData = await readUserData();

  return sendJson(res, 200, {
    data: userData.wallets
  });
};

export const createWallet = async (req, res) => {
  const userData = await readUserData();
  const body = await readBody(req);

  const name = body.name?.trim();
  const amount = Number(body.amount ?? 0);

  if (!name) {
    return sendJson(res, 400, {
      message: "Nama wallet wajib diisi."
    });
  }

  if (!isValidNumber(amount)) {
    return sendJson(res, 400, {
      message: "Amount harus berupa angka."
    });
  }

  const isWalletExist = userData.wallets.some((wallet) => {
    return wallet.name.toLowerCase() === name.toLowerCase();
  });

  if (isWalletExist) {
    return sendJson(res, 409, {
      message: "Wallet dengan nama tersebut sudah ada."
    });
  }

  const newWallet = {
    id: createId("wlt"),
    name,
    amount
  };

  userData.wallets.push(newWallet);

  await writeUserData(userData);

  return sendJson(res, 201, {
    message: "Wallet berhasil dibuat.",
    data: newWallet
  });
};

export const updateWallet = async (req, res, walletId) => {
  const userData = await readUserData();
  const body = await readBody(req);

  const selectedWallet = userData.wallets.find((wallet) => {
    return wallet.id === walletId;
  });

  if (!selectedWallet) {
    return sendJson(res, 404, {
      message: "Wallet tidak ditemukan."
    });
  }

  const name = body.name?.trim() || selectedWallet.name;
  const amount = body.amount === undefined ? selectedWallet.amount : Number(body.amount);

  if (!isValidNumber(amount)) {
    return sendJson(res, 400, {
      message: "Amount harus berupa angka."
    });
  }

  userData.wallets = userData.wallets.map((wallet) => {
    if (wallet.id !== walletId) {
      return wallet;
    }

    return {
      ...wallet,
      name,
      amount
    };
  });

  await writeUserData(userData);

  const updatedWallet = userData.wallets.find((wallet) => {
    return wallet.id === walletId;
  });

  return sendJson(res, 200, {
    message: "Wallet berhasil diperbarui.",
    data: updatedWallet
  });
};

export const deleteWallet = async (req, res, walletId) => {
  const userData = await readUserData();

  const selectedWallet = userData.wallets.find((wallet) => {
    return wallet.id === walletId;
  });

  if (!selectedWallet) {
    return sendJson(res, 404, {
      message: "Wallet tidak ditemukan."
    });
  }

  const isWalletUsed = userData.transactions.some((transaction) => {
    return transaction.wallet === selectedWallet.name;
  });

  if (isWalletUsed) {
    return sendJson(res, 409, {
      message: "Wallet tidak bisa dihapus karena masih dipakai transaksi."
    });
  }

  userData.wallets = userData.wallets.filter((wallet) => {
    return wallet.id !== walletId;
  });

  await writeUserData(userData);

  return sendJson(res, 200, {
    message: "Wallet berhasil dihapus."
  });
};

export const getTransactions = async (req, res) => {
  const userData = await readUserData();

  return sendJson(res, 200, {
    data: userData.transactions
  });
};

export const createTransaction = async (req, res) => {
  const userData = await readUserData();
  const body = await readBody(req);

  const result = validateTransactionPayload(body);

  if (result.error) {
    return sendJson(res, 400, {
      message: result.error
    });
  }

  const newTransaction = result.transaction;

  const walletResult = changeWalletAmount(
    userData.wallets,
    newTransaction.wallet,
    newTransaction.amount
  );

  if (!walletResult.isWalletFound) {
    return sendJson(res, 404, {
      message: "Wallet tidak ditemukan."
    });
  }

  userData.wallets = walletResult.updatedWallets;
  userData.transactions.push(newTransaction);

  await writeUserData(userData);

  return sendJson(res, 201, {
    message: "Transaksi berhasil dibuat.",
    data: newTransaction
  });
};

export const updateTransaction = async (req, res, transactionId) => {
  const userData = await readUserData();
  const body = await readBody(req);

  const oldTransaction = userData.transactions.find((transaction) => {
    return transaction.id === transactionId;
  });

  if (!oldTransaction) {
    return sendJson(res, 404, {
      message: "Transaksi tidak ditemukan."
    });
  }

  const result = validateTransactionPayload(body, transactionId);

  if (result.error) {
    return sendJson(res, 400, {
      message: result.error
    });
  }

  const newTransaction = result.transaction;

  const rollbackOldWallet = changeWalletAmount(
    userData.wallets,
    oldTransaction.wallet,
    -oldTransaction.amount
  );

  if (!rollbackOldWallet.isWalletFound) {
    return sendJson(res, 404, {
      message: "Wallet transaksi lama tidak ditemukan."
    });
  }

  const applyNewWallet = changeWalletAmount(
    rollbackOldWallet.updatedWallets,
    newTransaction.wallet,
    newTransaction.amount
  );

  if (!applyNewWallet.isWalletFound) {
    return sendJson(res, 404, {
      message: "Wallet transaksi baru tidak ditemukan."
    });
  }

  userData.wallets = applyNewWallet.updatedWallets;

  userData.transactions = userData.transactions.map((transaction) => {
    if (transaction.id !== transactionId) {
      return transaction;
    }

    return newTransaction;
  });

  await writeUserData(userData);

  return sendJson(res, 200, {
    message: "Transaksi berhasil diperbarui.",
    data: newTransaction
  });
};

export const deleteTransaction = async (req, res, transactionId) => {
  const userData = await readUserData();

  const selectedTransaction = userData.transactions.find((transaction) => {
    return transaction.id === transactionId;
  });

  if (!selectedTransaction) {
    return sendJson(res, 404, {
      message: "Transaksi tidak ditemukan."
    });
  }

  const walletResult = changeWalletAmount(
    userData.wallets,
    selectedTransaction.wallet,
    -selectedTransaction.amount
  );

  if (!walletResult.isWalletFound) {
    return sendJson(res, 404, {
      message: "Wallet transaksi tidak ditemukan."
    });
  }

  userData.wallets = walletResult.updatedWallets;

  userData.transactions = userData.transactions.filter((transaction) => {
    return transaction.id !== transactionId;
  });

  await writeUserData(userData);

  return sendJson(res, 200, {
    message: "Transaksi berhasil dihapus."
  });
};