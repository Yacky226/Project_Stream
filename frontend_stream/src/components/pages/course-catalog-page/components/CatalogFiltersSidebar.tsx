import type { CatalogCourse, PriceFilter } from '../courseCatalog.types';
import { levelOptions } from '../courseCatalog.utils';

interface CatalogFiltersSidebarProps {
  categories: string[];
  selectedCategories: string[];
  priceFilter: PriceFilter;
  selectedLevels: Array<CatalogCourse['level']>;
  minRating: number;
  maxDuration: number;
  clearFilters: () => void;
  toggleCategory: (category: string, checked: boolean) => void;
  setPriceFilter: (priceFilter: PriceFilter) => void;
  toggleLevel: (level: CatalogCourse['level'], checked: boolean) => void;
  setMinRating: (rating: number) => void;
  setMaxDuration: (duration: number) => void;
}

export function CatalogFiltersSidebar({
  categories,
  selectedCategories,
  priceFilter,
  selectedLevels,
  minRating,
  maxDuration,
  clearFilters,
  toggleCategory,
  setPriceFilter,
  toggleLevel,
  setMinRating,
  setMaxDuration,
}: CatalogFiltersSidebarProps) {
  return (
    <aside className="ccp-sidebar">
      <div className="ccp-sidebar-card">
        <div className="ccp-sidebar-head">
          <h3>Filters</h3>
          <button onClick={clearFilters} type="button">Clear all</button>
        </div>

        <section>
          <h4>Category</h4>
          <div className="ccp-filter-list">
            {categories.map((category) => (
              <label key={category}>
                <input
                  checked={selectedCategories.includes(category)}
                  onChange={(event) => toggleCategory(category, event.target.checked)}
                  type="checkbox"
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h4>Price</h4>
          <div className="ccp-filter-list">
            <label>
              <input
                checked={priceFilter === 'all'}
                name="price"
                onChange={() => setPriceFilter('all')}
                type="radio"
              />
              <span>Any</span>
            </label>
            <label>
              <input
                checked={priceFilter === 'free'}
                name="price"
                onChange={() => setPriceFilter('free')}
                type="radio"
              />
              <span>Free</span>
            </label>
            <label>
              <input
                checked={priceFilter === 'paid'}
                name="price"
                onChange={() => setPriceFilter('paid')}
                type="radio"
              />
              <span>Paid</span>
            </label>
          </div>
        </section>

        <section>
          <h4>Level</h4>
          <div className="ccp-filter-list">
            {levelOptions.map((level) => (
              <label key={level}>
                <input
                  checked={selectedLevels.includes(level)}
                  onChange={(event) => toggleLevel(level, event.target.checked)}
                  type="checkbox"
                />
                <span>{level}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h4>Rating</h4>
          <div className="ccp-filter-list">
            <label>
              <input
                checked={minRating === 0}
                name="rating"
                onChange={() => setMinRating(0)}
                type="radio"
              />
              <span>All ratings</span>
            </label>
            <label>
              <input
                checked={minRating === 4}
                name="rating"
                onChange={() => setMinRating(4)}
                type="radio"
              />
              <span>4.0 and up</span>
            </label>
            <label>
              <input
                checked={minRating === 4.5}
                name="rating"
                onChange={() => setMinRating(4.5)}
                type="radio"
              />
              <span>4.5 and up</span>
            </label>
          </div>
        </section>

        <section>
          <h4>Duration (max)</h4>
          <input
            max={40}
            min={1}
            onChange={(event) => setMaxDuration(Number(event.target.value))}
            type="range"
            value={maxDuration}
          />
          <div className="ccp-duration-range">
            <span>1h</span>
            <span>{maxDuration}h</span>
          </div>
        </section>
      </div>
    </aside>
  );
}
