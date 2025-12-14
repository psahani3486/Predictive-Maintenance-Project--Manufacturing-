"""
serve_production.py

Lightweight production runner using Waitress (works on Windows).

Usage:
  python serve_production.py --port 5000 --threads 4

This will import the WSGI app from `wsgi.py` and run it with Waitress.
"""
import argparse
import sys

try:
    from waitress import serve
except Exception:
    serve = None  # type: ignore

from wsgi import app  # this will load artifacts at import-time

if app is None:
    raise ValueError("The WSGI app could not be loaded. Ensure 'app' is properly defined in 'wsgi.py'.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=5000, help="Port to bind")
    parser.add_argument("--threads", type=int, default=4, help="Number of threads for waitress")
    args = parser.parse_args()

    if serve is None:
        print("Waitress is not installed. Install it with: pip install waitress", file=sys.stderr)
        sys.exit(1)

    print(f"Starting production server on 0.0.0.0:{args.port} with {args.threads} threads")
    serve(app, host="0.0.0.0", port=args.port, threads=args.threads)


if __name__ == "__main__":
    main()
