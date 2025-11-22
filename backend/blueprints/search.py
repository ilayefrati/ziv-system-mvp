from flask import Blueprint, request, jsonify
from models import Company, Vehicle, Driver
from sqlalchemy import or_

search_bp = Blueprint('search', __name__)

@search_bp.route('/companies', methods=['GET'])
def search_companies():
    """Search companies by name or identity_card"""
    query = request.args.get('q', '').strip()
    
    if not query:
        companies = Company.query.all()
    else:
        # Search by name or identity_card
        companies = Company.query.filter(
            or_(
                Company.name.ilike(f'%{query}%'),
                Company.identity_card.ilike(f'%{query}%')
            )
        ).all()
    
    return jsonify([company.to_dict() for company in companies]), 200

@search_bp.route('/vehicles', methods=['GET'])
def search_vehicles():
    """Search vehicles by license plate and filter"""
    query = request.args.get('q', '').strip()
    company_id = request.args.get('company_id', type=int)
    car_type = request.args.get('car_type')
    
    vehicles_query = Vehicle.query
    
    # Search by license plate
    if query:
        vehicles_query = vehicles_query.filter(
            Vehicle.license_plate.ilike(f'%{query}%')
        )
    
    # Filter by company
    if company_id:
        vehicles_query = vehicles_query.filter_by(company_id=company_id)
    
    # Filter by car_type (renamed from vehicle_type)
    if car_type:
        vehicles_query = vehicles_query.filter_by(car_type=car_type)
    
    vehicles = vehicles_query.all()
    return jsonify([vehicle.to_dict() for vehicle in vehicles]), 200

@search_bp.route('/drivers', methods=['GET'])
def search_drivers():
    """Search drivers by name or identity_card and filter"""
    query = request.args.get('q', '').strip()
    company_id = request.args.get('company_id', type=int)
    
    drivers_query = Driver.query
    
    # Search by name or identity_card
    if query:
        drivers_query = drivers_query.filter(
            or_(
                Driver.first_name.ilike(f'%{query}%'),
                Driver.last_name.ilike(f'%{query}%'),
                Driver.identity_card.ilike(f'%{query}%')
            )
        )
    
    # Filter by company
    if company_id:
        drivers_query = drivers_query.filter_by(company_id=company_id)
    
    drivers = drivers_query.all()
    return jsonify([driver.to_dict() for driver in drivers]), 200
