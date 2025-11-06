import React, { useEffect } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../../shared/hooks";
import { Skeleton } from "../../shared/ui";
interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  redirectTo,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 bg-white p-4">
        <View className="space-y-4">
          <Skeleton height={200} className="w-full rounded-lg" />
          <Skeleton height={24} className="w-3/4" />
          <Skeleton height={16} className="w-1/2" />
          <View className="space-y-2">
            <Skeleton height={12} className="w-full" />
            <Skeleton height={12} className="w-4/5" />
            <Skeleton height={12} className="w-3/5" />
          </View>
        </View>
      </View>
    );
  }

  if (requireAuth && !isAuthenticated) {
                                          return <Redirect href={(redirectTo || "/(public)/auth/login") as any} />;
  }
  if (!requireAuth && isAuthenticated) {
    return <Redirect href={(redirectTo || "/(app)/(tabs)/home") as any} />;
  }
  return <>{children}</>;
};

export const withAuthGuard = (
  Component: React.ComponentType<any>,
  options?: Partial<AuthGuardProps>
) => {
  return function AuthGuardedComponent(props: any) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
};

export const useAuthGuard = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const requireAuth = (redirectTo = "/(public)/auth/login") => {
    if (isLoading) return { canAccess: false, isLoading: true };
    if (!isAuthenticated)
      return { canAccess: false, isLoading: false, redirectTo };
    return { canAccess: true, isLoading: false };
  };
  const requireGuest = (redirectTo = "/(app)/(tabs)/home") => {
    if (isLoading) return { canAccess: false, isLoading: true };
    if (isAuthenticated)
      return { canAccess: false, isLoading: false, redirectTo };
    return { canAccess: true, isLoading: false };
  };
  return {
    isAuthenticated,
    isLoading,
    user,
    requireAuth,
    requireGuest,
  };
};
