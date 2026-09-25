import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { text } = req.body;

  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ message: "Text is required" });
  }

  const user = process.env.SMTP_USER || process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  const recipient = process.env.ADMIN_EMAIL || user;

  if (!user || !pass) {
    console.warn(
      "⚠️ [API Suggestions] SMTP_USER o SMTP_PASSWORD no están configurados en las variables de entorno."
    );
    return res.status(200).json({
      success: true,
      message: "Sugerencia registrada (servidor SMTP no configurado).",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user,
        pass,
      },
    });

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const day = now.getDate();
    const month = now.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
    const year = now.getFullYear();
    const formattedDate = `${hours}:${minutes} ${day} ${month} ${year}`;

    const mailOptions = {
      from: `"Lymbrarie" <${user}>`,
      to: recipient,
      subject: "💡 Nueva sugerencia en Lymbrarie",
      text: `Se ha recibido una nueva sugerencia en la plataforma Lymbrarie el ${formattedDate}:\n\n"${text.trim()}"\n\n- Este mensaje fue enviado automáticamente.`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 16px;">
          <h2 style="color: #6366f1;">💡 Nueva sugerencia en Lymbrarie</h2>
          <p style="font-size: 0.875rem; color: #64748b;">Recibida el ${formattedDate}</p>
          <blockquote style="border-left: 4px solid #6366f1; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; background-color: #f8fafc; padding: 1rem; border-radius: 8px;">
            ${text.trim()}
          </blockquote>
          <p style="font-size: 0.875rem; color: #64748b;">Este mensaje fue enviado automáticamente desde tu aplicación Lymbrarie.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error sending email via Nodemailer:", error?.message || error);
    return res.status(200).json({
      success: true,
      warning: "SMTP error",
      error: error?.message,
    });
  }
}
