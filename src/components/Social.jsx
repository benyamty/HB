import { useState } from 'react'

// Achievement definitions with points requirements
const ACHIEVEMENTS = [
  { id: 'starter', name: 'Starter', icon: '🌱', color: 'bg-green-100', borderColor: 'border-green-400', pointsRequired: 5, description: 'Earn 5 points' },
  { id: 'rising-star', name: 'Rising Star', icon: '⭐', color: 'bg-yellow-100', borderColor: 'border-yellow-400', pointsRequired: 10, description: 'Earn 10 points' },
  { id: 'go-getter', name: 'Go Getter', icon: '💪', color: 'bg-red-100', borderColor: 'border-red-400', pointsRequired: 15, description: 'Earn 15 points' },
  { id: 'dedicated', name: 'Dedicated', icon: '🎯', color: 'bg-blue-100', borderColor: 'border-blue-400', pointsRequired: 25, description: 'Earn 25 points' },
  { id: 'champion', name: 'Champion', icon: '🏆', color: 'bg-orange-100', borderColor: 'border-orange-400', pointsRequired: 40, description: 'Earn 40 points' },
  { id: 'legend', name: 'Legend', icon: '👑', color: 'bg-purple-100', borderColor: 'border-purple-400', pointsRequired: 60, description: 'Earn 60 points' },
  { id: 'master', name: 'Master', icon: '🔥', color: 'bg-amber-100', borderColor: 'border-amber-400', pointsRequired: 80, description: 'Earn 80 points' },
  { id: 'elite', name: 'Elite', icon: '💎', color: 'bg-cyan-100', borderColor: 'border-cyan-400', pointsRequired: 100, description: 'Earn 100 points' },
  { id: 'mythic', name: 'Mythic', icon: '🌟', color: 'bg-pink-100', borderColor: 'border-pink-400', pointsRequired: 150, description: 'Earn 150 points' },
  { id: 'immortal', name: 'Immortal', icon: '🚀', color: 'bg-indigo-100', borderColor: 'border-indigo-400', pointsRequired: 200, description: 'Earn 200 points' },
]

