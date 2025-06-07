import React from 'react';
import { Link } from 'react-router-dom';
import { File } from '../../types';
import Button from '../ui/Button';

interface FileCardProps {
  file: File;
}

const FileCard: React.FC<FileCardProps> = ({ file }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48">
        <img 
          src={file.previewUrl} 
          alt={file.title}
          className="w-full h-full object-cover"
        />
        {file.isFree && (
          <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-semibold px-2 py-1 m-2 rounded">
            Free
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">{file.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{file.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-blue-600 font-semibold">
            {file.isFree ? 'Free' : `$${file.price.toFixed(2)}`}
          </span>
          <Link to={`/file/${file.id}`}>
            <Button variant="outline" size="sm">View Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FileCard;