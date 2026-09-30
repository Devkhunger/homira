import "server-only";

/** Sends an OTP SMS through MSG91. Without keys (local development) it prints the OTP to the console. */
export async function sendOtpSms(phone: string, otp: string) {
  const key = process.env.MSG91_AUTH_KEY;
  const template = process.env.MSG91_TEMPLATE_ID;
  if (!key || !template) {
    if (process.env.NODE_ENV === "production") throw new Error("SMS provider is not configured");
    console.log(`\n[DEV OTP] ${phone} → ${otp}\n`);
    return;
  }
  const res = await fetch("https://control.msg91.com/api/v5/otp", {
    method: "POST",
    headers: { authkey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ template_id: template, mobile: `91${phone}`, otp }),
  });
  if (!res.ok) throw new Error("Could not send OTP, please try again");
}
