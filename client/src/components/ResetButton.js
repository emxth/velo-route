// components/ResetButton.jsx
const ResetButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full px-4 py-2.5 rounded-xl bg-secondary-50 border border-secondary-200 text-secondary-700 font-semibold hover:bg-secondary-100 hover:border-secondary-300 transition-all flex items-center justify-center gap-2"
  >
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
    Reset filters
  </button>
);

export default ResetButton;
