import { roleHome } from './roles'

export const dashboardPathForRoles = (user) => roleHome(user?.role)

export default dashboardPathForRoles
