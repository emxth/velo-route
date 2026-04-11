const FilterDropdown = ({ label, options, value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="px-4 py-2 border rounded-lg bg-white"
  >
    <option value="">All {label}</option>
    {options.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);
export default FilterDropdown;
