const SearchBar = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="px-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
  />
);
export default SearchBar;
