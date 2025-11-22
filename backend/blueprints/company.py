from flask import Blueprint, request, jsonify, current_app
from models import db, Company, Vehicle, Driver, File
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import uuid

company_bp = Blueprint('company', __name__)

def parse_date(date_str):
    """Helper to parse date string"""
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str.replace('Z', '+00:00')).date()
    except:
        return None

@company_bp.route('', methods=['GET'])
def list_companies():
    """List all companies"""
    companies = Company.query.all()
    return jsonify([company.to_dict() for company in companies]), 200

@company_bp.route('', methods=['POST'])
def create_company():
    """Create a new company"""
    data = request.get_json()
    
    # Validate required fields
    if not data.get('identity_card'):
        return jsonify({'error': 'identity_card is required'}), 400
    
    # Check if identity_card already exists
    if Company.query.filter_by(identity_card=data['identity_card']).first():
        return jsonify({'error': 'Identity card already exists'}), 400
    
    company = Company(
        identity_card=data['identity_card'],
        name=data.get('name'),
        address=data.get('address'),
        po_box=data.get('po_box'),
        phone=data.get('phone'),
        fax=data.get('fax'),
        contact_person=data.get('contact_person'),
        contact_phone=data.get('contact_phone'),
        manager_name=data.get('manager_name'),
        manager_phone=data.get('manager_phone'),
        manager_id=data.get('manager_id'),
        email=data.get('email'),
        safety_officer=data.get('safety_officer'),
        carrier_license_expiry=parse_date(data.get('carrier_license_expiry')),
        established_date=parse_date(data.get('established_date')),
        inspection_week=data.get('inspection_week'),
        notes=data.get('notes')
    )
    
    db.session.add(company)
    db.session.commit()
    
    return jsonify(company.to_dict()), 201

@company_bp.route('/<int:company_id>', methods=['GET'])
def get_company(company_id):
    """Get company by ID"""
    company = Company.query.get_or_404(company_id)
    return jsonify(company.to_dict()), 200

@company_bp.route('/<int:company_id>', methods=['PUT'])
def update_company(company_id):
    """Update company"""
    company = Company.query.get_or_404(company_id)
    data = request.get_json()
    
    if 'identity_card' in data:
        # Check if new identity_card already exists
        existing = Company.query.filter_by(identity_card=data['identity_card']).first()
        if existing and existing.id != company_id:
            return jsonify({'error': 'Identity card already exists'}), 400
        company.identity_card = data['identity_card']
    if 'name' in data:
        company.name = data['name']
    if 'address' in data:
        company.address = data['address']
    if 'po_box' in data:
        company.po_box = data['po_box']
    if 'phone' in data:
        company.phone = data['phone']
    if 'fax' in data:
        company.fax = data['fax']
    if 'contact_person' in data:
        company.contact_person = data['contact_person']
    if 'contact_phone' in data:
        company.contact_phone = data['contact_phone']
    if 'manager_name' in data:
        company.manager_name = data['manager_name']
    if 'manager_phone' in data:
        company.manager_phone = data['manager_phone']
    if 'manager_id' in data:
        company.manager_id = data['manager_id']
    if 'email' in data:
        company.email = data['email']
    if 'safety_officer' in data:
        company.safety_officer = data['safety_officer']
    if 'carrier_license_expiry' in data:
        company.carrier_license_expiry = parse_date(data['carrier_license_expiry'])
    if 'established_date' in data:
        company.established_date = parse_date(data['established_date'])
    if 'inspection_week' in data:
        company.inspection_week = data['inspection_week']
    if 'notes' in data:
        company.notes = data['notes']
    
    db.session.commit()
    
    return jsonify(company.to_dict()), 200

@company_bp.route('/<int:company_id>', methods=['DELETE'])
def delete_company(company_id):
    """Delete company"""
    company = Company.query.get_or_404(company_id)
    db.session.delete(company)
    db.session.commit()
    
    return jsonify({'message': 'Company deleted successfully'}), 200

@company_bp.route('/<int:company_id>/vehicles', methods=['GET'])
def get_company_vehicles(company_id):
    """Get all vehicles of a company"""
    company = Company.query.get_or_404(company_id)
    vehicles = Vehicle.query.filter_by(company_id=company_id).all()
    return jsonify([vehicle.to_dict() for vehicle in vehicles]), 200

@company_bp.route('/<int:company_id>/drivers', methods=['GET'])
def get_company_drivers(company_id):
    """Get all drivers of a company"""
    company = Company.query.get_or_404(company_id)
    drivers = Driver.query.filter_by(company_id=company_id).all()
    return jsonify([driver.to_dict() for driver in drivers]), 200

@company_bp.route('/<int:company_id>/files', methods=['POST'])
def upload_company_file(company_id):
    """Upload file for a company"""
    company = Company.query.get_or_404(company_id)
    
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
        os.makedirs(os.path.join(upload_folder, 'companies'), exist_ok=True)
        file_path = os.path.join(upload_folder, 'companies', filename)
        file.save(file_path)
        
        # Create file URL (relative or absolute)
        file_url = f"/uploads/companies/{filename}"
        
        # Create file record
        file_record = File(
            filename=original_filename,
            file_type=ext,
            file_url=file_url,
            notes=request.form.get('notes'),
            company_id=company_id
        )
        
        db.session.add(file_record)
        db.session.commit()
        
        return jsonify(file_record.to_dict()), 201
    
    return jsonify({'error': 'Invalid file'}), 400
