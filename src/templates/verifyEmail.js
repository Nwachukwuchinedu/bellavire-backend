const getVerifyEmailTemplate = ({ name, otp }) => `
  <div style="font-family: Arial, sans-serif;">
    <h2>Email Verification</h2>
    <p>Hello ${name || "User"},</p>
    <p>Your verification code is:</p>
    <h1 style="color: #2e6c80;">${otp}</h1>
    <p>This code will expire in 15 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
    <br/>
    <p>Thank you,<br/>Protege Journey Team</p>
  </div>
`;

export default getVerifyEmailTemplate;
