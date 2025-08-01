/**
 * Email templates for landlord notifications
 */

/**
 * Create maintenance notification email for landlords
 * @param {string} action - The maintenance action (new_request, status_updated, resolved)
 * @param {Object} maintenanceData - Maintenance data
 * @returns {Object} Email template with subject and HTML
 */
export const createMaintenanceNotificationEmail = (action, maintenanceData) => {
    const { issue, category, status, propertyAddress, tenantName, maintenanceId } = maintenanceData;
    
    let subject, html;
    
    switch (action) {
        case 'new_request':
            subject = `New Maintenance Request - ${propertyAddress}`;
            html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Maintenance Request</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background: #f9f9f9; }
                        .button { display: inline-block; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #3498db; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔧 New Maintenance Request</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>You have received a new maintenance request from your tenant.</p>
                            
                            <div class="info-box">
                                <h3>Request Details:</h3>
                                <p><strong>Property:</strong> ${propertyAddress}</p>
                                <p><strong>Tenant:</strong> ${tenantName}</p>
                                <p><strong>Issue:</strong> ${issue}</p>
                                <p><strong>Category:</strong> ${category}</p>
                                <p><strong>Status:</strong> ${status}</p>
                            </div>
                            
                            <p>Please review and take appropriate action on this maintenance request.</p>
                            
                            <a href="/maintenances/${maintenanceId}" class="button">View Maintenance Request</a>
                            
                            <p>Best regards,<br>Bellavire Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated notification from Bellavire Property Management System.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            break;
            
        case 'status_updated':
            subject = `Maintenance Status Updated - ${propertyAddress}`;
            html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Maintenance Status Updated</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #27ae60; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background: #f9f9f9; }
                        .button { display: inline-block; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #27ae60; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📋 Maintenance Status Updated</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>The status of a maintenance request has been updated.</p>
                            
                            <div class="info-box">
                                <h3>Updated Details:</h3>
                                <p><strong>Property:</strong> ${propertyAddress}</p>
                                <p><strong>Tenant:</strong> ${tenantName}</p>
                                <p><strong>Issue:</strong> ${issue}</p>
                                <p><strong>New Status:</strong> ${status}</p>
                            </div>
                            
                            <a href="/maintenances/${maintenanceId}" class="button">View Maintenance Request</a>
                            
                            <p>Best regards,<br>Bellavire Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated notification from Bellavire Property Management System.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            break;
            
        case 'resolved':
            subject = `Maintenance Resolved - ${propertyAddress}`;
            html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Maintenance Resolved</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #27ae60; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background: #f9f9f9; }
                        .button { display: inline-block; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #27ae60; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Maintenance Resolved</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>A maintenance request has been successfully resolved.</p>
                            
                            <div class="info-box">
                                <h3>Resolved Details:</h3>
                                <p><strong>Property:</strong> ${propertyAddress}</p>
                                <p><strong>Tenant:</strong> ${tenantName}</p>
                                <p><strong>Issue:</strong> ${issue}</p>
                                <p><strong>Status:</strong> ${status}</p>
                            </div>
                            
                            <a href="/maintenances/${maintenanceId}" class="button">View Maintenance Request</a>
                            
                            <p>Best regards,<br>Bellavire Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated notification from Bellavire Property Management System.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            break;
            
        default:
            return null;
    }
    
    return { subject, html };
};

/**
 * Create tour notification email for landlords
 * @param {string} action - The tour action (request, cancelled, rescheduled)
 * @param {Object} tourData - Tour data
 * @returns {Object} Email template with subject and HTML
 */
export const createTourNotificationEmail = (action, tourData) => {
    const { propertyName, date, timeSlot, tenantName, tourId, notes } = tourData;
    const formattedDate = new Date(date).toLocaleDateString();
    
    let subject, html;
    
    switch (action) {
        case 'request':
            subject = `New Tour Request - ${propertyName}`;
            html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Tour Request</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #3498db; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background: #f9f9f9; }
                        .button { display: inline-block; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #3498db; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🏠 New Tour Request</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>You have received a new property tour request.</p>
                            
                            <div class="info-box">
                                <h3>Tour Details:</h3>
                                <p><strong>Property:</strong> ${propertyName}</p>
                                <p><strong>Prospective Tenant:</strong> ${tenantName}</p>
                                <p><strong>Date:</strong> ${formattedDate}</p>
                                <p><strong>Time:</strong> ${timeSlot}</p>
                                ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
                            </div>
                            
                            <p>Please review and respond to this tour request.</p>
                            
                            <a href="/tours/${tourId}" class="button">View Tour Request</a>
                            
                            <p>Best regards,<br>Bellavire Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated notification from Bellavire Property Management System.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            break;
            
        case 'cancelled':
            subject = `Tour Cancelled - ${propertyName}`;
            html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Tour Cancelled</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background: #f9f9f9; }
                        .button { display: inline-block; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #e74c3c; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>❌ Tour Cancelled</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>A property tour has been cancelled.</p>
                            
                            <div class="info-box">
                                <h3>Cancelled Tour Details:</h3>
                                <p><strong>Property:</strong> ${propertyName}</p>
                                <p><strong>Tenant:</strong> ${tenantName}</p>
                                <p><strong>Original Date:</strong> ${formattedDate}</p>
                                <p><strong>Original Time:</strong> ${timeSlot}</p>
                            </div>
                            
                            <a href="/tours/${tourId}" class="button">View Tour Details</a>
                            
                            <p>Best regards,<br>Bellavire Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated notification from Bellavire Property Management System.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            break;
            
        case 'rescheduled':
            subject = `Tour Rescheduled - ${propertyName}`;
            html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Tour Rescheduled</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #f39c12; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background: #f9f9f9; }
                        .button { display: inline-block; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #f39c12; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔄 Tour Rescheduled</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>A property tour has been rescheduled.</p>
                            
                            <div class="info-box">
                                <h3>Rescheduled Tour Details:</h3>
                                <p><strong>Property:</strong> ${propertyName}</p>
                                <p><strong>Tenant:</strong> ${tenantName}</p>
                                <p><strong>New Date:</strong> ${formattedDate}</p>
                                <p><strong>New Time:</strong> ${timeSlot}</p>
                            </div>
                            
                            <a href="/tours/${tourId}" class="button">View Tour Details</a>
                            
                            <p>Best regards,<br>Bellavire Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated notification from Bellavire Property Management System.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            break;
            
        default:
            return null;
    }
    
    return { subject, html };
}; 