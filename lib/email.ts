import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM || 'Sportbnb <no-reply@apps.valentepro.com>';

if (!smtpHost || !smtpUser || !smtpPass) {
  console.warn('SMTP env vars not fully set. Email sending will fail until configured.');
}

export async function sendVerificationEmail(to: string, token: string) {
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.error('Missing SMTP configuration, cannot send verification email');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const verifyUrl = `${process.env.NEXTAUTH_URL || ''}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: emailFrom,
    to,
    subject: 'Conferma il tuo account Sportbnb',
    text: `Clicca su questo link per attivare il tuo account: ${verifyUrl}`,
    html: `<p>Ciao,</p><p>per attivare il tuo account clicca qui:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>Se non hai richiesto tu la registrazione, ignora questa email.</p>`,
  });
}
