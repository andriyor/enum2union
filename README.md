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

- Output without helperDir option:
```ts
export const Direction = {
    Up: "UP",
    Down: "DOWN",
} as const;
export type Direction = (typeof Direction)[keyof typeof Direction];
```

- Output with helperDir option:

`object-values.ts`
```typescript
export type ObjectValues<T> = T[keyof T];
```

```ts
import { ObjectValues } from "./types/object-values";
export const Direction = {
    Up: "UP",
    Down: "DOWN",
} as const;
export type Direction = ObjectValues<typeof Direction>;
```


## Usage

### CLI

```shell
tsx ${pathToLibrary}/enum2union/src/index.ts --project-files='./src/**/*.{tsx,ts}' --helper-dir='src/types/helpers'
```

### API

```ts
import { transform } from './src/index.ts';

transform({
  projectFiles: './src/**/*.{tsx,ts}',
  helperDir: './src/types',
});
```

## Why not to use enums?

[Typescript has unions, so are enums redundant? - Stack Overflow](https://stackoverflow.com/questions/40275832/typescript-has-unions-so-are-enums-redundant/60041791#60041791)

[Enums considered harmful - YouTube](https://www.youtube.com/watch?v=jjMbPt_H3RQ)

[Enums are MISUNDERSTOOD (not terrible): Josh Goldberg, typescript-eslint maintainer - YouTube](https://youtu.be/XTXPKbPcvl4?si=fM0egcwNxVatXDsN&t=1146)

https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums


## Related Projects

[benjlevesque/codemod-enum-to-union](https://github.com/benjlevesque/codemod-enum-to-union) doesn't have ObjectValues helper, the code is formatted worse


## TODO

- [x] transform string enum to union
- [x] add helper ObjectValues<T>
- [x] insert import of helper after all imports
- [ ] fix insertStatements https://github.com/dsherret/ts-morph/issues/1192
- [ ] improve formatting by adding space after type and const declaration
- [ ] support import alias
- [ ] use ts for resolving import https://github.com/microsoft/TypeScript/issues/50187
- [ ] publish as package
