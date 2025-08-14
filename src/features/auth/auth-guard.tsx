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

  // Show loading state while checking authentication
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

  // Redirect if authentication requirement is not met
  if (requireAuth && !isAuthenticated) {
    return <Redirect href={redirectTo || "/(public)/welcome"} />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Redirect href={redirectTo || "/(app)/(tabs)/home"} />;
  }

  return <>{children}</>;
};

// HOC for protecting screens
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

// Hook for accessing auth state in components
export const useAuthGuard = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  const requireAuth = (redirectTo = "/(public)/welcome") => {
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
