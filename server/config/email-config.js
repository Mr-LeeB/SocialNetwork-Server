const nodeMailer = require('nodemailer');

const transporter = nodeMailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const SendMail = (msg) => {
  transporter.sendMail(msg, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = {
  SenderMailServer: () => {
    transporter.verify((error, success) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Server is ready to take our messages');
      }
    });
  },

  sendMailForgotPassword: (email, code) => {
    const msg = {
      to: email,
      from: `"DevHub" <${process.env.EMAIL_USER}>`,
      subject: 'Reset password',
      text: 'Reset password',
      html: `<strong>Reset password</strong>
              <p>Code: ${code}</p>`,
    };
    return SendMail(msg);
  },
};
