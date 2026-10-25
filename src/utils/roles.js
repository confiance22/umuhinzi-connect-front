export const roleHome = (role) => {
  if (role === 'farmer') return '/farmer'
  if (role === 'buyer') return '/buyer'
  if (role === 'admin') return '/admin'
  return '/'
}

export const roleLabel = (role) => {
  if (role === 'farmer') return 'Farmer'
  if (role === 'buyer') return 'Buyer'
  if (role === 'admin') return 'Admin'
  return 'Member'
}
