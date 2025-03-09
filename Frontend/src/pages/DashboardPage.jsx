import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const DashboardPage = () => {
  const { user, token, logout } = useAuth();
  const { chats, loading, error, startChat } = useChat();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token || !user || !user.id) {
        console.log('Not fetching users: User not authenticated or missing ID');
        return;
      }
      
      try {
        console.log(`Fetching users for user ID: ${user.id}`);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': token,
            'user-id': user.id
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Users fetched successfully:', data.users.length);
          setUsers(data.users);
        } else {
          const errorData = await response.json();
          console.error('Error fetching users:', errorData);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, [token, user]);

  // Handle user search
  const handleSearch = async () => {
    if (!searchQuery.trim() || !token || !user || !user.id) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      console.log(`Searching for users with query: ${searchQuery}`);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/search/${searchQuery}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token,
          'user-id': user.id
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Search results:', data.users.length);
        setSearchResults(data.users);
      } else {
        const errorData = await response.json();
        console.error('Search error:', errorData);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Start a chat with a user
  const handleStartChat = async (userId) => {
    if (!userId || !user || !user.id) {
      console.error('Cannot start chat: Missing user ID');
      return;
    }
    
    try {
      console.log(`Starting chat with user ID: ${userId}`);
      const chat = await startChat(userId);
      console.log('Chat created/found:', chat);
      if (chat) {
        navigate(`/chat/${chat._id}`);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">LittleChat</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name?.charAt(0)}&background=random`} 
                alt={user?.name} 
                className="h-8 w-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="text-sm font-medium text-red-600 hover:text-red-500"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Chats */}
          <div className="md:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Conversations</h2>
              
              {loading ? (
                <div className="text-center py-4">Loading chats...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">{error}</div>
              ) : chats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No conversations yet</p>
                  <p className="text-sm">Search for users to start chatting</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {chats.map(chat => {
                    // Find the other participant (not the current user)
                    const otherParticipant = chat.participants.find(p => p._id !== user.id);
                    
                    return (
                      <li key={chat._id} className="py-4">
                        <Link to={`/chat/${chat._id}`} className="flex items-center hover:bg-gray-50 p-2 rounded-lg">
                          <img 
                            src={otherParticipant?.avatar || `https://ui-avatars.com/api/?name=${otherParticipant?.name?.charAt(0)}&background=random`} 
                            alt={otherParticipant?.name} 
                            className="h-10 w-10 rounded-full mr-4"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {otherParticipant?.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {chat.messages.length > 0 
                                ? `${chat.messages[chat.messages.length - 1].message_content.substring(0, 30)}${chat.messages[chat.messages.length - 1].message_content.length > 30 ? '...' : ''}`
                                : 'No messages yet'}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {chat.lastMessage && new Date(chat.lastMessage).toLocaleDateString()}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* User Search */}
          <div>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Find Users</h2>
              
              <div className="flex mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
              
              {searchResults.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {searchResults.map(user => (
                    <li key={user._id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <img 
                          src={user.avatar || `https://ui-avatars.com/api/?name=${user.name.charAt(0)}&background=random`} 
                          alt={user.name} 
                          className="h-8 w-8 rounded-full mr-3"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartChat(user._id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Message
                      </button>
                    </li>
                  ))}
                </ul>
              ) : searchQuery && !isSearching ? (
                <p className="text-center py-4 text-gray-500">No users found</p>
              ) : null}
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">All Users</h3>
                <ul className="divide-y divide-gray-200">
                  {users.slice(0, 5).map(user => (
                    <li key={user._id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <img 
                          src={user.avatar || `https://ui-avatars.com/api/?name=${user.name.charAt(0)}&background=random`} 
                          alt={user.name} 
                          className="h-8 w-8 rounded-full mr-3"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartChat(user._id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Message
                      </button>
                    </li>
                  ))}
                </ul>
                {users.length > 5 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View all users
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage; 