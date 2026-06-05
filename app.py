from flask import Flask, render_template, request, redirect, url_for, session, send_file
import random
import string
from datetime import datetime, timedelta
import io
import os
from fpdf import FPDF
import qrcode
from werkzeug.utils import secure_filename
import sqlite3
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import math
import base64

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Change this to a random secret key

bcrypt = Bcrypt(app)

UPLOAD_FOLDER = 'static/uploads/profiles'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# Sample Events Data (Hardcoded as per PHP version)
# Sample Events Data (Hardcoded as per PHP version)
def get_events():
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM events")
    events = [dict(row) for row in c.fetchall()]
    conn.close()
    return events

def get_event(event_id):
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM events WHERE id = ?", (event_id,))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None

def is_host():
    if not session.get('loggedin'):
        return False
    username = session.get('username', '').lower()
    # Debug: print(f"Checking host status for: {username}")
    if username == 'admin' or username == 'venu r':
        return True
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute("SELECT role FROM users WHERE LOWER(username) = ?", (username,))
    user = c.fetchone()
    conn.close()
    res = user and user[0] == 'host'
    # Debug: print(f"Is host: {res}")
    return res



import sqlite3
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt(app)

# Database Setup
def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT,
                  full_name TEXT, email TEXT, phone TEXT, college_id TEXT, profile_photo TEXT,
                  role TEXT DEFAULT 'user')''')

    c.execute('''CREATE TABLE IF NOT EXISTS registrations 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, event_id INTEGER, 
                  full_name TEXT, email TEXT, phone TEXT, college_id TEXT, 
                  payment_method TEXT, upi_id TEXT, 
                  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS events
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, date TEXT, desc TEXT, 
                  price TEXT, color TEXT, image TEXT, purpose TEXT, full_details TEXT, outcome TEXT)''')
    
    # Populate events table if empty
    c.execute("SELECT COUNT(*) FROM events")
    if c.fetchone()[0] == 0:
        for ev in EVENTS:
            c.execute("""INSERT INTO events (id, title, date, desc, price, color, image, purpose, full_details, outcome) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""", 
                      (ev['id'], ev['title'], ev['date'], ev['desc'], ev['price'], ev['color'], ev['image'], ev['purpose'], ev['full_details'], ev['outcome']))
    
    # Also ensure 'admin' exists and has host role
    c.execute("SELECT 1 FROM users WHERE username = 'admin'")
    if not c.fetchone():
        hashed_password = bcrypt.generate_password_hash('password123').decode('utf-8')
        c.execute("INSERT INTO users (username, password, role) VALUES ('admin', ?, 'host')", (hashed_password,))
    else:
        c.execute("UPDATE users SET role = 'host' WHERE username = 'admin'")
    
    # Ensure Venu R is also a host if exists
    c.execute("UPDATE users SET role = 'host' WHERE username = 'Venu R'")


    conn.commit()
    conn.close()

init_db()

@app.context_processor
def inject_user_data():
    current_user = None
    if session.get('loggedin'):
        username = session.get('username')
        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        c.execute("SELECT profile_photo FROM users WHERE username=?", (username,))
        res = c.fetchone()
        conn.close()
        
        photo = None
        if res and res[0]:
            photo = res[0]
            if not photo.startswith('http'):
                photo = url_for('static', filename=photo)
        else:
            photo = 'https://ui-avatars.com/api/?name=' + username
        
        current_user = {'username': username, 'profile_photo': photo}
    return dict(current_user=current_user)

@app.route('/', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        action = request.form.get('action')
        
        if action == 'register':
            username = request.form.get('reg_username')
            password = request.form.get('reg_password')
            confirm_password = request.form.get('reg_confirm_password')
            
            if password != confirm_password:
                error = "Passwords do not match!"
            else:
                try:
                    conn = sqlite3.connect('users.db')
                    c = conn.cursor()
                    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
                    c.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed_password))
                    conn.commit()
                    conn.close()
                    error = "Registration successful! Please login."
                except sqlite3.IntegrityError:
                    error = "Username already exists!"
                    
        elif action == 'login':
            username = request.form.get('username')
            password = request.form.get('password')
            captcha_input = request.form.get('captcha', '').replace(' ', '')
            expected_answer = session.get('captcha_answer', '')

            # if not expected_answer or captcha_input != expected_answer:
            #     error = "Incorrect CAPTCHA."
            # else:
            if True:
                conn = sqlite3.connect('users.db')
                c = conn.cursor()
                c.execute("SELECT password FROM users WHERE username = ?", (username,))
                user = c.fetchone()
                conn.close()
                
                if user and bcrypt.check_password_hash(user[0], password):
                    session['loggedin'] = True
                    session['username'] = username
                    return redirect(url_for('dashboard'))
                elif username.lower() == 'admin' and password == 'password123':
                    session['loggedin'] = True
                    session['username'] = username
                    return redirect(url_for('dashboard'))
                else:
                    error = "Invalid Username or Password."


    # Generate Captcha
    d1 = random.randint(0, 9)
    d2 = random.randint(0, 9)
    d3 = random.randint(0, 9)
    d4 = random.randint(0, 9)
    d5 = random.randint(0, 9)
    
    challenge_display = f"{d1} {d2} {d3} {d4} {d5}"
    challenge_value = f"{d1}{d2}{d3}{d4}{d5}"
    session['captcha_answer'] = challenge_value

    return render_template('login.html', error=error, challenge_display=challenge_display, username=request.form.get('username', ''))

@app.route('/dashboard')
def dashboard():
    if not session.get('loggedin'):
        return redirect(url_for('login'))
    username = session.get('username')
    
    # Get all registration IDs for this user
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute("SELECT event_id FROM registrations WHERE username = ?", (username,))
    registered_ids = [row[0] for row in c.fetchall()]
    conn.close()

    # Process events to check for expiry and registration
    current_date = datetime.now()
    upcoming_events = []
    past_events = []
    events = get_events()
    
    # First, categorize events and check registrations
    for ev in events:
        try:
            event_date = datetime.strptime(ev['date'], "%b %d, %Y")
            ev['is_expired'] = event_date < current_date
        except ValueError:
            ev['is_expired'] = False
            
        ev['is_registered'] = ev['id'] in registered_ids
        
        if ev['is_expired']:
            past_events.append(ev)
        else:
            upcoming_events.append(ev)
            
    # Calculate carousel angles only for upcoming events
    total_upcoming = len(upcoming_events)
    radius = 0
    if total_upcoming > 1:
        radius = int(round((350 / 2) / math.tan(math.pi / total_upcoming)))
    radius = max(radius + 50, 450)
    
    for i, ev in enumerate(upcoming_events):
        if total_upcoming > 0:
            ev['carousel_angle'] = round((360 / total_upcoming) * i, 2)
            ev['carousel_tz'] = radius
        else:
            ev['carousel_angle'] = 0
            ev['carousel_tz'] = 0
    
    return render_template('dashboard.html', upcoming_events=upcoming_events, past_events=past_events, username=username, is_host=is_host(), carousel_radius=radius)



@app.route('/event/<int:event_id>')
def event_detail(event_id):
    if not session.get('loggedin'):
        return redirect(url_for('login'))
    
    # Find event by ID
    event = get_event(event_id)
    
    if not event:
        return "Event not found", 404
    
    # Check expiry for the detail page too
    current_date = datetime.now()
    try:
        event_date = datetime.strptime(event['date'], "%b %d, %Y")
        event['is_expired'] = event_date < current_date
    except ValueError:
        event['is_expired'] = False
    
    # Check if user is registered
    username = session.get('username')
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute("SELECT 1 FROM registrations WHERE username = ? AND event_id = ?", (username, event_id))
    event['is_registered'] = c.fetchone() is not None
    conn.close()
        
    return render_template('details.html', event=event, username=username, is_host=is_host())



@app.route('/register/<int:event_id>', methods=['GET', 'POST'])
def register_event(event_id):
    if not session.get('loggedin'):
        return redirect(url_for('login'))
    
    event = get_event(event_id)
    if not event:
        return "Event not found", 404
    
    # Check if event has already passed
    current_date = datetime.now()
    try:
        event_date = datetime.strptime(event['date'], "%b %d, %Y")
        if event_date < current_date:
            return "Registration closed for this event.", 403
    except ValueError:
        pass

    if request.method == 'POST':
        full_name = request.form.get('full_name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        college_id = request.form.get('college_id')
        payment_method = request.form.get('payment_method')
        upi_id = request.form.get('upi_id')
        username = session.get('username')
        
        try:
            conn = sqlite3.connect('users.db')
            c = conn.cursor()
            c.execute("INSERT INTO registrations (username, event_id, full_name, email, phone, college_id, payment_method, upi_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                      (username, event_id, full_name, email, phone, college_id, payment_method, upi_id))
            conn.commit()
            conn.close()
            return render_template('registration.html', event=event, success=True, username=username, is_host=is_host())

        except Exception as e:
            return f"Error: {str(e)}", 500
            
    return render_template('registration.html', event=event, username=session.get('username'), is_host=is_host())


@app.route('/unregister/<int:event_id>', methods=['POST'])
def unregister_event(event_id):
    if not session.get('loggedin'):
        return redirect(url_for('login'))
    
    username = session.get('username')
    try:
        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        c.execute("DELETE FROM registrations WHERE username = ? AND event_id = ?", (username, event_id))
        conn.commit()
        conn.close()
    except Exception as e:
        return f"Error: {str(e)}", 500
        
    return redirect(url_for('dashboard'))

@app.route('/download_ticket/<int:event_id>')
def download_ticket(event_id):
    if not session.get('loggedin'):
        return redirect(url_for('login'))
    
    username = session.get('username')
    event = get_event(event_id)
    
    if not event:
        return "Event not found", 404
        
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute("SELECT full_name, email, phone, college_id, payment_method, upi_id, timestamp FROM registrations WHERE username = ? AND event_id = ?", (username, event_id))
    registration = c.fetchone()
    conn.close()
    
    if not registration:
        return "Registration not found", 404
        
    full_name, email, phone, college_id, payment_method, upi_id, reg_time = registration

    
    # Generate PDF
    pdf = FPDF()
    pdf.add_page()
    
    # Ticket Background Image
    pdf.image('static/ticket_bg.png', 10, 10, 190, 100)
    
    # Outer Border
    pdf.set_draw_color(0, 242, 254) # Cyan border
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
    
    # Status & Registration Time
    pdf.set_xy(15, 86)
    pdf.cell(100, 8, f"Registered On: {reg_time}")
    
    # Right side: QR Code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    
    # Detailed scan data
    qr_data = f"""BCA EVENTS TICKET
---
Event: {event['title']}
Date: {event['date']}
---
Attendee: {full_name}
Email: {email}
Phone: {phone}
College ID: {college_id}
Reg Time: {reg_time}
Payment: {payment_method if payment_method else 'N/A'}
"""
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    qr_buffer = io.BytesIO()
    img.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)
    
    # Position QR in a nice white box or just neatly aligned
    # Moving it a bit higher and more to the right for clarity
    pdf.set_fill_color(255, 255, 255)
    pdf.rect(153, 58, 39, 39, 'F')
    pdf.image(qr_buffer, x=155, y=60, w=35, h=35)
    
    # Tiny label for QR
    pdf.set_font("Helvetica", 'B', 8)
    pdf.set_text_color(0, 242, 254)
    pdf.set_xy(155, 98)
    pdf.cell(35, 5, "SCAN TO VERIFY", align='C')

    

    # Output PDF to BytesIO
    pdf_bytes = pdf.output(dest='S')
    
    buffer = io.BytesIO(pdf_bytes)

    
    buffer.seek(0)
    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"Ticket_{event['title'].replace(' ', '_')}.pdf",
        mimetype="application/pdf"
    )


@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if not session.get('loggedin'):
        return redirect(url_for('login'))
    
    username = session.get('username')
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    
    if request.method == 'POST':
        full_name = request.form.get('full_name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        college_id = request.form.get('college_id')
        
        # Handle Photo Upload
        file = request.files.get('profile_photo')
        cropped_data = request.form.get('cropped_image_data')
        photo_path = None

        if cropped_data:
            try:
                # Format is usually "data:image/jpeg;base64,/9j/4AAQSk..."
                header, encoded = cropped_data.split(",", 1)
                file_ext = header.split(';')[0].split('/')[1]
                filename = secure_filename(f"{username}_cropped.{file_ext}")
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                with open(filepath, "wb") as fh:
                    fh.write(base64.b64decode(encoded))
                photo_path = f"uploads/profiles/{filename}"
            except Exception as e:
                print(f"Error saving cropped image: {e}")
        elif file and allowed_file(file.filename):
            filename = secure_filename(f"{username}_{file.filename}")
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            photo_path = f"uploads/profiles/{filename}"
        
        if photo_path:
            c.execute("""UPDATE users SET full_name=?, email=?, phone=?, college_id=?, profile_photo=? 
                         WHERE username=?""", (full_name, email, phone, college_id, photo_path, username))
        else:
            c.execute("""UPDATE users SET full_name=?, email=?, phone=?, college_id=? 
                         WHERE username=?""", (full_name, email, phone, college_id, username))
        
        conn.commit()
        return redirect(url_for('profile', msg="Profile changes saved successfully!"))

    msg = request.args.get('msg')

    c.execute("SELECT username, full_name, email, phone, college_id, profile_photo FROM users WHERE username=?", (username,))
    user_data = c.fetchone()
    conn.close()

    if not user_data:
        return "User profile not found", 404

    
    user = {
        'username': user_data[0],
        'full_name': user_data[1] or '',
        'email': user_data[2] or '',
        'phone': user_data[3] or '',
        'college_id': user_data[4] or '',
        'profile_photo': user_data[5] or 'https://ui-avatars.com/api/?name=' + user_data[0]
    }
    
    return render_template('profile.html', user=user, is_host=is_host(), msg=msg)

@app.route('/history')
def history():
    if not session.get('loggedin'):
        return redirect(url_for('login'))
    
    username = session.get('username')
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute("SELECT event_id, full_name, timestamp FROM registrations WHERE username=?", (username,))
    registrations = c.fetchall()
    conn.close()
    
    history_list = []
    for reg in registrations:
        event = get_event(reg[0])
        if event:
            history_list.append({
                'id': event['id'],
                'title': event['title'],
                'date': event['date'],
                'reg_time': reg[2]
            })
            
    return render_template('history.html', history=history_list, username=username, is_host=is_host())

@app.route('/change_password', methods=['POST'])
def change_password():
    if not session.get('loggedin'):
        return redirect(url_for('login'))
    
    username = session.get('username')
    current_password = request.form.get('current_password')
    new_password = request.form.get('new_password')
    confirm_password = request.form.get('confirm_password')

    if new_password != confirm_password:
        return "Error: New passwords do not match", 400

    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute("SELECT password FROM users WHERE username=?", (username,))
    user_data = c.fetchone()

    if user_data and bcrypt.check_password_hash(user_data[0], current_password):
        hashed_new = bcrypt.generate_password_hash(new_password).decode('utf-8')
        c.execute("UPDATE users SET password=? WHERE username=?", (hashed_new, username))
        conn.commit()
        conn.close()
        return redirect(url_for('profile', msg="Password changed successfully!"))
    else:
        conn.close()
        return "Error: Incorrect current password", 401

@app.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        username = request.form.get('username')
        college_id = request.form.get('college_id')
        phone = request.form.get('phone')
        new_password = request.form.get('new_password')
        confirm_password = request.form.get('confirm_password')

        if new_password != confirm_password:
            return render_template('forgot_password.html', error="Passwords do not match.")

        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        
        # Verify user
        c.execute("SELECT college_id, phone FROM users WHERE username=?", (username,))
        user_data = c.fetchone()
        
        if user_data:
            db_college_id, db_phone = user_data
            
            # Additional check: If user hasn't set their profile yet, this verification fails by design.
            if db_college_id and db_phone and (db_college_id == college_id) and (db_phone == phone):
                hashed_new = bcrypt.generate_password_hash(new_password).decode('utf-8')
                c.execute("UPDATE users SET password=? WHERE username=?", (hashed_new, username))
                conn.commit()
                conn.close()
                return render_template('login.html', msg="Password reset successful! Please login.")
            else:
                conn.close()
                return render_template('forgot_password.html', error="Verification failed. The details provided do not match our records or your profile is incomplete.")
        else:
            conn.close()
            return render_template('forgot_password.html', error="User not found.")

    return render_template('forgot_password.html')



@app.route('/add_event', methods=['GET', 'POST'])
def add_event():
    if not is_host():
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        title = request.form.get('title')
        date = request.form.get('date') # Format "MMM DD, YYYY"
        desc = request.form.get('desc')
        price = request.form.get('price')
        color = request.form.get('color')
        image = request.form.get('image')
        purpose = request.form.get('purpose')
        full_details = request.form.get('full_details')
        outcome = request.form.get('outcome')

        try:
            conn = sqlite3.connect('users.db')
            c = conn.cursor()
            c.execute("""INSERT INTO events (title, date, desc, price, color, image, purpose, full_details, outcome) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""", 
                      (title, date, desc, price, color, image, purpose, full_details, outcome))
            conn.commit()
            conn.close()
            return redirect(url_for('dashboard'))
        except Exception as e:
            return f"Error: {str(e)}", 500

    return render_template('add_event.html', username=session.get('username'))

@app.route('/delete_event/<int:event_id>', methods=['POST'])
def delete_event(event_id):
    if not is_host():
        return redirect(url_for('dashboard'))
    
    try:
        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        c.execute("DELETE FROM events WHERE id = ?", (event_id,))
        c.execute("DELETE FROM registrations WHERE event_id = ?", (event_id,))
        conn.commit()
        conn.close()
    except Exception as e:
        return f"Error: {str(e)}", 500
        
    return redirect(url_for('dashboard'))

@app.route('/logout')

def logout():
    session.pop('loggedin', None)
    session.pop('username', None)
    session.pop('captcha_answer', None)
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)
