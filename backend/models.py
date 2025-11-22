from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Text, Boolean
from sqlalchemy.orm import relationship

# This will be initialized in app.py
db = SQLAlchemy()

class Company(db.Model):
    __tablename__ = 'company'
    
    id = Column(Integer, primary_key=True)
    identity_card = Column(String(100), unique=True, nullable=False)
    name = Column(Text)
    address = Column(Text)
    po_box = Column(Text)
    phone = Column(Text)
    fax = Column(Text)
    contact_person = Column(Text)
    contact_phone = Column(Text)
    manager_name = Column(Text)
    manager_phone = Column(Text)
    manager_id = Column(Text)
    email = Column(Text)
    safety_officer = Column(Text)
    carrier_license_expiry = Column(Date)
    established_date = Column(Date)
    inspection_week = Column(Integer)
    notes = Column(Text)
    
    # Relationships
    vehicles = relationship('Vehicle', back_populates='company', cascade='all, delete-orphan')
    drivers = relationship('Driver', back_populates='company', cascade='all, delete-orphan')
    files = relationship('File', back_populates='company', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'identity_card': self.identity_card,
            'name': self.name,
            'address': self.address,
            'po_box': self.po_box,
            'phone': self.phone,
            'fax': self.fax,
            'contact_person': self.contact_person,
            'contact_phone': self.contact_phone,
            'manager_name': self.manager_name,
            'manager_phone': self.manager_phone,
            'manager_id': self.manager_id,
            'email': self.email,
            'safety_officer': self.safety_officer,
            'carrier_license_expiry': self.carrier_license_expiry.isoformat() if self.carrier_license_expiry else None,
            'established_date': self.established_date.isoformat() if self.established_date else None,
            'inspection_week': self.inspection_week,
            'notes': self.notes,
            'vehicles_count': len(self.vehicles) if self.vehicles else 0,
            'drivers_count': len(self.drivers) if self.drivers else 0
        }

class Vehicle(db.Model):
    __tablename__ = 'vehicle'
    
    id = Column(Integer, primary_key=True)
    license_plate = Column(Text, unique=True, nullable=False)
    company_id = Column(Integer, ForeignKey('company.id'), nullable=True)
    assigned_driver_id = Column(Integer, ForeignKey('driver.id'), nullable=True)
    manufacturer = Column(Text)
    model = Column(Text)
    weight = Column(Integer)
    department = Column(Text)
    car_type = Column(Text)
    carrier_license_expiry_date = Column(Date)
    internal_number = Column(Integer)
    chassis_number = Column(Text)
    odometer_reading = Column(Integer)
    production_year = Column(Integer)
    license_expiry_date = Column(Date)
    last_safety_inspection = Column(Date)
    next_safety_inspection = Column(Date)
    hova_insurance_expiry_date = Column(Date)
    mekif_insurance_expiry_date = Column(Date)
    special_equipment_expiry_date = Column(Date)
    hazardous_license_expiry_date = Column(Date)
    tachograph_expiry_date = Column(Date)
    winter_inspection_expiry_date = Column(Date)
    brake_inspection_expiry_date = Column(Date)
    equipment = Column(Text)
    has_tow_hook = Column(Boolean)
    is_operational = Column(Boolean)
    notes = Column(Text)
    
    # Relationships
    company = relationship('Company', back_populates='vehicles')
    assigned_driver = relationship('Driver', back_populates='assigned_vehicle', foreign_keys=[assigned_driver_id])
    files = relationship('File', back_populates='vehicle', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'license_plate': self.license_plate,
            'company_id': self.company_id,
            'company_name': self.company.name if self.company else None,
            'assigned_driver_id': self.assigned_driver_id,
            'driver_name': f"{self.assigned_driver.first_name} {self.assigned_driver.last_name}" if self.assigned_driver else None,
            'manufacturer': self.manufacturer,
            'model': self.model,
            'weight': self.weight,
            'department': self.department,
            'car_type': self.car_type,
            'carrier_license_expiry_date': self.carrier_license_expiry_date.isoformat() if self.carrier_license_expiry_date else None,
            'internal_number': self.internal_number,
            'chassis_number': self.chassis_number,
            'odometer_reading': self.odometer_reading,
            'production_year': self.production_year,
            'license_expiry_date': self.license_expiry_date.isoformat() if self.license_expiry_date else None,
            'last_safety_inspection': self.last_safety_inspection.isoformat() if self.last_safety_inspection else None,
            'next_safety_inspection': self.next_safety_inspection.isoformat() if self.next_safety_inspection else None,
            'hova_insurance_expiry_date': self.hova_insurance_expiry_date.isoformat() if self.hova_insurance_expiry_date else None,
            'mekif_insurance_expiry_date': self.mekif_insurance_expiry_date.isoformat() if self.mekif_insurance_expiry_date else None,
            'special_equipment_expiry_date': self.special_equipment_expiry_date.isoformat() if self.special_equipment_expiry_date else None,
            'hazardous_license_expiry_date': self.hazardous_license_expiry_date.isoformat() if self.hazardous_license_expiry_date else None,
            'tachograph_expiry_date': self.tachograph_expiry_date.isoformat() if self.tachograph_expiry_date else None,
            'winter_inspection_expiry_date': self.winter_inspection_expiry_date.isoformat() if self.winter_inspection_expiry_date else None,
            'brake_inspection_expiry_date': self.brake_inspection_expiry_date.isoformat() if self.brake_inspection_expiry_date else None,
            'equipment': self.equipment,
            'has_tow_hook': self.has_tow_hook,
            'is_operational': self.is_operational,
            'notes': self.notes
        }
    
    def is_expired(self, field='license_expiry_date'):
        """Check if a date field is expired"""
        date_field = getattr(self, field, None)
        if date_field:
            return date_field < datetime.now().date()
        return False

