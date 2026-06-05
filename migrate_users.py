import sqlite3

def run_migration():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    
    # Check if full_name column exists
    c.execute("PRAGMA table_info(users)")
    columns = [row[1] for row in c.fetchall()]
    
    if 'full_name' not in columns:
        print("Adding full_name, email, phone, college_id, and profile_photo columns to users...")
        c.execute("ALTER TABLE users ADD COLUMN full_name TEXT")
        c.execute("ALTER TABLE users ADD COLUMN email TEXT")
        c.execute("ALTER TABLE users ADD COLUMN phone TEXT")
        c.execute("ALTER TABLE users ADD COLUMN college_id TEXT")
        c.execute("ALTER TABLE users ADD COLUMN profile_photo TEXT")
    else:
        print("User profile columns already exist.")
        
    conn.commit()
    conn.close()
    print("User table migration complete!")

if __name__ == '__main__':
    run_migration()
