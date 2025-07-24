const getNewsLetterTemplate = ({ email }) => `
  <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap" rel="stylesheet">
    </head>
    <body style="font-family: 'Poppins', Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 32px;">
        <h2 style="color: #1B1E69;">Welcome to the Bellevivre Ltd Newsletter!</h2>
        <p style="font-size: 18px; color: #333;">Hi${email ? `, ${email}` : ''}!</p>
        <p style="font-size: 16px; color: #333;">Thank you for subscribing to our newsletter. You'll now receive updates, news, and exclusive offers directly to your inbox.</p>
        <p style="font-size: 16px; color: #333;">If you did not subscribe, you can safely ignore this email.</p>
        <br/>
        <p style="color: #93999F; font-size: 15px;">&copy; Bellevivre Ltd</p>
      </div>
    </body>
  </html>
`;

export default getNewsLetterTemplate;
