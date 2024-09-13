import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function Loading() {
  return (
    <div className="loader">
      <FontAwesomeIcon icon={faSpinner} spin />
    </div>
  );
}
