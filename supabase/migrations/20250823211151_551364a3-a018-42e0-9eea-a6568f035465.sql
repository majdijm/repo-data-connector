-- Allow clients to view package services for their assigned packages
CREATE POLICY "Clients can view services for their assigned packages" 
ON public.package_services 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM client_packages cp 
  JOIN clients c ON c.id = cp.client_id 
  JOIN users u ON u.email = c.email 
  WHERE cp.package_id = package_services.package_id 
  AND u.id = auth.uid()
));