-- Add is_free_request column to payment_orders table
ALTER TABLE payment_orders 
ADD COLUMN is_free_request BOOLEAN DEFAULT FALSE;

-- Add comment to explain the column purpose
COMMENT ON COLUMN payment_orders.is_free_request IS 'Indicates if this is a free trial request (true for trial package)';
