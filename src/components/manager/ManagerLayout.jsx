/**
 * ManagerLayout — farmer portal shell. Thin wrapper over the shared
 * PortalLayout with a deliberately small navigation: overview, harvests,
 * harvest reports and the account menu.
 */
import PortalLayout from '../admin/PortalLayout'
import { ROUTE_PATHS } from '../../constants/routePaths'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../context/LanguageContext'

const NAV = [
  {
    id: 'products',
    titleKey: 'portal.nav.products',
    icon: 'box',
    items: [
      { labelKey: 'portal.nav.allProducts', to: ROUTE_PATHS.PRODUCTS, icon: 'box' },
      { labelKey: 'portal.nav.addProduct', to: ROUTE_PATHS.PRODUCT_ADD, icon: 'plus' },
    ],
  },
  {
    id: 'reports',
    titleKey: 'portal.nav.reports',
    icon: 'reports',
    highlight: true,
    items: [
      { labelKey: 'portal.nav.overallSummary', to: ROUTE_PATHS.REPORTS, icon: 'overview' },
    ],
  },
]

export const ManagerLayout = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const isFarmer = user?.role === 'farmer'

  const nav = NAV.map((section) => ({
    ...section,
    title: t(section.titleKey),
    items: section.items.map((item) => ({
      ...item,
      label: t(item.labelKey),
    })),
  }))

  return (
    <PortalLayout
      subtitle={t(isFarmer ? 'portal.farmerPortal' : 'portal.shopManagerPortal')}
      breadcrumbLabel={t(
        isFarmer ? 'portal.farmerBreadcrumb' : 'portal.shopManagerBreadcrumb'
      )}
      overview={{ label: t('portal.nav.overview'), to: ROUTE_PATHS.DASHBOARD, icon: 'overview' }}
      sections={nav}
      accountPath={ROUTE_PATHS.ACCOUNT}
      extraTitles={{ [ROUTE_PATHS.ACCOUNT]: t('portal.nav.myAccount') }}
      showNotifications={false}
    />
  )
}

export default ManagerLayout
