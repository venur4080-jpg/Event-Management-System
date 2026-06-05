import sqlite3

def fix_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    
    # Check if role column exists in users
    c.execute("PRAGMA table_info(users)")
    columns = [row[1] for row in c.fetchall()]
    if 'role' not in columns:
        print("Adding 'role' column to users table...")
        c.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'")
    
    # Create events table if not exists
    c.execute('''CREATE TABLE IF NOT EXISTS events
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, date TEXT, desc TEXT, 
                  price TEXT, color TEXT, image TEXT, purpose TEXT, full_details TEXT, outcome TEXT)''')
    
    # Populate events table if empty (copying from app.py logic)
    c.execute("SELECT COUNT(*) FROM events")
    if c.fetchone()[0] == 0:
        print("Populating events table...")
        # Hardcoded data from app.py
        EVENTS = [
            {"id": 1, "title": "TechNova Codeathon", "date": "Mar 15, 2026", "desc": "24-hour intense coding marathon.", "price": "Free", "color": "#4facfe", "image": "https://picsum.photos/seed/code1/800/600", "purpose": "Rapid prototyping and problem solving.", "full_details": "A 24-hour marathon where teams build solutions for real-world problems. Includes mentorship, workshops, and high-intensity coding.", "outcome": "Win prizes, gain deep technical experience, and network with tech leaders."},
            {"id": 2, "title": "AI & ML Summit", "date": "Mar 20, 2026", "desc": "Explore the future of AI with experts.", "price": "₹800", "color": "#00f2fe", "image": "https://picsum.photos/seed/ai2/800/600", "purpose": "Knowledge sharing on cutting-edge AI trends.", "full_details": "Deep dive into Generative AI, Neural Networks, and the ethical implications of ML. Features keynote speakers from top AI labs.", "outcome": "Certification of participation and insight into AI career paths."},
            {"id": 3, "title": "Cyber Shield 2026", "date": "Mar 25, 2026", "desc": "Ethical Hacking workshop.", "price": "₹1200", "color": "#ff0055", "image": "https://picsum.photos/seed/cyber3/800/600", "purpose": "Strengthening cybersecurity awareness and skills.", "full_details": "Hands-on penetration testing, network security basics, and threat modeling. Learn to protect modern web applications from common vulnerabilities.", "outcome": "Hands-on experience with security tools and a 'Security Badge' certification."},
            {"id": 4, "title": "WebMosaic UI/UX", "date": "Apr 02, 2026", "desc": "Design and build competition.", "price": "Free", "color": "#ff9a9e", "image": "https://picsum.photos/seed/design4/800/600", "purpose": "Focusing on user-centric design principles.", "full_details": "Compete to create the most intuitive and visually stunning interface. Workshops on Figma prototyping and accessibility included.", "outcome": "Portfolio feedback from design leads and a design trophy."},
            {"id": 5, "title": "CloudCom Azure", "date": "Apr 10, 2026", "desc": "Hands-on workshop on Azure Cloud.", "price": "₹400", "color": "#a18cd1", "image": "https://picsum.photos/seed/cloud5/800/600", "purpose": "Mastering cloud infrastructure and deployment.", "full_details": "Deploying scalable apps on Microsoft Azure. Learn about VMs, App Services, and Cloud Databases.", "outcome": "Hands-on deployment experience and trial Azure credits."},
            {"id": 6, "title": "Data Science Dive", "date": "Apr 15, 2026", "desc": "Big Data analytics and visualization.", "price": "₹1500", "color": "#fbc2eb", "image": "https://picsum.photos/seed/data6/800/600", "purpose": "Unlocking patterns through data visualization.", "full_details": "Using Pandas, Matplotlib, and Seaborn to analyze complex datasets and present findings in an impactful way.", "outcome": "Mastery of data cleaning and professional charting techniques."},
            {"id": 7, "title": "Gaming Arena (CS2)", "date": "Apr 20, 2026", "desc": "5v5 Tactical Shooter tournament.", "price": "₹400/Team", "color": "#8fd3f4", "image": "https://picsum.photos/seed/game7/800/600", "purpose": "Competitive gaming and team coordination.", "full_details": "A high-stakes Counter-Strike 2 tournament for college teams. Bracket-style elimination with live shoutcasting.", "outcome": "Winning team trophy and e-sports glory."},
            {"id": 8, "title": "AppVentures Mobile", "date": "Apr 25, 2026", "desc": "Flutter & React Native workshop.", "price": "₹800", "color": "#84fab0", "image": "https://picsum.photos/seed/mobile8/800/600", "purpose": "Cross-platform mobile app development.", "full_details": "Learn to build apps that run on both iOS and Android from a single codebase. Focus on state management and UI performance.", "outcome": "A fully functional demo app ready for your portfolio."},
            {"id": 9, "title": "IoT Systems Expo", "date": "May 05, 2026", "desc": "Showcase your hardware projects.", "price": "Free", "color": "#fa709a", "image": "https://picsum.photos/seed/iot9/800/600", "purpose": "Connecting the physical world to the internet.", "full_details": "An exhibition of Arduino, Raspberry Pi, and ESP32 projects. Network with fellow hardware enthusiasts and innovators.", "outcome": "Project visibility and peer review from expert engineers."},
            {"id": 10, "title": "RoboRumble", "date": "May 10, 2026", "desc": "Line follower and obstacle avoider competition.", "price": "₹1200", "color": "#fee140", "image": "https://picsum.photos/seed/robot10/800/600", "purpose": "Exploring robotics and autonomous logic.", "full_details": "Build and program robots to navigate complex paths and avoid obstacles. Testing speed, accuracy, and logic efficiency.", "outcome": "Robotics kit prizes and technical bragging rights."},
            {"id": 11, "title": "Blockchain Basics", "date": "May 15, 2026", "desc": "Introduction to Web3 and Crypto.", "price": "₹800", "color": "#667eea", "image": "https://picsum.photos/seed/crypto11/800/600", "purpose": "Demystifying decentralized technologies.", "full_details": "Understand how ledgers work, the role of Smart Contracts, and the future of Ethereum and Bitcoin ecosystem.", "outcome": "Foundational knowledge to start building dApps."},
            {"id": 12, "title": "Tech QuizWhiz", "date": "May 20, 2026", "desc": "Test your tech knowledge.", "price": "Free", "color": "#30cfd0", "image": "https://picsum.photos/seed/quiz12/800/600", "purpose": "Fun and engaging tech trivia.", "full_details": "Multiple rounds covering computer history, latest gadgets, and programming languages. Fast-paced and highly competitive.", "outcome": "Amazon vouchers and 'Tech Genius' title."},
            {"id": 13, "title": "Startup Pitch", "date": "May 28, 2026", "desc": "Pitch your ideas to investors.", "price": "Free", "color": "#f093fb", "image": "https://picsum.photos/seed/startup13/800/600", "purpose": "Accelerating entrepreneurship among students.", "full_details": "A platform to present your business ideas to a panel of venture capitalists and successful alumni. Get feedback and potential funding.", "outcome": "Incubation support and mentorship opportunities."},
            {"id": 14, "title": "Networking Night", "date": "Jun 01, 2026", "desc": "Alumni meet and greet.", "price": "₹2000", "color": "#c471ed", "image": "https://picsum.photos/seed/network14/800/600", "purpose": "Building professional connections.", "full_details": "A formal dinner event where current students can network with alumni working at top tech firms. Includes a panel discussion on career growth.", "outcome": "Valuable professional leads and mentorship connections."},
            {"id": 15, "title": "Full Stack Fest", "date": "Jun 10, 2026", "desc": "MERN Stack deep dive workshop.", "price": "₹2500", "color": "#f6d365", "image": "https://picsum.photos/seed/web15/800/600", "purpose": "End-to-end web app development.", "full_details": "From database design with MongoDB to backend logic with Node Express and frontend interactivity with React.", "outcome": "Deployment-ready Full Stack project and MERN certification."}
        ]
        for ev in EVENTS:
            c.execute("""INSERT INTO events (id, title, date, desc, price, color, image, purpose, full_details, outcome) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""", 
                      (ev['id'], ev['title'], ev['date'], ev['desc'], ev['price'], ev['color'], ev['image'], ev['purpose'], ev['full_details'], ev['outcome']))
    
    # Ensure admin is host
    print("Setting admin role to host...")
    c.execute("UPDATE users SET role = 'host' WHERE username = 'admin'")
    
    conn.commit()
    conn.close()
    print("Database fix complete.")

if __name__ == "__main__":
    fix_db()
