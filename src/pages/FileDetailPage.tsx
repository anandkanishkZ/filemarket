import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFileById } from '../data/mockData';
import FileDetails from '../components/files/FileDetails';
import MainLayout from '../components/layout/MainLayout';
import { File } from '../types';
import { useAuth } from '../context/AuthContext';

const FileDetailPage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  useEffect(() => {
    if (!fileId) {
      navigate('/browse');
      return;
    }

    // Fetch file details
    const fileDetails = getFileById(fileId);
    
    if (!fileDetails) {
      navigate('/browse');
      return;
    }
    
    setFile(fileDetails);
    
    // Check if user has purchased this file
    // In a real app, this would be a call to your database
    if (currentUser) {
      // Mock check - in a real app this would query purchase records
      setHasPurchased(fileId === '1' && currentUser.id === '1');
    }
    
    setLoading(false);
  }, [fileId, navigate, currentUser]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse bg-gray-200 h-64 rounded-lg mb-4"></div>
          <div className="animate-pulse bg-gray-200 h-8 w-1/2 rounded mb-2"></div>
          <div className="animate-pulse bg-gray-200 h-4 w-1/4 rounded mb-4"></div>
          <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
        </div>
      </MainLayout>
    );
  }

  if (!file) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">File not found</h2>
          <p className="text-gray-600 mb-6">The file you're looking for doesn't exist.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <FileDetails file={file} userHasPurchased={hasPurchased} />
      </div>
    </MainLayout>
  );
};

export default FileDetailPage;