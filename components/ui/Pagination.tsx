import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center space-x-2 mt-8 mb-4">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`
            w-8 h-8 flex items-center justify-center rounded
            ${currentPage === page
              ? 'bg-black text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'}
            border border-gray-300 text-sm font-medium
          `}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
