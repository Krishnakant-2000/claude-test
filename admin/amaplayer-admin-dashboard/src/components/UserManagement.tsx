import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Users, 
  Shield, 
  Ban, 
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye
} from 'lucide-react';
import { userManagementService, User } from '../services/userManagementService';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'athlete' | 'coach' | 'organization'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'verified'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userManagementService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadUsers();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await userManagementService.searchUsers(searchTerm);
      setUsers(searchResults);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (statusFilter === 'active' && (!user.isActive || user.isSuspended)) return false;
    if (statusFilter === 'suspended' && !user.isSuspended) return false;
    if (statusFilter === 'verified' && !user.isVerified) return false;
    return true;
  });

  const handleSuspendUser = async (user: User) => {
    const reason = prompt('Enter suspension reason:');
    if (!reason) return;

    try {
      await userManagementService.suspendUser(user.id, reason);
      await loadUsers();
      setActionMenuOpen(null);
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const handleUnsuspendUser = async (user: User) => {
    try {
      await userManagementService.unsuspendUser(user.id);
      await loadUsers();
      setActionMenuOpen(null);
    } catch (error) {
      console.error('Error unsuspending user:', error);
    }
  };

  const handleVerifyUser = async (user: User) => {
    try {
      await userManagementService.verifyUser(user.id);
      await loadUsers();
      setActionMenuOpen(null);
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  const handleUnverifyUser = async (user: User) => {
    try {
      await userManagementService.unverifyUser(user.id);
      await loadUsers();
      setActionMenuOpen(null);
    } catch (error) {
      console.error('Error unverifying user:', error);
    }
  };

  const UserDetailsModal: React.FC<{ user: User; onClose: () => void }> = ({ user, onClose }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-90vh overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-900">User Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="flex items-center space-x-4">
              <img
                src={user.photoURL || 'https://via.placeholder.com/80'}
                alt={user.displayName}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user.displayName}</h3>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {user.isVerified && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  )}
                  {user.isSuspended && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <Ban className="w-3 h-3 mr-1" />
                      Suspended
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'athlete' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'coach' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User ID - Always shown */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded border">{user.id}</p>
              </div>
              
              {user.bio && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <p className="mt-1 text-sm text-gray-900">{user.bio}</p>
                </div>
              )}
              
              {user.location && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="mt-1 text-sm text-gray-900">{user.location}</p>
                </div>
              )}
              
              {/* Sports - Show even if empty */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Sports</label>
                <p className="mt-1 text-sm text-gray-900">{user.sport || 'Not specified'}</p>
              </div>
              
              {user.age && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <p className="mt-1 text-sm text-gray-900">{user.age}</p>
                </div>
              )}
              
              {user.gender && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{user.gender}</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{user.followers || 0}</p>
                <p className="text-sm text-gray-600">Followers</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{user.following || 0}</p>
                <p className="text-sm text-gray-600">Following</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{user.postsCount || 0}</p>
                <p className="text-sm text-gray-600">Posts</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{user.videosCount || 0}</p>
                <p className="text-sm text-gray-600">Videos</p>
              </div>
            </div>

            {/* Admin Notes */}
            {user.adminNotes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                <div className="mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-gray-900">{user.adminNotes}</p>
                </div>
              </div>
            )}

            {/* Suspension Info */}
            {user.isSuspended && user.suspensionReason && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Suspension Reason</label>
                <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-gray-900">{user.suspensionReason}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage and moderate user accounts</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by User ID, name, email, bio, sport, or location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="athlete">Athletes</option>
              <option value="coach">Coaches</option>
              <option value="organization">Organizations</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="verified">Verified</option>
            </select>

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Users ({filteredUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={user.photoURL || 'https://via.placeholder.com/40'}
                        alt={user.displayName}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.sport && (
                          <div className="text-xs text-blue-600 mt-1">
                            🏃‍♂️ {user.sport}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'athlete' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'coach' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {user.isVerified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      )}
                      {user.isSuspended && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <Ban className="w-3 h-3 mr-1" />
                          Suspended
                        </span>
                      )}
                      {!user.isActive && !user.isSuspended && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <span>{user.followers || 0} followers</span>
                      <span>{user.postsCount || 0} posts</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {actionMenuOpen === user.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserDetails(true);
                                setActionMenuOpen(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4 inline mr-2" />
                              View Details
                            </button>
                            {user.isVerified ? (
                              <button
                                onClick={() => handleUnverifyUser(user)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <XCircle className="w-4 h-4 inline mr-2" />
                                Remove Verification
                              </button>
                            ) : (
                              <button
                                onClick={() => handleVerifyUser(user)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Shield className="w-4 h-4 inline mr-2" />
                                Verify User
                              </button>
                            )}
                            {user.isSuspended ? (
                              <button
                                onClick={() => handleUnsuspendUser(user)}
                                className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100"
                              >
                                <CheckCircle className="w-4 h-4 inline mr-2" />
                                Unsuspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSuspendUser(user)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                              >
                                <Ban className="w-4 h-4 inline mr-2" />
                                Suspend
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowUserDetails(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;