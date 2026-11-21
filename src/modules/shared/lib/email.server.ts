import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendAdminEmail({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<{ success: boolean; provider: string; error?: string }> {
  // 1. Try Gmail SMTP via Nodemailer
  const rawUser = process.env.GMAIL_USER;
  const rawPass = process.env.GMAIL_APP_PASSWORD;

  const gmailUser = rawUser ? rawUser.trim() : "";
  // Strip all whitespace/spaces from Gmail App Password
  const gmailPass = rawPass ? rawPass.replace(/\s+/g, "") : "";

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      await transporter.sendMail({
        from: `"معرض ولاد العم للسيارات" <${gmailUser}>`,
        to,
        subject,
        html,
      });

      return { success: true, provider: "gmail_smtp" };
    } catch (err: any) {
      console.error("[Email Error - Gmail SMTP]:", err);
      const errMsg = err?.message || "فشل إرسال الإيميل عبر Gmail SMTP";
      return { success: false, provider: "gmail_smtp", error: errMsg };
    }
  }

  // 2. Try Resend if configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ولاد العم للسيارات <onboarding@resend.dev>",
          to,
          subject,
          html,
        }),
      });

      if (res.ok) {
        return { success: true, provider: "resend" };
      }
      const data = await res.json();
      console.error("[Email Error - Resend]:", data);
      return { success: false, provider: "resend", error: data?.message || "Resend error" };
    } catch (err: any) {
      console.error("[Email Error - Resend]:", err);
      return { success: false, provider: "resend", error: err?.message };
    }
  }

  // 3. Fallback when credentials are not yet configured in .env
  const msg = "لم يتم ضبط GMAIL_USER و GMAIL_APP_PASSWORD في ملف .env.local";
  console.log(`[Installment Email Notice] To: ${to} | Subject: ${subject} (${msg})`);
  return { success: false, provider: "none", error: msg };
}
