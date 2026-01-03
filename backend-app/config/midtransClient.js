import midtransClient from "midtrans-client";

const isProd = String(process.env.MIDTRANS_IS_PRODUCTION) === "true";
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

// Helper untuk mendapatkan instance Snap client (Sandbox/Production sesuai env)
export function getSnapClient() {
  return new midtransClient.Snap({
    isProduction: isProd,
    serverKey,
    clientKey,
  });
}

export default getSnapClient;
