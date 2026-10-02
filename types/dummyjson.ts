export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
}

// POST /auth/login renvoie l'utilisateur + les deux tokens
export interface LoginResponse extends User, AuthTokens {}

// ---------- Produits (F1) ----------
// Écrits à partir d'une réponse réelle de GET /products.

export interface ProductDimensions {
  width: number
  height: number
  depth: number
}

export interface Review {
  rating: number
  comment: string
  date: string
  reviewerName: string
  reviewerEmail: string
}

export interface ProductMeta {
  createdAt: string
  updatedAt: string
  barcode: string
  qrCode: string
}

export interface Product {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  tags: string[]
  brand?: string // absent sur certains produits (ex. : les fruits)
  sku: string
  weight: number
  dimensions: ProductDimensions
  warrantyInformation: string
  shippingInformation: string
  availabilityStatus: string
  reviews: Review[]
  returnPolicy: string
  minimumOrderQuantity: number
  meta: ProductMeta
  images: string[]
  thumbnail: string
}

// Champs demandés au catalogue avec le paramètre `select` :
// on ne télécharge que ce que la carte produit affiche,
// plus `category` pour filtrer côté client quand l'API ne sait pas le faire.
export const PRODUCT_SUMMARY_FIELDS = [
  'title',
  'price',
  'discountPercentage',
  'rating',
  'thumbnail',
  'category',
] as const

// `id` est toujours renvoyé par DummyJSON, même s'il n'est pas dans `select`.
export type ProductSummary = Pick<
  Product,
  'id' | (typeof PRODUCT_SUMMARY_FIELDS)[number]
>

// Réponse paginée d'une liste de produits.
// Générique : Product par défaut, ProductSummary quand on utilise `select`.
export interface ProductsResponse<T = Product> {
  products: T[]
  total: number
  skip: number
  limit: number
}

// Une catégorie, telle que renvoyée par GET /products/categories.
export interface ProductCategory {
  slug: string
  name: string
  url: string
}
