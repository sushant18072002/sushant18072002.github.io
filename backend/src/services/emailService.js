// Mock Email Service for Development
const sendVerificationEmail = async (email, token) => {
  console.log('\n📧 EMAIL SERVICE - VERIFICATION EMAIL');
  console.log('='.repeat(50));
  console.log(`📧 To: ${email}`);
  console.log(`🔗 Verification Link: http://localhost:3000/api/auth/verify-email?token=${token}`);
  console.log(`⏰ Token expires in: 24 hours`);
  console.log('='.repeat(50));
  
  // In production, replace with real email service (SendGrid, AWS SES, etc.)
  return Promise.resolve({
    success: true,
    messageId: `mock-${Date.now()}`,
    message: 'Verification email sent successfully'
  });
};

const sendPasswordResetEmail = async (email, token) => {
  console.log('\n📧 EMAIL SERVICE - PASSWORD RESET EMAIL');
  console.log('='.repeat(50));
  console.log(`📧 To: ${email}`);
  console.log(`🔗 Reset Link: http://localhost:3000/reset-password?token=${token}`);
  console.log(`⏰ Token expires in: 1 hour`);
  console.log('='.repeat(50));
  
  return Promise.resolve({
    success: true,
    messageId: `mock-${Date.now()}`,
    message: 'Password reset email sent successfully'
  });
};

const sendBookingConfirmation = async (email, bookingDetails) => {
  console.log('\n📧 EMAIL SERVICE - BOOKING CONFIRMATION');
  console.log('='.repeat(50));
  console.log(`📧 To: ${email}`);
  console.log(`🎫 Booking ID: ${bookingDetails.id}`);
  console.log(`✈️ Details: ${JSON.stringify(bookingDetails, null, 2)}`);
  console.log('='.repeat(50));
  
  return Promise.resolve({
    success: true,
    messageId: `mock-${Date.now()}`,
    message: 'Booking confirmation sent successfully'
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBookingConfirmation
};