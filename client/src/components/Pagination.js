// src/components/Pagination.jsx
const Pagination = ({ page, totalPages, onPageChange }) => {
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
