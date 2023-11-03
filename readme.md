# Nullstack DnD

Inspired by react-beautiful-dnd, but oversimplified for all the nullstack folks

### Installation

```bash
yarn add nullstack-dnd
```

or

```bash
npm install nullstack-dnd
```

### Usage

To use `nullstack-dnd` you should import it, then wrap your draggable components with it

### Example

```tsx
import Nullstack from "nullstack";
import { NullstackDnD } from "nullstack-dnd";

import { ProductCard } from "./common/Card";

import "./styles.css";

export class NullstackApp extends Nullstack {
  products = [
    // {...},
    // {...},
    // {...},
  ];

  render() {
    return (
      <NullstackDnD
        // you can append a class to the dnd wrapper
        class="cool-dnd"
        // optional dnd configuration
        options={{
          column_gap: 20,
          columns_count: 3,
          rearranging_duration: 100,
        }}
      >
        {this.products.map((product) => (
          <ProductCard
            category="Comidinha"
            image={product.pictures[0].url}
            name={product.name}
            onChangeCategory={() => null}
            onDelete={() => null}
            onEdit={() => null}
            price={product.price}
            variants={product.variants.length}
            data-id={product.id}
          />
        ))}
      </NullstackDnD>
    );
  }
}
```
