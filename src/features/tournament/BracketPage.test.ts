import { describe, expect, it } from 'vitest';
import { leafSlotsByMatch, rotatedRightAngleElbow, roundOf32Order, type BracketPoint } from './BracketPage';

describe('radial knockout topology', () => {
  it('places every round-of-32 match exactly once around the outer ring', () => {
    const order = roundOf32Order();

    expect(order).toHaveLength(16);
    expect(new Set(order).size).toBe(16);
    expect([...order].sort((a, b) => a - b)).toEqual([
      73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88,
    ]);
  });

  it('collapses each round inward until the final covers all 32 team slots', () => {
    const slots = leafSlotsByMatch();

    expect(slots.get(89)).toHaveLength(4);
    expect(slots.get(97)).toHaveLength(8);
    expect(slots.get(101)).toHaveLength(16);
    expect(slots.get(104)).toHaveLength(32);
    expect(new Set(slots.get(104))).toEqual(new Set(Array.from({ length: 32 }, (_, index) => index)));
  });

  it.each([-135, -45, 35, 120])('keeps a 90-degree elbow when the fork is rotated to %s degrees', (angle) => {
    const from: BracketPoint = { x: 780, y: 260, angle };
    const radians = (angle * Math.PI) / 180;
    const to: BracketPoint = {
      x: 500 + Math.cos(radians) * 360,
      y: 500 + Math.sin(radians) * 360,
      angle,
    };
    const elbow = rotatedRightAngleElbow(from, to);
    const firstSegment = { x: elbow.x - from.x, y: elbow.y - from.y };
    const secondSegment = { x: to.x - elbow.x, y: to.y - elbow.y };
    const dotProduct = firstSegment.x * secondSegment.x + firstSegment.y * secondSegment.y;

    expect(dotProduct).toBeCloseTo(0, 8);
  });
});
