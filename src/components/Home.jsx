import { useMemo, useState, useEffect, useRef } from 'react'
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

function Home({ 
  wallet, 
  profileImage,
  habits, 
  completedToday,
  paidToday,
  friends = [],
  sharedPages = [],
  onSendSharedPageInvite,
  onRenameSharedPage,
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
  onDeleteHabit,
  onClearHabitStatus,
  onToggleHabits 
}) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [verifyingHabit, setVerifyingHabit] = useState(null)
  const [swipedHabitId, setSwipedHabitId] = useState(null)
  const swipeStartXRef = useRef(0)
  const swipeStartYRef = useRef(0)
  const swipeStartOffsetRef = useRef(0)
  const [swipeOffsetById, setSwipeOffsetById] = useState({})
  const [selectedHabitsDay, setSelectedHabitsDay] = useState(() => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()])
  const [habitsPage, setHabitsPage] = useState('my')
  const [showHabitsPageMenu, setShowHabitsPageMenu] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteFriendId, setInviteFriendId] = useState(null)
  const [showBadgePicker, setShowBadgePicker] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [achievementsExpanded, setAchievementsExpanded] = useState(false)
  const [selectedAchievement, setSelectedAchievement] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [returnToBadgePicker, setReturnToBadgePicker] = useState(false)
  const [isEditingSharedPageTitle, setIsEditingSharedPageTitle] = useState(false)
  const [sharedPageTitleDraft, setSharedPageTitleDraft] = useState('')
  const sharedPageTitleMeasureRef = useRef(null)
  const [sharedPageTitleInputWidth, setSharedPageTitleInputWidth] = useState(0)

  const habitsPageMenuRef = useRef(null)

  // Track if it's the first mount to avoid initial animation
  const isFirstMount = useRef(true)

  const WEEKDAYS = useMemo(() => (['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']), [])
  const todayKey = WEEKDAYS[new Date().getDay()]

  const getNewHabitContext = () => {
    // Collapsed home view: treat "Add" as creating a habit for today on My Habits
    if (!habitsExpanded) {
      return { daysOfWeek: [todayKey] }
    }

    // Expanded tasks view: scope to whichever page/day the user is currently viewing
    if (habitsPage === 'shared') {
      if (!inviteFriendId) return { isShared: true }
      return { isShared: true, sharedWith: [inviteFriendId] }
    }

    return { daysOfWeek: [selectedHabitsDay] }
  }

  const todaysHabits = useMemo(() => {
    return habits.filter(h => {
      const d = h.daysOfWeek
      if (!Array.isArray(d) || d.length === 0) return true
      return d.includes(todayKey)
    })
  }, [habits, todayKey])

  const otherPagesCount = useMemo(() => {
    const otherDays = habits.reduce((acc, h) => {
      const d = h.daysOfWeek
      if (!Array.isArray(d) || d.length === 0) return acc
      return d.includes(todayKey) ? acc : acc + 1
    }, 0)

    return otherDays + (sharedPages?.length || 0)
  }, [habits, sharedPages, todayKey])

  const filteredHabits = useMemo(() => {
    if (habitsPage === 'shared') {
      return habits.filter(h => {
        const isAnyShared = (h.sharedWith?.length || 0) > 0 || h.isShared
        if (!isAnyShared) return false
        if (!inviteFriendId) return true
        if (Array.isArray(h.sharedWith)) return h.sharedWith.includes(inviteFriendId)
        return true
      })
    }

    return habits.filter(h => {
      const d = h.daysOfWeek
      if (!Array.isArray(d) || d.length === 0) return true
      return d.includes(selectedHabitsDay)
    })
  }, [habits, habitsPage, selectedHabitsDay, inviteFriendId])

  const displayedHabits = habitsExpanded ? filteredHabits : todaysHabits
  useEffect(() => {
    isFirstMount.current = false
  }, [])

  // Update time every minute for countdown timers
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 30000) // every 30 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!showHabitsPageMenu) return

    const handleOutside = (e) => {
      if (!habitsPageMenuRef.current) return
      if (!habitsPageMenuRef.current.contains(e.target)) {
        setShowHabitsPageMenu(false)
      }
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [showHabitsPageMenu])

  useEffect(() => {
    if (!showInviteModal) {
      setInviteFriendId(null)
    }
  }, [showInviteModal])

  const selectedSharedPage = useMemo(() => {
    if (habitsPage !== 'shared') return null
    if (!inviteFriendId) return null
    return (sharedPages || []).find(p => p.friendId === inviteFriendId) || null
  }, [habitsPage, inviteFriendId, sharedPages])

  useEffect(() => {
    setIsEditingSharedPageTitle(false)
  }, [habitsPage, inviteFriendId])

  const commitSharedPageTitle = () => {
    const next = sharedPageTitleDraft.trim()
    if (next && selectedSharedPage) onRenameSharedPage?.(selectedSharedPage.id, next)
    setIsEditingSharedPageTitle(false)
  }

  const recalcSharedPageTitleWidth = (value) => {
    if (!sharedPageTitleMeasureRef.current) return
    const text = value && value.length ? value : ' '
    sharedPageTitleMeasureRef.current.textContent = text
    const w = Math.ceil(sharedPageTitleMeasureRef.current.offsetWidth) + 36
    setSharedPageTitleInputWidth(w)
  }

  useEffect(() => {
    if (!isEditingSharedPageTitle) return
    setSharedPageTitleDraft(selectedSharedPage?.title || '')
    setTimeout(() => {
      recalcSharedPageTitleWidth(selectedSharedPage?.title || '')
    }, 0)
  }, [isEditingSharedPageTitle, selectedSharedPage])

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

  const tasksDone = completedToday.length
  const points = tasksDone * 10

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
    <div className={`h-full flex flex-col bg-[#fcfcfc] px-4 pb-20 pt-[max(1rem,env(safe-area-inset-top))] ${habitsExpanded ? 'overflow-hidden' : ''}`}>

      {!habitsExpanded && (
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowProfileModal(true)
            }}
            className="w-10 h-10 rounded-full overflow-hidden bg-white border border-gray-200 flex items-center justify-center active:scale-95 transition-transform"
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center accent-chip">
                <svg className="w-5 h-5 text-[color:var(--accent-solid)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 text-[color:var(--accent-orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      )}

      {showProfileModal && !habitsExpanded && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center px-4 pt-[max(2.5rem,env(safe-area-inset-top))]"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center accent-chip">
                      <svg className="w-4 h-4 text-[color:var(--accent-solid)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-gray-700 text-sm font-semibold">Your Profile</span>
              </div>

              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {profileBadges.map((badgeId, index) => {
                  const badge = badgeId ? getAchievement(badgeId) : null
                  return (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBadgeSlotClick(index)
                      }}
                      className={`w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center transition-all active:scale-95 ${
                        badge
                          ? `${badge.color} ${badge.borderColor} border-solid`
                          : 'border-gray-300 bg-gray-50 hover:border-[color:var(--accent-solid)] hover:bg-white'
                      }`}
                    >
                      {badge ? (
                        <span className="text-lg">{badge.icon}</span>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center mb-1 accent-stat">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-lg font-bold text-gray-900 leading-none">{tasksDone}</span>
                  <span className="text-[10px] text-gray-500">Tasks Done</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full accent-chip flex items-center justify-center mb-1 accent-stat">
                    <svg className="w-5 h-5 text-[color:var(--accent-orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                    </svg>
                  </div>
                  <span className="text-lg font-bold text-gray-900 leading-none">{currentStreak}</span>
                  <span className="text-[10px] text-gray-500">Streak</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-yellow-50 flex items-center justify-center mb-1 accent-stat">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 15a4 4 0 004-4V4H8v7a4 4 0 004 4zm6-11h2a1 1 0 011 1v2a4 4 0 01-3 3.874V10a6 6 0 00-.17-1.418A3 3 0 0018 6V4zM6 4v2a3 3 0 00.17 2.582A6 6 0 006 10v.874A4 4 0 013 7V5a1 1 0 011-1h2zm3 17v-2h6v2a1 1 0 01-1 1h-4a1 1 0 01-1-1z" />
                    </svg>
                  </div>
                  <span className="text-lg font-bold text-gray-900 leading-none">{points}</span>
                  <span className="text-[10px] text-gray-500">Points</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <AnimatePresence initial={false} mode="wait">
        {habitsExpanded && (
          <motion.div
            key="habits-expanded"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-gray-50 px-4 pb-20 pt-[max(1rem,env(safe-area-inset-top))]"
          >
            <div className="h-full bg-white border border-gray-200 rounded-3xl px-6 py-5 flex flex-col min-h-0 habits-widget accent-card">
              {/* Header */}
              <div className="flex items-center justify-between mb-3 flex-shrink-0 w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl accent-chip flex items-center justify-center">
                    <svg className="w-5.5 h-5.5 text-[color:var(--accent-solid)]" fill="none" stroke="currentColor" strokeWidth={1.3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L16.5 11.743m0 0l1.378-1.378a1 1 0 00-1.414-1.414L15.086 10.33m1.414 1.414l-4.95 4.95a1 1 0 01-.39.242l-1.83.61.61-1.83a1 1 0 01.242-.39l4.95-4.95" />
                    </svg>
                  </div>

                  <div className="relative" ref={habitsPageMenuRef}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowHabitsPageMenu(!showHabitsPageMenu)
                      }}
                      className="flex items-center gap-1 text-gray-500 text-sm font-medium"
                    >
                      {habitsPage === 'shared' && selectedSharedPage ? (
                        isEditingSharedPageTitle ? (
                          <span className="relative" onClick={(e) => e.stopPropagation()}>
                            <span
                              ref={sharedPageTitleMeasureRef}
                              className="absolute -left-[9999px] -top-[9999px] text-sm font-medium whitespace-pre"
                            />
                            <input
                              value={sharedPageTitleDraft}
                              onChange={(e) => {
                                const v = e.target.value
                                setSharedPageTitleDraft(v)
                                recalcSharedPageTitleWidth(v)
                                requestAnimationFrame(() => {
                                  try { e.target.scrollLeft = 0 } catch (_) {}
                                })
                              }}
                              onFocus={(e) => {
                                try {
                                  const len = e.target.value?.length || 0
                                  e.target.setSelectionRange(len, len)
                                  requestAnimationFrame(() => {
                                    try { e.target.scrollLeft = 0 } catch (_) {}
                                  })
                                } catch (_) {}
                              }}
                              onBlur={() => {
                                commitSharedPageTitle()
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  commitSharedPageTitle()
                                }
                                if (e.key === 'Escape') setIsEditingSharedPageTitle(false)
                              }}
                              className="text-sm font-medium text-gray-700 text-left bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 focus:outline-none"
                              style={{ width: Math.min(Math.max(sharedPageTitleInputWidth + 20, 60), 360) }}
                              autoFocus
                            />
                          </span>
                        ) : (
                          <span className="truncate max-w-[14rem]">{selectedSharedPage.title}</span>
                        )
                      ) : (
                        'Your Habits'
                      )}
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showHabitsPageMenu && (
                      <div
                        className="absolute left-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-2xl overflow-hidden z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setHabitsPage('my')
                            setInviteFriendId(null)
                            setShowHabitsPageMenu(false)
                          }}
                          className={`w-full px-4 py-3 text-left text-sm font-medium ${
                            habitsPage === 'my' ? 'text-gray-900 bg-gray-50' : 'text-gray-600'
                          }`}
                        >
                          My Habits
                        </button>

                        {sharedPages.length > 0 && (
                          <div className="py-1">
                            {sharedPages.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setHabitsPage('shared')
                                  setInviteFriendId(p.friendId)
                                  setShowHabitsPageMenu(false)
                                }}
                                className={`w-full px-4 py-2.5 text-sm font-medium flex items-center justify-between ${
                                  habitsPage === 'shared' && inviteFriendId === p.friendId ? 'text-gray-900 bg-gray-50' : 'text-gray-600'
                                }`}
                              >
                                <span className="text-left truncate">{p.title}</span>
                                <span className="flex items-center flex-shrink-0 ml-3">
                                  <span className="w-6 h-6 rounded-full overflow-hidden bg-white border border-gray-200 flex items-center justify-center">
                                    {profileImage ? (
                                      <img src={profileImage} alt="You" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center accent-chip">
                                        <svg className="w-3.5 h-3.5 text-[color:var(--accent-solid)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                      </div>
                                    )}
                                  </span>
                                  <span className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center -ml-2">
                                    <span className="text-[10px] font-semibold text-gray-600">
                                      {(p.friendName || '?').charAt(0).toUpperCase()}
                                    </span>
                                  </span>
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setShowHabitsPageMenu(false)
                            setShowInviteModal(true)
                          }}
                          className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 flex items-center justify-between"
                        >
                          <span>Shared page</span>
                          <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {habitsPage === 'shared' && selectedSharedPage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowHabitsPageMenu(false)
                        setIsEditingSharedPageTitle(true)
                      }}
                      className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <svg className="w-4 h-4 text-[color:var(--accent-orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowHabitsPageMenu(false)
                      onAddHabit(getNewHabitContext())
                    }}
                    className="w-10 h-10 rounded-full accent-chip flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
                  >
                    <svg className="w-5 h-5 text-[color:var(--accent-solid)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              {habitsPage === 'my' && (
                <div className="flex items-center gap-1.5 bg-gray-100 rounded-full p-1 mb-4 flex-shrink-0 w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  {WEEKDAYS.map((d) => {
                    const isActive = selectedHabitsDay === d
                    const isToday = todayKey === d
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setSelectedHabitsDay(d)
                        }}
                        className={`relative px-2.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                          isActive ? 'bg-white text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {d}
                        {isToday && (
                          <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-[color:var(--accent-solid)]' : 'bg-gray-400'
                          }`} />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Habits List */}
              <div className="flex-1 flex flex-col gap-2 min-h-0 w-full overflow-y-auto">
                {habits.length === 0 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddHabit(getNewHabitContext())
                    }}
                    className="flex-1 flex flex-col items-center justify-center w-full"
                  >
                    <div className="w-20 h-20 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-[color:var(--accent-solid)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-4 text-center">No habits yet</p>
                    <div className="bg-white rounded-full px-8 py-3 border border-gray-200">
                      <span className="accent-text font-medium">Add Your First Habits</span>
                    </div>
                  </button>
                ) : (
                  [...displayedHabits]
                    .sort((a, b) => {
                      const aDone = isHabitDone(a)
                      const bDone = isHabitDone(b)
                      if (aDone && !bDone) return 1
                      if (!aDone && bDone) return -1
                      const aTime = a.allDay ? 0 : a.startTime
                      const bTime = b.allDay ? 0 : b.startTime
                      return aTime - bTime
                    })
                    .map((habit) => {
                      const isDone = isHabitDone(habit)
                      const isPaid = paidToday?.includes(habit.id)
                      const isResolved = isDone || isPaid

                      return (
                        <div key={habit.id} className="w-full overflow-hidden rounded-2xl">
                          <div className="relative w-full">
                            <div className="absolute right-0 top-0 bottom-0 w-[110px]">
                              {isDone ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onClearHabitStatus?.(habit.id)
                                    setSwipedHabitId(null)
                                    setSwipeOffsetById(prev => ({ ...prev, [habit.id]: 0 }))
                                  }}
                                  className="w-full h-full bg-gray-100 text-gray-700 font-semibold flex items-center justify-center"
                                >
                                  Clear
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteHabit?.(habit.id)
                                    setSwipedHabitId(null)
                                    setSwipeOffsetById(prev => ({ ...prev, [habit.id]: 0 }))
                                  }}
                                  className="w-full h-full bg-rose-500 text-white font-semibold flex items-center justify-center"
                                >
                                  Delete
                                </button>
                              )}
                            </div>

                            <div
                              className={`w-full p-4 transition-transform duration-200 flex items-center justify-between border ${
                                isDone
                                  ? 'bg-green-50 border-green-200'
                                  : isPaid
                                    ? 'bg-white/50 border-gray-200'
                                    : 'bg-white border-gray-200'
                              }`}
                              style={{ transform: `translateX(${swipeOffsetById[habit.id] || 0}px)` }}
                              onTouchStart={(e) => {
                                swipeStartXRef.current = e.touches[0].clientX
                                swipeStartYRef.current = e.touches[0].clientY
                                swipeStartOffsetRef.current = swipeOffsetById[habit.id] || 0
                                setSwipedHabitId(habit.id)
                              }}
                              onTouchMove={(e) => {
                                if (swipedHabitId !== habit.id) return
                                const dx = e.touches[0].clientX - swipeStartXRef.current
                                const dy = e.touches[0].clientY - swipeStartYRef.current

                                // If the user is clearly swiping horizontally, don't let vertical scroll steal the gesture.
                                if (Math.abs(dx) > Math.abs(dy)) {
                                  try { e.preventDefault() } catch (_) {}
                                }

                                let next = swipeStartOffsetRef.current + dx

                                // Support "swipe right" (dx > 0) from a closed state by treating it as an open gesture.
                                if (swipeStartOffsetRef.current === 0 && dx > 0) {
                                  next = -dx
                                }

                                if (next > 0) next = 0
                                if (next < -110) next = -110
                                setSwipeOffsetById(prev => ({ ...prev, [habit.id]: next }))
                              }}
                              onTouchEnd={() => {
                                const cur = swipeOffsetById[habit.id] || 0
                                const snap = cur < -55 ? -110 : 0
                                setSwipeOffsetById(prev => ({ ...prev, [habit.id]: snap }))
                                if (snap === 0) setSwipedHabitId(null)
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEditHabit(habit)
                                }}
                                className="flex-1 min-w-0 text-left"
                              >
                                <span className={`font-semibold text-lg block truncate ${
                                  isDone ? 'text-green-900' : isResolved ? 'text-gray-300' : 'text-gray-900'
                                }`}>
                                  {habit.name}
                                </span>
                                <span className={`text-sm ${
                                  isDone ? 'text-green-700' : isResolved ? 'text-gray-300' : 'text-gray-500'
                                }`}>
                                  {formatTimeRange(habit)}
                                </span>
                              </button>

                              {isResolved ? (
                                isPaid ? (
                                  <span className="text-gray-300 text-lg font-medium ml-4">Paid</span>
                                ) : (
                                  <span className="ml-3 px-4 py-2 rounded-full bg-green-50 text-green-700 font-semibold text-sm flex items-center gap-2 border border-green-200">
                                    <span className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </span>
                                    Done
                                  </span>
                                )
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setVerifyingHabit(habit)
                                  }}
                                  className="ml-3 px-4 py-2 rounded-full bg-green-500/85 backdrop-blur-sm text-white font-semibold text-sm flex items-center gap-1 border border-white/30 shadow-sm active:scale-95 transition-transform"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Done
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showInviteModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => setShowInviteModal(false)}
        >
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">
              Which one of your friends would you like to create a shared habit page with
            </h3>

            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto">
              {friends.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 font-medium">No friends yet</p>
                  <p className="text-gray-400 text-sm mt-1">Add a friend on the Social page first.</p>
                </div>
              ) : (
                friends.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setInviteFriendId(f.id)}
                    className={`w-full p-4 rounded-2xl border flex items-center justify-between ${
                      inviteFriendId === f.id ? 'border-[color:var(--accent-solid)] bg-white' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full accent-chip flex items-center justify-center flex-shrink-0">
                        <span className="text-[color:var(--accent-solid)] font-semibold text-sm">
                          {f.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900 truncate">{f.name}</span>
                    </div>
                    {inviteFriendId === f.id && (
                      <svg className="w-5 h-5 text-[color:var(--accent-solid)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled={!inviteFriendId}
                onClick={() => {
                  if (!inviteFriendId) return
                  onSendSharedPageInvite?.(inviteFriendId)
                  setHabitsPage('shared')
                  setShowHabitsPageMenu(false)
                  setShowInviteModal(false)
                }}
                className={`px-6 py-3 rounded-full font-semibold text-sm transition-colors ${
                  inviteFriendId ? 'accent-btn text-white' : 'bg-gray-200 text-gray-400'
                }`}
              >
                Invite
              </button>
            </div>
          </div>
        </div>
      )}

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
              <p className="text-sm text-orange-600 mt-2 font-medium">
                {selectedAchievement.pointsRequired.toLocaleString()} points needed
              </p>
            </div>
            
            {/* Close button */}
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

      {/* Badge Picker Modal */}
      {showBadgePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Choose a Badge</h3>
            <p className="text-sm text-gray-500 mb-4">Select an achievement to display on your profile</p>
            
            {/* Scrollable badge list */}
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
