import { Resend } from 'resend';

let resend: any;
const fromEmail = 'onboarding@resend.dev';

// Initialize Resend only on the server side
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

export async function sendVerificationEmail(
  email: string,
  verificationToken: string,
  userName: string
) {
  // Hardcode to send to vlatko.gavrilov1@gmail.com for testing
  const toEmail = 'vlatko.gavrilov1@gmail.com';
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

  try {
    if (!resend) {
      console.error('Resend is not initialized. Check RESEND_API_KEY environment variable.');
      throw new Error('Email service not configured');
    }

    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: 'Verify your Smart City Reporter email',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e293b; margin: 0;">Smart City Reporter</h1>
          </div>
          
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 30px; text-align: center;">
            <h2 style="color: #1e293b; margin-top: 0;">Welcome, ${userName}!</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              Thank you for registering. Please verify your email address to complete your account setup.
            </p>
            
            <a href="${verificationLink}" style="display: inline-block; background-color: #06b6d4; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0;">
              Verify Email
            </a>
            
            <p style="color: #94a3b8; font-size: 14px; margin-top: 20px;">
              Or copy this link in your browser:
            </p>
            <p style="color: #06b6d4; font-size: 12px; word-break: break-all;">
              ${verificationLink}
            </p>
          </div>
          
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
            This link will expire in 24 hours.
          </p>
        </div>
      `,
    });

    return result;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName: string
) {
  // Hardcode to send to vlatko.gavrilov1@gmail.com for testing
  const toEmail = 'vlatko.gavrilov1@gmail.com';
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  try {
    if (!resend) {
      console.error('Resend is not initialized. Check RESEND_API_KEY environment variable.');
      throw new Error('Email service not configured');
    }

    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: 'Reset your Smart City Reporter password',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e293b; margin: 0;">Smart City Reporter</h1>
          </div>
          
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 30px; text-align: center;">
            <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              Hi ${userName},
            </p>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password. Click the button below to set a new password.
            </p>
            
            <a href="${resetLink}" style="display: inline-block; background-color: #06b6d4; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0;">
              Reset Password
            </a>
            
            <p style="color: #94a3b8; font-size: 14px; margin-top: 20px;">
              Or copy this link in your browser:
            </p>
            <p style="color: #06b6d4; font-size: 12px; word-break: break-all;">
              ${resetLink}
            </p>
            
            <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin-top: 20px; text-align: left; border-radius: 4px;">
              <p style="color: #92400e; font-size: 14px; margin: 0;">
                <strong>Security Note:</strong> If you didn't request this, please ignore this email. Your account is secure.
              </p>
            </div>
          </div>
          
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
            This link will expire in 1 hour.
          </p>
        </div>
      `,
    });

    return result;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, userName: string) {
  // Hardcode to send to vlatko.gavrilov1@gmail.com for testing
  const toEmail = 'vlatko.gavrilov1@gmail.com';
  
  try {
    if (!resend) {
      console.error('Resend is not initialized. Check RESEND_API_KEY environment variable.');
      throw new Error('Email service not configured');
    }

    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: 'Welcome to Smart City Reporter!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e293b; margin: 0;">Smart City Reporter</h1>
          </div>
          
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 30px;">
            <h2 style="color: #1e293b; margin-top: 0;">Welcome, ${userName}!</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              Your email has been verified and your account is now active. You can start reporting issues in your city right away.
            </p>
            
            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #065f46; font-size: 14px; margin: 0;">
                <strong>Next Steps:</strong> Log in to your account and start creating reports to help improve your community.
              </p>
            </div>
          </div>
          
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
            Thank you for joining Smart City Reporter!
          </p>
        </div>
      `,
    });

    return result;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}
