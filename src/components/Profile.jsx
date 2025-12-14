import { useEffect, useRef, useState } from 'react'

const ACHIEVEMENTS = [
  { id: 'starter', name: 'Starter', icon: '🌱', color: 'bg-green-100', borderColor: 'border-green-400', pointsRequired: 5, description: 'Earn 5 points' },
  { id: 'rising-star', name: 'Rising Star', icon: '⭐', color: 'bg-yellow-100', borderColor: 'border-yellow-400', pointsRequired: 10, description: 'Earn 10 points' },
  { id: 'go-getter', name: 'Go Getter', icon: '💪', color: 'bg-red-100', borderColor: 'border-red-400', pointsRequired: 15, description: 'Earn 15 points' },
  { id: 'dedicated', name: 'Dedicated', icon: '🎯', color: 'bg-blue-100', borderColor: 'border-blue-400', pointsRequired: 25, description: 'Earn 25 points' },
  { id: 'champion', name: 'Champion', icon: '🏆', color: 'accent-chip', borderColor: 'border-[color:var(--accent-solid)]', pointsRequired: 40, description: 'Earn 40 points' },
  { id: 'legend', name: 'Legend', icon: '👑', color: 'bg-orange-100', borderColor: 'border-orange-400', pointsRequired: 60, description: 'Earn 60 points' },
  { id: 'master', name: 'Master', icon: '🔥', color: 'bg-amber-100', borderColor: 'border-amber-400', pointsRequired: 80, description: 'Earn 80 points' },
  { id: 'elite', name: 'Elite', icon: '💎', color: 'bg-cyan-100', borderColor: 'border-cyan-400', pointsRequired: 100, description: 'Earn 100 points' },
  { id: 'mythic', name: 'Mythic', icon: '🌟', color: 'bg-orange-100', borderColor: 'border-orange-400', pointsRequired: 150, description: 'Earn 150 points' },
  { id: 'immortal', name: 'Immortal', icon: '🚀', color: 'bg-indigo-100', borderColor: 'border-indigo-400', pointsRequired: 200, description: 'Earn 200 points' },
]

