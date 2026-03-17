import { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { supabase, UploadedFile } from '../lib/supabase';

interface FileUploadProps {
  onFileUploaded?: (file: UploadedFile) => void;
}

export function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [fileType, setFileType] = useState<'instruction' | 'sample'>('instruction');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      setError('Please upload a .txt file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const content = await file.text();

      const { data, error: uploadError } = await supabase
        .from('uploaded_files')
        .insert({
          filename: file.name,
          content,
          file_type: fileType,
        })
        .select()
        .single();

      if (uploadError) throw uploadError;

      setSuccess(true);
      if (data && onFileUploaded) {
        onFileUploaded(data as UploadedFile);
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Upload Text File</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="instruction"
                checked={fileType === 'instruction'}
                onChange={(e) => setFileType(e.target.value as 'instruction')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Instruction</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="sample"
                checked={fileType === 'sample'}
                onChange={(e) => setFileType(e.target.value as 'sample')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Sample</span>
            </label>
          </div>
        </div>

        <div>
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">
              {uploading ? 'Uploading...' : 'Choose Text File'}
            </span>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
          <p className="mt-2 text-xs text-gray-500">
            Only .txt files are supported
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <X className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">File uploaded successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
}
