/**
 * Simple Fake Payment Service - Just simulates payment processing
 * TODO: Replace with actual payment provider when decided
 */
class PaymentService {
  /**
   * Simulate payment processing
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} - Fake payment result
   */
  async processPayment(paymentData) {
    try {
      const { amount, description } = paymentData;
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate fake payment ID
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('FAKE PAYMENT: Processed payment:', paymentId, 'Amount:', amount);
      
      return {
        id: paymentId,
        status: 'succeeded',
        amount: amount,
        description: description
      };
    } catch (error) {
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  /**
   * Simulate payment confirmation
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} - Confirmed payment
   */
  async confirmPayment(paymentId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('FAKE PAYMENT: Confirmed payment:', paymentId);
      
      return {
        id: paymentId,
        status: 'confirmed',
        confirmedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  }
}

export default new PaymentService(); 