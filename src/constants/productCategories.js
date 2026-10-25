/**
 * productCategories.js — the single source of truth for retail product
 * categories and their badge colours. All product screens (catalogue,
 * add/edit form, stock in/out, stock check, QR generation) import from here
 * so the list stays consistent everywhere.
 */

export const PRODUCT_CATEGORIES = [
  'Shoes',
  'Clothes',
  'Bags',
  'Accessories',
  'Watches',
  'Jewelry',
  'Hats',
  'Socks',
  'General',
]

export const CATEGORY_COLORS = {
  Shoes: 'bg-indigo-50 text-indigo-700 border-indigo-200/50',
  Clothes: 'bg-blue-50 text-blue-700 border-blue-200/50',
  Bags: 'bg-amber-50 text-amber-700 border-amber-200/50',
  Accessories: 'bg-purple-50 text-purple-700 border-purple-200/50',
  Watches: 'bg-sky-50 text-sky-700 border-sky-200/50',
  Jewelry: 'bg-pink-50 text-pink-700 border-pink-200/50',
  Hats: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
  Socks: 'bg-teal-50 text-teal-700 border-teal-200/50',
  General: 'bg-gray-50 text-gray-700 border-gray-200/50',
}

export const productCategoryColor = (cat) =>
  CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-700 border-gray-200/50'