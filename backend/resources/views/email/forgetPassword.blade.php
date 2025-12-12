<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Password Reset Request</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f4f4f4; height: 100%;">
        <tr>
            <td align="center" style="padding: 25px 0;">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    
                    <tr>
                        <td align="center" style="padding: 20px 20px 10px; border-bottom: 1px solid #e5e5e5;">
                            <h1 style="color: #4f46e5; font-size: 24px; margin: 0;">LMS App</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 30px 40px;">
                            <h2 style="color: #1f2937; font-size: 20px; font-weight: bold; margin-bottom: 20px;">Password Reset Request</h2>

                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Hello,</p>
                            
                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                                You requested a password reset for your account. Click the button below to continue with the reset process.
                            </p>

                            <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $resetUrl }}" target="_blank" style="
                                            display: inline-block;
                                            padding: 12px 24px;
                                            background-color: #4f46e5;
                                            color: #ffffff;
                                            text-decoration: none;
                                            border-radius: 6px;
                                            font-size: 16px;
                                            font-weight: bold;
                                            mso-padding-alt: 0; /* Outlook fix */
                                        ">
                                            <span style="mso-text-raise:12pt; display:inline-block;">Reset Password</span>
                                            </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                                This link will expire in 60 minutes for security reasons.
                            </p>
                            
                            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 30px;">
                                If you did not request a password reset, please ignore this email. Your password will remain unchanged.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e5e5;">
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                &copy; {{ date('Y') }} LMS Team. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>