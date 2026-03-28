import type { CourseCatalogDataModel, SortBy } from '../courseCatalog.types';
import { CatalogCourseCard } from './CatalogCourseCard';
import { CatalogFiltersSidebar } from './CatalogFiltersSidebar';
import { CatalogPagination } from './CatalogPagination';

interface CourseCatalogContentProps {
  model: CourseCatalogDataModel;
  onNavigate: (path: string) => void;
}

export function CourseCatalogContent({ model, onNavigate }: CourseCatalogContentProps) {
  return (
    <main className="ccp-main ccp-container">
      <CatalogFiltersSidebar
        categories={model.categories}
        clearFilters={model.clearFilters}
        maxDuration={model.maxDuration}
        minRating={model.minRating}
        priceFilter={model.priceFilter}
        selectedCategories={model.selectedCategories}
        selectedLevels={model.selectedLevels}
        setMaxDuration={model.setMaxDuration}
        setMinRating={model.setMinRating}
        setPriceFilter={model.setPriceFilter}
        toggleCategory={model.toggleCategory}
        toggleLevel={model.toggleLevel}
      />

      <section className="ccp-content">
        <div className="ccp-content-head">
          <div>
            <h1>Course Catalog</h1>
            <p>Showing {model.filteredCoursesCount} of {model.coursesCount} courses</p>
          </div>

          <div className="ccp-sort">
            <span>Sort by:</span>
            <select
              onChange={(event) => model.setSortBy(event.target.value as SortBy)}
              value={model.sortBy}
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {model.isLoading && <p className="ccp-state">Loading courses...</p>}
        {model.isError && <p className="ccp-state">Unable to load courses right now.</p>}
        {!model.isLoading && !model.isError && model.paginatedCourses.length === 0 && (
          <p className="ccp-state">No course matches your filters.</p>
        )}

        {!model.isLoading && model.paginatedCourses.length > 0 && (
          <div className="ccp-grid">
            {model.paginatedCourses.map((course) => (
              <CatalogCourseCard
                course={course}
                key={course.id}
                onOpenCourse={(courseId) => onNavigate(`/courses/${courseId}`)}
              />
            ))}
          </div>
        )}

        <CatalogPagination
          goToNextPage={model.goToNextPage}
          goToPage={model.goToPage}
          goToPreviousPage={model.goToPreviousPage}
          page={model.page}
          totalPages={model.totalPages}
        />
      </section>
    </main>
  );
}
