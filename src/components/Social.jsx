import { useState } from 'react'

// Mock world leaderboard data
const WORLD_LEADERBOARD = [
  { id: 'w1', name: 'Alex Champion', points: 2450, streak: 45 },
  { id: 'w2', name: 'Sarah Star', points: 2280, streak: 38 },
  { id: 'w3', name: 'Mike Legend', points: 2150, streak: 42 },
  { id: 'w4', name: 'Emma Pro', points: 1980, streak: 35 },
  { id: 'w5', name: 'Chris Elite', points: 1850, streak: 30 },
  { id: 'w6', name: 'Lisa Master', points: 1720, streak: 28 },
  { id: 'w7', name: 'David Hero', points: 1650, streak: 25 },
  { id: 'w8', name: 'Anna Swift', points: 1580, streak: 22 },
  { id: 'w9', name: 'Tom Ace', points: 1490, streak: 20 },
  { id: 'w10', name: 'Kate Rise', points: 1420, streak: 18 },
]

function Social({ 
  friends,
  onAddFriend,
  onRemoveFriend
}) {
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [friendName, setFriendName] = useState('')
  const [leaderboardTab, setLeaderboardTab] = useState('friends') // 'friends' or 'world'

  const handleAddFriend = () => {
    if (friendName.trim()) {
      onAddFriend(friendName.trim())
      setFriendName('')
      setShowAddFriend(false)
    }
  }

  return (
    <div className="h-full flex flex-col px-4 pb-20 pt-[max(1rem,env(safe-area-inset-top))]">
      {/* Top Row: Title */}
      <div className="flex-shrink-0 mb-4 flex items-center">
        <div className="w-11 h-11 rounded-full stat-circle-profile flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
        </div>
        <span className="ml-3 text-lg font-semibold text-gray-700">Social</span>
      </div>

      {/* Leaderboard Card */}
      <div className="flex-shrink-0 glass-card rounded-3xl px-6 py-5 mb-4">
        {/* Header with toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full circle-yellow flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
              </svg>
            </div>
            <span className="text-gray-700 text-base font-semibold">Leaderboard</span>
          </div>
          
          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setLeaderboardTab('friends')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                leaderboardTab === 'friends'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Friends
            </button>
            <button
              onClick={() => setLeaderboardTab('world')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                leaderboardTab === 'world'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              World
            </button>
          </div>
        </div>
        
        {/* Leaderboard List */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {leaderboardTab === 'friends' ? (
            friends.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Add friends to see rankings</p>
              </div>
            ) : (
              friends.map((friend, index) => (
                <div
                  key={friend.id || index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                >
                  {/* Rank */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-200 text-gray-600' :
                    index === 2 ? 'bg-[color:var(--accent-orange)]/20 text-[color:var(--accent-solid)]' :
                    'bg-gray-100 text-gray-500'
                  } accent-stat`}>
                    {index + 1}
                  </div>
                  
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full accent-chip flex items-center justify-center">
                    <span className="text-[color:var(--accent-solid)] font-semibold text-xs">
                      {friend.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Name */}
                  <span className="flex-1 font-medium text-gray-900 text-sm truncate">{friend.name}</span>
                  
                  {/* Points */}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 15a4 4 0 004-4V4H8v7a4 4 0 004 4zm6-11h2a1 1 0 011 1v2a4 4 0 01-3 3.874V10a6 6 0 00-.17-1.418A3 3 0 0018 6V4zM6 4v2a3 3 0 00.17 2.582A6 6 0 006 10v.874A4 4 0 013 7V5a1 1 0 011-1h2zm3 17v-2h6v2a1 1 0 01-1 1h-4a1 1 0 01-1-1z" />
                    </svg>
                    <span>{friend.points || Math.floor(Math.random() * 500) + 100}</span>
                  </div>
                </div>
              ))
            )
          ) : (
            WORLD_LEADERBOARD.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
              >
                {/* Rank */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-200 text-gray-600' :
                  index === 2 ? 'bg-[color:var(--accent-orange)]/20 text-[color:var(--accent-solid)]' :
                  'bg-gray-100 text-gray-500'
                } accent-stat`}>
                  {index + 1}
                </div>
                
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-xs">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                {/* Name */}
                <span className="flex-1 font-medium text-gray-900 text-sm truncate">{player.name}</span>
                
                {/* Points */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 15a4 4 0 004-4V4H8v7a4 4 0 004 4zm6-11h2a1 1 0 011 1v2a4 4 0 01-3 3.874V10a6 6 0 00-.17-1.418A3 3 0 0018 6V4zM6 4v2a3 3 0 00.17 2.582A6 6 0 006 10v.874A4 4 0 013 7V5a1 1 0 011-1h2zm3 17v-2h6v2a1 1 0 01-1 1h-4a1 1 0 01-1-1z" />
                  </svg>
                  <span>{player.points.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Friends Card */}
      <div className="flex-1 glass-card rounded-3xl px-6 py-5 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0 w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full circle-green flex items-center justify-center">
              <svg className="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <span className="text-gray-700 text-base font-semibold">Friends</span>
          </div>
          <button 
            onClick={() => setShowAddFriend(true)}
            className="w-11 h-11 rounded-full pill-counter flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {/* Friends List */}
        <div className="flex-1 flex flex-col gap-2 min-h-0 w-full overflow-y-auto">
          {friends.length === 0 ? (
            <button 
              onClick={() => setShowAddFriend(true)}
              className="flex-1 flex flex-col items-center justify-center w-full"
            >
              {/* Plus Icon Circle */}
              <div className="w-20 h-20 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-[color:var(--accent-solid)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4 text-center">No friends yet</p>
              <div className="bg-white rounded-full px-8 py-3 border border-gray-200">
                <span className="accent-text font-medium">Add Your First Friend</span>
              </div>
            </button>
          ) : (
            friends.map((friend, index) => (
              <div
                key={friend.id || index}
                className="w-full p-4 rounded-2xl habit-item flex items-center justify-between"
              >
                {/* Friend Avatar & Name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full stat-circle-profile flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {friend.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">{friend.name}</span>
                </div>
                
                {/* Remove button */}
                <button
                  onClick={() => onRemoveFriend(friend.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="glass-card rounded-3xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Friend</h3>
            <input
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="Friend's name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-solid)] mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddFriend(false)
                  setFriendName('')
                }}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFriend}
                className="flex-1 py-3 rounded-xl accent-btn text-white font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
  )
}

export default Social
