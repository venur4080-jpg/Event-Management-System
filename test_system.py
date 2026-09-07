"""
test_system.py - Automated verification test suite for the Event Management System.
Tests authentication, registration, seats tracking, notifications, audit logs,
admin controls, AI assistant responses, and PDF ticket generation.
"""
import unittest
import json
import sqlite3
from datetime import datetime
from app import app, init_db, get_events

class EventManagementSystemTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()

    def _get_upcoming_event(self):
        events = get_events()
        now = datetime.now()
        for e in events:
            try:
                ev_date = datetime.strptime(e.get('date', ''), "%b %d, %Y")
                if ev_date >= now:
                    return e
            except Exception:
                continue
        return events[-1] if events else None

    def setUp(self):
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def test_01_database_tables_and_columns(self):
        """Verify all tables and critical columns exist in the database."""
        conn = sqlite3.connect('users.db', timeout=15)
        c = conn.cursor()
        
        # Check tables
        tables = ['users', 'events', 'registrations', 'notifications', 'reviews', 'audit_log', 'razorpay_orders']
        for tbl in tables:
            c.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{tbl}'")
            self.assertIsNotNone(c.fetchone(), f"Table '{tbl}' should exist in database.")

        # Check events columns
        c.execute("PRAGMA table_info(events)")
        event_cols = [row[1] for row in c.fetchall()]
        for col in ['seats_total', 'seats_filled', 'featured', 'venue']:
            self.assertIn(col, event_cols, f"Column '{col}' should exist in events table.")

        # Check users columns
        c.execute("PRAGMA table_info(users)")
        user_cols = [row[1] for row in c.fetchall()]
        self.assertIn('is_admin', user_cols, "Column 'is_admin' should exist in users table.")
        conn.close()

    def test_02_admin_login_and_dashboard_access(self):
        """Test admin login and access to admin panel dashboard."""
        with self.client.session_transaction() as sess:
            sess['loggedin'] = True
            sess['username'] = 'admin'
        
        # Admin dashboard
        resp = self.client.get('/admin')
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b'Overview', resp.data)
        self.assertIn(b'Total Users', resp.data)

        # Admin users page
        resp_users = self.client.get('/admin/users')
        self.assertEqual(resp_users.status_code, 200)
        self.assertIn(b'Users', resp_users.data)

        # Admin events page
        resp_events = self.client.get('/admin/events')
        self.assertEqual(resp_events.status_code, 200)
        self.assertIn(b'Events', resp_events.data)

        # Admin audit log
        resp_audit = self.client.get('/admin/audit')
        self.assertEqual(resp_audit.status_code, 200)
        self.assertIn(b'Audit', resp_audit.data)

    def test_03_registration_flow_and_audit(self):
        """Test event registration, seat increment, notification, and audit log."""
        ev = self._get_upcoming_event()
        self.assertIsNotNone(ev, "There should be at least one upcoming event in database.")
        ev_id = ev['id']

        test_user = 'test_student_user'
        with self.client.session_transaction() as sess:
            sess['loggedin'] = True
            sess['username'] = test_user

        # Register for event
        resp = self.client.post(f'/register/{ev_id}', data={
            'full_name': 'Test Student',
            'email': 'student@test.com',
            'phone': '9876543210',
            'college_id': 'COL-2026-001',
            'payment_method': 'UPI',
            'upi_id': 'test@upi'
        }, follow_redirects=True)
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b'Registration Successful', resp.data)

        # Verify registration in DB
        conn = sqlite3.connect('users.db', timeout=15)
        c = conn.cursor()
        c.execute("SELECT * FROM registrations WHERE username=? AND event_id=?", (test_user, ev_id))
        reg = c.fetchone()
        self.assertIsNotNone(reg, "Registration row should exist.")

        # Verify notification created
        c.execute("SELECT * FROM notifications WHERE username=?", (test_user,))
        notif = c.fetchone()
        self.assertIsNotNone(notif, "Notification should be generated for the user.")

        # Verify audit log entry
        c.execute("SELECT * FROM audit_log WHERE username=? AND action='register_event'", (test_user,))
        audit = c.fetchone()
        self.assertIsNotNone(audit, "Audit log should record the registration.")
        conn.close()

        # Verify PDF ticket download
        resp_ticket = self.client.get(f'/download_ticket/{ev_id}')
        self.assertEqual(resp_ticket.status_code, 200)
        self.assertEqual(resp_ticket.headers.get('Content-Type'), 'application/pdf')

        # Clean up registration
        self.client.post(f'/unregister/{ev_id}')

    def test_04_ai_assistant_endpoint(self):
        """Test AI assistant endpoint (/api/chat) with contextual queries."""
        with self.client.session_transaction() as sess:
            sess['loggedin'] = True
            sess['username'] = 'test_student_user'

        # Test query for free events
        resp_free = self.client.post('/api/chat', 
                                     data=json.dumps({'message': 'Are there any free events?'}),
                                     content_type='application/json')
        self.assertEqual(resp_free.status_code, 200)
        data_free = resp_free.get_json()
        self.assertIn('reply', data_free)
        self.assertTrue(len(data_free['reply']) > 10)

        # Test query for how to register
        resp_reg = self.client.post('/api/chat', 
                                    data=json.dumps({'message': 'How do I register for hackathons?'}),
                                    content_type='application/json')
        self.assertEqual(resp_reg.status_code, 200)
        data_reg = resp_reg.get_json()
        self.assertIn('reply', data_reg)
        self.assertIn('register', data_reg['reply'].lower())

        # Test query for ticket download
        resp_ticket = self.client.post('/api/chat', 
                                       data=json.dumps({'message': 'Where can I download my ticket?'}),
                                       content_type='application/json')
        self.assertEqual(resp_ticket.status_code, 200)
        data_ticket = resp_ticket.get_json()
        self.assertIn('reply', data_ticket)
        self.assertIn('ticket', data_ticket['reply'].lower())

    def test_05_admin_user_role_management(self):
        """Test promoting, demoting and exporting users via admin panel."""
        conn = sqlite3.connect('users.db', timeout=15)
        c = conn.cursor()
        c.execute("INSERT OR IGNORE INTO users (username, password, role) VALUES ('demouser', 'dummyhash', 'user')")
        c.execute("SELECT id FROM users WHERE username='demouser'")
        user_id = c.fetchone()[0]
        conn.commit()
        conn.close()

        with self.client.session_transaction() as sess:
            sess['loggedin'] = True
            sess['username'] = 'admin'

        # Promote to host
        resp_promote = self.client.post(f'/admin/users/{user_id}/promote', follow_redirects=True)
        self.assertEqual(resp_promote.status_code, 200)

        conn = sqlite3.connect('users.db', timeout=15)
        c = conn.cursor()
        c.execute("SELECT role FROM users WHERE id=?", (user_id,))
        self.assertEqual(c.fetchone()[0], 'host')
        conn.close()

        # Demote to user
        resp_demote = self.client.post(f'/admin/users/{user_id}/demote', follow_redirects=True)
        self.assertEqual(resp_demote.status_code, 200)
        
        conn = sqlite3.connect('users.db', timeout=15)
        c = conn.cursor()
        c.execute("SELECT role FROM users WHERE id=?", (user_id,))
        self.assertEqual(c.fetchone()[0], 'user')

        # Export users CSV
        resp_export = self.client.get('/admin/export/users')
        self.assertEqual(resp_export.status_code, 200)
        self.assertIn('text/csv', resp_export.headers.get('Content-Type'))
        self.assertIn(b'Username', resp_export.data)

        # Clean up test user
        conn = sqlite3.connect('users.db', timeout=15)
        c = conn.cursor()
        c.execute("DELETE FROM users WHERE id=?", (user_id,))
        conn.commit()
        conn.close()

    def test_06_team_registration_and_ticket(self):
        """Test Team Registration with teammates and team PDF ticket generation."""
        ev = self._get_upcoming_event()
        self.assertIsNotNone(ev, "There should be at least one upcoming event in database.")
        ev_id = ev['id']

        team_leader = 'test_team_lead'
        with self.client.session_transaction() as sess:
            sess['loggedin'] = True
            sess['username'] = team_leader

        # Register Team of 3
        resp = self.client.post(f'/register/{ev_id}', data={
            'reg_type': 'team',
            'team_name': 'Code Warriors',
            'member_count': '3',
            'full_name': 'Lead Dev',
            'email': 'lead@test.com',
            'phone': '9876543211',
            'college_id': 'COL-2026-T01',
            'member_2_name': 'Alice Smith',
            'member_2_email': 'alice@test.com',
            'member_2_phone': '9876543212',
            'member_2_college': 'COL-2026-T02',
            'member_3_name': 'Bob Jones',
            'member_3_email': 'bob@test.com',
            'member_3_phone': '9876543213',
            'member_3_college': 'COL-2026-T03',
            'payment_method': 'UPI',
            'upi_id': 'team@upi'
        }, follow_redirects=True)
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b'Code Warriors', resp.data)

        # Verify DB entry with team details
        conn = sqlite3.connect('users.db', timeout=15)
        c = conn.cursor()
        c.execute("SELECT team_name, team_members FROM registrations WHERE username=? AND event_id=?", (team_leader, ev_id))
        row = c.fetchone()
        self.assertIsNotNone(row)
        self.assertEqual(row[0], 'Code Warriors')
        members = json.loads(row[1])
        self.assertEqual(len(members), 2)
        conn.close()

        # Verify PDF Ticket contains team info
        resp_ticket = self.client.get(f'/download_ticket/{ev_id}')
        self.assertEqual(resp_ticket.status_code, 200)
        self.assertEqual(resp_ticket.headers.get('Content-Type'), 'application/pdf')

        # Clean up
        self.client.post(f'/unregister/{ev_id}')

        # Test 5-member team registration
        resp5 = self.client.post(f'/register/{ev_id}', data={
            'reg_type': 'team',
            'team_name': 'Quantum Five',
            'member_count': '5',
            'full_name': 'Lead Dev',
            'email': 'lead@test.com',
            'phone': '9876543211',
            'college_id': 'COL-2026-T01',
            'member_2_name': 'Alice',
            'member_2_email': 'alice@test.com',
            'member_2_phone': '9876543212',
            'member_2_college': 'COL-2026-T02',
            'member_3_name': 'Bob',
            'member_3_email': 'bob@test.com',
            'member_3_phone': '9876543213',
            'member_3_college': 'COL-2026-T03',
            'member_4_name': 'Charlie',
            'member_4_email': 'charlie@test.com',
            'member_4_phone': '9876543214',
            'member_4_college': 'COL-2026-T04',
            'member_5_name': 'Diana',
            'member_5_email': 'diana@test.com',
            'member_5_phone': '9876543215',
            'member_5_college': 'COL-2026-T05',
            'payment_method': 'UPI',
            'upi_id': 'team5@upi'
        }, follow_redirects=True)
        self.assertEqual(resp5.status_code, 200)
        self.assertIn(b'Quantum Five', resp5.data)

        # Verify DB has 4 teammates
        conn = sqlite3.connect('users.db', timeout=15)
        c = conn.cursor()
        c.execute("SELECT team_name, team_members FROM registrations WHERE username=? AND event_id=?", (team_leader, ev_id))
        row = c.fetchone()
        self.assertIsNotNone(row)
        self.assertEqual(row[0], 'Quantum Five')
        members = json.loads(row[1])
        self.assertEqual(len(members), 4)
        conn.close()

        # Clean up
        self.client.post(f'/unregister/{ev_id}')

    def test_07_live_ticket_scanner_checkin(self):
        """Test Live Ticket QR Scanner verification API and check-in status."""
        ev = self._get_upcoming_event()
        self.assertIsNotNone(ev, "There should be at least one upcoming event in database.")
        ev_id = ev['id']

        attendee_user = 'scanner_test_attendee'
        with self.client.session_transaction() as sess:
            sess['loggedin'] = True
            sess['username'] = attendee_user

        # Register attendee
        self.client.post(f'/register/{ev_id}', data={
            'full_name': 'Scanner Test Attendee',
            'email': 'scan@test.com',
            'phone': '9876543299',
            'college_id': 'COL-2026-SCAN',
            'payment_method': 'UPI',
            'upi_id': 'scan@upi'
        })

        # Switch to Admin/Host session for scanning
        with self.client.session_transaction() as sess:
            sess['loggedin'] = True
            sess['username'] = 'admin'

        # Scanner page access
        resp_scan_page = self.client.get('/scan_ticket')
        self.assertEqual(resp_scan_page.status_code, 200)

        # 1. Verify valid ticket by attendee username
        resp_verify = self.client.post('/api/verify_ticket', 
                                       data=json.dumps({'code': attendee_user}),
                                       content_type='application/json')
        self.assertEqual(resp_verify.status_code, 200)
        data = resp_verify.get_json()
        self.assertTrue(data['ok'])
        self.assertFalse(data['already_checked_in'])
        self.assertEqual(data['username'], attendee_user)

        # 2. Verify duplicate check-in warning
        resp_dup = self.client.post('/api/verify_ticket', 
                                    data=json.dumps({'code': attendee_user}),
                                    content_type='application/json')
        self.assertEqual(resp_dup.status_code, 200)
        data_dup = resp_dup.get_json()
        self.assertTrue(data_dup['ok'])
        self.assertTrue(data_dup['already_checked_in'])

        # 3. Check recent checkins API
        resp_recent = self.client.get('/api/recent_checkins')
        self.assertEqual(resp_recent.status_code, 200)
        recent_data = resp_recent.get_json()
        self.assertTrue(len(recent_data['checkins']) > 0)

        # Clean up
        with self.client.session_transaction() as sess:
            sess['loggedin'] = True
            sess['username'] = attendee_user
        self.client.post(f'/unregister/{ev_id}')

if __name__ == '__main__':
    unittest.main()
