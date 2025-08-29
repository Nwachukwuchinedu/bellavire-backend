export const adminRegistrationTokenTemplate = ({
    firstName,
    lastName,
    token,
    expiresAt,
    generatedBy,
    registrationUrl = 'http://localhost:3000/admin/register'
}) => {
    const expiryDate = new Date(expiresAt).toLocaleString();

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Registration Invitation</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #007bff;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
            }
            .title {
                color: #333;
                font-size: 24px;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #666;
                font-size: 16px;
            }
            .content {
                margin-bottom: 30px;
            }
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #333;
            }
            .message {
                font-size: 16px;
                margin-bottom: 25px;
                color: #555;
            }
            .token-section {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #007bff;
                margin: 25px 0;
            }
            .token-label {
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .token {
                font-family: 'Courier New', monospace;
                font-size: 18px;
                background-color: #e9ecef;
                padding: 15px;
                border-radius: 5px;
                text-align: center;
                letter-spacing: 2px;
                color: #333;
                word-break: break-all;
                border: 1px solid #dee2e6;
            }
            .expiry-info {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                font-size: 14px;
            }
            .steps {
                background-color: #e7f3ff;
                padding: 20px;
                border-radius: 8px;
                margin: 25px 0;
            }
            .steps h3 {
                color: #007bff;
                margin-bottom: 15px;
                font-size: 18px;
            }
            .step {
                margin-bottom: 10px;
                padding-left: 20px;
                position: relative;
            }
            .step:before {
                content: counter(step-counter);
                counter-increment: step-counter;
                position: absolute;
                left: 0;
                top: 0;
                background-color: #007bff;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
            }
            .steps {
                counter-reset: step-counter;
            }
            .cta-button {
                display: inline-block;
                background-color: #007bff;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
                transition: background-color 0.3s;
            }
            .cta-button:hover {
                background-color: #0056b3;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                color: #666;
                font-size: 14px;
            }
            .warning {
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                font-size: 14px;
            }
            .generated-by {
                background-color: #d1ecf1;
                border: 1px solid #bee5eb;
                color: #0c5460;
                padding: 10px;
                border-radius: 5px;
                margin: 15px 0;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏠 Real Estate Admin</div>
                <div class="title">Admin Registration Invitation</div>
                <div class="subtitle">You've been invited to join our admin team</div>
            </div>

            <div class="content">
                <div class="greeting">Hello ${firstName} ${lastName},</div>
                
                <div class="message">
                    You have been invited to join our Real Estate platform as an administrator. 
                    An owner has generated a secure registration token for your email address.
                </div>

                <div class="generated-by">
                    <strong>Invited by:</strong> ${generatedBy.firstName} ${generatedBy.lastName} (${generatedBy.email})
                </div>

                <div class="token-section">
                    <div class="token-label">Your Registration Token</div>
                    <div class="token">${token}</div>
                </div>

                <div class="expiry-info">
                    ⏰ <strong>Important:</strong> This token expires on ${expiryDate}. 
                    Please complete your registration before this time.
                </div>

                <div class="steps">
                    <h3>How to Complete Your Registration:</h3>
                    <div class="step">Visit our admin registration page</div>
                    <div class="step">Enter your personal information (name, email, phone, password)</div>
                    <div class="step">Paste the registration token above</div>
                    <div class="step">Click "Register" to create your admin account</div>
                </div>

                <div style="text-align: center;">
                    <a href="${registrationUrl}" class="cta-button">
                        Complete Registration
                    </a>
                </div>

                <div class="warning">
                    ⚠️ <strong>Security Notice:</strong> 
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>This token is valid for one-time use only</li>
                        <li>Do not share this token with anyone</li>
                        <li>The token will expire automatically after 24 hours</li>
                        <li>If you didn't request this invitation, please ignore this email</li>
                    </ul>
                </div>
            </div>

            <div class="footer">
                <p>This is an automated message from the Real Estate Admin System.</p>
                <p>If you have any questions, please contact your system administrator.</p>
                <p>&copy; ${new Date().getFullYear()} Real Estate Platform. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
