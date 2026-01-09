## 2024-05-23 - Prevent Redundant Firestore Subscriptions
**Learning:** Adding UI state variables (like `isOpen` or `language`) to `useEffect` dependencies for Firestore subscriptions (`onSnapshot`) causes the listener to unsubscribe and resubscribe on every UI toggle. This wastes resources and network bandwidth.
**Action:** Use `useRef` to store the latest value of these mutable variables. Update the ref in a separate effect, and read `ref.current` inside the subscription callback. This allows the subscription to persist while still accessing fresh state.
