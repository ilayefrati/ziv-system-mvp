from flask import Blueprint, request, jsonify, current_app
from models import db, Vehicle, Company, Driver, File
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import uuid

vehicle_bp = Blueprint('vehicle', __name__)

def parse_date(date_str):
    """Helper to parse date string"""
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str.replace('Z', '+00:00')).date()
    except:
        return None

@vehicle_bp.route('', methods=['GET'])
def list_vehicles():
    """List all vehicles"""
    vehicles = Vehicle.query.all()
    return jsonify([vehicle.to_dict() for vehicle in vehicles]), 200

@vehicle_bp.route('', methods=['POST'])
def create_vehicle():
    """Create a new vehicle"""
    data = request.get_json()
    
    # Validate required fields
    if not data.get('license_plate'):
        return jsonify({'error': 'license_plate is required'}), 400
    
    # Check if license_plate already exists
    if Vehicle.query.filter_by(license_plate=data['license_plate']).first():
        return jsonify({'error': 'License plate already exists'}), 400
    
    # Validate company exists if provided
    if data.get('company_id'):
        company = Company.query.get(data['company_id'])
        if not company:
            return jsonify({'error': 'Company not found'}), 404
    
    vehicle = Vehicle(
        license_plate=data['license_plate'],
        company_id=data.get('company_id'),
        assigned_driver_id=data.get('assigned_driver_id'),
        manufacturer=data.get('manufacturer'),
        model=data.get('model'),
        weight=data.get('weight'),
        department=data.get('department'),
        car_type=data.get('car_type'),
        carrier_license_expiry_date=parse_date(data.get('carrier_license_expiry_date')),
        internal_number=data.get('internal_number'),
        chassis_number=data.get('chassis_number'),
        odometer_reading=data.get('odometer_reading'),
        production_year=data.get('production_year'),
        license_expiry_date=parse_date(data.get('license_expiry_date')),
        last_safety_inspection=parse_date(data.get('last_safety_inspection')),
        next_safety_inspection=parse_date(data.get('next_safety_inspection')),
        hova_insurance_expiry_date=parse_date(data.get('hova_insurance_expiry_date')),
        mekif_insurance_expiry_date=parse_date(data.get('mekif_insurance_expiry_date')),
        special_equipment_expiry_date=parse_date(data.get('special_equipment_expiry_date')),
        hazardous_license_expiry_date=parse_date(data.get('hazardous_license_expiry_date')),
        tachograph_expiry_date=parse_date(data.get('tachograph_expiry_date')),
        winter_inspection_expiry_date=parse_date(data.get('winter_inspection_expiry_date')),
        brake_inspection_expiry_date=parse_date(data.get('brake_inspection_expiry_date')),
        equipment=data.get('equipment'),
        has_tow_hook=data.get('has_tow_hook'),
        is_operational=data.get('is_operational', True),
        notes=data.get('notes')
    )
    
    db.session.add(vehicle)
    db.session.commit()
    
    return jsonify(vehicle.to_dict()), 201

@vehicle_bp.route('/<int:vehicle_id>', methods=['GET'])
def get_vehicle(vehicle_id):
    """Get vehicle by ID"""
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    return jsonify(vehicle.to_dict()), 200

