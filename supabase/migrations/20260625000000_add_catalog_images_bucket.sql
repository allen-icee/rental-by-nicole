-- Create the catalog-images bucket
insert into storage.buckets (id, name, public)
values ('catalog-images', 'catalog-images', true)
on conflict (id) do nothing;

-- Set up security policies
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'catalog-images' );

create policy "Authenticated Admin Upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'catalog-images' );

create policy "Authenticated Admin Update"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'catalog-images' );

create policy "Authenticated Admin Delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'catalog-images' );
