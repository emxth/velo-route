// components/Pagination.jsx
const Pagination = ({ page, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const delta = 2;
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

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-3 mt-10">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-5 py-2 rounded-xl border border-neutral-200 text-neutral-600 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition-all"
      >
        ← Previous
      </button>
      <span className="text-neutral-600 text-sm">
        Page <strong className="text-primary-600">{page}</strong> of{" "}
        {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-5 py-2 rounded-xl border border-neutral-200 text-neutral-600 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition-all"
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
