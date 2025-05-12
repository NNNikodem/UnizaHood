import React from 'react';
import '../../CSS/Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  
  // Funkcia na generovanie rozsahu strán
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Vždy zobraziť prvú stranu
    pageNumbers.push(1);
    
    // Určiť rozsah strán okolo aktuálnej strany
    const rangeStart = Math.max(2, currentPage - 1);
    const rangeEnd = Math.min(totalPages - 1, currentPage + 1);
    
    // Pridať elipsu medzi prvou stranou a rangeStart, ak je medzera
    if (rangeStart > 2) {
      pageNumbers.push('...');
    }
    
    // Pridať strany v rozsahu
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pageNumbers.push(i);
    }
    
    // Pridať elipsu medzi rangeEnd a poslednou stranou, ak je medzera
    if (rangeEnd < totalPages - 1) {
      pageNumbers.push('...');
    }
    
    // Vždy zobraziť poslednú stranu, ak ich je viac ako 1
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="pagination-button"
        aria-label="Predchádzajúca stránka"
      >
        &laquo;
      </button>
      
      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>;
        }
        
        return (
          <button
            key={`page-${page}`}
            onClick={() => onPageChange(page)}
            className={`pagination-button ${currentPage === page ? 'active' : ''}`}
            aria-label={`Stránka ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}
      
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="pagination-button"
        aria-label="Nasledujúca stránka"
      >
        &raquo;
      </button>
    </div>
  );
};

export default Pagination;
