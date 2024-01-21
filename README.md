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

- Output:
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
tsx ${pathToLibrary}/enum2union/src/index.ts --project-files='./src/**/*.{tsx,ts}'
```

### API

```ts
import { transform } from './src/index.ts';

transform('src/**/*.{tsx,ts,js}')
```

## TODO

- [x] transform string enum to union
- [x] add helper ObjectValues<T>
- [x] insert import of helper after all imports
- [ ] fix insertStatements https://github.com/dsherret/ts-morph/issues/1192
- [ ] improve formatting by adding space after type and const declaration
- [ ] publish as package
