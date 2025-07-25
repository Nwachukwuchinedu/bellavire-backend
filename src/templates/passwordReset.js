const getPasswordResetSuccessTemplate = ({ name }) => `
  <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap" rel="stylesheet">
    </head>
    <body style="font-family: 'Poppins', Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 32px;">
        <h2 style="color: #1B1E69;">Your password has been reset</h2>
        <p style="font-size: 18px; color: #333;">Hi${name ? `, ${name}` : ''}!</p>
        <p style="font-size: 16px; color: #333;">Your password has been reset successfully. If you did not perform this action, please contact our support team immediately.</p>
        <br/>
        <p style="color: #93999F; font-size: 15px;">&copy; Bellevivre Ltd</p>
      </div>
    </body>
  </html>
`;

export default getPasswordResetSuccessTemplate;