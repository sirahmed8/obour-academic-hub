# Bolt's Journal

## 2024-05-22 - [Chat List Re-render Bottleneck]
**Learning:** The `AIChatbot` component re-renders the entire message list on every keystroke because `ChatMessageItem` is not memoized and callback props (`onReply`, `onReact`) are inline arrow functions. This causes O(N) re-renders where N is the number of messages, leading to input lag as the chat history grows.
**Action:** Use `React.memo` for list items and `useCallback` for handlers passed to them. Always check list rendering in state-heavy components like chats.
