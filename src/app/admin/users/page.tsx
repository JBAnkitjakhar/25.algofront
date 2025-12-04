// src/app/admin/users/page.tsx - FIXED API error with search functionality

'use client';

import { useState, useMemo } from "react";
import Image from "next/image";
import AdminLayout from "@/components/admin/AdminLayout";
import RoleChangeModal from "@/components/admin/RoleChangeModal";
import {
  UsersIcon,
  ShieldCheckIcon,
  UserIcon,
  ChevronUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { UserRole, UserListItem, User } from "@/types";
import { dateUtils } from "@/lib/utils/common";
import { roleUtils } from "@/lib/utils/auth";
import { useAuth } from "@/hooks/useAuth";
import { useRolePermissions, useUsers, useUsersByRole } from "@/hooks/useUserManagement";

const roleIcons = {
  [UserRole.USER]: UserIcon,
  [UserRole.ADMIN]: ShieldCheckIcon,
  [UserRole.SUPERADMIN]: ChevronUpDownIcon,
};

const roleColors = {
  [UserRole.USER]: "text-gray-600 bg-gray-100",
  [UserRole.ADMIN]: "text-blue-600 bg-blue-100",
  [UserRole.SUPERADMIN]: "text-purple-600 bg-purple-100",
};

// Define proper types for user stats
interface UserStatsData {
  totalUsers: number;
  users: number;
  admins: number;
  superAdmins: number;
}

function SearchAndFilterBar({
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleFilter,
  totalUsers,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRole: UserRole | "ALL";
  onRoleFilter: (role: UserRole | "ALL") => void;
  totalUsers?: number;
}) {
  const clearSearch = () => onSearchChange("");
  const hasActiveFilters = searchQuery || selectedRole !== "ALL";

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 space-y-4 mb-6">
      <div className="flex items-center gap-2">
        <FunnelIcon className="h-5 w-5 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900">Search & Filters</h3>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or email..."
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {searchQuery && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              type="button"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Role Filter Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            Filter by role:
          </span>
          <div className="flex space-x-1">
            {(
              [
                "ALL",
                UserRole.USER,
                UserRole.ADMIN,
                UserRole.SUPERADMIN,
              ] as const
            ).map((role) => (
              <button
                key={role}
                onClick={() => onRoleFilter(role)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  selectedRole === role
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {role === "ALL" ? "All Users" : role}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {totalUsers && `${totalUsers} total users`}
          </span>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="text-sm text-gray-600 flex items-center space-x-2">
            {searchQuery && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: {searchQuery}
                <button
                  onClick={clearSearch}
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedRole !== "ALL" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Role: {selectedRole}
                <button
                  onClick={() => onRoleFilter("ALL")}
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 text-purple-400 hover:text-purple-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
          <button
            onClick={() => {
              onSearchChange("");
              onRoleFilter("ALL");
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

function UserTable({
  users,
  isLoading,
  onRoleChange,
  currentUser,
  searchQuery,
}: {
  users?: UserListItem[];
  isLoading: boolean;
  onRoleChange: (user: UserListItem) => void;
  currentUser: User | null;
  searchQuery: string;
}) {
  if (isLoading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="animate-pulse">
          <div className="divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-4 py-4 flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No users found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? `No users match "${searchQuery}". Try adjusting your search.`
              : "No users match your current filters."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {users.map((user) => {
          const Icon = roleIcons[user.role];
          const canChange = roleUtils.canChangeRole(currentUser, user);
          const isPrimary = user.primarySuperAdmin;

          return (
            <li key={user.id}>
              <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      {isPrimary && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      Joined {dateUtils.formatRelativeTime(user.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        roleColors[user.role]
                      }`}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {user.role}
                    </span>
                  </div>

                  {canChange ? (
                    <button
                      onClick={() => onRoleChange(user)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Change Role
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">Protected</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function UserStats({ userRoles }: { userRoles?: UserStatsData }) {
  if (!userRoles) return null;

  const stats = [
    {
      label: "Total Users",
      value: userRoles.totalUsers,
      icon: UsersIcon,
      color: "text-gray-600",
    },
    {
      label: "Regular Users",
      value: userRoles.users,
      icon: UserIcon,
      color: "text-green-600",
    },
    {
      label: "Admins",
      value: userRoles.admins,
      icon: ShieldCheckIcon,
      color: "text-blue-600",
    },
    {
      label: "Super Admins",
      value: userRoles.superAdmins,
      icon: ChevronUpDownIcon,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.label}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stat.value.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminUsersPage() {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserRole | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // FIXED: Conditionally fetch data based on role filter
  const allUsersQuery = useUsers({
    page: currentPage,
    size: 20,
  });

  // FIXED: Only call role-specific query when a specific role is selected
  const filteredUsersQuery = useUsersByRole(selectedRole as UserRole, {
    page: currentPage,
    size: 20,
  });

  // FIXED: Properly choose the active query and disable the unused one
  const {
    data: userPage,
    isLoading,
    error,
  } = selectedRole === "ALL" ? allUsersQuery : filteredUsersQuery;

  // Get role permissions for info display
  const { data: permissions } = useRolePermissions();

  // Client-side search filtering
  const filteredUsers = useMemo(() => {
    const allUsers = userPage?.content || [];

    if (!searchQuery.trim()) {
      return allUsers;
    }

    const query = searchQuery.toLowerCase();

    return allUsers.filter((user) => {
      // Check name (always present)
      const nameMatch = user.name.toLowerCase().includes(query);

      // Check email (might be undefined for GitHub users with private emails)
      const emailMatch = user.email
        ? user.email.toLowerCase().includes(query)
        : false;

      // Also check GitHub username if available
      const githubMatch = user.githubUsername
        ? user.githubUsername.toLowerCase().includes(query)
        : false;

      return nameMatch || emailMatch || githubMatch;
    });
  }, [userPage?.content, searchQuery]);

  // Calculate user stats from filtered results
  const userStats: UserStatsData | undefined = userPage
    ? {
        totalUsers: filteredUsers.length,
        users: filteredUsers.filter((u) => u.role === UserRole.USER).length,
        admins: filteredUsers.filter((u) => u.role === UserRole.ADMIN).length,
        superAdmins: filteredUsers.filter((u) => u.role === UserRole.SUPERADMIN)
          .length,
      }
    : undefined;

  const handleRoleChange = (user: UserListItem) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowRoleModal(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRoleFilter = (role: UserRole | "ALL") => {
    setSelectedRole(role);
    setCurrentPage(0); // Reset to first page when filtering
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0); // Reset to first page when searching
  };

  // Don't show if user is not admin
  if (!currentUser || !roleUtils.canAccessAdmin(currentUser)) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-400">
              <svg
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Access Denied
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You need admin privileges to access user management.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                User Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage user accounts and permissions across the platform.
              </p>
            </div>
            {!isSuperAdmin() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Only Super Admins can modify user
                  roles.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Statistics */}
        <UserStats userRoles={userStats} />

        {/* Search and Filters */}
        <SearchAndFilterBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedRole={selectedRole}
          onRoleFilter={handleRoleFilter}
          totalUsers={userPage?.totalElements}
        />

        {/* Results Summary */}
        {(searchQuery || selectedRole !== "ALL") && (
          <div className="mb-4">
            <div className="text-sm text-gray-600">
              Showing {filteredUsers.length} result
              {filteredUsers.length !== 1 ? "s" : ""}
              {searchQuery && ` for "${searchQuery}"`}
              {selectedRole !== "ALL" && ` with role ${selectedRole}`}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              Failed to load users: {error.message}
            </p>
          </div>
        )}

        {/* User Table */}
        <UserTable
          users={filteredUsers}
          isLoading={isLoading}
          onRoleChange={handleRoleChange}
          currentUser={currentUser}
          searchQuery={searchQuery}
        />

        {/* Pagination */}
        {userPage && userPage.totalPages > 1 && !searchQuery && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={userPage.first}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={userPage.last}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{currentPage * 20 + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min((currentPage + 1) * 20, userPage.totalElements)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{userPage.totalElements}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={userPage.first}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>

                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {currentPage + 1} of {userPage.totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={userPage.last}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Role Permissions Info (for non-SuperAdmins) */}
        {!isSuperAdmin() && permissions && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Role Permissions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(permissions.permissions).map(([role, perms]) => (
                <div key={role} className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center mb-3">
                    {(() => {
                      const Icon = roleIcons[role as UserRole];
                      return Icon ? (
                        <Icon className="h-5 w-5 mr-2 text-gray-600" />
                      ) : null;
                    })()}
                    <h4 className="font-medium text-gray-900">{role}</h4>
                  </div>
                  <ul className="space-y-1">
                    {Object.entries(perms as Record<string, boolean>).map(
                      ([perm, allowed]) => (
                        <li key={perm} className="text-sm flex items-center">
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${
                              allowed ? "bg-green-400" : "bg-red-400"
                            }`}
                          />
                          {perm
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      {selectedUser && (
        <RoleChangeModal
          isOpen={showRoleModal}
          onClose={handleCloseModal}
          user={selectedUser}
        />
      )}
    </AdminLayout>
  );
}