@vehicle_bp.route('/<int:vehicle_id>', methods=['PUT'])
def update_vehicle(vehicle_id):
    """Update vehicle"""
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    data = request.get_json()
    
    if 'license_plate' in data:
        # Check if new license_plate already exists
        existing = Vehicle.query.filter_by(license_plate=data['license_plate']).first()
        if existing and existing.id != vehicle_id:
            return jsonify({'error': 'License plate already exists'}), 400
        vehicle.license_plate = data['license_plate']
    if 'company_id' in data:
        if data['company_id']:
            company = Company.query.get(data['company_id'])
            if not company:
                return jsonify({'error': 'Company not found'}), 404
        vehicle.company_id = data['company_id']
    if 'assigned_driver_id' in data:
        if data['assigned_driver_id']:
            driver = Driver.query.get(data['assigned_driver_id'])
            if not driver:
                return jsonify({'error': 'Driver not found'}), 404
        vehicle.assigned_driver_id = data['assigned_driver_id']
    if 'manufacturer' in data:
        vehicle.manufacturer = data['manufacturer']
    if 'model' in data:
        vehicle.model = data['model']
    if 'weight' in data:
        vehicle.weight = data['weight']
    if 'department' in data:
        vehicle.department = data['department']
    if 'car_type' in data:
        vehicle.car_type = data['car_type']
    if 'carrier_license_expiry_date' in data:
        vehicle.carrier_license_expiry_date = parse_date(data['carrier_license_expiry_date'])
    if 'internal_number' in data:
        vehicle.internal_number = data['internal_number']
    if 'chassis_number' in data:
        vehicle.chassis_number = data['chassis_number']
    if 'odometer_reading' in data:
        vehicle.odometer_reading = data['odometer_reading']
    if 'production_year' in data:
        vehicle.production_year = data['production_year']
    if 'license_expiry_date' in data:
        vehicle.license_expiry_date = parse_date(data['license_expiry_date'])
    if 'last_safety_inspection' in data:
        vehicle.last_safety_inspection = parse_date(data['last_safety_inspection'])
    if 'next_safety_inspection' in data:
        vehicle.next_safety_inspection = parse_date(data['next_safety_inspection'])
    if 'hova_insurance_expiry_date' in data:
        vehicle.hova_insurance_expiry_date = parse_date(data['hova_insurance_expiry_date'])
    if 'mekif_insurance_expiry_date' in data:
        vehicle.mekif_insurance_expiry_date = parse_date(data['mekif_insurance_expiry_date'])
    if 'special_equipment_expiry_date' in data:
        vehicle.special_equipment_expiry_date = parse_date(data['special_equipment_expiry_date'])
    if 'hazardous_license_expiry_date' in data:
        vehicle.hazardous_license_expiry_date = parse_date(data['hazardous_license_expiry_date'])
    if 'tachograph_expiry_date' in data:
        vehicle.tachograph_expiry_date = parse_date(data['tachograph_expiry_date'])
    if 'winter_inspection_expiry_date' in data:
        vehicle.winter_inspection_expiry_date = parse_date(data['winter_inspection_expiry_date'])
    if 'brake_inspection_expiry_date' in data:
        vehicle.brake_inspection_expiry_date = parse_date(data['brake_inspection_expiry_date'])
    if 'equipment' in data:
        vehicle.equipment = data['equipment']
    if 'has_tow_hook' in data:
        vehicle.has_tow_hook = data['has_tow_hook']
    if 'is_operational' in data:
        vehicle.is_operational = data['is_operational']
    if 'notes' in data:
        vehicle.notes = data['notes']
    
    db.session.commit()
    
    return jsonify(vehicle.to_dict()), 200

@vehicle_bp.route('/<int:vehicle_id>', methods=['DELETE'])
def delete_vehicle(vehicle_id):
    """Delete vehicle"""
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    db.session.delete(vehicle)
    db.session.commit()
    
    return jsonify({'message': 'Vehicle deleted successfully'}), 200

@vehicle_bp.route('/<int:vehicle_id>/assign', methods=['PUT'])
def assign_driver(vehicle_id):
    """Assign driver to vehicle"""
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    data = request.get_json()
    
    driver_id = data.get('driver_id') or data.get('assigned_driver_id')
    
    if driver_id:
        # Validate driver exists
        driver = Driver.query.get(driver_id)
        if not driver:
            return jsonify({'error': 'Driver not found'}), 404
        
        # Unassign driver from previous vehicle if any
        previous_vehicle = Vehicle.query.filter_by(assigned_driver_id=driver_id).first()
        if previous_vehicle and previous_vehicle.id != vehicle_id:
            previous_vehicle.assigned_driver_id = None
        
        vehicle.assigned_driver_id = driver_id
    else:
        # Unassign driver
        vehicle.assigned_driver_id = None
    
    db.session.commit()
    
    return jsonify(vehicle.to_dict()), 200

@vehicle_bp.route('/<int:vehicle_id>/driver', methods=['GET'])
def get_vehicle_driver(vehicle_id):
    """Get assigned driver of vehicle"""
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    
    if vehicle.assigned_driver_id:
        driver = Driver.query.get(vehicle.assigned_driver_id)
        if driver:
            return jsonify(driver.to_dict()), 200
    
    return jsonify({'message': 'No driver assigned'}), 404

@vehicle_bp.route('/<int:vehicle_id>/files', methods=['POST'])
def upload_vehicle_file(vehicle_id):
    """Upload file for a vehicle"""
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    
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
        os.makedirs(os.path.join(upload_folder, 'vehicles'), exist_ok=True)
        file_path = os.path.join(upload_folder, 'vehicles', filename)
        file.save(file_path)
        
        # Create file URL (relative or absolute)
        file_url = f"/uploads/vehicles/{filename}"
        
        # Create file record
        file_record = File(
            filename=original_filename,
            file_type=ext,
            file_url=file_url,
            notes=request.form.get('notes'),
            vehicle_id=vehicle_id
        )
        
        db.session.add(file_record)
        db.session.commit()
        
        return jsonify(file_record.to_dict()), 201
    
    return jsonify({'error': 'Invalid file'}), 400
