# Ziv System MVP Specification

## 🧠 Overview

Ziv System is an internal fleet and driver management system for companies. The system provides functionality to register companies, assign drivers and vehicles, upload documentation (files), track expiration dates, and enable search and filtering. It is designed for use by logistics or fleet management personnel.

---

## 📊 MVP Core Features

### 1. Company Management
- View list of companies
- Add new company
- Edit company info
- Delete company
- Upload company-related files
- View vehicles of a company
- View drivers of a company

### 2. Vehicle Management
- View list of vehicles
- Add a new vehicle
- Edit vehicle details
- Delete a vehicle
- Upload vehicle files
- Assign driver to vehicle
- Show expired dates in red

### 3. Driver Management
- View list of drivers
- Add a new driver
- Edit driver details
- Delete a driver
- Upload driver files
- Show expired dates in red

### 4. Search & Filtering
- Search company by name or ID
- Search vehicles by license plate + filter by company/type/etc.
- Search drivers by name or ID + filter by company/status/etc.

---

## 🗂️ Backend API Structure

### Blueprint: `company`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/companies` | List all companies |
| POST   | `/companies` | Create new company |
| GET    | `/companies/<id>` | Get company by ID |
| PUT    | `/companies/<id>` | Update company |
| DELETE | `/companies/<id>` | Delete company |
| POST   | `/companies/<id>/files` | Upload file |
| GET    | `/companies/<id>/vehicles` | Get all vehicles of company |
| GET    | `/companies/<id>/drivers` | Get all drivers of company |

### Blueprint: `vehicle`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/vehicles` | List all vehicles |
| POST   | `/vehicles` | Create new vehicle |
| GET    | `/vehicles/<id>` | Get vehicle by ID |
| PUT    | `/vehicles/<id>` | Update vehicle |
| DELETE | `/vehicles/<id>` | Delete vehicle |
| POST   | `/vehicles/<id>/files` | Upload file |
| PUT    | `/vehicles/<id>/assign` | Assign driver to vehicle |
| GET    | `/vehicles/<id>/driver` | Get assigned driver |

### Blueprint: `driver`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/drivers` | List all drivers |
| POST   | `/drivers` | Create new driver |
| GET    | `/drivers/<id>` | Get driver by ID |
| PUT    | `/drivers/<id>` | Update driver |
| DELETE | `/drivers/<id>` | Delete driver |
| POST   | `/drivers/<id>/files` | Upload file |

### Blueprint: `file`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/files` | List all files (admin/debug) |
| GET    | `/files/<id>` | View metadata/download |
| DELETE | `/files/<id>` | Delete file |
| GET    | `/companies/<id>/files` | List company files |
| GET    | `/vehicles/<id>/files` | List vehicle files |
| GET    | `/drivers/<id>/files` | List driver files |

### Blueprint: `search`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/search/companies` | Search company by name/ID |
| GET    | `/search/vehicles` | Search vehicles by license_plate + filter |
| GET    | `/search/drivers` | Search drivers by name/ID + filter |

### Blueprint: `auth` (Optional)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/auth/login` | Login |
| GET    | `/auth/me` | Get current user |
| POST   | `/auth/logout` | Logout |

---

## 🖼️ Frontend Structure

### Pages
- **DashboardPage**: Home with quick stats (company count, expired licenses, etc.)
- **CompaniesPage**: View, add, edit, delete companies
- **CompanyDetailsPage**: View company info, vehicles, drivers, and upload files
- **VehiclesPage**: List and manage vehicles
- **VehicleDetailsPage**: Full vehicle card and driver assignment
- **DriversPage**: List and manage drivers
- **DriverDetailsPage**: Full driver profile and file uploads
- **SearchPage**: Centralized search and filter interface
- **LoginPage** *(optional)*

### Shared Components
- **CompanyCard** – Summary card for company
- **VehicleCard** – Summary card for vehicle
- **DriverCard** – Summary card for driver
- **FileUpload** – Upload files for any entity
- **FileList** – List of uploaded files
- **ExpiredLabel** – Displays red warning for expired items
- **SearchBar** – Search by field (name/ID/license)
- **Sidebar** – Navigation menu
- **Header** – Top navigation or branding
- **StatCard** – Dashboard insights (e.g., total vehicles, expiring this month)

---

## 🧱 Technologies & Stack

- **Frontend**: React + TypeScript (Vite)
- **Backend**: Flask + Flask Blueprints
- **Database**: PostgreSQL (pgAdmin)
- **Deployment (later)**: Docker (optional), local dev for MVP
- **Design**: Stitch AI (provided in zip)

---