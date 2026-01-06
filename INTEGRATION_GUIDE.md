# Integration Guide - Advanced Components

This guide provides step-by-step instructions for integrating the advanced components created during the enhancement phases.

---

## 1. Integrating BulkActionsBar into Admin Users Page

### Location

`src/app/admin/users/page.tsx`

### Steps

1. **Add State for Selection**

```tsx
const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
```

2. **Import Component**

```tsx
import { BulkActionsBar } from "@/components/admin/BulkActionsBar";
import { toast } from "sonner";
```

3. **Add Checkbox Column to User Table**

```tsx
// In the table header
<th className="w-12">
  <input
    type="checkbox"
    checked={selectedUsers.size === users.length && users.length > 0}
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedUsers(new Set(users.map(u => u.uid)));
      } else {
        setSelectedUsers(new Set());
      }
    }}
  />
</th>

// In each table row
<td>
  <input
    type="checkbox"
    checked={selectedUsers.has(user.uid)}
    onChange={(e) => {
      const newSelected = new Set(selectedUsers);
      if (e.target.checked) {
        newSelected.add(user.uid);
      } else {
        newSelected.delete(user.uid);
      }
      setSelectedUsers(newSelected);
    }}
  />
</td>
```

4. **Add Bulk Operation Handlers**

```tsx
const handleBulkRoleChange = async (role: "student" | "admin" | "owner") => {
  try {
    const promises = Array.from(selectedUsers).map((uid) =>
      updateDoc(doc(db, "users", uid), { role })
    );
    await Promise.all(promises);
    toast.success(
      language === "ar"
        ? `تم تحديث ${selectedUsers.size} مستخدمين`
        : `Updated ${selectedUsers.size} users`
    );
    setSelectedUsers(new Set());
  } catch (error) {
    toast.error(language === "ar" ? "فشل التحديث" : "Update failed");
  }
};

const handleExportCSV = () => {
  const selectedUserData = users.filter((u) => selectedUsers.has(u.uid));
  const csvData = [
    ["Name", "Email", "Role", "Student Code", "Created At"].join(","),
    ...selectedUserData.map((u) =>
      [
        u.displayName,
        u.email,
        u.role,
        u.studentCode || "",
        new Date(u.createdAt?.toDate?.() || Date.now()).toISOString(),
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `users_export_${Date.now()}.csv`);
  link.click();
  URL.revokeObjectURL(url);
};
```

5. **Render Component**

```tsx
<BulkActionsBar
  selectedUsers={selectedUsers}
  users={users}
  onClearSelection={() => setSelectedUsers(new Set())}
  onBulkRoleChange={handleBulkRoleChange}
  onExportCSV={handleExportCSV}
  language={language}
/>
```

---

## 2. Integrating QuickReplies into AIChatbot

### Location

`src/components/features/AIChatbot.tsx`

### Steps

1. **Import Components**

```tsx
import { QuickReplies } from "@/components/ui/QuickReplies";
import { QUICK_REPLIES } from "@/lib/quickReplies";
```

2. **Add Handler**

```tsx
const handleQuickReplyClick = (query: string) => {
  setInput(query);
  handleSendMessage(query);
};
```

3. **Add to Render** (after messages, before input area)

```tsx
{
  /* Quick Replies - Only show in bot mode when no messages */
}
{
  mode === "bot" && filteredMessages.length === 0 && (
    <QuickReplies replies={QUICK_REPLIES} onSelect={handleQuickReplyClick} language={language} />
  );
}
```

---

## 3. Using Firebase Analytics Events

### Import

```tsx
import { analyticsEvents } from "@/lib/analytics";
```

### Usage Examples

```tsx
// Track login
analyticsEvents.login("google");

// Track subject view
analyticsEvents.viewSubject(subject.id, subject.name);

// Track search
analyticsEvents.searchQuery(searchTerm, results.length);

// Track resource download
analyticsEvents.downloadResource(resource.id, resource.type);

// Track chat message
analyticsEvents.sendChatMessage(mode); // "bot" or "live"

// Track theme toggle
analyticsEvents.toggleTheme(theme);

// Track language toggle
analyticsEvents.toggleLanguage(language);
```

---

## 4. Using Firebase Services Layer

### Import

```tsx
import { userService, subjectService, notificationService } from "@/services/firebase.service";
```

### Usage Examples

```tsx
// Get all users
const users = await userService.getAll({ role: "student", limit: 50 });

// Get user by ID
const user = await userService.getById(uid);

// Update user
await userService.update(uid, { displayName: "New Name" });

// Create/update user (upsert)
await userService.upsert(uid, { studentCode: "123456" });

// Delete user
await userService.delete(uid);

// Subject operations
const subjects = await subjectService.getAll();
const subject = await subjectService.getById(id);
await subjectService.create({ name: "Math", description: "..." });
await subjectService.update(id, { name: "Advanced Math" });
await subjectService.delete(id);

// Notification operations
const notifications = await notificationService.getForUser(userId);
await notificationService.create({
  userId,
  title: "Welcome",
  message: "Welcome to the platform!",
  type: "info",
});
await notificationService.markAsRead(notificationId);
await notificationService.delete(notificationId);
```

---

## 5. Using Client Search Component

### Import

```tsx
import { ClientSearch } from "@/components/features/ClientSearch";
```

### Prepare Data

```tsx
const searchData = [
  ...subjects.map((s) => ({
    id: s.id,
    title: s.name,
    type: "subject" as const,
    description: s.description,
    url: `/subject?id=${s.id}`,
  })),
  ...resources.map((r) => ({
    id: r.id,
    title: r.title,
    type: "resource" as const,
    description: r.description,
    url: r.url,
  })),
];
```

### Render

```tsx
<ClientSearch
  data={searchData}
  placeholder={language === "ar" ? "ابحث..." : "Search..."}
  onResultClick={(result) => {
    // Navigate or perform action
    window.location.href = result.url;
  }}
/>
```

---

## Testing the Integrations

### BulkActionsBar

1. Navigate to `/admin/users`
2. Select multiple users via checkboxes
3. Test role change functionality
4. Test CSV export
5. Verify floating action bar appears/disappears correctly

### QuickReplies

1. Open the chatbot
2. Ensure you're in "bot" mode
3. Verify quick replies appear when chat is empty
4. Click a quick reply and verify it sends the message

### Analytics

1. Open browser DevTools → Network tab
2. Filter for "analytics"
3. Perform tracked actions (login, search, etc.)
4. Verify events are being sent to Firebase Analytics

### Services Layer

1. Replace direct Firestore calls with service methods
2. Test CRUD operations
3. Verify error handling works correctly

---

## Best Practices

1. **Error Handling**: Always wrap service calls in try-catch blocks
2. **Loading States**: Show loading indicators during async operations
3. **User Feedback**: Use toast notifications for action results
4. **Analytics**: Track important user actions for insights
5. **Accessibility**: Ensure all new features are keyboard accessible

---

## Troubleshooting

### BulkActionsBar not appearing

- Check that `selectedUsers.size > 0`
- Verify component is rendered outside modals/dialogs
- Check z-index conflicts

### QuickReplies not showing

- Verify mode is "bot"
- Check that `filteredMessages.length === 0`
- Ensure component is imported correctly

### Analytics events not tracking

- Check Firebase Analytics is enabled in console
- Verify `measurementId` in Firebase config
- Check browser console for errors

---

For more details, see the [main walkthrough documentation](./walkthrough.md).
