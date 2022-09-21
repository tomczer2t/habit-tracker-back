import { createTransport } from 'nodemailer';
import { config } from '../../config/config';

const mailConfig = config.NODE_ENV === 'develop' ? {
  host: '127.0.0.1',
  port: 2500,
  secure: false,
  auth: {
    user: 'username',
    pass: 'password',
  },
} : {
  host: 'mail.habit-tracker.networkmanager.pl',
  port: 587,
  secure: true,
  auth: {
    user: config.MAIL_USER,
    pass: config.MAIL_PASS,
  },
};

const transporter = createTransport(mailConfig, {
  from: 'habit.tracker@habit-tracker.networkmanager.pl',
});

export const sendMail = async (to: string, subject: string, html: string) => {
  return await transporter.sendMail({ to, subject, html });
};
