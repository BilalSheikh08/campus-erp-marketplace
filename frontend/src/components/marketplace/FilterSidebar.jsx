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
    <aside className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-800" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Catalog Filters</h3>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 transition cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* Domain Category Filter */}
      {domains.length > 0 && (
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Campus Department
          </h4>
          <div className="space-y-1">
            {domains.map((dom) => (
              <button
                key={dom.value}
                type="button"
                onClick={() => onDomainChange(dom.value)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                  selectedDomain === dom.value
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{dom.label}</span>
                {dom.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    selectedDomain === dom.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
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
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Availability
          </h4>
          <div className="space-y-1">
            {stockStatuses.map((st) => (
              <button
                key={st.value}
                type="button"
                onClick={() => onStockStatusChange(st.value)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                  selectedStockStatus === st.value
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
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
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Budget (₹)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
          />
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
          />
        </div>
      </div>
    </aside>
  );
}

FilterSidebar.propTypes = {
  domains: PropTypes.array,
  selectedDomain: PropTypes.string,
  onDomainChange: PropTypes.func.isRequired,
  stockStatuses: PropTypes.array,
  selectedStockStatus: PropTypes.string,
  onStockStatusChange: PropTypes.func.isRequired,
  minPrice: PropTypes.string,
  maxPrice: PropTypes.string,
  onMinPriceChange: PropTypes.func.isRequired,
  onMaxPriceChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
};
