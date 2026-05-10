import axios from "axios";

const MPESA_ENV = process.env.MPESA_ENV || "sandbox";
const BASE_URL =
  MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

async function getAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );

  const response = await axios.get(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${credentials}` },
    }
  );

  return response.data.access_token;
}

function getTimestamp() {
  const now = new Date();
  return now
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);
}

function getPassword(timestamp) {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

/**
 * Initiate M-Pesa STK Push (C2B) to collect payment from client
 */
export async function initiateSTKPush({ phone, amount, taskId, accountRef }) {
  const token = await getAccessToken();
  const timestamp = getTimestamp();
  const password = getPassword(timestamp);
  const shortcode = process.env.MPESA_SHORTCODE;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;

  // Normalize phone number to 254 format
  const normalizedPhone = phone.replace(/^0/, "254").replace(/^\+/, "");

  const response = await axios.post(
    `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(amount),
      PartyA: normalizedPhone,
      PartyB: shortcode,
      PhoneNumber: normalizedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountRef || `TASK-${taskId}`,
      TransactionDesc: `Payment for Task ${taskId}`,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
}

/**
 * Send payment to Tasker via M-Pesa B2C
 */
export async function sendB2CPayment({ phone, amount, taskId }) {
  const token = await getAccessToken();
  const shortcode = process.env.MPESA_SHORTCODE;
  const normalizedPhone = phone.replace(/^0/, "254").replace(/^\+/, "");

  const response = await axios.post(
    `${BASE_URL}/mpesa/b2c/v1/paymentrequest`,
    {
      InitiatorName: "TaskBridge",
      SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL || "",
      CommandID: "BusinessPayment",
      Amount: Math.floor(amount),
      PartyA: shortcode,
      PartyB: normalizedPhone,
      Remarks: `Payout for Task ${taskId}`,
      QueueTimeOutURL: `${process.env.MPESA_CALLBACK_URL}/b2c/timeout`,
      ResultURL: `${process.env.MPESA_CALLBACK_URL}/b2c/result`,
      Occasion: `Task-${taskId}`,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
}
