const BASE_URL = "http://localhost:5000";

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Terjadi kesalahan saat menghubungi server.");
  }

  return result;
};

export const getWallets = async () => {
  return request("/wallets");
};

export const createWallet = async (wallet) => {
  return request("/wallets", {
    method: "POST",
    body: JSON.stringify(wallet)
  });
};

export const updateWallet = async (walletId, wallet) => {
  return request(`/wallets/${walletId}`, {
    method: "PATCH",
    body: JSON.stringify(wallet)
  });
};

export const deleteWallet = async (walletId) => {
  return request(`/wallets/${walletId}`, {
    method: "DELETE"
  });
};

export const getCategories = async (type) => {
  return request(`/categories?type=${type}`);
};

export const getTransactions = async () => {
  return request("/transactions");
};

export const createTransaction = async (transaction) => {
  return request("/transactions", {
    method: "POST",
    body: JSON.stringify(transaction)
  });
};

export const updateTransaction = async (transactionId, transaction) => {
  return request(`/transactions/${transactionId}`, {
    method: "PATCH",
    body: JSON.stringify(transaction)
  });
};

export const deleteTransaction = async (transactionId) => {
  return request(`/transactions/${transactionId}`, {
    method: "DELETE"
  });
};