function Social({ 
  completedToday,
  habits,
  currentStreak,
  friends,
  onAddFriend,
  onRemoveFriend,
  unlockedAchievements = [],
  profileBadges = [null, null, null],
  onSetProfileBadge
}) {
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [friendName, setFriendName] = useState('')
  const [showBadgePicker, setShowBadgePicker] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [achievementsExpanded, setAchievementsExpanded] = useState(false)
  const [selectedAchievement, setSelectedAchievement] = useState(null)

  // Calculate tasks done (green theme stat)
  const tasksDone = completedToday.length

  // Calculate points (simple: 10 points per completed task)
  const points = tasksDone * 10

  const handleAddFriend = () => {
    if (friendName.trim()) {
      onAddFriend(friendName.trim())
      setFriendName('')
      setShowAddFriend(false)
    }
  }

  const handleBadgeSlotClick = (slotIndex) => {
    setSelectedSlot(slotIndex)
    setShowBadgePicker(true)
  }

  const handleSelectBadge = (achievementId) => {
    if (selectedSlot !== null) {
      onSetProfileBadge(selectedSlot, achievementId)
    }
    setShowBadgePicker(false)
    setSelectedSlot(null)
  }

  const handleRemoveBadge = () => {
    if (selectedSlot !== null) {
      onSetProfileBadge(selectedSlot, null)
    }
    setShowBadgePicker(false)
    setSelectedSlot(null)
  }

  // Get achievement data by ID
  const getAchievement = (id) => ACHIEVEMENTS.find(a => a.id === id)

  return (
    <div className="h-full flex flex-col bg-[#fcfcfc] px-4 pb-20 pt-[max(1rem,env(safe-area-inset-top))]">
      {/* Top Row: Title */}
      <div className="flex-shrink-0 mb-4 flex items-center">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <span className="ml-3 text-lg font-semibold text-gray-900">Social</span>
      </div>

      {/* Profile Stats Card */}
      <div className="flex-shrink-0 bg-white border border-gray-200 rounded-3xl px-6 py-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm font-medium">Your Profile</span>
          </div>
          
          {/* 3 Profile Badge Slots */}
          <div className="flex items-center gap-2">
            {profileBadges.map((badgeId, index) => {
              const badge = badgeId ? getAchievement(badgeId) : null
              return (
                <button
                  key={index}
                  onClick={() => handleBadgeSlotClick(index)}
                  className={`w-11 h-11 rounded-full border-2 border-dashed flex items-center justify-center transition-all active:scale-95 ${
                    badge 
                      ? `${badge.color} ${badge.borderColor} border-solid` 
                      : 'border-gray-300 bg-gray-50 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  {badge ? (
                    <span className="text-lg">{badge.icon}</span>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="flex justify-around items-center py-2">
          {/* Tasks Done - Green theme */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">{tasksDone}</span>
            <span className="text-xs text-gray-500">Tasks Done</span>
          </div>

          {/* Streak - Fire icon */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">{currentStreak}</span>
            <span className="text-xs text-gray-500">Streak</span>
          </div>

          {/* Points - Trophy icon */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 15a4 4 0 004-4V4H8v7a4 4 0 004 4zm6-11h2a1 1 0 011 1v2a4 4 0 01-3 3.874V10a6 6 0 00-.17-1.418A3 3 0 0018 6V4zM6 4v2a3 3 0 00.17 2.582A6 6 0 006 10v.874A4 4 0 013 7V5a1 1 0 011-1h2zm3 17v-2h6v2a1 1 0 01-1 1h-4a1 1 0 01-1-1z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">{points}</span>
            <span className="text-xs text-gray-500">Points</span>
          </div>
        </div>
      </div>

      {/* Achievements Card - Collapsible */}
      <div className="flex-shrink-0 bg-white border border-gray-200 rounded-3xl px-6 py-5 mb-4">
        {/* Header - Clickable to expand/collapse */}
        <button 
          onClick={() => setAchievementsExpanded(!achievementsExpanded)}
          className="flex items-center gap-3 w-full"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <span className="text-gray-500 text-sm font-medium">Achievements</span>
          <span className="ml-auto text-xs text-gray-400 mr-2">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${achievementsExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Collapsed view - show first 5 badges in a row */}
        {!achievementsExpanded && (
          <div className="flex gap-2 mt-4 justify-center">
            {ACHIEVEMENTS.slice(0, 5).map((achievement) => {
              const isUnlocked = unlockedAchievements.includes(achievement.id)
              return (
                <button
                  key={achievement.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedAchievement(achievement)
                  }}
                  className="flex-shrink-0"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                      isUnlocked
                        ? `${achievement.color} ${achievement.borderColor} border-solid shadow-sm`
                        : 'bg-gray-100 border-gray-200 border-dashed opacity-40'
                    }`}
                    style={{ borderWidth: '2px' }}
                  >
                    <span className={`text-lg ${isUnlocked ? '' : 'grayscale'}`}>
                      {achievement.icon}
                    </span>
                  </div>
                </button>
              )
            })}
            <div className="w-10 h-10 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-400 font-medium">+{ACHIEVEMENTS.length - 5}</span>
            </div>
          </div>
        )}
        
        {/* Expanded view - show all badges in grid */}
        {achievementsExpanded && (
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {ACHIEVEMENTS.map((achievement) => {
              const isUnlocked = unlockedAchievements.includes(achievement.id)
              return (
                <button
                  key={achievement.id}
                  onClick={() => setSelectedAchievement(achievement)}
                  className="flex flex-col items-center active:scale-95 transition-transform"
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                      isUnlocked
                        ? `${achievement.color} ${achievement.borderColor} border-solid shadow-md`
                        : 'bg-gray-100 border-gray-200 border-dashed opacity-40'
                    }`}
                    style={{ borderWidth: '3px' }}
                  >
                    <span className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>
                      {achievement.icon}
                    </span>
                  </div>
                  <span className={`text-[10px] mt-1 text-center max-w-[60px] leading-tight ${
                    isUnlocked ? 'text-gray-700 font-medium' : 'text-gray-400'
                  }`}>
                    {achievement.name}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Friends Card */}
      <div className="flex-1 bg-white border border-gray-200 rounded-3xl px-6 py-5 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm font-medium">Friends</span>
          </div>
          <button 
            onClick={() => setShowAddFriend(true)}
            className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
                <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4 text-center">No friends yet</p>
              <div className="bg-white rounded-full px-8 py-3 border border-gray-200">
                <span className="text-orange-700 font-medium">Add Your First Friend</span>
              </div>
            </button>
          ) : (
            friends.map((friend, index) => (
              <div
                key={friend.id || index}
                className="w-full p-4 rounded-2xl bg-white border border-gray-200 flex items-center justify-between"
              >
                {/* Friend Avatar & Name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 font-semibold text-sm">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Friend</h3>
            <input
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="Friend's name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
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
                className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center">
            {/* Badge Icon */}
            <div
              className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4 ${
                unlockedAchievements.includes(selectedAchievement.id)
                  ? `${selectedAchievement.color} ${selectedAchievement.borderColor} border-solid shadow-lg`
                  : 'bg-gray-100 border-gray-300 border-dashed'
              }`}
              style={{ borderWidth: '4px' }}
            >
              <span className={`text-5xl ${unlockedAchievements.includes(selectedAchievement.id) ? '' : 'grayscale opacity-50'}`}>
                {selectedAchievement.icon}
              </span>
            </div>
            
            {/* Badge Name */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedAchievement.name}</h3>
            
            {/* Status */}
            {unlockedAchievements.includes(selectedAchievement.id) ? (
              <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Unlocked!
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Locked
              </div>
            )}
            
            {/* Requirement */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <p className="text-sm text-gray-500 mb-1">Requirement</p>
              <p className="text-lg font-semibold text-gray-900">{selectedAchievement.description}</p>
              <p className="text-sm text-purple-600 mt-2 font-medium">
                {selectedAchievement.pointsRequired.toLocaleString()} points needed
              </p>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => setSelectedAchievement(null)}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium active:scale-95 transition-transform"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Badge Picker Modal */}
      {showBadgePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Choose a Badge</h3>
            <p className="text-sm text-gray-500 mb-4">Select an achievement to display on your profile</p>
            
            {/* Scrollable badge list */}
            <div className="flex-1 overflow-y-auto mb-4">
              <div className="grid grid-cols-3 gap-3">
                {ACHIEVEMENTS.filter(a => unlockedAchievements.includes(a.id)).map((achievement) => {
                  const isSelected = profileBadges.includes(achievement.id)
                  return (
                    <button
                      key={achievement.id}
                      onClick={() => handleSelectBadge(achievement.id)}
                      disabled={isSelected && profileBadges[selectedSlot] !== achievement.id}
                      className={`flex flex-col items-center p-3 rounded-2xl transition-all ${
                        isSelected && profileBadges[selectedSlot] !== achievement.id
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:bg-gray-50 active:scale-95'
                      } ${
                        profileBadges[selectedSlot] === achievement.id
                          ? 'bg-orange-50 ring-2 ring-orange-400'
                          : ''
                      }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-full ${achievement.color} ${achievement.borderColor} border-solid flex items-center justify-center shadow-sm`}
                        style={{ borderWidth: '3px' }}
                      >
                        <span className="text-2xl">{achievement.icon}</span>
                      </div>
                      <span className="text-[10px] mt-2 text-center text-gray-700 font-medium leading-tight">
                        {achievement.name}
                      </span>
                    </button>
                  )
                })}
              </div>
              
              {unlockedAchievements.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No achievements unlocked yet</p>
                  <p className="text-gray-400 text-xs mt-1">Complete habits to earn badges!</p>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-3 flex-shrink-0">
              {profileBadges[selectedSlot] && (
                <button
                  onClick={handleRemoveBadge}
                  className="flex-1 py-3 rounded-xl border border-red-200 text-red-600 font-medium"
                >
                  Remove
                </button>
              )}
              <button
                onClick={() => {
                  setShowBadgePicker(false)
                  setSelectedSlot(null)
                }}
                className={`${profileBadges[selectedSlot] ? 'flex-1' : 'w-full'} py-3 rounded-xl border border-gray-200 text-gray-600 font-medium`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Social
