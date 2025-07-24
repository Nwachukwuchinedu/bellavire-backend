import ContactUs from '../models/ContactUs.js';
import validator from '../validation/dynamicValidateAndSanitize.js';
import { sendEmail } from '../services/emailService.js';
import getContactUsTemplate from '../templates/contactUs.js';

export const sendContactMessage = async (req, res) => {
    try {
        const { value, error } = validator.validateForCreate(req.body, ContactUs);
        if (error) {
            return res.status(400).json({ success: false, message: error.details.map(e => e.message).join(', ') });
        }
        await ContactUs.create(value);
        // Send confirmation email (do not block response)
        sendEmail({
            to: value.email,
            subject: 'We have received your message',
            html: getContactUsTemplate({ fullName: value.fullName })
        });
        res.status(201).json({ success: true, message: 'Message sent successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