class Driver(db.Model):
    __tablename__ = 'driver'
    
    id = Column(Integer, primary_key=True)
    identity_card = Column(Text, unique=True, nullable=False)
    company_id = Column(Integer, ForeignKey('company.id'), nullable=True)
    first_name = Column(Text)
    last_name = Column(Text)
    license_class = Column(Text)
    license_expiry_date = Column(Date)
    traffic_info_expiry_date = Column(Date)
    address = Column(Text)
    phone_mobile = Column(Text)
    phone_home = Column(Text)
    job_title = Column(Text)
    work_location = Column(Text)
    marital_status = Column(Text)
    birth_date = Column(Date)
    employment_start_date = Column(Date)
    education = Column(Text)
    was_license_revoked = Column(Boolean)
    has_hazardous_materials_permit = Column(Boolean)
    has_crane_operation_permit = Column(Boolean)
    personal_number_in_company = Column(Text)
    email = Column(Text)
    notes = Column(Text)
    
    # Relationships
    company = relationship('Company', back_populates='drivers')
    assigned_vehicle = relationship('Vehicle', back_populates='assigned_driver', uselist=False, foreign_keys='Vehicle.assigned_driver_id')
    files = relationship('File', back_populates='driver', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'identity_card': self.identity_card,
            'company_id': self.company_id,
            'company_name': self.company.name if self.company else None,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"{self.first_name} {self.last_name}" if self.first_name and self.last_name else None,
            'license_class': self.license_class,
            'license_expiry_date': self.license_expiry_date.isoformat() if self.license_expiry_date else None,
            'traffic_info_expiry_date': self.traffic_info_expiry_date.isoformat() if self.traffic_info_expiry_date else None,
            'address': self.address,
            'phone_mobile': self.phone_mobile,
            'phone_home': self.phone_home,
            'job_title': self.job_title,
            'work_location': self.work_location,
            'marital_status': self.marital_status,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'employment_start_date': self.employment_start_date.isoformat() if self.employment_start_date else None,
            'education': self.education,
            'was_license_revoked': self.was_license_revoked,
            'has_hazardous_materials_permit': self.has_hazardous_materials_permit,
            'has_crane_operation_permit': self.has_crane_operation_permit,
            'personal_number_in_company': self.personal_number_in_company,
            'email': self.email,
            'notes': self.notes,
            'vehicle_id': self.assigned_vehicle.id if self.assigned_vehicle else None,
            'vehicle_plate': self.assigned_vehicle.license_plate if self.assigned_vehicle else None
        }
    
    def is_expired(self, field='license_expiry_date'):
        """Check if a date field is expired"""
        date_field = getattr(self, field, None)
        if date_field:
            return date_field < datetime.now().date()
        return False

class File(db.Model):
    __tablename__ = 'files'
    
    id = Column(Integer, primary_key=True)
    filename = Column(Text)
    file_type = Column(Text)
    file_url = Column(Text, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)
    company_id = Column(Integer, ForeignKey('company.id'), nullable=True)
    vehicle_id = Column(Integer, ForeignKey('vehicle.id'), nullable=True)
    driver_id = Column(Integer, ForeignKey('driver.id'), nullable=True)
    
    # Relationships
    company = relationship('Company', back_populates='files')
    vehicle = relationship('Vehicle', back_populates='files')
    driver = relationship('Driver', back_populates='files')
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'file_type': self.file_type,
            'file_url': self.file_url,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'notes': self.notes,
            'company_id': self.company_id,
            'vehicle_id': self.vehicle_id,
            'driver_id': self.driver_id
        }
