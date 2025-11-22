from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import db from models to avoid circular imports
from models import db

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Configuration
    # Database connection from .env
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', 'postgres')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME', 'ziv_system')
    
    # Construct DATABASE_URI from individual components or use DATABASE_URI if provided
    database_uri = os.getenv('DATABASE_URI')
    if not database_uri:
        database_uri = f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)  # Enable CORS for all routes
    
    # Create upload folder if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from blueprints.company import company_bp
    from blueprints.vehicle import vehicle_bp
    from blueprints.driver import driver_bp
    from blueprints.file import file_bp
    from blueprints.search import search_bp
    
    app.register_blueprint(company_bp, url_prefix='/api/companies')
    app.register_blueprint(vehicle_bp, url_prefix='/api/vehicles')
    app.register_blueprint(driver_bp, url_prefix='/api/drivers')
    app.register_blueprint(file_bp, url_prefix='/api/files')
    app.register_blueprint(search_bp, url_prefix='/api/search')
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)

