CREATE TABLE "company" (
  "id" serial PRIMARY KEY,
  "identity_card" text UNIQUE NOT NULL,
  "name" text,
  "address" text,
  "po_box" text,
  "phone" text,
  "fax" text,
  "contact_person" text,
  "contact_phone" text,
  "manager_name" text,
  "manager_phone" text,
  "manager_id" text,
  "email" text,
  "safety_officer" text,
  "carrier_license_expiry" date,
  "established_date" date,
  "inspection_week" integer,
  "notes" text
);

CREATE TABLE "vehicle" (
  "id" serial PRIMARY KEY,
  "license_plate" text UNIQUE NOT NULL,
  "company_id" integer,
  "assigned_driver_id" integer,
  "manufacturer" text,
  "model" text,
  "weight" integer,
  "department" text,
  "car_type" text,
  "carrier_license_expiry_date" date,
  "internal_number" integer,
  "chassis_number" text,
  "odometer_reading" integer,
  "production_year" integer,
  "license_expiry_date" date,
  "last_safety_inspection" date,
  "next_safety_inspection" date,
  "hova_insurance_expiry_date" date,
  "mekif_insurance_expiry_date" date,
  "special_equipment_expiry_date" date,
  "hazardous_license_expiry_date" date,
  "tachograph_expiry_date" date,
  "winter_inspection_expiry_date" date,
  "brake_inspection_expiry_date" date,
  "equipment" text,
  "has_tow_hook" boolean,
  "is_operational" boolean,
  "notes" text
);

CREATE TABLE "driver" (
  "id" serial PRIMARY KEY,
  "identity_card" text UNIQUE NOT NULL,
  "company_id" integer,
  "first_name" text,
  "last_name" text,
  "license_class" text,
  "license_expiry_date" date,
  "traffic_info_expiry_date" date,
  "address" text,
  "phone_mobile" text,
  "phone_home" text,
  "job_title" text,
  "work_location" text,
  "marital_status" text,
  "birth_date" date,
  "employment_start_date" date,
  "education" text,
  "was_license_revoked" boolean,
  "has_hazardous_materials_permit" boolean,
  "has_crane_operation_permit" boolean,
  "personal_number_in_company" text,
  "email" text,
  "notes" text
);

CREATE TABLE "files" (
  "id" serial PRIMARY KEY,
  "filename" text,
  "file_type" text,
  "file_url" text NOT NULL,
  "uploaded_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "notes" text,
  "company_id" integer,
  "vehicle_id" integer,
  "driver_id" integer
);

ALTER TABLE "vehicle" ADD FOREIGN KEY ("company_id") REFERENCES "company" ("id");

ALTER TABLE "vehicle" ADD FOREIGN KEY ("assigned_driver_id") REFERENCES "driver" ("id");

ALTER TABLE "driver" ADD FOREIGN KEY ("company_id") REFERENCES "company" ("id");

ALTER TABLE "files" ADD FOREIGN KEY ("company_id") REFERENCES "company" ("id");

ALTER TABLE "files" ADD FOREIGN KEY ("vehicle_id") REFERENCES "vehicle" ("id");

ALTER TABLE "files" ADD FOREIGN KEY ("driver_id") REFERENCES "driver" ("id");
