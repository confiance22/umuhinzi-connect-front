export const roleHome = (role) => {
  if (role === 'farmer') return '/farmer'
  if (role === 'buyer') return '/buyer'
  if (role === 'super_admin' || role === 'admin') return '/admin/dashboard'
  return '/'
}

export const roleLabel = (role) => {
  if (role === 'farmer') return 'Farmer'
  if (role === 'buyer') return 'Buyer'
  if (role === 'super_admin' || role === 'admin') return 'Super Admin'
  return 'Member'
}
