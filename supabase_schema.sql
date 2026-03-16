-- =============================================================
-- DUYENHAIRSALON – Supabase Production Schema
-- Role: PostgreSQL & Supabase expert
-- =============================================================

-- ▶ 1. ROLES (phân quyền)
CREATE TABLE roles (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL CHECK (name IN ('admin', 'manager', 'staff')),
  description text,
  created_at  timestamptz DEFAULT now()
);

INSERT INTO roles (name, description) VALUES
  ('admin',   'Toàn quyền truy cập và quản lý hệ thống'),
  ('manager', 'Quản lý lịch hẹn, tài chính, nhân viên – không xoá admin'),
  ('staff',   'Chỉ xem lịch hẹn của bản thân');

-- ▶ 2. USERS (nhân viên – kết hợp Supabase Auth)
CREATE TABLE users (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   text        NOT NULL,
  email       text        UNIQUE NOT NULL,
  phone       text,
  role_id     uuid        REFERENCES roles(id) ON DELETE SET NULL,
  avatar_url  text,
  is_active   boolean     DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_users_role_id ON users(role_id);

-- ▶ 3. CUSTOMERS (khách hàng)
CREATE TABLE customers (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   text        NOT NULL,
  phone       text,
  email       text,
  note        text,
  created_at  timestamptz DEFAULT now()
);

-- ▶ 4. APPOINTMENTS (lịch hẹn)
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled');

CREATE TABLE appointments (
  id               uuid               PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      uuid               REFERENCES customers(id) ON DELETE CASCADE,
  staff_id         uuid               REFERENCES users(id) ON DELETE SET NULL,
  service_name     text               NOT NULL,
  appointment_time timestamptz        NOT NULL,
  status           appointment_status DEFAULT 'scheduled',
  price            numeric            DEFAULT 0,
  created_at       timestamptz        DEFAULT now()
);

CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_staff_id    ON appointments(staff_id);
CREATE INDEX idx_appointments_time        ON appointments(appointment_time);

-- ▶ 5. EXPENSES (chi tiêu)
CREATE TABLE expenses (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  amount       numeric     NOT NULL CHECK (amount >= 0),
  category     text,
  expense_date date        NOT NULL,
  note         text,
  created_by   uuid        REFERENCES users(id) ON DELETE SET NULL,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX idx_expenses_created_by   ON expenses(created_by);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);

-- ▶ 6. INVENTORY (kho hàng)
CREATE TABLE inventory (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text        NOT NULL,
  quantity     integer     NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_stock    integer     NOT NULL DEFAULT 0,
  unit_price   numeric     NOT NULL DEFAULT 0,
  image_url    text,
  updated_at   timestamptz DEFAULT now()
);

-- ▶ 7. REVENUE LOGS (optional – tracking chi tiết doanh thu)
CREATE TABLE revenue_logs (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid        REFERENCES appointments(id) ON DELETE CASCADE,
  amount         numeric     NOT NULL,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX idx_revenue_appointment_id ON revenue_logs(appointment_id);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE roles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory     ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_logs  ENABLE ROW LEVEL SECURITY;

-- Helper function to get the current user's role name
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT r.name
  FROM   users u
  JOIN   roles r ON r.id = u.role_id
  WHERE  u.id = auth.uid()
  LIMIT  1;
$$;

-- ── ROLES table ──────────────────────────────────────────────
-- Admin only
CREATE POLICY "admin_all_roles" ON roles
  FOR ALL TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- ── USERS table ──────────────────────────────────────────────
-- Admin: full access
CREATE POLICY "admin_all_users" ON users
  FOR ALL TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- Manager: read all users, update non-admin, no delete admin
CREATE POLICY "manager_read_users" ON users
  FOR SELECT TO authenticated
  USING (get_my_role() = 'manager');

-- Staff: read own profile only
CREATE POLICY "staff_own_profile" ON users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- ── CUSTOMERS table ───────────────────────────────────────────
CREATE POLICY "admin_manager_all_customers" ON customers
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin', 'manager'))
  WITH CHECK (get_my_role() IN ('admin', 'manager'));

CREATE POLICY "staff_read_customers" ON customers
  FOR SELECT TO authenticated
  USING (get_my_role() = 'staff');

-- ── APPOINTMENTS table ────────────────────────────────────────
CREATE POLICY "admin_manager_all_appointments" ON appointments
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin', 'manager'))
  WITH CHECK (get_my_role() IN ('admin', 'manager'));

-- Staff: only their own appointments
CREATE POLICY "staff_own_appointments" ON appointments
  FOR SELECT TO authenticated
  USING (staff_id = auth.uid() AND get_my_role() = 'staff');

-- ── EXPENSES table ────────────────────────────────────────────
CREATE POLICY "admin_manager_all_expenses" ON expenses
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin', 'manager'))
  WITH CHECK (get_my_role() IN ('admin', 'manager'));
-- Staff: no access to expenses

-- ── INVENTORY table ───────────────────────────────────────────
CREATE POLICY "admin_manager_all_inventory" ON inventory
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin', 'manager'))
  WITH CHECK (get_my_role() IN ('admin', 'manager'));
-- Staff: no access to inventory

-- ── REVENUE LOGS table ────────────────────────────────────────
CREATE POLICY "admin_manager_revenue_logs" ON revenue_logs
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin', 'manager'))
  WITH CHECK (get_my_role() IN ('admin', 'manager'));

-- =============================================================
-- USEFUL VIEWS (KPI Aggregation)
-- =============================================================

-- Monthly Revenue KPI
CREATE OR REPLACE VIEW monthly_revenue AS
  SELECT
    DATE_TRUNC('month', appointment_time) AS month,
    SUM(price)                            AS total_revenue,
    COUNT(*)                              AS total_appointments
  FROM appointments
  WHERE status = 'completed'
  GROUP BY 1
  ORDER BY 1 DESC;

-- Monthly Expense KPI
CREATE OR REPLACE VIEW monthly_expenses AS
  SELECT
    DATE_TRUNC('month', expense_date::timestamptz) AS month,
    SUM(amount)                                    AS total_expense,
    category
  FROM expenses
  GROUP BY 1, category
  ORDER BY 1 DESC;

-- Low Stock Alert View
CREATE OR REPLACE VIEW low_stock_items AS
  SELECT *
  FROM inventory
  WHERE quantity < min_stock
  ORDER BY quantity ASC;


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
