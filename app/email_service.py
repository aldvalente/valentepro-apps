"""Email service for sending transactional emails"""
import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from app.i18n import t

# Setup logging
logger = logging.getLogger(__name__)

# Email configuration from environment variables
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASS = os.environ.get('SMTP_PASS', '')
MAIL_FROM = os.environ.get('MAIL_FROM', 'noreply@sportbnb.com')
MAIL_FROM_NAME = os.environ.get('MAIL_FROM_NAME', 'Sportbnb')

# Base URL for links in emails
BASE_URL = os.environ.get('BASE_URL', 'http://localhost:3000')


def send_email(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: Optional[str] = None
) -> bool:
    """
    Send an email using SMTP
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_body: HTML content
        text_body: Plain text content (optional)
    
    Returns:
        True if email sent successfully, False otherwise
    """
    # Skip if SMTP not configured
    if not SMTP_USER or not SMTP_PASS:
        print(f"⚠️ Email not sent (SMTP not configured): {subject} to {to_email}")
        return False
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{MAIL_FROM_NAME} <{MAIL_FROM}>"
        msg['To'] = to_email
        
        # Add text and HTML parts
        if text_body:
            part1 = MIMEText(text_body, 'plain', 'utf-8')
            msg.attach(part1)
        
        part2 = MIMEText(html_body, 'html', 'utf-8')
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        
        print(f"✓ Email sent: {subject} to {to_email}")
        return True
    
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return False


def send_verification_email(email: str, name: str, token: str, lang: str = 'it') -> bool:
    """Send email verification email"""
    verify_url = f"{BASE_URL}/static/index.html?verify={token}"
    
    subject = t('email.subject.verify_email', lang)
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #e74c3c;">{t('email.subject.welcome', lang)}</h2>
            <p>{t('email.greeting', lang)} {name},</p>
            <p>{t('auth.welcome', lang)}</p>
            <p>Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{verify_url}" 
                   style="background-color: #e74c3c; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    {t('email.verify_button', lang)}
                </a>
            </div>
            <p style="color: #666; font-size: 12px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                {verify_url}
            </p>
            <p>{t('email.regards', lang)},<br>{t('email.team', lang)}</p>
        </div>
    </body>
    </html>
    """
    
    return send_email(email, subject, html_body)


def send_password_reset_email(email: str, name: str, token: str, lang: str = 'it') -> bool:
    """Send password reset email"""
    reset_url = f"{BASE_URL}/static/index.html?reset={token}"
    
    subject = t('email.subject.password_reset', lang)
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #e74c3c;">{subject}</h2>
            <p>{t('email.greeting', lang)} {name},</p>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_url}" 
                   style="background-color: #e74c3c; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    {t('email.reset_password_button', lang)}
                </a>
            </div>
            <p style="color: #666;">This link will expire in 1 hour.</p>
            <p style="color: #666; font-size: 12px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                {reset_url}
            </p>
            <p style="color: #666; font-size: 12px;">
                If you didn't request a password reset, you can safely ignore this email.
            </p>
            <p>{t('email.regards', lang)},<br>{t('email.team', lang)}</p>
        </div>
    </body>
    </html>
    """
    
    return send_email(email, subject, html_body)


def send_booking_confirmation_guest(
    email: str, 
    name: str, 
    equipment_title: str, 
    date_from: str, 
    date_to: str,
    total_price: float,
    lang: str = 'it'
) -> bool:
    """Send booking confirmation to guest"""
    subject = t('email.subject.booking_confirmation_guest', lang)
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #e74c3c;">{subject}</h2>
            <p>{t('email.greeting', lang)} {name},</p>
            <p>Your booking has been confirmed!</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">{equipment_title}</h3>
                <p><strong>From:</strong> {date_from}</p>
                <p><strong>To:</strong> {date_to}</p>
                <p><strong>Total Price:</strong> €{total_price:.2f}</p>
            </div>
            <p>{t('email.regards', lang)},<br>{t('email.team', lang)}</p>
        </div>
    </body>
    </html>
    """
    
    return send_email(email, subject, html_body)


def send_booking_confirmation_host(
    email: str,
    name: str,
    equipment_title: str,
    guest_name: str,
    date_from: str,
    date_to: str,
    total_price: float,
    lang: str = 'it'
) -> bool:
    """Send booking notification to host"""
    subject = t('email.subject.booking_confirmation_host', lang)
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #e74c3c;">{subject}</h2>
            <p>{t('email.greeting', lang)} {name},</p>
            <p>You have received a new booking request!</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">{equipment_title}</h3>
                <p><strong>Guest:</strong> {guest_name}</p>
                <p><strong>From:</strong> {date_from}</p>
                <p><strong>To:</strong> {date_to}</p>
                <p><strong>Total Price:</strong> €{total_price:.2f}</p>
            </div>
            <p>Please log in to confirm or reject this booking.</p>
            <p>{t('email.regards', lang)},<br>{t('email.team', lang)}</p>
        </div>
    </body>
    </html>
    """
    
    return send_email(email, subject, html_body)


def send_booking_cancelled_email(
    email: str,
    name: str,
    equipment_title: str,
    date_from: str,
    date_to: str,
    lang: str = 'it'
) -> bool:
    """Send booking cancellation notification"""
    subject = t('email.subject.booking_cancelled', lang)
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #e74c3c;">{subject}</h2>
            <p>{t('email.greeting', lang)} {name},</p>
            <p>A booking has been cancelled:</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">{equipment_title}</h3>
                <p><strong>From:</strong> {date_from}</p>
                <p><strong>To:</strong> {date_to}</p>
            </div>
            <p>{t('email.regards', lang)},<br>{t('email.team', lang)}</p>
        </div>
    </body>
    </html>
    """
    
    return send_email(email, subject, html_body)


def send_new_message_notification(
    email: str,
    name: str,
    sender_name: str,
    message_preview: str,
    lang: str = 'it'
) -> bool:
    """Send new message notification"""
    subject = t('email.subject.new_message', lang)
    
    # Truncate message if too long
    preview_text = message_preview[:200]
    if len(message_preview) > 200:
        preview_text += '...'
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #e74c3c;">{subject}</h2>
            <p>{t('email.greeting', lang)} {name},</p>
            <p>You have received a new message from {sender_name}:</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p style="font-style: italic;">"{preview_text}"</p>
            </div>
            <p>Log in to read and reply to this message.</p>
            <p>{t('email.regards', lang)},<br>{t('email.team', lang)}</p>
        </div>
    </body>
    </html>
    """
    
    return send_email(email, subject, html_body)
