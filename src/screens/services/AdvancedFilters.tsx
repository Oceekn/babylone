import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import './AdvancedFilters.css'

const AdvancedFilters = () => {
  return (
    <ScreenLayout
      title=""
      rightAction={<Button variant="secondary">Appliquer</Button>}
      showBottomNav
    >
      <div className="advanced-filters">
        <div className="filter-header">
          <button className="reset-btn">Réinitialiser</button>
        </div>
        <div className="filters-content">
          {/* Filter options would go here */}
        </div>
      </div>
    </ScreenLayout>
  )
}

export default AdvancedFilters



