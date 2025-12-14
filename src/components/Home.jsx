import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VerificationModal from './VerificationModal'

// SVG icons for progress messages
const ProgressIcons = {
  trophy: (
    <svg className="w-5 h-5 text-[color:var(--accent-solid)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  fire: (
    <svg className="w-5 h-5 text-[color:var(--accent-solid)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5 text-[color:var(--accent-solid)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  bolt: (
    <svg className="w-5 h-5 text-[color:var(--accent-solid)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  sparkle: (
    <svg className="w-5 h-5 text-[color:var(--accent-solid)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  sun: (
    <svg className="w-5 h-5 text-[color:var(--accent-solid)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  moon: (
    <svg className="w-5 h-5 text-[color:var(--accent-solid)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
}

function getProgressMessage(habits, completedToday, paidToday, habitHistory) {
  const totalHabits = habits.length
  // Only count completions/payments that match actual habit IDs
  const habitIds = habits.map(h => h.id)
  const validCompletions = completedToday.filter(id => habitIds.includes(id))
  const validPayments = (paidToday || []).filter(id => habitIds.includes(id))
  const doneToday = validCompletions.length + validPayments.length
  
  // Get best per-habit streak
  const bestStreak = getBestHabitStreak(habits, habitHistory)
  
  // Priority 1: No habits yet
  if (totalHabits === 0) {
    return {
      icon: ProgressIcons.sparkle,
      headline: "Ready to start",
      subtext: "Add your first habit below"
    }
  }
  
  // Priority 2: Has a notable habit streak (2+ days)
  if (bestStreak.days >= 2) {
    return {
      icon: ProgressIcons.fire,
      headline: `${bestStreak.days}-day streak`,
      subtext: `of ${bestStreak.habitName}`
    }
  }
  
  // Priority 3: All done today
  if (doneToday > 0 && doneToday >= totalHabits) {
    return {
      icon: ProgressIcons.check,
      headline: "Perfect day!",
      subtext: "You crushed all your habits"
    }
  }
  
  // Priority 4: Some done
  if (doneToday > 0) {
    return {
      icon: ProgressIcons.bolt,
      headline: `${doneToday} of ${totalHabits} done`,
      subtext: "Keep going, almost there"
    }
  }
  
  // Priority 5: Has habits, none done yet - time-based greeting
  const hour = new Date().getHours()
  if (hour < 12) {
    return {
      icon: ProgressIcons.sun,
      headline: "Good morning!",
      subtext: `${totalHabits} habit${totalHabits > 1 ? 's' : ''} to complete today`
    }
  } else if (hour < 17) {
    return {
      icon: ProgressIcons.sun,
      headline: "Afternoon check-in",
      subtext: `${totalHabits} habit${totalHabits > 1 ? 's' : ''} waiting for you`
    }
  } else {
    return {
      icon: ProgressIcons.moon,
      headline: "Evening push",
      subtext: `${totalHabits} habit${totalHabits > 1 ? 's' : ''} left today`
    }
  }
}

// Calculate streak for a single habit from its completion history
function calculateHabitStreak(dates) {
  if (!dates || dates.length === 0) return 0
  
  // Sort dates descending (most recent first)
  const sortedDates = [...dates].sort().reverse()
  
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  
  // Streak must include today or yesterday to be "active"
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0
  }
  
  let streak = 1
  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i - 1])
    const prev = new Date(sortedDates[i])
    const diffDays = (current - prev) / 86400000
    
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

// Find the best habit streak to display
function getBestHabitStreak(habits, habitHistory) {
  let bestStreak = { habitName: '', days: 0 }
  
  for (const habit of habits) {
    const dates = habitHistory[habit.id] || []
    const streak = calculateHabitStreak(dates)
    
    if (streak > bestStreak.days) {
      bestStreak = { habitName: habit.name, days: streak }
    }
  }
  
  return bestStreak
}

// Achievement definitions with points requirements
const ACHIEVEMENTS = [
  { id: 'starter', name: 'Starter', icon: '🌱', color: 'circle-green', borderColor: 'border-green-400', pointsRequired: 5, description: 'Earn 5 points' },
  { id: 'rising-star', name: 'Rising Star', icon: '⭐', color: 'circle-yellow', borderColor: 'border-yellow-400', pointsRequired: 10, description: 'Earn 10 points' },
  { id: 'go-getter', name: 'Go Getter', icon: '💪', color: 'circle-pink', borderColor: 'border-pink-400', pointsRequired: 15, description: 'Earn 15 points' },
  { id: 'dedicated', name: 'Dedicated', icon: '🎯', color: 'circle-blue', borderColor: 'border-blue-400', pointsRequired: 25, description: 'Earn 25 points' },
  { id: 'champion', name: 'Champion', icon: '🏆', color: 'circle-gray', borderColor: 'border-[color:var(--accent-solid)]', pointsRequired: 40, description: 'Earn 40 points' },
  { id: 'legend', name: 'Legend', icon: '👑', color: 'circle-gray', borderColor: 'border-purple-400', pointsRequired: 60, description: 'Earn 60 points' },
  { id: 'master', name: 'Master', icon: '🔥', color: 'circle-gray', borderColor: 'border-amber-400', pointsRequired: 80, description: 'Earn 80 points' },
  { id: 'elite', name: 'Elite', icon: '💎', color: 'circle-gray', borderColor: 'border-cyan-400', pointsRequired: 100, description: 'Earn 100 points' },
  { id: 'mythic', name: 'Mythic', icon: '🌟', color: 'circle-gray', borderColor: 'border-purple-400', pointsRequired: 150, description: 'Earn 150 points' },
  { id: 'immortal', name: 'Immortal', icon: '🚀', color: 'circle-gray', borderColor: 'border-indigo-400', pointsRequired: 200, description: 'Earn 200 points' },
]

