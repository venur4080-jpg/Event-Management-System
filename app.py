"""
Event Management System - Server Launcher
Allows running `python app.py` directly from the workspace root directory.
"""
import sys
import os

# Set working directory to backend folder for database and asset lookups
workspace_root = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(workspace_root, 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if workspace_root not in sys.path:
    sys.path.insert(0, workspace_root)

os.chdir(backend_dir)

# Import application from backend package
import backend.app as backend_module
app = backend_module.app
asgi_app = backend_module.asgi_app

if __name__ == '__main__':
    is_dev = '--dev' in sys.argv or os.environ.get('FLASK_ENV') == 'development' or os.environ.get('DEBUG') == '1'

    print("\n" + "=" * 75)
    print("  EVENTS MANAGEMENT SYSTEM SERVER")
    print("=" * 75)
    print("  Local Access URL:    http://127.0.0.1:5000")
    print("  Network URL:         http://localhost:5000")
    print("  Default Admin Login: User ID: 0001 (or Email: admin@example.com)  |  Password: password123")
    print("  Engine:              " + ("Flask Dev Server (Debug Mode)" if is_dev else "High-Concurrency Async Server (Uvicorn / Waitress)"))
    print("  To Stop Server:      Press CTRL + C in this terminal")
    print("=" * 75)
    print("  Server is actively listening for requests.\n")

    if is_dev:
        app.run(debug=True, threaded=True, host='127.0.0.1', port=5000)
    else:
        started = False
        try:
            import uvicorn
            uvicorn.run(
                "app:asgi_app",
                host='127.0.0.1',
                port=5000,
                log_level='warning',
                access_log=False,
                limit_concurrency=2500,
                backlog=4096,
                timeout_keep_alive=30,
                http='httptools',
            )
            started = True
        except Exception as e:
            print(f"Uvicorn fallback note: {e}")

        if not started:
            try:
                from waitress import serve
                serve(
                    app,
                    host='127.0.0.1',
                    port=5000,
                    threads=64,
                    connection_limit=500,
                    channel_timeout=60,
                    backlog=500,
                )
                started = True
            except Exception as e:
                print(f"Waitress fallback note: {e}")

        if not started:
            app.run(debug=False, threaded=True, host='127.0.0.1', port=5000)
