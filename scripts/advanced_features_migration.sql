  -- == 1. HR & Tính Lương Hoa Hồng ==
  ALTER TABLE services ADD COLUMN IF NOT EXISTS commission_percent numeric DEFAULT 0;
  
  ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS staff_id uuid REFERENCES users(id) ON DELETE SET NULL;
  ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS commission_amount numeric DEFAULT 0;
  
  DO $$ BEGIN
      CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');
  EXCEPTION
      WHEN duplicate_object THEN null;
  END $$;
  
  CREATE TABLE IF NOT EXISTS leave_requests (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id uuid REFERENCES users(id) ON DELETE CASCADE,
      start_date date NOT NULL,
      end_date date NOT NULL,
      reason text,
      status leave_status DEFAULT 'pending',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
  );
  
  -- == 2. Khuyến mãi (Promo Codes) ==
  CREATE TABLE IF NOT EXISTS promo_codes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      code text UNIQUE NOT NULL,
      discount_type text NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
      discount_value numeric NOT NULL,
      max_uses integer,
      used_count integer DEFAULT 0,
      valid_from timestamptz,
      valid_until timestamptz,
      is_active boolean DEFAULT true,
      created_at timestamptz DEFAULT now()
  );
  
  ALTER TABLE invoices ADD COLUMN IF NOT EXISTS promo_code_id uuid REFERENCES promo_codes(id) ON DELETE SET NULL;
  
  -- == 3. Gói dịch vụ trả trước (Prepaid Packages & Combos) ==
  CREATE TABLE IF NOT EXISTS prepaid_packages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      price numeric NOT NULL,
      total_sessions integer NOT NULL,
      service_id uuid REFERENCES services(id) ON DELETE SET NULL, 
      valid_days integer DEFAULT 365,
      is_active boolean DEFAULT true,
      created_at timestamptz DEFAULT now()
  );
  
  CREATE TABLE IF NOT EXISTS customer_prepaid_packages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
      package_id uuid REFERENCES prepaid_packages(id) ON DELETE RESTRICT,
      total_sessions integer NOT NULL,
      used_sessions integer DEFAULT 0,
      expiry_date timestamptz,
      created_at timestamptz DEFAULT now()
  );
  
  -- == 4. Quản lý hạn sử dụng Kho ==
  ALTER TABLE inventory ADD COLUMN IF NOT EXISTS expiry_date date;
