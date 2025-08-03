/**
 * Email templates for agent contact functionality
 */

/**
 * Create email template for agent inquiry
 * @param {Object} data - Inquiry data
 * @param {string} data.tenantName - Tenant's full name
 * @param {string} data.tenantEmail - Tenant's email address
 * @param {string} data.tenantPhone - Tenant's phone number
 * @param {string} data.message - Tenant's message
 * @param {boolean} data.wantFinancingInfo - Whether tenant wants financing info
 * @returns {Object} Email template with subject and HTML content
 */
export const createAgentInquiryEmail = (data) => {
    const { tenantName, tenantEmail, tenantPhone, message, wantFinancingInfo } = data;
    
    const subject = `New Property Inquiry from ${tenantName}`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Property Inquiry</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
                .content { background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 5px; }
                .contact-info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .message { background-color: #ffffff; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
                .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; }
                .label { font-weight: bold; color: #495057; }
                .value { color: #212529; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2 style="margin: 0; color: #007bff;">New Property Inquiry</h2>
                    <p style="margin: 5px 0 0 0; color: #6c757d;">Bellavire Platform</p>
                </div>
                
                <div class="content">
                    <h3>Contact Information</h3>
                    <div class="contact-info">
                        <p><span class="label">Name:</span> <span class="value">${tenantName}</span></p>
                        <p><span class="label">Email:</span> <span class="value">${tenantEmail}</span></p>
                        <p><span class="label">Phone:</span> <span class="value">${tenantPhone}</span></p>
                        <p><span class="label">Wants Financing Information:</span> <span class="value">${wantFinancingInfo ? 'Yes' : 'No'}</span></p>
                    </div>
                    
                    <h3>Message</h3>
                    <div class="message">
                        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                    </div>
                    
                    <p style="margin-top: 20px;">
                        <strong>Please respond directly to the tenant at:</strong> <a href="mailto:${tenantEmail}">${tenantEmail}</a>
                    </p>
                </div>
                
                <div class="footer">
                    <p>This inquiry was sent through the Bellavire platform.</p>
                    <p>&copy; 2024 Bellavire. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    return { subject, html };
};

/**
 * Create confirmation email template for tenant
 * @param {Object} data - Confirmation data
 * @param {string} data.tenantName - Tenant's full name
 * @param {string} data.tenantEmail - Tenant's email address
 * @param {string} data.agentEmail - Agent's email address
 * @param {string} data.message - Tenant's original message
 * @returns {Object} Email template with subject and HTML content
 */
export const createTenantConfirmationEmail = (data) => {
    const { tenantName, tenantEmail, agentEmail, message } = data;
    
    const subject = 'Your inquiry has been sent successfully';
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Inquiry Confirmation</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #28a745; padding: 20px; border-radius: 5px; margin-bottom: 20px; color: white; }
                .content { background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 5px; }
                .message { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; }
                .success-icon { font-size: 48px; text-align: center; margin-bottom: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="success-icon">✓</div>
                    <h2 style="margin: 0; text-align: center;">Inquiry Sent Successfully</h2>
                </div>
                
                <div class="content">
                    <p>Dear <strong>${tenantName}</strong>,</p>
                    
                    <p>Your inquiry has been successfully sent to the buyer agent at <strong>${agentEmail}</strong>.</p>
                    
                    <p>The agent will review your message and contact you directly at <strong>${tenantEmail}</strong>.</p>
                    
                    <h3>Your Message</h3>
                    <div class="message">
                        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                    </div>
                    
                    <p style="margin-top: 20px;">
                        <strong>What happens next?</strong><br>
                        • The agent will review your inquiry<br>
                        • They will contact you directly via email or phone<br>
                        • You can expect a response within 24-48 hours
                    </p>
                </div>
                
                <div class="footer">
                    <p>Thank you for using Bellavire!</p>
                    <p>&copy; 2024 Bellavire. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    return { subject, html };
}; 