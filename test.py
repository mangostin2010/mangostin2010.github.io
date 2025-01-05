import smtplib
from email.mime.text import MIMEText

smtp_server = "smtp.gmail.com"
smtp_port = 587
sender_email = "swcis.kr@gmail.com"
sender_password = "rzxm dvfm ofca hswk"  # Replace with your actual app password
recipient_email = "mangostin2010@gmail.com"

msg = MIMEText("테스트 이메일입니다.")
msg['Subject'] = "SMTP 테스트"
msg['From'] = sender_email
msg['To'] = recipient_email

try:
    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, recipient_email, msg.as_string())
    print("이메일 전송 성공")
except Exception as e:
    print(f"이메일 전송 실패: {e}")