function Home({ 
  wallet, 
  habits, 
  completedToday,
  paidToday,
  currentStreak,
  longestStreak,
  habitHistory,
  habitsExpanded,
  unlockedAchievements = [],
  profileBadges = [null, null, null],
  onSetProfileBadge,
  onAddHabit, 
  onEditHabit, 
  onMarkDone,
  onToggleHabits 
}) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [verifyingHabit, setVerifyingHabit] = useState(null)
  const [showBadgePicker, setShowBadgePicker] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [achievementsExpanded, setAchievementsExpanded] = useState(false)
  const [selectedAchievement, setSelectedAchievement] = useState(null)

  // Track if it's the first mount to avoid initial animation
  const isFirstMount = useRef(true)
  useEffect(() => {
    isFirstMount.current = false
  }, [])

  // Update time every minute for countdown timers
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 30000) // every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const formatTimeRange = (habit) => {
    if (habit.allDay) return 'All Day'
    const format = (t) => {
      const [h, m] = t.split(':').map(Number)
      const ampm = h >= 12 ? 'PM' : 'AM'
      const displayHour = h % 12 || 12
      return `${displayHour} ${ampm}`
    }
    return `${format(habit.startTime)} - ${format(habit.endTime)}`
  }

  const isHabitDone = (habit) => completedToday.includes(habit.id)

  // Badge picker handlers
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

  // Calculate time remaining for a habit
  const getTimeRemaining = (habit) => {
    const now = currentTime
    let endTime
    
    if (habit.allDay) {
      // End of day (midnight)
      endTime = new Date(now)
      endTime.setHours(23, 59, 59, 999)
    } else {
      // Parse habit end time
      const [endHour, endMin] = habit.endTime.split(':').map(Number)
      endTime = new Date(now)
      endTime.setHours(endHour, endMin, 0, 0)
    }
    
    const diffMs = endTime - now
    
    if (diffMs <= 0) {
      return { text: 'Check in', expired: true }
    }
    
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    
    if (hours > 0) {
      return { text: `${hours}h ${mins}m`, expired: false }
    } else {
      return { text: `${mins}m`, expired: false }
    }
  }

  return (
    <div className={`h-full flex flex-col px-4 pb-20 pt-[max(1rem,env(safe-area-inset-top))] ${habitsExpanded ? 'overflow-hidden' : ''}`}>
      
      {/* Collapsible Top Section */}
      <AnimatePresence>
        {!habitsExpanded && (
          <motion.div
            initial={isFirstMount.current ? { height: 'auto', opacity: 1, marginBottom: '1rem' } : { height: 0, opacity: 0, marginBottom: 0 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: '1rem' }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-shrink-0 flex flex-col overflow-visible"
          >
            {/* Your Profile Card */}
            {(() => {
              const tasksDone = completedToday.length
              const points = tasksDone * 10
              return (
                <div className="flex-shrink-0 glass-card rounded-[36px] px-6 py-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full stat-circle-profile flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                      <span className="text-gray-700 text-lg font-bold tracking-tight">Your Profile</span>
                    </div>
                    
                    {/* 3 Profile Badge Slots - Styled as soft 3D buttons */}
                    <div className="flex items-center gap-3">
                      {profileBadges.map((badgeId, index) => {
                        const badge = badgeId ? getAchievement(badgeId) : null
                        // Fallback styles for empty slots if needed, or specific colors for badges
                        // Using a generic soft sphere style for badges
                        return (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleBadgeSlotClick(index)
                            }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-95 ${
                              badge ? `${badge.color} shadow-md` : 'sphere-3d bg-gray-100'
                            }`}
                            style={!badge ? { background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' } : {}}
                          >
                            {badge ? (
                              <span className="text-2xl filter drop-shadow-sm">{badge.icon}</span>
                            ) : (
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="flex justify-between items-center px-2">
                    {/* Tasks Done */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full stat-circle-green flex items-center justify-center mb-1">
                        <svg className="w-8 h-8 text-green-600 drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-3xl font-bold text-gray-700 leading-none">{tasksDone}</span>
                      <span className="text-sm font-medium text-gray-500">Tasks Done</span>
                    </div>

                    {/* Streak */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full stat-circle-orange flex items-center justify-center mb-1">
                        <svg className="w-8 h-8 text-orange-500 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                        </svg>
                      </div>
                      <span className="text-3xl font-bold text-gray-700 leading-none">{currentStreak}</span>
                      <span className="text-sm font-medium text-gray-500">Streak</span>
                    </div>

                    {/* Points */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full stat-circle-yellow flex items-center justify-center mb-1">
                        <svg className="w-8 h-8 text-yellow-600 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                      </div>
                      <span className="text-3xl font-bold text-gray-700 leading-none">{points}</span>
                      <span className="text-sm font-medium text-gray-500">Points</span>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Achievements Card - Collapsible */}
            <div className="flex-shrink-0 glass-card rounded-[36px] px-6 py-5 mb-6">
              {/* Header - Clickable to expand/collapse */}
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setAchievementsExpanded(!achievementsExpanded)
                }}
                className="flex items-center gap-3 w-full"
              >
                <div className="w-11 h-11 rounded-full stat-circle-yellow flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700 text-lg font-bold tracking-tight">Achievements</span>
                <div className="ml-auto pill-counter px-3 py-1.5 rounded-full flex items-center gap-1 mr-2">
                  <span className="text-sm font-bold text-gray-700">{unlockedAchievements.length}</span>
                  <span className="text-sm text-gray-400">/{ACHIEVEMENTS.length}</span>
                </div>
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
                              ? `${achievement.color} shadow-sm`
                              : 'circle-gray'
                          }`}
                        >
                          <span className={`text-lg ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
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
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedAchievement(achievement)
                        }}
                        className="flex flex-col items-center active:scale-95 transition-transform"
                      >
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                            isUnlocked
                              ? `${achievement.color} shadow-md`
                              : 'circle-gray'
                          }`}
                        >
                          <span className={`text-2xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Habits List */}
      <motion.div 
        layout
        className="flex-1 flex flex-col min-h-0 cursor-pointer habits-widget"
        onClick={() => { if (!habitsExpanded) onToggleHabits() }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Header - hidden when expanded, habits shown inline */}

        {/* Habits List */}
        <div className="flex-1 flex flex-col gap-4 min-h-0 w-full overflow-y-auto px-1 pb-4">
          {habits.length === 0 ? (
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onAddHabit()
              }}
              className="flex-1 flex flex-col items-center justify-center w-full glass-card rounded-[36px] py-10"
            >
              {/* Plus Icon Circle */}
              <div className="w-20 h-20 rounded-full bg-white border border-gray-100 flex items-center justify-center mb-4 shadow-sm">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-gray-400 mb-4 text-center font-medium">No habits yet</p>
              <div className="bg-gray-100 rounded-full px-8 py-3">
                <span className="text-gray-500 font-bold">Add Your First Habits</span>
              </div>
            </button>
          ) : (
            // Sort habits: by time, then done habits go to bottom
            [...habits]
              .sort((a, b) => {
                const aDone = isHabitDone(a)
                const bDone = isHabitDone(b)
                // Done habits go to bottom
                if (aDone && !bDone) return 1
                if (!aDone && bDone) return -1
                // Sort by start time
                const aTime = a.allDay ? 0 : a.startTime
                const bTime = b.allDay ? 0 : b.startTime
                return aTime - bTime
              })
              .map((habit) => {
              const isDone = isHabitDone(habit)
              const isPaid = paidToday?.includes(habit.id)
              const isResolved = isDone || isPaid
              
              return (
                <div
                  key={habit.id}
                  className={`w-full p-5 rounded-[32px] transition-all flex items-center justify-between glass-card ${
                    isResolved ? 'opacity-60 grayscale-[0.2]' : ''
                  }`}
                >
                  {/* Habit Info - Clickable to edit */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditHabit(habit)
                    }}
                    className="flex-1 min-w-0 text-left"
                  >
                    <span className={`font-bold text-xl block truncate mb-1 ${
                      isResolved ? 'text-gray-400' : 'text-gray-800'
                    }`}>
                      {habit.name}
                    </span>
                    <span className={`text-sm font-medium ${
                      isResolved ? 'text-gray-300' : 'text-gray-400'
                    }`}>
                      {formatTimeRange(habit)}
                    </span>
                  </button>
                  
                  {/* Done Button / Status */}
                  {isResolved ? (
                    <span className="text-gray-300 text-lg font-bold ml-4">{isPaid ? 'Paid' : 'Done'}</span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setVerifyingHabit(habit)
                      }}
                      className="ml-3 px-6 py-3 rounded-[20px] btn-done text-white font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Done
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </motion.div>

      {/* Verification Modal */}
      {verifyingHabit && (
        <VerificationModal
          habitName={verifyingHabit.name}
          onVerified={() => {
            onMarkDone(verifyingHabit.id)
            setVerifyingHabit(null)
          }}
          onCancel={() => setVerifyingHabit(null)}
        />
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

export default Home
