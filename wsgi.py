"""
WSGI entrypoint for production servers (gunicorn / waitress).

This module exposes a Flask `app` object that production WSGI servers can use.
It ensures model artifacts are loaded on import so the server is ready to serve requests.
"""
from serve_model import app, load_artifacts

# Load artifacts at import time so the WSGI server has a ready-to-serve app.
# Keep errors visible to the process (so the server fails fast if artifacts are missing).
load_artifacts()

# Expose the WSGI callable named 'application'
application = app

# `app` is the WSGI callable used by servers like gunicorn or waitress.
# Example (gunicorn):  gunicorn -w 4 wsgi:app
# Example (waitress, Windows-friendly):  waitress-serve --port=5000 wsgi:app
