from fpdf import FPDF
import qrcode
import io
import os

# Mock data
event = {"id": 2, "title": "AI & ML Summit", "date": "Mar 20, 2026"}
username = "admin"
full_name = "Test User"
email = "test@example.com"
phone = "1234567890"
college_id = "BCA-TEST"
payment_method = "UPI"
reg_time = "2026-04-01 12:00:00"

def generate_test_ticket():
    pdf = FPDF()
    pdf.add_page()
    
    # Background (placeholder or real if exists)
    if os.path.exists('static/ticket_bg.png'):
        pdf.image('static/ticket_bg.png', 10, 10, 190, 100)
    
    # Outer Border
    pdf.set_draw_color(0, 242, 254)
    pdf.set_line_width(1)
    pdf.rect(10, 10, 190, 100)
    
    # Title
    pdf.set_font("Helvetica", 'B', 24)
    pdf.set_text_color(255, 255, 255)
    pdf.set_xy(10, 13)
    pdf.cell(190, 10, "BCA Events - Official Ticket", align='C')
    
    # Event Name
    pdf.set_xy(15, 35)
    pdf.set_font("Helvetica", 'B', 20)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(100, 10, event['title'])
    
    # Event Date
    pdf.set_font("Helvetica", '', 12)
    pdf.set_text_color(200, 200, 200)
    pdf.set_xy(15, 45)
    pdf.cell(100, 10, f"Date: {event['date']}")
    
    # Divider
    pdf.set_draw_color(0, 242, 254)
    pdf.line(15, 55, 195, 55)
    
    # Attendee Details
    pdf.set_xy(15, 60)
    pdf.set_font("Helvetica", 'B', 14)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(100, 10, "Attendee Information:")
    
    pdf.set_font("Helvetica", '', 12)
    pdf.set_text_color(220, 220, 220)
    pdf.set_xy(15, 70)
    pdf.cell(100, 8, f"Name: {full_name}")
    pdf.set_xy(15, 78)
    pdf.cell(100, 8, f"College ID: {college_id}")
    pdf.set_xy(15, 86)
    pdf.cell(100, 8, f"Registered On: {reg_time}")
    
    # QR Code
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=2)
    qr_data = f"BCA EVENTS TICKET\n---\nEvent: {event['title']}\nDate: {event['date']}\n---\nAttendee: {full_name}\nEmail: {email}\nPhone: {phone}\nCollege ID: {college_id}\nReg Time: {reg_time}\nPayment: {payment_method}"
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    qr_buffer = io.BytesIO()
    img.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)
    
    pdf.set_fill_color(255, 255, 255)
    pdf.rect(153, 58, 39, 39, 'F')
    pdf.image(qr_buffer, x=155, y=60, w=35, h=35)
    
    pdf.set_font("Helvetica", 'B', 8)
    pdf.set_text_color(0, 242, 254)
    pdf.set_xy(155, 98)
    pdf.cell(35, 5, "SCAN TO VERIFY", align='C')
    
    pdf.output("test_ticket.pdf")
    print("Test ticket generated: test_ticket.pdf")

if __name__ == "__main__":
    generate_test_ticket()
