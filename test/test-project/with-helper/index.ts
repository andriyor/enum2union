import { User } from './types/user';

enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}

enum ShapeKind {
  Circle = 'Circle',
  Square = 'Square'
}

type Action = {
  user: User,
  direction: Direction
}
