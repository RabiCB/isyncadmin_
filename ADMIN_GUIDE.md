# Admin Panel Documentation

## 📋 Overview

A professional, reusable admin panel system built with Next.js, React, Tailwind CSS, and TypeScript. The admin panel features a responsive sidebar layout with dark theme styling matching your existing design.

## 🎯 Features

✅ **Responsive Admin Layout** - Sidebar + top bar navigation  
✅ **Reusable AdminTable Component** - For managing any resource (Phones, Laptops, etc.)  
✅ **Built-in Actions** - View, Edit, Delete with confirmation modal  
✅ **Search & Filter** - Quick search across all items  
✅ **Mobile Responsive** - Works seamlessly on all devices  
✅ **Dark Theme** - Matches your existing design system  
✅ **Type-Safe** - Full TypeScript support  

## 📁 Directory Structure

```
app/admin/
├── layout.tsx                    # Main admin layout with sidebar
├── page.tsx                      # Admin dashboard
├── phones/
│   ├── page.tsx                 # Phones management list
│   ├── add/
│   │   └── page.tsx             # Add new phone
│   └── [id]/edit/
│       └── page.tsx             # Edit phone
├── laptops/
│   ├── page.tsx                 # Laptops management list
│   ├── add/
│   │   └── page.tsx             # Add new laptop
│   └── [id]/edit/
│       └── page.tsx             # Edit laptop
├── speakers/page.tsx            # Speakers management (placeholder)
├── wearables/page.tsx           # Wearables management (placeholder)
├── gaming/page.tsx              # Gaming management (placeholder)
└── settings/page.tsx            # Settings page

components/
└── admin-table.tsx              # Reusable AdminTable component
```

## 🔧 Using AdminTable Component

### Basic Usage

```tsx
import { AdminTable, AdminTableColumn, AdminTableAction } from "@/components/admin-table"
import { Eye, Pencil, Trash2 } from "lucide-react"

const COLUMNS: AdminTableColumn[] = [
  {
    key: "name",
    label: "Name",
    render: (value) => <strong>{value}</strong>,
  },
  {
    key: "email",
    label: "Email",
    hidden: true, // Hidden on mobile
  },
]

const actions: AdminTableAction[] = [
  {
    label: "View",
    icon: <Eye className="h-4 w-4" />,
    href: (item) => `/admin/users/${item.id}`,
  },
  {
    label: "Edit",
    icon: <Pencil className="h-4 w-4" />,
    href: (item) => `/admin/users/${item.id}/edit`,
  },
  {
    label: "Delete",
    icon: <Trash2 className="h-4 w-4" />,
    variant: "danger",
    onClick: (item) => console.log(item),
  },
]

export default function UsersPage() {
  const [users, setUsers] = useState([])

  return (
    <AdminTable
      title="Users"
      description="Manage all users"
      items={users}
      columns={COLUMNS}
      actions={actions}
      addHref="/admin/users/add"
      onDelete={handleDelete}
      itemName="User"
      loading={false}
    />
  )
}
```

## 📋 AdminTable Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | ✅ | Page title |
| `description` | `string` | ❌ | Subtitle/description |
| `items` | `any[]` | ✅ | Array of items to display |
| `columns` | `AdminTableColumn[]` | ✅ | Column definitions |
| `actions` | `AdminTableAction[]` | ✅ | Action buttons configuration |
| `addHref` | `string` | ❌ | URL for "Add" button |
| `onDelete` | `(item: any) => Promise<void>` | ❌ | Delete handler |
| `itemName` | `string` | ❌ | Singular name of item (for labels) |
| `loading` | `boolean` | ❌ | Show loading state |

## 🎨 AdminTableColumn

Define how data is displayed in each column:

```tsx
interface AdminTableColumn {
  key: string                                // Data key from item
  label: string                              // Column header
  width?: string                             // Tailwind width class
  hidden?: boolean                           // Hide on mobile
  render?: (value: any, item: any) => React.ReactNode  // Custom render
}
```

### Examples

```tsx
// Simple text column
{ key: "name", label: "Name" }

// Custom render with image
{
  key: "image",
  label: "Image",
  render: (value) => (
    <img src={value} alt="item" className="h-10 w-10 rounded" />
  ),
}

// Badge/tag column
{
  key: "status",
  label: "Status",
  render: (value) => (
    <span className="inline-block px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">
      {value}
    </span>
  ),
}
```

