# enum2union

Convert Enums to Union types

## Example

- Input:
```ts
enum Direction {
  Up = 'UP',
  Down = 'DOWN',
}
```

- Output (after running prettier):
```ts
export const Direction = {
  Up: "UP",
  Down: "DOWN",
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];
```


## Usage

### CLI

```shell
tsx ${[pathToLibrary]}/enum2union/src/index.ts --project-files='./src/**/*.{tsx,ts}'
```

### API

```ts
import { transform } from './src/index.ts';

transform('src/**/*.{tsx,ts,js}')
```

## TODO

- [x] transform string enum to union
- [ ] add helper ObjectValues<T>
- [ ] publish as package
