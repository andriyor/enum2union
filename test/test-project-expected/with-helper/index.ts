import { ObjectValues } from "./types/object-values";
export const Direction = {
    Up: "UP",
    Down: "DOWN",
    Left: "LEFT",
    Right: "RIGHT"
} as const;
export type Direction = ObjectValues<typeof Direction>;
export const ShapeKind = {
    Circle: "Circle",
    Square: "Square"
} as const;
export type ShapeKind = ObjectValues<typeof ShapeKind>;
