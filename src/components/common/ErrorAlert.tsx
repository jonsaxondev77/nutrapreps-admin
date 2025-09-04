import React from 'react';
import Alert from '@/components/ui/alert/Alert';

interface ErrorAlertProps {
  error: any;
  title?: string;
  className?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  error,
  title = "An Error Occurred",
  className = ""
}) => {
  let errorMessage = 'Please try again later.';

  // Attempt to extract a more specific error message from the API response
  if (error && typeof error === 'object') {
    if (error.data && error.data.message) {
      errorMessage = error.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      errorMessage = `Server responded with status: ${error.status}`;
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return (
    <div className={`my-4 ${className}`}>
      <Alert 
        variant="error" 
        title={title} 
        message={errorMessage} 
      />
    </div>
  );
};

export default ErrorAlert;