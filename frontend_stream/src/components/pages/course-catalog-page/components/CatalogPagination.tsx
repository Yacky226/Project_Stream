import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPaginationNumbers } from '../courseCatalog.utils';

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  goToPage: (page: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
}

export function CatalogPagination({
  page,
  totalPages,
  goToPage,
  goToPreviousPage,
  goToNextPage,
}: CatalogPaginationProps) {
  const pageNumbers = getPaginationNumbers(page, totalPages);

  return (
    <div className="ccp-pagination">
      <button disabled={page <= 1} onClick={goToPreviousPage} type="button">
        <ChevronLeft size={16} />
      </button>

      {pageNumbers.map((pageNumber) => (
        <button
          className={pageNumber === page ? 'is-active' : ''}
          key={pageNumber}
          onClick={() => goToPage(pageNumber)}
          type="button"
        >
          {pageNumber}
        </button>
      ))}

      <button disabled={page >= totalPages} onClick={goToNextPage} type="button">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
