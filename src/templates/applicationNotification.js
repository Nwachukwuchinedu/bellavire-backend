/**
 * Email templates for tenant application notifications
 */

/**
 * Create email template for new application notification to landlord
 */
export const createNewApplicationEmail = ({ landlordName, propertyName, tenantName, tenantEmail, tenantPhone }) => {
    const subject = `New Rental Application - ${propertyName}`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Rental Application</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background-color: #4CAF50;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 5px 5px 0 0;
                }
                .content {
                    background-color: #f9f9f9;
                    padding: 20px;
                    border-radius: 0 0 5px 5px;
                }
                .button {
                    display: inline-block;
                    background-color: #4CAF50;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 10px 0;
                }
                .info-box {
                    background-color: white;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    padding: 15px;
                    margin: 15px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>New Rental Application</h1>
            </div>
            
            <div class="content">
                <p>Dear ${landlordName},</p>
                
                <p>A new application has been submitted for your property: <strong>${propertyName}</strong></p>
                
                <div class="info-box">
                    <h3>Applicant Information:</h3>
                    <p><strong>Name:</strong> ${tenantName}</p>
                    <p><strong>Email:</strong> ${tenantEmail}</p>
                    <p><strong>Phone:</strong> ${tenantPhone}</p>
                </div>
                
                <p>Please review the application in your dashboard to see all the details including:</p>
                <ul>
                    <li>Employment information</li>
                    <li>Background check status</li>
                    <li>Submitted documents</li>
                    <li>Desired move-in date</li>
                </ul>
                
                <p>You can approve or cancel the application from your dashboard.</p>
                
                <p>Thank you for using Bellavire!</p>
                
                <div class="footer">
                    <p>This is an automated message from Bellavire. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    return { subject, html };
};

/**
 * Create email template for application approval notification to tenant
 */
export const createApplicationApprovedEmail = ({ tenantName, propertyName, propertyAddress }) => {
    const subject = `Application Approved - ${propertyName}`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Application Approved</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background-color: #4CAF50;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 5px 5px 0 0;
                }
                .content {
                    background-color: #f9f9f9;
                    padding: 20px;
                    border-radius: 0 0 5px 5px;
                }
                .button {
                    display: inline-block;
                    background-color: #4CAF50;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 10px 0;
                }
                .info-box {
                    background-color: white;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    padding: 15px;
                    margin: 15px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🎉 Congratulations!</h1>
                <h2>Your Application Has Been Approved</h2>
            </div>
            
            <div class="content">
                <p>Dear ${tenantName},</p>
                
                <p>Great news! Your application for <strong>${propertyName}</strong> has been approved.</p>
                
                <div class="info-box">
                    <h3>Property Details:</h3>
                    <p><strong>Property:</strong> ${propertyName}</p>
                    <p><strong>Address:</strong> ${propertyAddress}</p>
                </div>
                
                <p>You can now proceed with the payment and lease signing process. The landlord will contact you soon with next steps.</p>
                
                <p>Thank you for choosing Bellavire!</p>
                
                <div class="footer">
                    <p>This is an automated message from Bellavire. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    return { subject, html };
};

/**
 * Create email template for application cancellation notification to tenant
 */
export const createApplicationCancelledEmail = ({ tenantName, propertyName, propertyAddress }) => {
    const subject = `Application Cancelled - ${propertyName}`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Application Cancelled</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background-color: #f44336;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 5px 5px 0 0;
                }
                .content {
                    background-color: #f9f9f9;
                    padding: 20px;
                    border-radius: 0 0 5px 5px;
                }
                .button {
                    display: inline-block;
                    background-color: #4CAF50;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 10px 0;
                }
                .info-box {
                    background-color: white;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    padding: 15px;
                    margin: 15px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Application Update</h1>
            </div>
            
            <div class="content">
                <p>Dear ${tenantName},</p>
                
                <p>Your application for <strong>${propertyName}</strong> has been cancelled.</p>
                
                <div class="info-box">
                    <h3>Property Details:</h3>
                    <p><strong>Property:</strong> ${propertyName}</p>
                    <p><strong>Address:</strong> ${propertyAddress}</p>
                </div>
                
                <p>We encourage you to apply for other properties that may be a better fit. There are many great options available on Bellavire.</p>
                
                <p>Thank you for your interest in our property.</p>
                
                <div class="footer">
                    <p>This is an automated message from Bellavire. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    return { subject, html };
}; 