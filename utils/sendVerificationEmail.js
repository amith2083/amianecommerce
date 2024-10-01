import nodemailer from 'nodemailer';

async function sendVerificationEmail(email, otp = null, resetLink = null)  {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.PASSWORD,
      },
    });
    let mailOptions={};

    // const mailOptions = {
    //   from: process.env.EMAIL_ID,
    //   to: email,
    //   subject: 'Your OTP code',
    //   text: `Your otp code is ${otp}`
    // };
    if (otp) {
      mailOptions = {
        from: process.env.EMAIL_ID,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`,
      };
    } else if (resetLink) {
      mailOptions = {
        from: process.env.EMAIL_ID,
        to: email,
        subject: 'Password Reset Request',
        html: `Click <a href="${resetLink}">here</a> to reset your password.`,
      };
    }
await transporter.sendMail(mailOptions)
    console.log('Email sent successfully');
  } catch (error) {
    console.log('Email not sent');
    console.error(error);
  }
};

export default sendVerificationEmail;
