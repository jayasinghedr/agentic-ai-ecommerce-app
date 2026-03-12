// ── Auth ──────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer' | 'guest';
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// ── Products ──────────────────────────────────────────────────────────────

export interface Offer {
  id: number;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  productId: number;
  product?: Pick<Product, 'id' | 'name' | 'price' | 'imageUrl'>;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  offers: Offer[];
}

// ── Cart ──────────────────────────────────────────────────────────────────

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  product: Product;
  quantity: number;
  unitPriceSnapshot: number;
  offerApplied: boolean;
  discountSnapshot: number | null;
  offer: Offer | null;
  finalUnitPrice: number;
  discountAmount: number;
  lineTotal: number;
}

export interface Cart {
  id: number;
  status: string;
  items: CartItem[];
  subtotal: number;
  totalDiscount: number;
  total: number;
}

// ── Checkout ──────────────────────────────────────────────────────────────

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CheckoutPreview {
  lineItems: {
    productId: number;
    productName: string;
    imageUrl: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    finalUnitPrice: number;
    lineTotal: number;
    offer: Pick<Offer, 'id' | 'title' | 'discountType' | 'discountValue'> | null;
  }[];
  subtotal: number;
  totalDiscount: number;
  total: number;
}

// ── Orders ────────────────────────────────────────────────────────────────

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered';

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product: { id: number; name: string; imageUrl: string };
  quantity: number;
  unitPriceSnapshot: number;
  offerSnapshot: Offer | null;
}

export interface Order {
  id: number;
  userId: number | null;
  guestEmail: string | null;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  paymentReference: string;
  notes: string | null;
  placedAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  user?: Pick<User, 'id' | 'name' | 'email'> | null;
}

// ── Admin Metrics ─────────────────────────────────────────────────────────

export interface Metrics {
  totalOrders: number;
  totalProducts: number;
  activeOffers: number;
  totalRevenue: number;
  totalUsers: number;
}
