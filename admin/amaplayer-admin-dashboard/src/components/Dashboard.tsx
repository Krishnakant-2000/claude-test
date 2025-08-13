import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  PlayCircle, 
  Activity,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  MapPin,
  Eye,
  Ban,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { userManagementService, User as UserType } from '../services/userManagementService';
import { videoVerificationService } from '../services/videoVerificationService';
import { eventsService } from '../services/eventsService';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    suspended: number;
    verified: number;
    athletes: number;
    coaches: number;
    organizations: number;
  };
  videos: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  events: {
    total: number;
    active: number;
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'athlete' | 'coach' | 'organization'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'verified'>('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female' | 'other'>('all');
  const [ageFilter, setAgeFilter] = useState('');
  const [ageOperator, setAgeOperator] = useState<'exact' | 'greater' | 'less'>('exact');
  const [achievementFilter, setAchievementFilter] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setUsersLoading(true);
      
      const [userStats, videoStats, events, allUsers] = await Promise.all([
        userManagementService.getUserStats(),
        videoVerificationService.getVerificationStats(),
        eventsService.getAllEvents(),
        userManagementService.getAllUsers()
      ]);

      const eventStats = {
        total: events.length,
        active: events.filter(e => e.isActive).length
      };

      setStats({
        users: userStats,
        videos: videoStats,
        events: eventStats
      });
      
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setUsersLoading(false);
    }
  };

  // Filter users based on all criteria
  const filteredUsers = users.filter(user => {
    // Text search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.bio?.toLowerCase().includes(searchLower) ||
        user.location?.toLowerCase().includes(searchLower) ||
        user.sport?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Role filter
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;

    // Status filter
    if (statusFilter === 'active' && (!user.isActive || user.isSuspended)) return false;
    if (statusFilter === 'suspended' && !user.isSuspended) return false;
    if (statusFilter === 'verified' && !user.isVerified) return false;

    // Location filter
    if (locationFilter.trim() && user.location && 
        !user.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;

    // Sport filter
    if (sportFilter.trim() && user.sport && 
        !user.sport.toLowerCase().includes(sportFilter.toLowerCase())) return false;

    // Gender filter
    if (genderFilter !== 'all' && user.gender !== genderFilter) return false;

    // Age filter
    if (ageFilter.trim() && user.age) {
      const filterAge = parseInt(ageFilter);
      if (!isNaN(filterAge)) {
        const userAge = parseInt(user.age.toString());
        if (ageOperator === 'exact' && userAge !== filterAge) return false;
        if (ageOperator === 'greater' && userAge <= filterAge) return false;
        if (ageOperator === 'less' && userAge >= filterAge) return false;
      }
    }

    // Achievement filter
    if (achievementFilter.trim() && user.achievements && 
        !user.achievements.some(achievement => 
          achievement.title.toLowerCase().includes(achievementFilter.toLowerCase()) ||
          achievement.description.toLowerCase().includes(achievementFilter.toLowerCase()))) return false;

    return true;
  });

  const clearAllFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setLocationFilter('');
    setSportFilter('');
    setGenderFilter('all');
    setAgeFilter('');
    setAchievementFilter('');
    setAgeOperator('exact');
  };


  const StatCard: React.FC<{
    title: string;
    value: number;
    subtitle?: string;
    icon: React.ElementType;
    color: string;
    link: string;
  }> = ({ title, value, subtitle, icon: Icon, color, link }) => (
    <Link
      to={link}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Link>
  );

  const UserCard: React.FC<{ user: UserType }> = ({ user }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={user.photoURL || 'https://via.placeholder.com/48'}
            alt={user.displayName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.displayName}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedUser(user);
            setShowUserModal(true);
          }}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            user.role === 'athlete' ? 'bg-blue-100 text-blue-800' :
            user.role === 'coach' ? 'bg-green-100 text-green-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
          </span>
          
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
        </div>

        {user.location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {user.location}
          </div>
        )}

        {user.sport && (
          <div className="flex items-center text-sm text-gray-600">
            <Activity className="w-4 h-4 mr-2" />
            {user.sport}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 mt-3">
          <span>{user.followers || 0} followers</span>
          <span>{user.postsCount || 0} posts</span>
        </div>
      </div>
    </div>
  );

  const UserModal: React.FC<{ user: UserType; onClose: () => void }> = ({ user, onClose }) => (
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
              {user.sport && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sport</label>
                  <p className="mt-1 text-sm text-gray-900">{user.sport}</p>
                </div>
              )}
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
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to the AmaPlayer admin dashboard</p>
      </div>

      {/* Main Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.users.total}
            subtitle={`${stats.users.active} active`}
            icon={Users}
            color="bg-blue-500"
            link="/users"
          />
          <StatCard
            title="Events"
            value={stats.events.total}
            subtitle={`${stats.events.active} active`}
            icon={Calendar}
            color="bg-green-500"
            link="/events"
          />
          <StatCard
            title="Videos"
            value={stats.videos.total}
            subtitle={`${stats.videos.pending} pending review`}
            icon={PlayCircle}
            color="bg-purple-500"
            link="/videos"
          />
          <StatCard
            title="Verified Users"
            value={stats.users.verified}
            subtitle={`${Math.round((stats.users.verified / stats.users.total) * 100)}% of total`}
            icon={CheckCircle}
            color="bg-indigo-500"
            link="/users"
          />
        </div>
      )}

      {/* Users Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">All Users</h2>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </span>
            <Link
              to="/users"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Advanced Management →
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            {/* Main Search */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, bio, location, or sport..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="athlete">Athletes</option>
                    <option value="coach">Coaches</option>
                    <option value="organization">Organizations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="verified">Verified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="Filter by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sport</label>
                  <input
                    type="text"
                    placeholder="Filter by sport..."
                    value={sportFilter}
                    onChange={(e) => setSportFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <div className="flex space-x-2">
                    <select
                      value={ageOperator}
                      onChange={(e) => setAgeOperator(e.target.value as any)}
                      className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="exact">=</option>
                      <option value="greater">&gt;</option>
                      <option value="less">&lt;</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Age"
                      value={ageFilter}
                      onChange={(e) => setAgeFilter(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
                  <input
                    type="text"
                    placeholder="Filter by achievements..."
                    value={achievementFilter}
                    onChange={(e) => setAchievementFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Users Grid */}
        {usersLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUsers.slice(0, 12).map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
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

            {filteredUsers.length > 12 && (
              <div className="text-center">
                <Link
                  to="/users"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  View All {filteredUsers.length} Users
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;