# Ziv System - Fleet and Driver Management System

A comprehensive internal fleet and driver management system for companies, built with Flask (backend) and React + TypeScript (frontend).

## 🚀 Features

### Company Management
- View, add, edit, and delete companies
- Upload company-related files
- View vehicles and drivers of a company

### Vehicle Management
- View, add, edit, and delete vehicles
- Upload vehicle files
- Assign drivers to vehicles
- Track expiration dates (registration, insurance, inspection)
- Visual indicators for expired dates

### Driver Management
- View, add, edit, and delete drivers
- Upload driver files
- Track license and medical expiration dates
- Visual indicators for expired dates

### Search & Filtering
- Search companies by name or ID
- Search vehicles by license plate
- Search drivers by name or ID
- Filter by company, status, type, etc.

## 🛠️ Tech Stack

- **Backend**: Flask, Flask-SQLAlchemy, PostgreSQL
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Database**: PostgreSQL

## 📋 Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL

## 🔧 Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file in the backend directory (copy from `.env.example`):
```bash
DATABASE_URI=postgresql://postgres:postgres@localhost:5432/ziv_system
UPLOAD_FOLDER=uploads
```

6. Create the PostgreSQL database:
```sql
CREATE DATABASE ziv_system;
```

7. Run the Flask application:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults to `http://localhost:5000/api`):
```bash
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## 📁 Project Structure

```
ziv-system/
├── backend/
│   ├── app.py                 # Flask application entry point
│   ├── models.py              # Database models
│   ├── blueprints/            # API blueprints
│   │   ├── company.py
│   │   ├── vehicle.py
│   │   ├── driver.py
│   │   ├── file.py
│   │   └── search.py
│   ├── requirements.txt
│   └── uploads/               # File uploads directory
│
├── frontend/
│   ├── src/
│   │   ├── api/               # API client
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── design/                    # Design files
```

## 🔌 API Endpoints

### Companies
- `GET /api/companies` - List all companies
- `POST /api/companies` - Create company
- `GET /api/companies/<id>` - Get company
- `PUT /api/companies/<id>` - Update company
- `DELETE /api/companies/<id>` - Delete company
- `POST /api/companies/<id>/files` - Upload file
- `GET /api/companies/<id>/vehicles` - Get company vehicles
- `GET /api/companies/<id>/drivers` - Get company drivers

### Vehicles
- `GET /api/vehicles` - List all vehicles
- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles/<id>` - Get vehicle
- `PUT /api/vehicles/<id>` - Update vehicle
- `DELETE /api/vehicles/<id>` - Delete vehicle
- `POST /api/vehicles/<id>/files` - Upload file
- `PUT /api/vehicles/<id>/assign` - Assign driver
- `GET /api/vehicles/<id>/driver` - Get assigned driver

### Drivers
- `GET /api/drivers` - List all drivers
- `POST /api/drivers` - Create driver
- `GET /api/drivers/<id>` - Get driver
- `PUT /api/drivers/<id>` - Update driver
- `DELETE /api/drivers/<id>` - Delete driver
- `POST /api/drivers/<id>/files` - Upload file

### Search
- `GET /api/search/companies?q=<query>` - Search companies
- `GET /api/search/vehicles?q=<query>&company_id=<id>&vehicle_type=<type>` - Search vehicles
- `GET /api/search/drivers?q=<query>&company_id=<id>&status=<status>` - Search drivers

## 🎨 Design

The frontend follows the design specifications provided in the `design/` folder, featuring:
- Dark theme with custom color palette
- Responsive layout
- Modern UI components
- Tailwind CSS styling

## 📝 Notes

- The database tables are automatically created when the Flask app starts
- File uploads are stored in the `uploads/` directory
- Expired dates are highlighted in red throughout the UI
- The system supports file uploads for companies, vehicles, and drivers

## 🚧 Next Steps

- Add authentication/authorization
- Implement form modals for add/edit operations
- Add file download functionality
- Enhance search and filtering
- Add data export capabilities
- Implement notifications for expiring documents

