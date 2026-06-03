const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE = "https://api.paystack.co";

interface PaystackMetadata {
  customer_name?: string;
  phone?: string;
  address?: string;
  subtotal?: number;
  delivery_fee?: number;
  total?: number;
  items?: unknown[];
  [key: string]: unknown;
}

interface PaystackCustomer {
  email?: string;
}

export interface PaystackTransaction {
  status: string;
  metadata?: PaystackMetadata;
  customer?: PaystackCustomer;
}

interface InitializePaymentParams {
  email: string;
  amountNGN: number;
  metadata?: PaystackMetadata;
  callbackUrl?: string;
}

interface InitializePaymentResponse {
  authorization_url: string;
  reference: string;
  access_code: string;
}

/**
 * Initialize a Paystack transaction
 * @param {object} params
 * @returns {Promise<{authorization_url: string, reference: string}>}
 */
export async function initializePayment({
  email,
  amountNGN,
  metadata,
  callbackUrl,
}: InitializePaymentParams): Promise<InitializePaymentResponse> {
  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amountNGN * 100), // Paystack expects kobo
      metadata,
      callback_url: callbackUrl,
    }),
  });

  const data = await response.json();

  if (!data.status) {
    throw new Error(data.message || "Paystack initialization failed");
  }

  return {
    authorization_url: data.data.authorization_url,
    reference: data.data.reference,
    access_code: data.data.access_code,
  };
}

/**
 * Verify a Paystack transaction by reference
 * @param {string} reference
 * @returns {Promise<object>}
 */
export async function verifyPayment(
  reference: string,
): Promise<PaystackTransaction> {
  const response = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    },
  );

  const data = await response.json();

  if (!data.status) {
    throw new Error(data.message || "Paystack verification failed");
  }

  return data.data;
}
