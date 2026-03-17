import { useEffect, useState } from 'react';
import { FileText, Trash2, Download } from 'lucide-react';
import { supabase, UploadedFile } from '../lib/supabase';

export function FileList() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (!error && data) {
      setFiles(data as UploadedFile[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('uploaded_files')
      .delete()
      .eq('id', id);

    if (!error) {
      setFiles(files.filter(f => f.id !== id));
    }
  };

  const handleDownload = (file: UploadedFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <p className="text-gray-500 text-center">Loading files...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <p className="text-gray-500 text-center">No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h2>
      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.filename}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    file.file_type === 'instruction'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {file.file_type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(file.uploaded_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(file)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(file.id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
