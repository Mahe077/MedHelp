# Permission System Documentation

## Overview

The MedHelp application uses a **unified permission system** that works seamlessly between the backend and frontend. Permissions are sent from the backend in **UPPERCASE_UNDERSCORE** format and automatically matched on the frontend.

---

## Permission Format

### Backend Format
The backend sends permissions in **UPPERCASE with UNDERSCORES**:

```json
{
  "permissions": [
    "USER_READ",
    "USER_CREATE",
    "USER_UPDATE",
    "USER_DELETE",
    "BRANCH_READ",
    "BRANCH_CREATE",
    "PRODUCT_READ",
    "PRODUCT_UPDATE",
    "PRESCRIPTION_READ",
    "PRESCRIPTION_CREATE"
  ]
}
```

### Frontend Matching
The frontend **automatically handles** both formats:
- ✅ `USER_READ` (backend format)
- ✅ `user:read` (alternative format)
- ✅ Case-insensitive matching

**You don't need to worry about the format** - the system handles it automatically!

---

## Permission Structure

Permissions follow the pattern: `{ENTITY}_{ACTION}`

### Entities
- `USER` - User management
- `BRANCH` - Branch management
- `PRODUCT` - Inventory/products
- `PRESCRIPTION` - Prescription management
- `ORDER` - Order management
- `INVOICE` - Invoice management
- `REPORT` - Reports and analytics
- `ALERT` - System alerts
- `STAFF` - Staff management
- `SETTINGS` - System settings

### Actions
- `READ` - View/list entities
- `CREATE` - Create new entities
- `UPDATE` - Modify existing entities
- `DELETE` - Remove entities
- `EXPORT` - Export data
- `IMPORT` - Import data

### Examples
```
USER_READ          → Can view users
USER_CREATE        → Can create users
BRANCH_READ        → Can view branches
BRANCH_UPDATE      → Can modify branches
PRODUCT_DELETE     → Can delete products
PRESCRIPTION_READ  → Can view prescriptions
REPORT_EXPORT      → Can export reports
```

---

## How It Works

### 1. Backend Sends Permissions
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "roles": ["PHARMACIST"],
    "permissions": [
      "USER_READ",
      "BRANCH_READ",
      "PRODUCT_READ",
      "PRODUCT_UPDATE",
      "PRESCRIPTION_READ",
      "PRESCRIPTION_CREATE"
    ]
  }
}
```

### 2. Frontend Module Configuration
In `/config/modules.ts`, you specify the **entity name** (lowercase):

```typescript
{
  id: "inventory",
  title: "Inventory",
  icon: Package,
  href: "/dashboard/inventory",
  entity: "product",  // ← Lowercase entity name
  category: "operations",
  order: 10,
}
```

### 3. Automatic Matching
The system automatically checks if the user has **any permission** for that entity:

```typescript
// User has: ["USER_READ", "PRODUCT_READ", "PRODUCT_UPDATE"]
// Module entity: "product"

// System checks:
// - Does "USER_READ" start with "PRODUCT_"? ❌ No
// - Does "PRODUCT_READ" start with "PRODUCT_"? ✅ Yes!
// - Does "PRODUCT_UPDATE" start with "PRODUCT_"? ✅ Yes!

// Result: User can access the inventory module ✅
```

---

## Module Configuration Examples

### Example 1: Entity-Based Access
```typescript
{
  id: "customers",
  title: "Customers",
  icon: Users,
  href: "/dashboard/customers",
  entity: "user",  // Matches USER_READ, USER_CREATE, etc.
}
```
**User needs:** At least one of `USER_READ`, `USER_CREATE`, `USER_UPDATE`, `USER_DELETE`

### Example 2: Specific Permissions
```typescript
{
  id: "reports",
  title: "Reports",
  icon: BarChart3,
  href: "/dashboard/reports",
  permissions: ["REPORT_READ", "REPORT_EXPORT"],  // Exact match
}
```
**User needs:** At least one of `REPORT_READ` or `REPORT_EXPORT`

### Example 3: Role-Based Access
```typescript
{
  id: "security",
  title: "Security",
  icon: Shield,
  href: "/dashboard/security",
  requiredRoles: ["ADMIN"],  // Only admins
}
```
**User needs:** `ADMIN` role

### Example 4: Combined Access Control
```typescript
{
  id: "staff",
  title: "Staff",
  icon: UserCog,
  href: "/dashboard/staff",
  entity: "staff",
  requiredRoles: ["ADMIN", "MANAGER"],  // Must be admin or manager
}
```
**User needs:** 
- `ADMIN` or `MANAGER` role **AND**
- At least one `STAFF_*` permission

---

## Permission Checking in Code

### Using the Hook
```typescript
import { useModuleAccess } from "@/hooks/useModuleAccess";