export default function Profile({
  userId,
  profileImage,
  completedToday = [],
  currentStreak = 0,
  clearedHabitHistory = [],
  unlockedAchievements = [],
  profileBadges = [null, null, null],
  onSetProfileBadge,
  onUpdateUserId,
  onUpdateProfileImage,
}) {
  const [isEditingId, setIsEditingId] = useState(false)
  const [draftId, setDraftId] = useState(userId || '')
  const [showBadgePicker, setShowBadgePicker] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedAchievement, setSelectedAchievement] = useState(null)
  const [returnToBadgePicker, setReturnToBadgePicker] = useState(false)
  const [showHabitHistory, setShowHabitHistory] = useState(false)

  const fileInputRef = useRef(null)

  useEffect(() => {
    setDraftId(userId || '')
  }, [userId])

  const tasksDone = completedToday.length
  const points = tasksDone * 10

  const getAchievement = (id) => ACHIEVEMENTS.find(a => a.id === id)

  const slotIndexGuard = (v) => (typeof v === 'number' ? v : 0)

  const handleBadgeSlotClick = (slotIndex) => {
    setSelectedSlot(slotIndex)
    setShowBadgePicker(true)
  }

  const handleSelectBadge = (achievementId) => {
    if (selectedSlot !== null) {
      onSetProfileBadge?.(slotIndexGuard(selectedSlot), achievementId)
    }
    setShowBadgePicker(false)
    setSelectedSlot(null)
  }

  const handleRemoveBadge = () => {
    if (selectedSlot !== null) {
      onSetProfileBadge?.(slotIndexGuard(selectedSlot), null)
    }
    setShowBadgePicker(false)
    setSelectedSlot(null)
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      if (typeof dataUrl === 'string') {
        onUpdateProfileImage?.(dataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  const commitId = () => {
    const next = (draftId || '').trim()
    onUpdateUserId?.(next)
    setIsEditingId(false)
  }

  return (
    <div className="h-full flex flex-col bg-[#fcfcfc] px-4 pb-20 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col items-center pt-4">
          <div className="w-full flex items-start justify-start">
            <button
              type="button"
              onClick={() => setShowHabitHistory(true)}
              className="text-sm font-semibold text-gray-600 active:opacity-70"
            >
              History
            </button>
          </div>
          <button
            type="button"
            onClick={openFilePicker}
            className="w-28 h-28 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center active:scale-95 transition-transform"
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center accent-chip">
                <svg className="w-10 h-10 text-[color:var(--accent-solid)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </button>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />

          <div className="mt-4 flex items-center gap-2">
            {!isEditingId ? (
              <>
                <span className="text-gray-900 font-bold text-lg">{userId || 'Your ID'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setDraftId(userId || '')
                    setIsEditingId(true)
                  }}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  value={draftId}
                  onChange={(e) => setDraftId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitId()
                    if (e.key === 'Escape') {
                      setDraftId(userId || '')
                      setIsEditingId(false)
                    }
                  }}
                  className="h-10 w-56 rounded-full bg-white border border-gray-200 px-4 text-gray-900 font-semibold focus:outline-none"
                  placeholder="Enter ID"
                />
                <button
                  type="button"
                  onClick={commitId}
                  className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="w-full mt-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              {profileBadges.map((badgeId, index) => {
                const badge = badgeId ? getAchievement(badgeId) : null
                return (
                  <button
                    key={index}
                    onClick={() => handleBadgeSlotClick(index)}
                    className={`w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center transition-all active:scale-95 ${
                      badge
                        ? `${badge.color} ${badge.borderColor} border-solid`
                        : 'border-gray-300 bg-gray-50 hover:border-[color:var(--accent-solid)] hover:bg-white'
                    }`}
                  >
                    {badge ? (
                      <span className="text-xl">{badge.icon}</span>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex justify-around items-center py-2">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-2 accent-stat">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-gray-900">{tasksDone}</span>
                <span className="text-xs text-gray-500">Tasks Done</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full accent-chip flex items-center justify-center mb-2 accent-stat">
                  <svg className="w-6 h-6 text-[color:var(--accent-orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-gray-900">{currentStreak}</span>
                <span className="text-xs text-gray-500">Streak</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center mb-2 accent-stat">
                  <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 15a4 4 0 004-4V4H8v7a4 4 0 004 4zm6-11h2a1 1 0 011 1v2a4 4 0 01-3 3.874V10a6 6 0 00-.17-1.418A3 3 0 0018 6V4zM6 4v2a3 3 0 00.17 2.582A6 6 0 006 10v.874A4 4 0 013 7V5a1 1 0 011-1h2zm3 17v-2h6v2a1 1 0 01-1 1h-4a1 1 0 01-1-1z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-gray-900">{points}</span>
                <span className="text-xs text-gray-500">Points</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showHabitHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setShowHabitHistory(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Habit History</h3>
              <button
                type="button"
                onClick={() => setShowHabitHistory(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">Shows habits you cleared (undid) after completing.</p>

            <div className="flex-1 overflow-y-auto">
              {clearedHabitHistory.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6" />
                    </svg>
                  </div>
                  <div className="font-semibold text-gray-900">No history yet</div>
                  <div className="text-sm text-gray-500 mt-1">Clear a done habit to see it here.</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {clearedHabitHistory.map((item) => (
                    <div key={item.id} className="w-full p-4 rounded-2xl border border-gray-200 bg-gray-50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{item.habitName}</div>
                          <div className="text-sm text-gray-500">
                            {item.date}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                            Cleared
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedAchievement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center">
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

            <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedAchievement.name}</h3>

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

            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <p className="text-sm text-gray-500 mb-1">Requirement</p>
              <p className="text-lg font-semibold text-gray-900">{selectedAchievement.description}</p>
              <p className="text-sm text-orange-600 mt-2 font-medium">
                {selectedAchievement.pointsRequired.toLocaleString()} points needed
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedAchievement(null)
                if (returnToBadgePicker) {
                  setShowBadgePicker(true)
                  setReturnToBadgePicker(false)
                }
              }}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium active:scale-95 transition-transform"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showBadgePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Choose a Badge</h3>
            <p className="text-sm text-gray-500 mb-4">Select an achievement to display on your profile</p>

            <div className="flex-1 overflow-y-auto mb-4 pt-2 px-1">
              <div className="grid grid-cols-3 gap-3">
                {ACHIEVEMENTS.map((achievement) => {
                  const isUnlocked = unlockedAchievements.includes(achievement.id)
                  const isSelected = profileBadges.includes(achievement.id)

                  if (!isUnlocked) {
                    return (
                      <button
                        key={achievement.id}
                        onClick={() => {
                          setReturnToBadgePicker(true)
                          setShowBadgePicker(false)
                          setSelectedAchievement(achievement)
                        }}
                        className="flex flex-col items-center p-3 rounded-2xl transition-all hover:bg-gray-50 active:scale-95"
                      >
                        <div
                          className="w-14 h-14 rounded-full bg-gray-100 border-gray-200 border-dashed flex items-center justify-center opacity-50"
                          style={{ borderWidth: '3px' }}
                        >
                          <span className="text-2xl grayscale">{achievement.icon}</span>
                        </div>
                        <span className="text-[10px] mt-2 text-center text-gray-400 font-medium leading-tight">
                          {achievement.name}
                        </span>
                      </button>
                    )
                  }

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
                          ? 'bg-white ring-2 ring-[color:var(--accent-solid)]'
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
            </div>

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
