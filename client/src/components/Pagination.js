const Pagination = ({ page, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const delta = 2; // show 2 pages on each side of current
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  // Don't render if only one page
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition"
      >
        Previous
      </button>

      {/* Page numbers */}
      {pageNumbers.map((p, idx) => (
        <button
          key={idx}
          onClick={() => typeof p === "number" && onPageChange(p)}
          className={`px-3 py-2 text-sm rounded-lg transition ${
            p === page
              ? "bg-primary-600 text-white"
              : p === "..."
                ? "cursor-default bg-transparent"
                : "border hover:bg-neutral-50"
          }`}
          disabled={p === "..."}
        >
          {p}
        </button>
      ))}

      {/* Next button */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
