import { useState } from 'react';
import { Product, Offer } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

interface Props {
  product: Product;
}

function getDiscountedPrice(price: number, offer: Offer | undefined) {
  if (!offer) return null;
  if (offer.discountType === 'percentage') {
    return price * (1 - offer.discountValue / 100);
  }
  return Math.max(0, price - offer.discountValue);
}

function offerLabel(offer: Offer) {
  if (offer.discountType === 'percentage') return `${offer.discountValue}% OFF`;
  return `$${offer.discountValue} OFF`;
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCartStore();
  const { isAuthenticated, guestLogin } = useAuthStore();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const activeOffer = product.offers?.[0];
  const finalPrice = activeOffer ? getDiscountedPrice(product.price, activeOffer) : null;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      await guestLogin();
    }
    setAdding(true);
    try {
      await addItem(product.id, 1);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="card flex flex-col overflow-hidden group hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-brand-light">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {activeOffer && (
          <div className="absolute top-2 left-2">
            <Badge label={offerLabel(activeOffer)} variant="offer" />
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-brand-black line-clamp-2 mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-brand-dark/60 line-clamp-2 mb-3 flex-1">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          {finalPrice !== null ? (
            <>
              <span className="text-lg font-bold text-brand-red">
                ${finalPrice.toFixed(2)}
              </span>
              <span className="text-sm text-brand-dark/40 line-through">
                ${product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-brand-black">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Offer detail */}
        {activeOffer && (
          <p className="text-xs text-brand-red mb-3">{activeOffer.title}</p>
        )}

        {/* Stock badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-brand-dark/60">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            loading={adding}
          >
            Add to Cart
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/catalog`)}
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
}
