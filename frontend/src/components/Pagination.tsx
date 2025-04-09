interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  }
  
  const Pagination = ({
    currentPage,
    totalPages,
    pageSize,
    onPageChange,
    onPageSizeChange
  }: PaginationProps) => {
    const generatePageNumbers = () => {
      const pages: (number | string)[] = [];
  
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
  
        if (currentPage > 3) {
          pages.push("...");
        }
  
        const start = Math.max(2, currentPage - 2);
        const end = Math.min(totalPages - 1, currentPage + 2);
  
        for (let i = start; i <= end; i++) {
          if (i !== 1 && i !== totalPages) {
            pages.push(i);
          }
        }
  
        if (currentPage < totalPages - 2) {
          pages.push("...");
        }
  
        pages.push(totalPages);
      }
  
      return pages;
    };
  
    return (
      <div className="flex flex-col items-center mt-4 gap-2">
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
  
          {generatePageNumbers().map((page, idx) =>
            typeof page === "number" ? (
              <button
                key={idx}
                onClick={() => onPageChange(page)}
                disabled={page === currentPage}
                className={`px-3 py-1 border rounded ${
                  page === currentPage ? "bg-blue-600 text-white" : ""
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={idx} className="px-2">
                {page}
              </span>
            )
          )}
  
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
  
        <label className="text-sm">
          Results per page:
          <select
            value={pageSize}
            onChange={(p) => {
              onPageSizeChange(Number(p.target.value));
              onPageChange(1);
            }}
            className="ml-2 border rounded px-2 py-1"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </label>
      </div>
    );
  };
  
  export default Pagination;
  