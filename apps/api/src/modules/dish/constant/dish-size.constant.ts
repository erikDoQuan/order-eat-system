export const DISH_SIZE = ['small', 'medium', 'large'] as const;
export type DishSize = (typeof DISH_SIZE)[number];