/**
 * Unit tests for the pure `applyDiscount` helper exported from cart.controller.
 * Prisma is mocked so no DB connection is required.
 */

// Must be declared before imports so jest hoists it correctly
jest.mock('../../utils/prismaClient', () => ({
  __esModule: true,
  default: {},
}));

import { applyDiscount } from '../../controllers/cart.controller';
import { Offer } from '@prisma/client';

// ── Fixture factory ──────────────────────────────────────────────────────────

function makeOffer(discountType: string, discountValue: number): Offer {
  return {
    id: 1,
    title: 'Test Offer',
    description: 'Test discount',
    discountType,
    discountValue,
    startDate: new Date(),
    endDate: new Date(Date.now() + 86_400_000),
    isActive: true,
    productId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('applyDiscount helper', () => {
  test('returns the original price and 0 discount when offer is null', () => {
    const { finalPrice, discountAmount } = applyDiscount(100, null);
    expect(finalPrice).toBe(100);
    expect(discountAmount).toBe(0);
  });

  test('applies a percentage discount correctly (20% off $100)', () => {
    const offer = makeOffer('percentage', 20);
    const { finalPrice, discountAmount } = applyDiscount(100, offer);
    expect(discountAmount).toBe(20);
    expect(finalPrice).toBe(80);
  });

  test('applies a fixed_amount discount correctly ($15 off $100)', () => {
    const offer = makeOffer('fixed_amount', 15);
    const { finalPrice, discountAmount } = applyDiscount(100, offer);
    expect(discountAmount).toBe(15);
    expect(finalPrice).toBe(85);
  });

  test('percentage discount floors final price at 0 (no negative prices)', () => {
    // 150% discount on $100 should not produce a negative price
    const offer = makeOffer('percentage', 150);
    const { finalPrice } = applyDiscount(100, offer);
    expect(finalPrice).toBe(0);
  });

  test('fixed discount is capped at the product price (no negative prices)', () => {
    // $200 discount on $100 product should cap at price
    const offer = makeOffer('fixed_amount', 200);
    const { discountAmount, finalPrice } = applyDiscount(100, offer);
    expect(discountAmount).toBe(100); // capped at price
    expect(finalPrice).toBe(0);
  });
});
