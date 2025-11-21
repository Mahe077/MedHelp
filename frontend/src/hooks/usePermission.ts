import { useAuth } from "@/context/auth-context";

export const usePermission = () => {
  const { user } = useAuth();

  const checkPermission = (entity: string, action: string): boolean => {
    if (!user || !user.permissions) {
      return false;
    }

    const requiredPermission = `${entity}:${action}`;
    return user.permissions.includes(requiredPermission);
  };

  return { checkPermission };
};
