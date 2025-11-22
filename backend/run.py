#!/usr/bin/env python
"""
Simple script to run the Flask application
"""
from app import create_app

if __name__ == '__main__':
    app = create_app()
    print("=" * 50)
    print("Starting Ziv System Backend Server")
    print("=" * 50)
    print("Server will run on: http://localhost:5000")
    print("API endpoints available at: http://localhost:5000/api/*")
    print("Health check: http://localhost:5000/api/health")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)

