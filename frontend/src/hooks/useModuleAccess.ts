import { useAuth } from "@/context/auth-context";
import { Module } from "@/config/modules";

/**
 * Hook to check if a user has access to a specific module
 */
export function useModuleAccess() {
  const { user } = useAuth();

  /**
   * Check if user has access to a module based on permissions and roles
   */
  const hasModuleAccess = (module: Module): boolean => {
    // If module is always visible, grant access
    if (module.alwaysVisible) {
      return true;
    }

    // If no user, deny access
    if (!user) {
      return false;
    }

    // Check required roles
    if (module.requiredRoles && module.requiredRoles.length > 0) {
      const hasRequiredRole = module.requiredRoles.some((role) =>
        user.roles?.includes(role)
      );
      if (!hasRequiredRole) {
        return false;
      }
    }

    // Check specific permissions
    if (module.permissions && module.permissions.length > 0) {
      const hasRequiredPermission = module.permissions.some((permission) =>
        user.permissions?.includes(permission)
      );
      if (!hasRequiredPermission) {
        return false;
      }
    }

    // Check entity-based permissions
    if (module.entity) {
      // Admin has access to everything
      if (user.roles?.includes("ADMIN")) {
        return true;
      }

      // Check if user has any permission for the entity
      // Backend sends permissions like "USER_READ", "BRANCH_CREATE"
      // We need to check if permission starts with entity name (case-insensitive)
      const entityUpper = module.entity.toUpperCase();
      const hasEntityPermission = user.permissions?.some((permission) => {
        const permUpper = permission.toUpperCase();
        // Check both formats: "USER_READ" and "user:read"
        return permUpper.startsWith(`${entityUpper}_`) || 
               permUpper.startsWith(`${entityUpper}:`);
      });
      
      if (!hasEntityPermission) {
        return false;
      }
    }

    // If no specific checks failed, grant access
    return true;
  };

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) {
      return false;
    }

    // Admin has all permissions
    if (user.roles?.includes("ADMIN")) {
      return true;
    }

    return user.permissions.includes(permission);
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    if (!user || !user.roles) {
      return false;
    }

    return user.roles.includes(role);
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: string[]): boolean => {
    if (!user || !user.roles) {
      return false;
    }

    return roles.some((role) => user.roles?.includes(role));
  };

  /**
   * Check if user has all of the specified roles
   */
  const hasAllRoles = (roles: string[]): boolean => {
    if (!user || !user.roles) {
      return false;
    }

    return roles.every((role) => user.roles?.includes(role));
  };

  /**
   * Check if user has any permission for a specific entity
   */
  const hasEntityAccess = (entity: string): boolean => {
    if (!user || !user.permissions) {
      return false;
    }

    // Admin has access to all entities
    if (user.roles?.includes("ADMIN")) {
      return true;
    }

    // Check both formats: "USER_READ" and "user:read"
    const entityUpper = entity.toUpperCase();
    return user.permissions.some((permission) => {
      const permUpper = permission.toUpperCase();
      return permUpper.startsWith(`${entityUpper}_`) || 
             permUpper.startsWith(`${entityUpper}:`);
    });
  };

  /**
   * Get all accessible modules for the current user
   */
  const getAccessibleModules = (modules: Module[]): Module[] => {
    return modules.filter((module) => hasModuleAccess(module));
  };

  return {
    hasModuleAccess,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasEntityAccess,
    getAccessibleModules,
  };
}
