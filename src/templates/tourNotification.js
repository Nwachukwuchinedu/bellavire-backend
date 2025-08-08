export const createTourNotificationEmail = (action, tourData) => {
    const { propertyName, date, timeSlot, tenantName, landlordName, notes } = tourData;
    const tourDateTime = `${new Date(date).toLocaleDateString('en-GB')} at ${timeSlot}`;

    let subject, message, actionText;

    switch (action) {
        case 'request':
            subject = `New Tour Request - ${propertyName}`;
            actionText = 'New Tour Request';
            message = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">New Tour Request</h2>
                    <p>Hello ${landlordName},</p>
                    <p>You have received a new tour request for your property:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">${propertyName}</h3>
                        <p><strong>Date:</strong> ${tourDateTime}</p>
                        <p><strong>Requested by:</strong> ${tenantName}</p>
                        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
                    </div>
                    <p>Please log into your dashboard to confirm or decline this tour request.</p>
                    <p>Best regards,<br>The Bellavire Team</p>
                </div>
            `;
            break;
        case 'confirmed':
            subject = `Tour Confirmed - ${propertyName}`;
            actionText = 'Tour Confirmed';
            message = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #28a745;">Tour Confirmed</h2>
                    <p>Hello ${tenantName},</p>
                    <p>Great news! Your tour request has been confirmed:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">${propertyName}</h3>
                        <p><strong>Date:</strong> ${tourDateTime}</p>
                        <p><strong>Landlord:</strong> ${landlordName}</p>
                    </div>
                    <p>Please arrive on time for your tour. If you need to reschedule, please contact the landlord as soon as possible.</p>
                    <p>Best regards,<br>The Bellavire Team</p>
                </div>
            `;
            break;
        case 'declined':
            subject = `Tour Declined - ${propertyName}`;
            actionText = 'Tour Declined';
            message = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #dc3545;">Tour Declined</h2>
                    <p>Hello ${tenantName},</p>
                    <p>Unfortunately, your tour request has been declined:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">${propertyName}</h3>
                        <p><strong>Date:</strong> ${tourDateTime}</p>
                        <p><strong>Landlord:</strong> ${landlordName}</p>
                    </div>
                    <p>You can browse other available properties on our platform.</p>
                    <p>Best regards,<br>The Bellavire Team</p>
                </div>
            `;
            break;
        case 'cancelled':
            subject = `Tour Cancelled - ${propertyName}`;
            actionText = 'Tour Cancelled';
            message = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #dc3545;">Tour Cancelled</h2>
                    <p>Hello ${tenantName},</p>
                    <p>Your tour has been cancelled:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">${propertyName}</h3>
                        <p><strong>Date:</strong> ${tourDateTime}</p>
                        <p><strong>Landlord:</strong> ${landlordName}</p>
                    </div>
                    <p>If you have any questions, please contact the landlord directly.</p>
                    <p>Best regards,<br>The Bellavire Team</p>
                </div>
            `;
            break;
        case 'rescheduled':
            subject = `Tour Rescheduled - ${propertyName}`;
            actionText = 'Tour Rescheduled';
            message = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #ffc107;">Tour Rescheduled</h2>
                    <p>Hello ${tenantName},</p>
                    <p>Your tour has been rescheduled:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">${propertyName}</h3>
                        <p><strong>New Date:</strong> ${tourDateTime}</p>
                        <p><strong>Landlord:</strong> ${landlordName}</p>
                    </div>
                    <p>Please update your calendar with the new time.</p>
                    <p>Best regards,<br>The Bellavire Team</p>
                </div>
            `;
            break;
        default:
            return null;
    }

    return { subject, html: message };
}; 