import React from 'react';
import { File } from '../../types';
import FileCard from './FileCard';

interface FileGridProps {
  files: File[];
  title?: string;
}

const FileGrid: React.FC<FileGridProps> = ({ files, title }) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg text-gray-600">No files found</h3>
      </div>
    );
  }

  return (
    <div className="py-6">
      {title && (
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {files.map((file) => (
          <FileCard key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
};

export default FileGrid;