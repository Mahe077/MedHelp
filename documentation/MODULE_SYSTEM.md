# Dashboard Module System

## Overview

The dashboard uses a **modular, configuration-based system** that makes it easy to add, remove, or modify modules without changing the sidebar component code. All modules are defined in a central configuration file with automatic permission-based filtering.

---

## Quick Start

### Adding a New Module

To add a new module to the dashboard, simply add it to the `MODULES` array in `/frontend/src/config/modules.ts`:

```typescript
{
  id: "appointments",           // Unique identifier
  title: "Appointments",        // Display name
  icon: Calendar,               // Lucide icon
  href: "/dashboard/appointments", // Route path
  entity: "appointment",        // Entity for permission checking
  category: "operations",       // Module category
  order: 14,                    // Display order (lower = higher)
  enabled: true,                // Feature flag
}
```

**That's it!** The module will automatically:
- Appear in the sidebar for users with appropriate permissions
- Be filtered based on user roles and permissions
- Maintain proper ordering
- Show/hide based on the `enabled` flag

### Removing a Module

**Option 1: Disable temporarily**
```typescript
{
  id: "reports",
  // ... other properties
  enabled: false,  // Module won't appear in sidebar
}
```

**Option 2: Delete permanently**
Simply remove the module object from the `MODULES` array.

---

## Module Configuration

### Module Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | ✅ | Unique identifier for the module |
| `title` | `string` | ✅ | Display name in the sidebar |
| `icon` | `LucideIcon` | ✅ | Icon component from lucide-react |
| `href` | `string` | ✅ | Route path for the module |
| `entity` | `string` | ❌ | Entity name for permission checking (e.g., "product", "user") |
| `permissions` | `string[]` | ❌ | Specific permissions required (e.g., ["user:create", "user:read"]) |
| `requiredRoles` | `string[]` | ❌ | Required roles to access (e.g., ["ADMIN", "MANAGER"]) |
| `alwaysVisible` | `boolean` | ❌ | If true, visible to all users (no permission check) |
| `category` | `string` | ❌ | Module category: "core", "operations", "management", "admin", "reports" |
| `order` | `number` | ❌ | Display order (lower numbers appear first, default: 999) |
| `enabled` | `boolean` | ❌ | Feature flag (default: true) |
| `badge` | `string` | ❌ | Badge text to display (e.g., "New", "Beta") |

---

## Permission System

### How Permissions Work

The system supports three types of access control and **automatically handles the backend's permission format**:

**Backend Format:** Permissions are sent as `USER_READ`, `BRANCH_CREATE`, `PRODUCT_UPDATE` (UPPERCASE_UNDERSCORE)  
**Frontend Matching:** Automatically converts and matches (case-insensitive)

#### 1. **Entity-Based Permissions** (Recommended)
```typescript
{
  id: "inventory",
  entity: "product",  // Matches PRODUCT_READ, PRODUCT_CREATE, etc.
}
```
- User needs at least one permission starting with `PRODUCT_` (e.g., `PRODUCT_READ`, `PRODUCT_CREATE`)
- System automatically handles case conversion
- Admins automatically have access to all entities

#### 2. **Specific Permissions**
```typescript
{
  id: "reports",
  permissions: ["REPORT_READ", "REPORT_EXPORT"],  // User needs one of these
}
```
- User must have at least one of the specified permissions (exact match)
- Use UPPERCASE_UNDERSCORE format to match backend

#### 3. **Role-Based Access**
```typescript
{
  id: "security",
  requiredRoles: ["ADMIN"],  // Only admins can access
}
```
- User must have one of the specified roles

#### 4. **Always Visible**
```typescript
{
  id: "dashboard",
  alwaysVisible: true,  // No permission check
}
```
- Module is visible to all authenticated users

### Permission Priority

If multiple access controls are defined, they work together:
1. `alwaysVisible: true` → Grants immediate access
2. `requiredRoles` → User must have one of the roles
3. `permissions` → User must have one of the permissions (exact match)
4. `entity` → User must have any permission for the entity (e.g., `USER_READ`, `USER_CREATE`)

### Backend Permission Examples

**User with permissions:**
```json
{
  "permissions": [
    "USER_READ",
    "BRANCH_READ",
    "PRODUCT_READ",
    "PRODUCT_UPDATE",
    "PRESCRIPTION_CREATE"
  ]
}
```

**Module access:**
- ✅ `{ entity: "user" }` - Has `USER_READ`
- ✅ `{ entity: "branch" }` - Has `BRANCH_READ`
- ✅ `{ entity: "product" }` - Has `PRODUCT_READ` and `PRODUCT_UPDATE`
- ✅ `{ entity: "prescription" }` - Has `PRESCRIPTION_CREATE`
- ❌ `{ entity: "invoice" }` - No `INVOICE_*` permissions

---

## Categories

Modules can be organized into categories for better structure:

- **`core`**: Essential modules (Dashboard, Alerts)
- **`operations`**: Day-to-day operations (Inventory, Prescriptions, Orders)
- **`management`**: User and resource management (Customers, Branches, Staff)
- **`admin`**: Administrative functions (Security, System Settings)
- **`reports`**: Analytics and reporting

```typescript
// Get modules by category
import { getModulesByCategory } from "@/config/modules";

const operationsModules = getModulesByCategory("operations");
```

