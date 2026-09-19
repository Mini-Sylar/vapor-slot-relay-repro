# Vapor interop: a slot forwarded through a dynamic functional component renders as `[object Object]`

Minimal repro, distilled from a real bug in [vael-ui](https://github.com/Mini-Sylar/vael-ui)'s
`Menu`/`CascadeSelect` components — no third-party dependency, just `vue`.

## Versions

- `vue`: `3.6.0-rc.9`
- `@vitejs/plugin-vue`: `^6.0.9`
- `vite`: `^8.3.0`

## Setup

```sh
pnpm install
pnpm dev
```

Open the printed local URL. `Wrapper.vue` and `MenuLike.vue` (`src/plain/` and `src/vapor/`,
byte-for-byte identical except `src/vapor/`'s `<script setup>` tags carry an extra `vapor`
attribute) are mounted three ways:

1. **VDOM only** — `createApp(PlainApp).mount(...)`.
2. **Vapor only** — `createVaporApp(VaporOnlyApp).mount(...)`, its own root, no VDOM involved.
3. **Interop** — `createApp(InteropApp).use(vaporInteropPlugin).mount(...)`: a plain VDOM root
   embedding the Vapor-marked `Wrapper` as a *child* component.

No interaction needed — nested rows render immediately below their parent.

## What it does

`MenuLike.vue` renders a nested list via a `#item` scoped slot. Top-level rows use the slot
directly:

```vue
<slot name="item" :item="item" />
```

Rows one level deep (or more) are rendered by a **recursive** `<MenuLike>` invocation. A bare
`<slot name="item">` written directly inside that recursive usage re-resolves against the nested
instance's own (empty) slot instead of the caller's under Vapor — a separate, already-known Vapor
quirk. The workaround (taken directly from vael-ui's real `Menu.vue`) is to capture the real slot
once via `useSlots()`, wrap it in a plain functional component, and forward it dynamically:

```ts
const relayItemSlot: FunctionalComponent<{ item: Item }> = (relayProps) =>
  slots.item?.(relayProps) as VNodeChild
```

```vue
<MenuLike :items="item.children">
  <template #item="scope">
    <component :is="relayItemSlot" :item="scope.item" />
  </template>
</MenuLike>
```

`Wrapper.vue` sits in front of `MenuLike` and *always* gives it a `#item` override (never gated on
whether `Wrapper`'s own caller supplied one) — and that override itself contains an **unfilled**
`<slot name="item">` falling back to default content (mirroring `CascadeSelect.vue`, which always
overrides `Menu`'s `#item` this same way). This "slot forwarding a slot" shape is what actually
matters — a single level of slot capture-and-forward, without the second slot indirection, renders
fine everywhere, including under Vapor.

## Expected

Every row, at every depth, renders its label — identically in all three mounts.

## Actual

- **VDOM only**: every row renders correctly, at every depth.
- **Vapor only**: every row renders correctly, at every depth — a pure Vapor app, with no VDOM
  involved, does **not** show the bug.
- **Interop** (Vapor component embedded as a child of a VDOM root via `vaporInteropPlugin`): rows
  at depth ≥ 1 — anything routed through `relayItemSlot` — render the literal string
  `[object Object]` instead of the slot's real output.

This third case is not an edge case invented for this repro — it's exactly how a real app adopts
Vapor incrementally (a VDOM app tree with some components compiled as Vapor and mixed in via
`vaporInteropPlugin`), and it's exactly how `vael-ui`'s own docs site renders its "VDOM/Vapor"
toggle for every component demo on one page — which is how this bug was originally found.

## Notes from investigating the original bug

- This is not a template-authoring mistake in vael-ui: two different fixes were tried against the
  real component (wrapping the functional component as a `{ render }` object instead of a bare
  function; removing an intermediate slot indirection in the caller) — neither fixed it, and the
  second only changed the garbage output to `[object HTMLSpanElement][object Object]`, suggesting
  the compiled Vapor output is stringifying *something* real (a VNode, or the slot-call's return
  value) rather than treating it as genuine renderable output.
- The bug requires **both** ingredients demonstrated here: the slot-forwarding-a-slot shape, *and*
  mounting via `vaporInteropPlugin` rather than a pure standalone Vapor app. Neither alone was
  enough in isolation while narrowing this down.
- This looks like it could be the same failure class as component-typed props (e.g. `icon:
  Component`) not rendering correctly under Vapor when the reference is a plain function/VDOM-shaped
  value flowing through `createComponent` dynamically, rather than a literal `<Comp>` tag the
  compiler saw at compile time — but here it's additionally scoped to the interop bridge
  specifically, not plain Vapor.
