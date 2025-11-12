// src/components/admin/RoleChangeModal.tsx - FIXED: Added SuperAdmin option for Primary SuperAdmin

'use client';

import { Fragment, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { 
  XMarkIcon, 
  ExclamationTriangleIcon, 
  ShieldCheckIcon,
  UserIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';
import { UserRole } from '@/types';
import { UserListItem } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { roleUtils } from '@/lib/utils/auth';
import { useUpdateUserRole } from '@/hooks/useUserManagement';

interface RoleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserListItem;
}

const roleIcons = {
  [UserRole.USER]: UserIcon,
  [UserRole.ADMIN]: ShieldCheckIcon,
  [UserRole.SUPERADMIN]: ChevronUpDownIcon,
};

const roleColors = {
  [UserRole.USER]: 'text-gray-600 bg-gray-100',
  [UserRole.ADMIN]: 'text-blue-600 bg-blue-100',
  [UserRole.SUPERADMIN]: 'text-purple-600 bg-purple-100',
};

const roleDescriptions = {
  [UserRole.USER]: 'Standard user with basic access to questions and solutions.',
  [UserRole.ADMIN]: 'Administrator with access to manage questions, solutions, and view analytics.',
  [UserRole.SUPERADMIN]: 'Super Administrator with full system access including user management.',
};

export default function RoleChangeModal({ isOpen, onClose, user }: RoleChangeModalProps) {
  const { user: currentUser } = useAuth();
  const updateRoleMutation = useUpdateUserRole();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [showConfirm, setShowConfirm] = useState(false);

  // Check if current user is Primary SuperAdmin
  const isPrimarySuperAdmin = roleUtils.isPrimarySuperAdmin(currentUser);
  
  // Get available roles based on Primary SuperAdmin status
  const getAvailableRoles = (): UserRole[] => {
    if (!currentUser || !roleUtils.canChangeRole(currentUser, user)) return [];
    
    // Primary SuperAdmin can assign all roles (including SUPERADMIN)
    if (isPrimarySuperAdmin) {
      return [UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN];
    }
    
    // Regular SuperAdmin can only assign USER and ADMIN
    return [UserRole.USER, UserRole.ADMIN];
  };

  const availableRoles = getAvailableRoles();
  const canChangeRole = currentUser ? roleUtils.canChangeRole(currentUser, user) : false;

  const handleRoleChange = () => {
    if (!currentUser || !canChangeRole) return;

    const validation = roleUtils.validateRoleChange(currentUser, user, selectedRole);
    if (!validation.isValid) {
      return;
    }

    setShowConfirm(true);
  };

  const confirmRoleChange = () => {
    updateRoleMutation.mutate({
      userId: user.id,
      newRole: selectedRole,
      // Removed reason field since backend doesn't use it
    }, {
      onSuccess: () => {
        onClose();
        setSelectedRole(user.role);
        setShowConfirm(false);
      },
      onError: () => {
        setShowConfirm(false);
      }
    });
  };

  const resetAndClose = () => {
    setSelectedRole(user.role);
    setShowConfirm(false);
    onClose();
  };

  if (!canChangeRole) {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={resetAndClose}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <DialogTitle className="text-lg font-medium text-gray-900">
                      Access Denied
                    </DialogTitle>
                    <button
                      onClick={resetAndClose}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="text-center">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      Insufficient Permissions
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Only Super Administrators can change user roles.
                    </p>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={resetAndClose}
                      className="w-full rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Close
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={resetAndClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {!showConfirm ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <DialogTitle className="text-lg font-medium text-gray-900">
                        Change User Role
                      </DialogTitle>
                      <button
                        onClick={resetAndClose}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* User Info */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
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
                        <div>
                          <h3 className="font-medium text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="flex items-center mt-1">
                            {(() => {
                              const Icon = roleIcons[user.role];
                              return <Icon className="h-4 w-4 text-gray-400 mr-1" />;
                            })()}
                            <span className="text-xs text-gray-500">Current: {user.role}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Primary SuperAdmin Notice */}
                    {isPrimarySuperAdmin && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Primary SuperAdmin:</strong> You can assign any role, including SuperAdmin.
                        </p>
                      </div>
                    )}

                    {/* Role Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select New Role
                      </label>
                      <div className="space-y-3">
                        {availableRoles.map((role) => {
                          const Icon = roleIcons[role];
                          const isSelected = selectedRole === role;
                          return (
                            <button
                              key={role}
                              onClick={() => setSelectedRole(role)}
                              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-full ${roleColors[role]}`}>
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{role}</h4>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {roleDescriptions[role]}
                                  </p>
                                  {role === UserRole.SUPERADMIN && isPrimarySuperAdmin && (
                                    <p className="text-xs text-purple-600 mt-1 font-medium">
                                      Only Primary SuperAdmin can create SuperAdmins
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <button
                        onClick={resetAndClose}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRoleChange}
                        disabled={selectedRole === user.role}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Change Role
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Confirmation Screen */}
                    <div className="text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="mt-3">
                        <DialogTitle className="text-lg font-medium text-gray-900">
                          Confirm Role Change
                        </DialogTitle>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            You are about to change <strong>{user.name}</strong> role from{' '}
                            <strong>{user.role}</strong> to <strong>{selectedRole}</strong>.
                          </p>
                          {selectedRole === UserRole.SUPERADMIN && (
                            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
                              <p className="text-sm font-medium text-purple-800">
                                ⚠️ This user will gain full system access including the ability to manage other users roles.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={() => setShowConfirm(false)}
                        disabled={updateRoleMutation.isPending}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={confirmRoleChange}
                        disabled={updateRoleMutation.isPending}
                        className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                          selectedRole === UserRole.SUPERADMIN 
                            ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' 
                            : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                        }`}
                      >
                        {updateRoleMutation.isPending ? 'Changing...' : 'Confirm Change'}
                      </button>
                    </div>
                  </>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}