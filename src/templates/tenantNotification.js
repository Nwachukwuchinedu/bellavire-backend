/**
 * Email templates for tenant notifications
 */

export const createMaintenanceNotificationEmail = (action, maintenanceData) => {
    const { issue, category, status, propertyAddress, landlordName } = maintenanceData;
    
    let subject = '';
    let message = '';
    
    switch (action) {
        case 'created':
            subject = 'Maintenance Request Submitted';
            message = `Your maintenance request for "${issue}" has been successfully submitted.`;
            break;
        case 'status_updated':
            subject = `Maintenance Request ${status.charAt(0).toUpperCase() + status.slice(1)}`;
            message = `Your maintenance request for "${issue}" has been updated to ${status}.`;
            break;
        case 'contractor_assigned':
            subject = 'Contractor Assigned to Your Maintenance Request';
            message = `A contractor has been assigned to your maintenance request for "${issue}".`;
            break;
        case 'resolved':
            subject = 'Maintenance Request Resolved';
            message = `Your maintenance request for "${issue}" has been resolved.`;
            break;
        default:
            subject = 'Maintenance Request Update';
            message = `Your maintenance request for "${issue}" has been updated.`;
    }

    return {
        subject,
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${subject}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
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
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #007bff;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        color: #007bff;
                        margin: 0;
                        font-size: 24px;
                    }
                    .content {
                        margin-bottom: 30px;
                    }
                    .maintenance-details {
                        background-color: #f8f9fa;
                        padding: 20px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .maintenance-details h3 {
                        margin-top: 0;
                        color: #495057;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                        padding: 5px 0;
                        border-bottom: 1px solid #e9ecef;
                    }
                    .detail-label {
                        font-weight: bold;
                        color: #6c757d;
                    }
                    .detail-value {
                        color: #495057;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e9ecef;
                        color: #6c757d;
                        font-size: 14px;
                    }
                    .btn {
                        display: inline-block;
                        padding: 12px 24px;
                        background-color: #007bff;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .btn:hover {
                        background-color: #0056b3;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>${subject}</h1>
                    </div>
                    
                    <div class="content">
                        <p>Hello,</p>
                        
                        <p>${message}</p>
                        
                        <div class="maintenance-details">
                            <h3>Maintenance Request Details</h3>
                            <div class="detail-row">
                                <span class="detail-label">Issue:</span>
                                <span class="detail-value">${issue}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Category:</span>
                                <span class="detail-value">${category}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Status:</span>
                                <span class="detail-value">${status}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Property:</span>
                                <span class="detail-value">${propertyAddress}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Landlord:</span>
                                <span class="detail-value">${landlordName}</span>
                            </div>
                        </div>
                        
                        <p>You can view the full details of your maintenance request in your tenant dashboard.</p>
                        
                        <div style="text-align: center;">
                            <a href="#" class="btn">View Maintenance Request</a>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated notification from BellaVire Property Management.</p>
                        <p>If you have any questions, please contact your landlord or property manager.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
};

export const createRentDueReminderEmail = (rentData) => {
    const { amount, dueDate, propertyAddress, daysUntilDue } = rentData;
    
    const subject = `Rent Due Reminder - ${daysUntilDue === 0 ? 'Due Today' : `${daysUntilDue} Day${daysUntilDue === 1 ? '' : 's'} Remaining`}`;
    
    return {
        subject,
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${subject}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
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
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #dc3545;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        color: #dc3545;
                        margin: 0;
                        font-size: 24px;
                    }
                    .content {
                        margin-bottom: 30px;
                    }
                    .rent-details {
                        background-color: #fff3cd;
                        border: 1px solid #ffeaa7;
                        padding: 20px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .rent-details h3 {
                        margin-top: 0;
                        color: #856404;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                        padding: 5px 0;
                        border-bottom: 1px solid #ffeaa7;
                    }
                    .detail-label {
                        font-weight: bold;
                        color: #856404;
                    }
                    .detail-value {
                        color: #495057;
                        font-weight: bold;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e9ecef;
                        color: #6c757d;
                        font-size: 14px;
                    }
                    .btn {
                        display: inline-block;
                        padding: 12px 24px;
                        background-color: #dc3545;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .btn:hover {
                        background-color: #c82333;
                    }
                    .urgent {
                        color: #dc3545;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>${subject}</h1>
                    </div>
                    
                    <div class="content">
                        <p>Hello,</p>
                        
                        <p>This is a friendly reminder that your rent payment is ${daysUntilDue === 0 ? 'due today' : `due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`}.</p>
                        
                        <div class="rent-details">
                            <h3>Payment Details</h3>
                            <div class="detail-row">
                                <span class="detail-label">Amount Due:</span>
                                <span class="detail-value">£${amount}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Due Date:</span>
                                <span class="detail-value">${new Date(dueDate).toLocaleDateString()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Property:</span>
                                <span class="detail-value">${propertyAddress}</span>
                            </div>
                        </div>
                        
                        ${daysUntilDue === 0 ? '<p class="urgent">Please make your payment today to avoid any late fees.</p>' : ''}
                        
                        <p>You can make your payment through your tenant dashboard or contact your landlord for payment instructions.</p>
                        
                        <div style="text-align: center;">
                            <a href="#" class="btn">Make Payment</a>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated reminder from BellaVire Property Management.</p>
                        <p>If you have any questions about your rent payment, please contact your landlord.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
};

export const createLeaseRenewalEmail = (leaseData) => {
    const { expirationDate, propertyAddress, daysUntilExpiration } = leaseData;
    
    const subject = `Lease Renewal Notice - ${daysUntilExpiration} Day${daysUntilExpiration === 1 ? '' : 's'} Until Expiration`;
    
    return {
        subject,
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${subject}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
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
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #28a745;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        color: #28a745;
                        margin: 0;
                        font-size: 24px;
                    }
                    .content {
                        margin-bottom: 30px;
                    }
                    .lease-details {
                        background-color: #d4edda;
                        border: 1px solid #c3e6cb;
                        padding: 20px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .lease-details h3 {
                        margin-top: 0;
                        color: #155724;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                        padding: 5px 0;
                        border-bottom: 1px solid #c3e6cb;
                    }
                    .detail-label {
                        font-weight: bold;
                        color: #155724;
                    }
                    .detail-value {
                        color: #495057;
                        font-weight: bold;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e9ecef;
                        color: #6c757d;
                        font-size: 14px;
                    }
                    .btn {
                        display: inline-block;
                        padding: 12px 24px;
                        background-color: #28a745;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .btn:hover {
                        background-color: #218838;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>${subject}</h1>
                    </div>
                    
                    <div class="content">
                        <p>Hello,</p>
                        
                        <p>Your lease agreement is set to expire in ${daysUntilExpiration} day${daysUntilExpiration === 1 ? '' : 's'}.</p>
                        
                        <div class="lease-details">
                            <h3>Lease Details</h3>
                            <div class="detail-row">
                                <span class="detail-label">Expiration Date:</span>
                                <span class="detail-value">${new Date(expirationDate).toLocaleDateString()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Property:</span>
                                <span class="detail-value">${propertyAddress}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Days Remaining:</span>
                                <span class="detail-value">${daysUntilExpiration}</span>
                            </div>
                        </div>
                        
                        <p>Please contact your landlord to discuss lease renewal options or make arrangements for moving out.</p>
                        
                        <div style="text-align: center;">
                            <a href="#" class="btn">Contact Landlord</a>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated notice from BellaVire Property Management.</p>
                        <p>If you have any questions about your lease, please contact your landlord.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
}; 