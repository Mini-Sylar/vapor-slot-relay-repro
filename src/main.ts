import { createApp, createVaporApp, vaporInteropPlugin } from 'vue'
import './style.css'
import PlainApp from './PlainApp.vue'
import VaporOnlyApp from './VaporOnlyApp.vue'
import InteropApp from './InteropApp.vue'

// 1. VDOM only.
createApp(PlainApp).mount('#vdom-only')

// 2. Vapor only — its own root, no VDOM involved at all.
createVaporApp(VaporOnlyApp).mount('#vapor-only')

// 3. Interop — a VDOM root embedding a Vapor-compiled child. This is the
// one that reproduces the bug; 1 and 2 don't.
const interopApp = createApp(InteropApp)
interopApp.use(vaporInteropPlugin)
interopApp.mount('#interop')
