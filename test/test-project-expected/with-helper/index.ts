import { ObjectValues } from "./types/object-values";

export const Direction = {
  Up: 'UP',
  Down: 'DOWN',
  Left: 'LEFT',
  Right: 'RIGHT',
} as const;

export type Direction = ObjectValues<typeof Direction>;
