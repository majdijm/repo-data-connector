-- Allow clients to view packages that are assigned to them
CREATE POLICY "Clients can view their assigned packages" 
ON public.packages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM client_packages cp 
  JOIN clients c ON c.id = cp.client_id 
  JOIN users u ON u.email = c.email 
  WHERE cp.package_id = packages.id 
  AND u.id = auth.uid()
));