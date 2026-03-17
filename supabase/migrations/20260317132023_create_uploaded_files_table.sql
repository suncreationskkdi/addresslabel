/*
  # Create uploaded files table

  1. New Tables
    - `uploaded_files`
      - `id` (uuid, primary key) - Unique identifier for each file
      - `filename` (text) - Original name of the uploaded file
      - `content` (text) - The text content of the file
      - `file_type` (text) - Type of file (instruction/sample)
      - `uploaded_at` (timestamptz) - When the file was uploaded
      - `user_id` (uuid) - Reference to the user who uploaded (nullable for now)

  2. Security
    - Enable RLS on `uploaded_files` table
    - Add policy for anyone to insert files (can be restricted later with auth)
    - Add policy for anyone to read files (can be restricted later with auth)

  3. Notes
    - Files are stored as text content in the database
    - Support for both instruction and sample text files
    - User authentication can be added later to restrict access
*/

CREATE TABLE IF NOT EXISTS uploaded_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  content text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('instruction', 'sample')),
  uploaded_at timestamptz DEFAULT now(),
  user_id uuid
);

ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert files"
  ON uploaded_files
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view files"
  ON uploaded_files
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can delete files"
  ON uploaded_files
  FOR DELETE
  USING (true);