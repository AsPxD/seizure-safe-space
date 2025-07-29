import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createTransporter } from "npm:nodemailer@6.9.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPRequest {
  email: string;
  otpCode: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otpCode }: OTPRequest = await req.json();

    console.log(`Sending OTP ${otpCode} to ${email}`);

    // Create nodemailer transporter
    const transporter = createTransporter({
      service: 'gmail',
      auth: {
        user: 'driveourdestiny@gmail.com',
        pass: Deno.env.get('GMAIL_APP_PASSWORD') || 'your-app-password-here'
      }
    });

    // Email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
          .title { font-size: 20px; color: #333; margin-bottom: 20px; }
          .otp-box { background-color: #f8f9fa; border: 2px dashed #2563eb; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-code { font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 4px; margin: 10px 0; }
          .warning { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🛡️ CareGuard</div>
            <div class="title">Medical Vault Access Code</div>
          </div>
          
          <p>Hello,</p>
          <p>You have requested access to your secure Medical Vault. Please use the following verification code:</p>
          
          <div class="otp-box">
            <div>Your verification code is:</div>
            <div class="otp-code">${otpCode}</div>
            <div style="color: #666; font-size: 14px;">This code expires in 10 minutes</div>
          </div>
          
          <div class="warning">
            <strong>Security Notice:</strong> If you did not request this code, please ignore this email. Never share this code with anyone.
          </div>
          
          <p>For your security, this code can only be used once and will expire in 10 minutes.</p>
          
          <div class="footer">
            <p>This email was sent from CareGuard Medical Vault System</p>
            <p>© 2024 CareGuard. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const mailOptions = {
      from: 'CareGuard Medical Vault <driveourdestiny@gmail.com>',
      to: email,
      subject: '🔐 Medical Vault Access Code - CareGuard',
      html: emailHtml,
      text: `Your CareGuard Medical Vault verification code is: ${otpCode}. This code expires in 10 minutes. If you did not request this, please ignore this email.`
    };

    await transporter.sendMail(mailOptions);

    console.log(`Medical Vault OTP sent successfully to ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP sent successfully to your email",
        // Remove OTP from response in production for security
        ...(Deno.env.get('NODE_ENV') === 'development' && { otp: otpCode })
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-vault-otp function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send OTP email",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);