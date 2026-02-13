import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

export interface CinetPayInitRequest {
  amount: number;
  currency: string;
  description: string;
  customer_name: string;
  customer_surname: string;
  customer_phone_number: string;
  customer_email?: string;
  notify_url: string;
  return_url: string;
  metadata?: Record<string, any>;
}

export interface CinetPayInitResponse {
  code: string;
  message: string;
  data: {
    payment_url: string;
    payment_token: string;
  };
}

export interface CinetPayWebhookPayload {
  cpm_site_id: string;
  cpm_trans_id: string;
  cpm_trans_date: string;
  cpm_amount: string;
  cpm_currency: string;
  signature: string;
  payment_method: string;
  cel_phone_num: string;
  cpm_custom: string;
  cpm_payid: string;
  cpm_pay_date: string;
  cpm_pay_time: string;
  cpm_error_message: string;
  cpm_phone_prefixe: string;
  cpm_libelle: string;
  cpm_result: string; // 00 = success
  cpm_designation: string;
}

@Injectable()
export class CinetPayProvider {
  private apiKey: string;
  private siteId: string;
  private secretKey: string;
  private apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('CINETPAY_API_KEY', '');
    this.siteId = this.configService.get<string>('CINETPAY_SITE_ID', '');
    this.secretKey = this.configService.get<string>('CINETPAY_SECRET_KEY', '');
    this.apiUrl = 'https://api.cinetpay.com/v2';
  }

  // Générer une signature pour la requête
  private generateSignature(data: string): string {
    return crypto.createHash('sha256').update(data + this.secretKey).digest('hex');
  }

  // Vérifier la signature du webhook
  verifyWebhookSignature(payload: CinetPayWebhookPayload): boolean {
    const dataToSign = `${payload.cpm_site_id}${payload.cpm_trans_id}${payload.cpm_trans_date}${payload.cpm_amount}${payload.cpm_currency}${this.secretKey}`;
    const expectedSignature = crypto.createHash('sha256').update(dataToSign).digest('hex');
    return expectedSignature.toLowerCase() === payload.signature.toLowerCase();
  }

  // Initialiser un paiement
  async initializePayment(request: CinetPayInitRequest): Promise<CinetPayInitResponse> {
    const transactionId = `BABYLONE_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const payload = {
      apikey: this.apiKey,
      site_id: this.siteId,
      transaction_id: transactionId,
      amount: request.amount,
      currency: request.currency,
      description: request.description,
      customer_name: request.customer_name,
      customer_surname: request.customer_surname,
      customer_phone_number: request.customer_phone_number,
      customer_email: request.customer_email || '',
      notify_url: request.notify_url,
      return_url: request.return_url,
      metadata: request.metadata || {},
    };

    try {
      const response = await axios.post(
        `${this.apiUrl}/payment`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new Error(`CinetPay initialization failed: ${error.message}`);
    }
  }

  // Vérifier le statut d'un paiement
  async checkPaymentStatus(transactionId: string): Promise<any> {
    const payload = {
      apikey: this.apiKey,
      site_id: this.siteId,
      transaction_id: transactionId,
    };

    try {
      const response = await axios.post(
        `${this.apiUrl}/payment/check`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new Error(`CinetPay status check failed: ${error.message}`);
    }
  }
}