function MyComponent() {
  const {
    hasPermission,
    hasEntityAccess,
    hasRole,
  } = useModuleAccess();

  // Check specific permission (exact match)
  const canCreateUser = hasPermission("USER_CREATE");

  // Check entity access (any permission for entity)
  const canAccessProducts = hasEntityAccess("product");
  // Returns true if user has any of: PRODUCT_READ, PRODUCT_CREATE, etc.

  // Check role
  const isAdmin = hasRole("ADMIN");

  return (
    <div>
      {canCreateUser && <CreateUserButton />}
      {canAccessProducts && <ProductList />}
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

---

## Backend Permission Assignment

### Role-Based Permissions
Roles automatically grant sets of permissions:

```java
// ADMIN role
permissions: [
  "USER_*",      // All user permissions
  "BRANCH_*",    // All branch permissions
  "PRODUCT_*",   // All product permissions
  // ... etc (all permissions)
]

// PHARMACIST role
permissions: [
  "USER_READ",
  "PRODUCT_READ",
  "PRODUCT_UPDATE",
  "PRESCRIPTION_READ",
  "PRESCRIPTION_CREATE",
  "PRESCRIPTION_UPDATE"
]

// CASHIER role
permissions: [
  "PRODUCT_READ",
  "ORDER_CREATE",
  "INVOICE_CREATE",
  "INVOICE_READ"
]
```

### Custom Permissions
You can assign custom permissions to individual users:

```java
User user = new User();
user.setRoles(Set.of(pharmacistRole));
user.setCustomPermissions(Set.of(
  Permission.of("REPORT_READ"),
  Permission.of("REPORT_EXPORT")
));
```

---

## Frontend-Backend Mapping

| Frontend Entity | Backend Permissions | Example Permissions |
|----------------|---------------------|---------------------|
| `user` | `USER_*` | `USER_READ`, `USER_CREATE` |
| `branch` | `BRANCH_*` | `BRANCH_READ`, `BRANCH_UPDATE` |
| `product` | `PRODUCT_*` | `PRODUCT_READ`, `PRODUCT_DELETE` |
| `prescription` | `PRESCRIPTION_*` | `PRESCRIPTION_READ`, `PRESCRIPTION_CREATE` |
| `order` | `ORDER_*` | `ORDER_READ`, `ORDER_UPDATE` |
| `invoice` | `INVOICE_*` | `INVOICE_READ`, `INVOICE_CREATE` |
| `report` | `REPORT_*` | `REPORT_READ`, `REPORT_EXPORT` |
| `alert` | `ALERT_*` | `ALERT_READ`, `ALERT_UPDATE` |
| `staff` | `STAFF_*` | `STAFF_READ`, `STAFF_CREATE` |
| `settings` | `SETTINGS_*` | `SETTINGS_READ`, `SETTINGS_UPDATE` |

---

## Best Practices

### 1. Use Entity-Based Permissions
✅ **Recommended:**
```typescript
{ entity: "product" }  // Flexible - matches any PRODUCT_* permission
```

❌ **Avoid:**
```typescript
{ permissions: ["PRODUCT_READ"] }  // Too restrictive
```

### 2. Consistent Naming
Always use the same entity names in frontend and backend:
- Frontend: `entity: "product"`
- Backend: `PRODUCT_READ`, `PRODUCT_CREATE`

### 3. Admin Override
Admins automatically have access to all modules (no permission check needed).

### 4. Granular Permissions
Use specific actions for fine-grained control:
- `USER_READ` - Can view user list
- `USER_CREATE` - Can create new users
- `USER_UPDATE` - Can modify existing users
- `USER_DELETE` - Can delete users

---

## Troubleshooting

### Module Not Appearing?

1. **Check user permissions:**
   ```javascript
   console.log(user.permissions);
   // Should include permissions like ["USER_READ", "BRANCH_READ"]
   ```

2. **Check entity name:**
   ```typescript
   // Module config
   { entity: "product" }
   
   // User should have at least one:
   // PRODUCT_READ, PRODUCT_CREATE, PRODUCT_UPDATE, or PRODUCT_DELETE
   ```

3. **Check role requirements:**
   ```typescript
   { requiredRoles: ["ADMIN"] }
   // User must have ADMIN role
   ```

### Permission Not Working?

1. **Verify backend response:**
   - Permissions should be in UPPERCASE_UNDERSCORE format
   - Example: `"USER_READ"`, not `"user_read"` or `"user:read"`

2. **Check entity matching:**
   - Frontend entity: `"user"` (lowercase)
   - Backend permission: `"USER_READ"` (uppercase with underscore)
   - System handles case conversion automatically

---

## Summary

✅ **Backend sends:** `USER_READ`, `BRANCH_CREATE`, `PRODUCT_UPDATE`  
✅ **Frontend uses:** `entity: "user"`, `entity: "branch"`, `entity: "product"`  
✅ **System automatically matches** them (case-insensitive)  
✅ **No manual conversion needed!**

The permission system is now **fully unified** and works seamlessly! 🎉
