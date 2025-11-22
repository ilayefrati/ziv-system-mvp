from flask import Blueprint, request, jsonify, send_file, current_app
from models import db, File, Company, Vehicle, Driver
from werkzeug.utils import secure_filename
from datetime import datetime
import os

file_bp = Blueprint('file', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'xls', 'xlsx', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_path(file_url):
    """Convert file_url to actual file path"""
    if file_url.startswith('/uploads/'):
        # Relative path - construct full path
        upload_folder = current_app.config['UPLOAD_FOLDER']
        return os.path.join(upload_folder, file_url.replace('/uploads/', ''))
    return file_url

@file_bp.route('', methods=['GET'])
def list_files():
    """List all files (admin/debug)"""
    files = File.query.all()
    return jsonify([file.to_dict() for file in files]), 200

@file_bp.route('/<int:file_id>', methods=['GET'])
def get_file(file_id):
    """Get file metadata or download"""
    file = File.query.get_or_404(file_id)
    return jsonify(file.to_dict()), 200

@file_bp.route('/<int:file_id>/download', methods=['GET'])
def download_file(file_id):
    """Download file"""
    file = File.query.get_or_404(file_id)
    
    file_path = get_file_path(file.file_url)
    
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found on server'}), 404
    
    return send_file(
        file_path,
        as_attachment=True,
        download_name=file.filename,
        mimetype='application/octet-stream'
    )

@file_bp.route('/<int:file_id>', methods=['DELETE'])
def delete_file(file_id):
    """Delete file"""
    file = File.query.get_or_404(file_id)
    
    # Delete physical file
    file_path = get_file_path(file.file_url)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    db.session.delete(file)
    db.session.commit()
    
    return jsonify({'message': 'File deleted successfully'}), 200

@file_bp.route('/companies/<int:company_id>', methods=['GET'])
def list_company_files(company_id):
    """List company files"""
    company = Company.query.get_or_404(company_id)
    files = File.query.filter_by(company_id=company_id).all()
    return jsonify([file.to_dict() for file in files]), 200

@file_bp.route('/vehicles/<int:vehicle_id>', methods=['GET'])
def list_vehicle_files(vehicle_id):
    """List vehicle files"""
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    files = File.query.filter_by(vehicle_id=vehicle_id).all()
    return jsonify([file.to_dict() for file in files]), 200

@file_bp.route('/drivers/<int:driver_id>', methods=['GET'])
def list_driver_files(driver_id):
    """List driver files"""
    driver = Driver.query.get_or_404(driver_id)
    files = File.query.filter_by(driver_id=driver_id).all()
    return jsonify([file.to_dict() for file in files]), 200

# File upload endpoints are handled in the respective blueprints (company, vehicle, driver)
# This keeps the upload logic close to the entity it belongs to
