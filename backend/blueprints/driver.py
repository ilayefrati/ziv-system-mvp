from flask import Blueprint, request, jsonify, current_app
from models import db, Driver, Company, File
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import uuid

driver_bp = Blueprint('driver', __name__)

def parse_date(date_str):
    """Helper to parse date string"""
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str.replace('Z', '+00:00')).date()
    except:
        return None

@driver_bp.route('', methods=['GET'])
def list_drivers():
    """List all drivers"""
    drivers = Driver.query.all()
    return jsonify([driver.to_dict() for driver in drivers]), 200

@driver_bp.route('', methods=['POST'])
def create_driver():
    """Create a new driver"""
    data = request.get_json()
    
    # Validate required fields
    if not data.get('identity_card'):
        return jsonify({'error': 'identity_card is required'}), 400
    
    # Check if identity_card already exists
    if Driver.query.filter_by(identity_card=data['identity_card']).first():
        return jsonify({'error': 'Identity card already exists'}), 400
    
    # Validate company exists if provided
    if data.get('company_id'):
        company = Company.query.get(data['company_id'])
        if not company:
            return jsonify({'error': 'Company not found'}), 404
    
    driver = Driver(
        identity_card=data['identity_card'],
        company_id=data.get('company_id'),
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        license_class=data.get('license_class'),
        license_expiry_date=parse_date(data.get('license_expiry_date')),
        traffic_info_expiry_date=parse_date(data.get('traffic_info_expiry_date')),
        address=data.get('address'),
        phone_mobile=data.get('phone_mobile'),
        phone_home=data.get('phone_home'),
        job_title=data.get('job_title'),
        work_location=data.get('work_location'),
        marital_status=data.get('marital_status'),
        birth_date=parse_date(data.get('birth_date')),
        employment_start_date=parse_date(data.get('employment_start_date')),
        education=data.get('education'),
        was_license_revoked=data.get('was_license_revoked', False),
        has_hazardous_materials_permit=data.get('has_hazardous_materials_permit', False),
        has_crane_operation_permit=data.get('has_crane_operation_permit', False),
        personal_number_in_company=data.get('personal_number_in_company'),
        email=data.get('email'),
        notes=data.get('notes')
    )
    
    db.session.add(driver)
    db.session.commit()
    
    return jsonify(driver.to_dict()), 201

@driver_bp.route('/<int:driver_id>', methods=['GET'])
def get_driver(driver_id):
    """Get driver by ID"""
    driver = Driver.query.get_or_404(driver_id)
    return jsonify(driver.to_dict()), 200

@driver_bp.route('/<int:driver_id>', methods=['PUT'])
def update_driver(driver_id):
    """Update driver"""
    driver = Driver.query.get_or_404(driver_id)
    data = request.get_json()
    
    if 'identity_card' in data:
        # Check if new identity_card already exists
        existing = Driver.query.filter_by(identity_card=data['identity_card']).first()
        if existing and existing.id != driver_id:
            return jsonify({'error': 'Identity card already exists'}), 400
        driver.identity_card = data['identity_card']
    if 'company_id' in data:
        if data['company_id']:
            company = Company.query.get(data['company_id'])
            if not company:
                return jsonify({'error': 'Company not found'}), 404
        driver.company_id = data['company_id']
    if 'first_name' in data:
        driver.first_name = data['first_name']
    if 'last_name' in data:
        driver.last_name = data['last_name']
    if 'license_class' in data:
        driver.license_class = data['license_class']
    if 'license_expiry_date' in data:
        driver.license_expiry_date = parse_date(data['license_expiry_date'])
    if 'traffic_info_expiry_date' in data:
        driver.traffic_info_expiry_date = parse_date(data['traffic_info_expiry_date'])
    if 'address' in data:
        driver.address = data['address']
    if 'phone_mobile' in data:
        driver.phone_mobile = data['phone_mobile']
    if 'phone_home' in data:
        driver.phone_home = data['phone_home']
    if 'job_title' in data:
        driver.job_title = data['job_title']
    if 'work_location' in data:
        driver.work_location = data['work_location']
    if 'marital_status' in data:
        driver.marital_status = data['marital_status']
    if 'birth_date' in data:
        driver.birth_date = parse_date(data['birth_date'])
    if 'employment_start_date' in data:
        driver.employment_start_date = parse_date(data['employment_start_date'])
    if 'education' in data:
        driver.education = data['education']
    if 'was_license_revoked' in data:
        driver.was_license_revoked = data['was_license_revoked']
    if 'has_hazardous_materials_permit' in data:
        driver.has_hazardous_materials_permit = data['has_hazardous_materials_permit']
    if 'has_crane_operation_permit' in data:
        driver.has_crane_operation_permit = data['has_crane_operation_permit']
    if 'personal_number_in_company' in data:
        driver.personal_number_in_company = data['personal_number_in_company']
    if 'email' in data:
        driver.email = data['email']
    if 'notes' in data:
        driver.notes = data['notes']
    
    db.session.commit()
    
    return jsonify(driver.to_dict()), 200

@driver_bp.route('/<int:driver_id>', methods=['DELETE'])
def delete_driver(driver_id):
    """Delete driver"""
    driver = Driver.query.get_or_404(driver_id)
    
    # Unassign from vehicle if assigned
    if driver.assigned_vehicle:
        driver.assigned_vehicle.assigned_driver_id = None
    
    db.session.delete(driver)
    db.session.commit()
    
    return jsonify({'message': 'Driver deleted successfully'}), 200

@driver_bp.route('/<int:driver_id>/files', methods=['POST'])
def upload_driver_file(driver_id):
    """Upload file for a driver"""
    driver = Driver.query.get_or_404(driver_id)
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and '.' in file.filename:
        # Generate unique filename
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4()}.{ext}"
        original_filename = secure_filename(file.filename)
        
        # Save file
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(os.path.join(upload_folder, 'drivers'), exist_ok=True)
        file_path = os.path.join(upload_folder, 'drivers', filename)
        file.save(file_path)
        
        # Create file URL (relative or absolute)
        file_url = f"/uploads/drivers/{filename}"
        
        # Create file record
        file_record = File(
            filename=original_filename,
            file_type=ext,
            file_url=file_url,
            notes=request.form.get('notes'),
            driver_id=driver_id
        )
        
        db.session.add(file_record)
        db.session.commit()
        
        return jsonify(file_record.to_dict()), 201
    
    return jsonify({'error': 'Invalid file'}), 400
