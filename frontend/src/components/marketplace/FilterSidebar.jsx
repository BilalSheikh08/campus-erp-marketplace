import PropTypes from 'prop-types';
import { Filter, RotateCcw } from 'lucide-react';

export default function FilterSidebar({
  domains = [],
  selectedDomain = 'all',
  onDomainChange,
  stockStatuses = [],
  selectedStockStatus = 'all',
  onStockStatusChange,
  minPrice = '',
  maxPrice = '',
  onMinPriceChange,
  onMaxPriceChange,
  onResetFilters,
}) {
  return (
    <aside className="bg-white rounded-lg border border-[#E4DDCF] p-4 shadow-xs space-y-5 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-[#E4DDCF]">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-zinc-800" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900">
            Catalog Index
          </h3>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-[11px] font-mono text-blue-900 hover:underline inline-flex items-center gap-1 transition cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* Domain Category Filter */}
      {domains.length > 0 && (
        <div>
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-2">
            Campus Department
          </h4>
          <div className="space-y-1">
            {domains.map((dom) => (
              <button
                key={dom.value}
                type="button"
                onClick={() => onDomainChange(dom.value)}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition flex items-center justify-between cursor-pointer ${
                  selectedDomain === dom.value
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'text-zinc-700 hover:bg-[#FAF8F3]'
                }`}
              >
                <span>{dom.label}</span>
                {dom.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    selectedDomain === dom.value ? 'bg-white/20 text-white' : 'bg-[#FAF8F3] text-zinc-600 border border-[#E4DDCF]'
                  }`}>
                    {dom.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stock Availability */}
      {stockStatuses.length > 0 && (
        <div>
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-2">
            Stock Status
          </h4>
          <div className="space-y-1">
            {stockStatuses.map((st) => (
              <button
                key={st.value}
                type="button"
                onClick={() => onStockStatusChange(st.value)}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition flex items-center justify-between cursor-pointer ${
                  selectedStockStatus === st.value
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'text-zinc-700 hover:bg-[#FAF8F3]'
                }`}
              >
                <span>{st.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-2">
          Rate Filter (₹)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="w-full text-xs font-mono px-2.5 py-1.5 rounded border border-[#E4DDCF] bg-[#FAF8F3] text-zinc-900 focus:outline-none focus:border-blue-900 focus:bg-white"
          />
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="w-full text-xs font-mono px-2.5 py-1.5 rounded border border-[#E4DDCF] bg-[#FAF8F3] text-zinc-900 focus:outline-none focus:border-blue-900 focus:bg-white"
          />
        </div>
      </div>
    </aside>
  );
}

FilterSidebar.propTypes = {
  domains: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      count: PropTypes.number,
    })
  ),
  selectedDomain: PropTypes.string,
  onDomainChange: PropTypes.func.isRequired,
  stockStatuses: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  selectedStockStatus: PropTypes.string,
  onStockStatusChange: PropTypes.func.isRequired,
  minPrice: PropTypes.string,
  maxPrice: PropTypes.string,
  onMinPriceChange: PropTypes.func.isRequired,
  onMaxPriceChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
};