## ⚡ AdminTableAction

Configure action buttons:

```tsx
interface AdminTableAction {
  label: string                                // Button title
  icon: React.ReactNode                        // Icon component
  href?: (item: any) => string                // Link URL
  onClick?: (item: any) => void               // Click handler
  variant?: "default" | "danger"              // Styling variant
}
```

### Examples

```tsx
// Link action
{
  label: "Edit",
  icon: <Pencil className="h-4 w-4" />,
  href: (item) => `/admin/items/${item.id}/edit`,
}

// Delete action (with confirmation modal)
{
  label: "Delete",
  icon: <Trash2 className="h-4 w-4" />,
  variant: "danger",
  onClick: (item) => handleDelete(item),
}

// Custom action
{
  label: "Download",
  icon: <Download className="h-4 w-4" />,
  onClick: (item) => downloadItem(item),
}
```

## 🚀 Quick Start

### 1. Navigate to Admin Panel
```
http://localhost:3000/admin
```

### 2. View Phones Management
```
http://localhost:3000/admin/phones
```

### 3. Add New Phone
```
http://localhost:3000/admin/phones/add
```

### 4. Edit Existing Phone
```
http://localhost:3000/admin/phones/{id}/edit
```

## 🎨 Customization

### Changing Colors

Edit `app/admin/layout.tsx` to change the sidebar colors:

```tsx
// Change sidebar background
bg-[#14141c]  // Dark background

// Change accent color
bg-purple-600  // Primary accent

// Change hover state
hover:bg-purple-600/20
```

### Adding Navigation Items

Edit the `SIDEBAR_LINKS` array in `app/admin/layout.tsx`:

```tsx
const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Phones", href: "/admin/phones", icon: Smartphone },
  // Add new item
  { label: "Users", href: "/admin/users", icon: Users },
]
```

### Creating New Admin Pages

1. Create a new folder: `app/admin/users/`
2. Create `page.tsx` with AdminTable component
3. Define your columns and actions
4. Connect your API

## 📱 Responsive Behavior

- **Mobile**: Sidebar slides in from left, some columns hidden
- **Tablet**: Sidebar visible, some columns still hidden
- **Desktop**: Full sidebar, all columns visible

Control column visibility with the `hidden` property:

```tsx
{
  key: "email",
  label: "Email",
  hidden: true,  // Hidden on screens < 768px
}
```

## 🔐 Security Notes

- Always validate API responses
- Implement proper authentication before showing admin pages
- Use environment variables for API endpoints
- Validate user permissions before allowing deletes/edits

## 📝 Adding Edit Pages

Create edit page with form pre-population:

```tsx
// app/admin/users/[id]/edit/page.tsx
export default function EditUserPage() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .then(setUser)
  }, [id])

  return (
    <div>
      <YourForm initialData={user} onSuccess={...} />
    </div>
  )
}
```

## 🎯 Next Steps

1. ✅ Admin layout with sidebar
2. ✅ Reusable AdminTable component
3. ✅ Phone and Laptop management pages
4. ⏭️ Create laptop form component
5. ⏭️ Add authentication/authorization
6. ⏭️ Implement speaker, wearables, gaming management
7. ⏭️ Add export/import features
8. ⏭️ Add analytics dashboard

## 💡 Tips

- Use the `render` prop to customize column appearance
- Leverage the delete confirmation modal for safety
- Search functionality is automatic across all columns
- Mobile sidebar closes automatically after navigation
- Loading state shows spinner during data fetch
- Item count shows at bottom of table

## 🆘 Troubleshooting

### Sidebar not showing on mobile
- Check that layout.tsx is properly wrapping children
- Ensure mobile breakpoint classes are applied (lg:)

### Delete modal not appearing
- Ensure `onDelete` prop is provided
- Check that `variant="danger"` is set on delete action

### Search not working
- Verify items are being passed correctly
- Check console for errors
- Ensure data structure is correct

---

**Admin Panel v1.0.0** - Built with Next.js 16 and Tailwind CSS 4
