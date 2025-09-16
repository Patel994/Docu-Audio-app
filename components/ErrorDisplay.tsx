
import React from 'react';
import { IconAlertTriangle } from './Icons';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="w-full flex flex-col items-center text-center p-6 bg-red-50 border border-red-200 rounded-lg">
      <IconAlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-xl font-semibold text-red-800">An Error Occurred</h3>
      <p className="text-red-700 mt-2 max-w-md">{message}</p>
      <p className="text-red-600 mt-4 text-sm">Please try again. If the problem persists, ensure your image is clear and well-lit.</p>
    </div>
  );
};

export default ErrorDisplay;
