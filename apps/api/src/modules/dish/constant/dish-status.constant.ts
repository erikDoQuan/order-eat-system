export const DISH_STATUS = ['available', 'unavailable'] as const;
export type DishStatus = (typeof DISH_STATUS)[number];