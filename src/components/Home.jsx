import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VerificationModal from './VerificationModal'

// SVG icons for progress messages
const ProgressIcons = {
  trophy: (
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  fire: (
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  bolt: (
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  sparkle: (
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  sun: (
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  moon: (
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

function Home({ 
  wallet, 
  habits, 
  completedToday,
  paidToday,
  currentStreak,
  longestStreak,
  habitHistory,
  habitsExpanded,
  onAddHabit, 
  onEditHabit, 
  onMarkDone,
  onToggleHabits 
}) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [verifyingHabit, setVerifyingHabit] = useState(null)

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
      
      {/* Collapsible Top Section */}
      <AnimatePresence>
        {!habitsExpanded && (
          <motion.div
            initial={isFirstMount.current ? { height: 'auto', opacity: 1, marginBottom: '1rem' } : { height: 0, opacity: 0, marginBottom: 0 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: '1rem' }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-shrink-0 flex flex-col overflow-hidden"
          >
            {/* Top Row: Profile Icon */}
            <div className="flex-shrink-0 mb-4 flex items-center">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            {/* Your Progress Card */}
            {(() => {
              const tasksDone = completedToday.length
              const points = tasksDone * 10
              return (
                <div className="flex-shrink-0 bg-white border border-gray-200 rounded-3xl px-6 py-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-gray-500 text-sm font-medium">Your Progress</span>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="flex justify-around items-center py-2">
                    {/* Tasks Done */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-2">
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{tasksDone}</span>
                      <span className="text-xs text-gray-500">Tasks Done</span>
                    </div>

                    {/* Streak */}
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

                    {/* Points */}
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
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Habits Card */}
      <motion.div 
        layout
        className="flex-1 bg-white border border-gray-200 rounded-3xl px-6 py-5 flex flex-col min-h-0 cursor-pointer habits-widget shadow-sm"
        onClick={() => { if (!habitsExpanded) onToggleHabits() }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L16.5 11.743m0 0l1.378-1.378a1 1 0 00-1.414-1.414L15.086 10.33m1.414 1.414l-4.95 4.95a1 1 0 01-.39.242l-1.83.61.61-1.83a1 1 0 01.242-.39l4.95-4.95" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm font-medium">Today's Habits</span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onAddHabit()
            }}
            className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {/* Habits List */}
        <div className="flex-1 flex flex-col gap-2 min-h-0 w-full overflow-y-auto">
          {habits.length === 0 ? (
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onAddHabit()
              }}
              className="flex-1 flex flex-col items-center justify-center w-full"
            >
              {/* Plus Icon Circle */}
              <div className="w-20 h-20 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4 text-center">No habits yet</p>
              <div className="bg-white rounded-full px-8 py-3 border border-gray-200">
                <span className="text-orange-700 font-medium">Add Your First Habits</span>
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
                  className={`w-full p-4 rounded-2xl transition-all flex items-center justify-between ${
                    isResolved ? 'bg-white/50' : 'bg-white'
                  } border border-gray-200`}
                >
                  {/* Habit Info - Clickable to edit */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditHabit(habit)
                    }}
                    className="flex-1 min-w-0 text-left"
                  >
                    <span className={`font-semibold text-lg block truncate ${
                      isResolved ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {habit.name}
                    </span>
                    <span className={`text-sm ${
                      isResolved ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {formatTimeRange(habit)}
                    </span>
                  </button>
                  
                  {/* Done Button / Status */}
                  {isResolved ? (
                    <span className="text-gray-300 text-lg font-medium ml-4">{isPaid ? 'Paid' : 'Done'}</span>
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
    </div>
  )
}

export default Home
