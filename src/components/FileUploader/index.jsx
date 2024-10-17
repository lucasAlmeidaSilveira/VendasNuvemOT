import React, { useState } from 'react';

export function FileUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files?.[0] || null);
    setUploadedFileUrl('');
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor, selecione um arquivo');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload do arquivo');
      }

      const data = await response.json();
      setUploadedFileUrl(data.url);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setUploading(false);
      setSelectedFile(null); // Limpar o arquivo após o upload
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <input
        type="file"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {selectedFile && (
        <div className="mt-4">
          <button
            onClick={handleUpload}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Fazer upload
          </button>
        </div>
      )}
      {uploading && <p className="text-gray-500">Fazendo upload...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {uploadedFileUrl && (
        <div className="mt-4">
          <p className="text-gray-500">Arquivo enviado com sucesso!</p>
          <p className="text-gray-500">URL: {uploadedFileUrl}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