---

## Examples

### Example 1: Public Module (No Permissions)
```typescript
{
  id: "dashboard",
  title: "Overview",
  icon: LayoutDashboard,
  href: "/dashboard",
  alwaysVisible: true,  // Everyone can see this
  category: "core",
  order: 1,
}
```

### Example 2: Entity-Based Module
```typescript
{
  id: "inventory",
  title: "Inventory",
  icon: Package,
  href: "/dashboard/inventory",
  entity: "product",  // Requires any "product:*" permission
  category: "operations",
  order: 10,
}
```

### Example 3: Admin-Only Module
```typescript
{
  id: "security",
  title: "Security",
  icon: Shield,
  href: "/dashboard/security",
  requiredRoles: ["ADMIN"],  // Only admins
  category: "admin",
  order: 50,
}
```

### Example 4: Module with Badge
```typescript
{
  id: "analytics",
  title: "Analytics",
  icon: TrendingUp,
  href: "/dashboard/analytics",
  entity: "analytics",
  badge: "Beta",  // Shows "Beta" badge
  category: "reports",
  order: 31,
}
```

### Example 5: Disabled Module (Coming Soon)
```typescript
{
  id: "telemedicine",
  title: "Telemedicine",
  icon: Video,
  href: "/dashboard/telemedicine",
  entity: "telemedicine",
  enabled: false,  // Won't appear in sidebar
  badge: "Coming Soon",
  category: "operations",
  order: 15,
}
```

---

## Using the Permission Hook

The `useModuleAccess` hook provides utilities for checking permissions:

```typescript
import { useModuleAccess } from "@/hooks/useModuleAccess";

function MyComponent() {
  const {
    hasModuleAccess,
    hasPermission,
    hasRole,
    hasEntityAccess,
  } = useModuleAccess();

  // Check if user has access to a module
  const canAccessInventory = hasModuleAccess(inventoryModule);

  // Check specific permission
  const canCreateProduct = hasPermission("product:create");

  // Check role
  const isAdmin = hasRole("ADMIN");

  // Check entity access
  const canAccessProducts = hasEntityAccess("product");

  return (
    <div>
      {canAccessInventory && <InventoryWidget />}
      {canCreateProduct && <CreateProductButton />}
    </div>
  );
}
```

---

## Best Practices

### 1. **Use Entity-Based Permissions**
Prefer `entity` over specific `permissions` for flexibility:
```typescript
// ✅ Good - Flexible
{ entity: "product" }

// ❌ Less flexible - Too specific
{ permissions: ["product:read"] }
```

### 2. **Assign Meaningful IDs**
Use descriptive, unique IDs:
```typescript
// ✅ Good
{ id: "inventory-management" }

// ❌ Bad
{ id: "module1" }
```

### 3. **Order Logically**
Group related modules with similar order numbers:
```typescript
// Core modules: 1-9
{ id: "dashboard", order: 1 }

// Operations: 10-19
{ id: "inventory", order: 10 }
{ id: "prescriptions", order: 11 }

// Management: 20-29
{ id: "customers", order: 20 }
{ id: "branches", order: 21 }
```

### 4. **Use Categories**
Organize modules into logical categories for better structure.

### 5. **Feature Flags**
Use `enabled` for gradual rollouts:
```typescript
{
  id: "new-feature",
  enabled: process.env.NEXT_PUBLIC_ENABLE_NEW_FEATURE === "true",
}
```

---

## Migration Guide

### From Old System to New System

**Old Code (Hardcoded):**
```typescript
const navigationItems = [
  {
    title: "Inventory",
    icon: <Package className="h-4 w-4" />,
    href: "/dashboard/inventory",
    entity: "product",
  },
];
```

**New Code (Configuration):**
```typescript
// In /config/modules.ts
{
  id: "inventory",
  title: "Inventory",
  icon: Package,  // No JSX needed
  href: "/dashboard/inventory",
  entity: "product",
  category: "operations",
  order: 10,
  enabled: true,
}
```

---

## Troubleshooting

### Module Not Appearing?

1. **Check `enabled` flag**: Ensure `enabled: true` or remove the property
2. **Check permissions**: Verify user has required permissions/roles
3. **Check order**: Module might be out of view (scroll down)
4. **Check imports**: Ensure icon is imported from lucide-react

### Permission Not Working?

1. **Verify user object**: Check `user.permissions` and `user.roles` in console
2. **Check entity name**: Ensure it matches backend permission format
3. **Admin override**: Admins bypass entity checks

---

## File Structure

```
frontend/src/
├── config/
│   └── modules.ts              # Module configuration (ADD/REMOVE MODULES HERE)
├── hooks/
│   └── useModuleAccess.ts      # Permission checking hook
└── components/
    └── dashboard-sidebar.tsx   # Sidebar component (NO CHANGES NEEDED)
```

---

## Summary

✅ **Add a module**: Add object to `MODULES` array  
✅ **Remove a module**: Set `enabled: false` or delete object  
✅ **Change permissions**: Update `entity`, `permissions`, or `requiredRoles`  
✅ **Reorder modules**: Change `order` property  
✅ **No sidebar code changes needed!**

This system makes the dashboard truly modular and maintainable! 🎉
