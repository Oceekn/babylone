import { api } from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  is_active: boolean;
  last_transaction_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit' | 'payment' | 'transfer' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  currency: string;
  description?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

class WalletService {
  // Obtenir le wallet de l'utilisateur
  async getWallet(): Promise<Wallet> {
    return api.get<Wallet>(API_ENDPOINTS.WALLET.GET_WALLET);
  }

  // Obtenir le solde
  async getBalance(): Promise<{ balance: number; currency: string; user_id: string }> {
    return api.get<{ balance: number; currency: string; user_id: string }>(
      API_ENDPOINTS.WALLET.GET_BALANCE
    );
  }

  // Obtenir les transactions
  async getTransactions(cursor?: string, limit?: number): Promise<{ transactions: Transaction[]; nextCursor?: string }> {
    const params: any = {};
    if (cursor) params.cursor = cursor;
    if (limit) params.limit = limit.toString();

    return api.get<{ transactions: Transaction[]; nextCursor?: string }>(
      API_ENDPOINTS.TRANSACTIONS.MY_TRANSACTIONS,
      { params }
    );
  }

  // Obtenir une transaction par ID
  async getTransactionById(transactionId: string): Promise<Transaction> {
    return api.get<Transaction>(API_ENDPOINTS.TRANSACTIONS.GET_BY_ID(transactionId));
  }

  // Rechargement simule (MVP)
  async topup(amount: number): Promise<{ message: string; balance: number; currency: string }> {
    return api.post<{ message: string; balance: number; currency: string }>(
      API_ENDPOINTS.WALLET.TOPUP,
      { amount }
    );
  }
}

export const walletService = new WalletService();
export default walletService;

