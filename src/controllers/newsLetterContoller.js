import NewsLetter from '../models/NewsLetter.js';
import validator from '../validation/dynamicValidateAndSanitize.js';
import { sendEmail } from '../services/emailService.js';
import getNewsLetterTemplate from '../templates/newsLetter.js';

export const subscribeToNewsletter = async (req, res) => {
    try {
        const { value, error } = validator.validateForCreate(req.body, NewsLetter);
        if (error) {
            return res.status(400).json({ success: false, message: error.details.map(e => e.message).join(', ') });
        }
        const { email } = value;
        const existing = await NewsLetter.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already subscribed.' });
        }
        await NewsLetter.create({ email });
        // Send confirmation email (do not block response)
        sendEmail({
            to: email,
            subject: 'Newsletter Subscription Confirmation',
            html: getNewsLetterTemplate({ email })
        });
        res.status(201).json({ success: true, message: 'Subscribed to newsletter successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
