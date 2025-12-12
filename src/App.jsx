import { useState, useEffect } from 'react'
import HomeScreen from './screens/HomeScreen'
import EditHabitScreen from './screens/EditHabitScreen'
import EditWalletScreen from './screens/EditWalletScreen'
import SocialScreen from './screens/SocialScreen'
// EditSkipCostScreen removed - skip cost is now per-habit
import HabitEducation from './components/HabitEducation'
import CheckInModal from './components/CheckInModal'

// Load from localStorage or use defaults
const loadState = () => {
  const saved = localStorage.getItem('accountability-app-state')
  if (saved) {
    return JSON.parse(saved)
  }
  return {
    wallet: 100,
        habits: [],
    completedToday: [], // habit IDs completed today
    paidToday: [], // habit IDs paid for today
    lastCheckedDate: new Date().toDateString(),
    currentStreak: 0,
    longestStreak: 0,
    habitHistory: {}, // { habitId: ['2024-12-08', '2024-12-09', ...] }
    friends: [], // { id, name }
  }
}

function App() {
  const [state, setState] = useState(loadState)
  const [screen, setScreen] = useState('home') // 'home' | 'habit-adder' | 'wallet-editor' | 'skip-cost-editor' | 'social'
  const [editingHabit, setEditingHabit] = useState(null)
  const [previousScreen, setPreviousScreen] = useState('home')
  const [habitsExpanded, setHabitsExpanded] = useState(false)
  const [previousHabitsExpanded, setPreviousHabitsExpanded] = useState(false)
  const [newlyAddedHabit, setNewlyAddedHabit] = useState(null) // For education screen
  const [checkInQueue, setCheckInQueue] = useState([]) // Queue of habits needing check-in
  const [showSuccessToast, setShowSuccessToast] = useState(false) // For good vibes toast

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('accountability-app-state', JSON.stringify(state))
  }, [state])

  // Check for missed habits and reset daily completions
  useEffect(() => {
    const today = new Date().toDateString()
    
    if (state.lastCheckedDate !== today) {
      // New day - check if all habits were done yesterday, update streak
      const allDoneYesterday = state.habits.length > 0 && 
        state.habits.every(h => state.completedToday.includes(h.id))
      
      setState(prev => {
        const newStreak = allDoneYesterday ? prev.currentStreak + 1 : 0
        return {
          ...prev,
          completedToday: [],
          paidToday: [],
          lastCheckedDate: today,
          currentStreak: newStreak,
          longestStreak: Math.max(prev.longestStreak, newStreak),
        }
      })
    }

    // Check for missed habits (past end time and not completed)
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    state.habits.forEach(habit => {
      const [endHour, endMin] = habit.endTime.split(':').map(Number)
      const endMinutes = endHour * 60 + endMin

      // Skip if created today after the deadline
      const createdAt = new Date(habit.id)
      const isCreatedToday = createdAt.toDateString() === today
      const createdMinutes = createdAt.getHours() * 60 + createdAt.getMinutes()
      
      if (isCreatedToday && createdMinutes > endMinutes) {
        return
      }

      if (currentMinutes > endMinutes && !state.completedToday.includes(habit.id)) {
        // Check if we already penalized this habit today
        const penaltyKey = `penalty-${habit.id}-${today}`
        if (!localStorage.getItem(penaltyKey)) {
          localStorage.setItem(penaltyKey, 'true')
          setState(prev => ({
            ...prev,
            wallet: Math.max(0, prev.wallet - (habit.skipCost || 0)),
          }))
        }
      }
    })
  }, [state.habits, state.completedToday, state.lastCheckedDate])

  const updateWallet = (amount) => {
    setState(prev => ({ ...prev, wallet: amount }))
  }

  const addHabit = (habit) => {
    setState(prev => ({
      ...prev,
      habits: [...prev.habits, { ...habit, id: Date.now() }],
    }))
  }

  const updateHabit = (updatedHabit) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === updatedHabit.id ? updatedHabit : h),
    }))
  }

  const deleteHabit = (habitId) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== habitId),
    }))
  }

  const markHabitDone = (habitId) => {
    if (!state.completedToday.includes(habitId)) {
      const today = new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'
      setState(prev => {
        const habitDates = prev.habitHistory[habitId] || []
        // Only add if not already recorded for today
        const updatedDates = habitDates.includes(today) 
          ? habitDates 
          : [...habitDates, today]
        
        return {
          ...prev,
          completedToday: [...prev.completedToday, habitId],
          habitHistory: {
            ...prev.habitHistory,
            [habitId]: updatedDates,
          },
        }
      })
    }
  }

  const markHabitPaid = (habitId) => {
    if (!state.paidToday?.includes(habitId)) {
      setState(prev => ({
        ...prev,
        paidToday: [...(prev.paidToday || []), habitId],
      }))
    }
  }

  const openHabitAdder = (habit = null) => {
    setEditingHabit(habit)
    setScreen('habit-adder')
  }

  const addFriend = (name) => {
    setState(prev => ({
      ...prev,
      friends: [...(prev.friends || []), { id: Date.now(), name }],
    }))
  }

  const removeFriend = (friendId) => {
    setState(prev => ({
      ...prev,
      friends: (prev.friends || []).filter(f => f.id !== friendId),
    }))
  }

  // Find ALL habits that need check-in (past end time, not completed, not paid)
  const getHabitsNeedingCheckIn = () => {
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    
    return state.habits.filter(habit => {
      if (state.completedToday.includes(habit.id)) return false
      if (state.paidToday?.includes(habit.id)) return false
      const [endHour, endMin] = habit.endTime.split(':').map(Number)
      const endMinutes = endHour * 60 + endMin
      return currentMinutes > endMinutes
    })
  }

  // Populate check-in queue on app load (once)
  useEffect(() => {
    const habitsNeedingCheckIn = getHabitsNeedingCheckIn()
    if (habitsNeedingCheckIn.length > 0) {
      setCheckInQueue(habitsNeedingCheckIn)
    }
  }, [])

  // Current habit to show = first in queue
  const currentCheckIn = checkInQueue[0] || null

  // Safety: redirect to home if on education screen but habit is null
  useEffect(() => {
    if (screen === 'habit-education' && !newlyAddedHabit) {
      setScreen('home')
    }
  }, [screen, newlyAddedHabit])

  // Check if we should show the main nav bar (not on editor screens)
  const showMainNav = screen === 'home' || screen === 'social'

  return (
    <div className="h-full w-full">
        <div style={{ display: screen === 'home' ? 'contents' : 'none' }}>
          <HomeScreen
            wallet={state.wallet}
            habits={state.habits}
            completedToday={state.completedToday}
            paidToday={state.paidToday || []}
            currentStreak={state.currentStreak || 0}
            longestStreak={state.longestStreak || 0}
            habitHistory={state.habitHistory || {}}
            habitsExpanded={habitsExpanded}
                        onAddHabit={() => {
              setPreviousHabitsExpanded(habitsExpanded)
              setEditingHabit(null)
              setScreen('habit-adder')
            }}
            onEditHabit={(habit) => {
              setPreviousHabitsExpanded(habitsExpanded)
              setEditingHabit(habit)
              setScreen('habit-adder')
            }}
            onMarkDone={markHabitDone}
            onToggleHabits={() => setHabitsExpanded(!habitsExpanded)}
          />
        </div>
      {screen === 'habit-adder' && (
        <EditHabitScreen
          habit={editingHabit}
          onSave={(habit) => {
            if (editingHabit) {
              updateHabit(habit)
              setEditingHabit(null)
              setScreen(previousScreen)
              setPreviousScreen('home')
            } else {
              // New habit - add it and show education screen
              const newHabit = { ...habit, id: Date.now() }
              setState(prev => ({
                ...prev,
                habits: [...prev.habits, newHabit],
              }))
              setNewlyAddedHabit(newHabit)
              setEditingHabit(null)
              setScreen('habit-education')
            }
          }}
          onDelete={editingHabit ? () => {
            deleteHabit(editingHabit.id)
            setEditingHabit(null)
            setScreen(previousScreen)
            setPreviousScreen('home')
          } : null}
          onBack={() => {
            setEditingHabit(null)
            setScreen(previousScreen)
            setPreviousScreen('home')
            setHabitsExpanded(previousHabitsExpanded)
          }}
        />
      )}
      {screen === 'habit-education' && newlyAddedHabit && (
        <HabitEducation
          habit={newlyAddedHabit}
          onDone={() => {
            setNewlyAddedHabit(null)
            setScreen('home')
          }}
        />
      )}
      {screen === 'wallet-editor' && (
        <EditWalletScreen
          wallet={state.wallet}
          onSave={(amount) => {
            updateWallet(amount)
            setScreen('home')
          }}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'social' && (
        <SocialScreen
          completedToday={state.completedToday}
          habits={state.habits}
          currentStreak={state.currentStreak || 0}
          friends={state.friends || []}
          onAddFriend={addFriend}
          onRemoveFriend={removeFriend}
        />
      )}
      
        {/* Global Bottom Nav - Outside all screen transitions */}
        {showMainNav && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-50">
            <div className="max-w-md mx-auto flex justify-center items-center gap-12">
              {/* Home */}
              <button 
                onClick={() => {
                  setScreen('home')
                  setHabitsExpanded(false)
                }}
                className="p-2"
              >
                <svg className={`w-6 h-6 ${screen === 'home' && !habitsExpanded ? 'text-orange-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
              {/* Heart */}
              <button 
                onClick={() => {
                  setScreen('home')
                  setHabitsExpanded(true)
                }}
                className="p-2"
              >
                <svg className={`w-6 h-6 ${screen === 'home' && habitsExpanded ? 'text-orange-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              {/* Social/Friends */}
              <button 
                onClick={() => setScreen('social')}
                className="p-2"
              >
                <svg className={`w-6 h-6 ${screen === 'social' ? 'text-orange-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>
          </div>
        )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div 
          className="fixed top-[max(1rem,env(safe-area-inset-top))] left-4 right-4 bg-green-500 text-white py-4 px-6 rounded-2xl z-[60] flex items-center justify-center gap-2"
          onAnimationEnd={() => setShowSuccessToast(false)}
          style={{ animation: 'toastSlide 2s ease-out forwards' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold text-lg">Great job!</span>
        </div>
      )}

      {/* Check-in Modal */}
      {currentCheckIn && (
        <CheckInModal
          key={currentCheckIn.id}
          habitName={currentCheckIn.name}
          skipCost={currentCheckIn.skipCost}
          onYes={() => {
            const id = currentCheckIn.id
            markHabitDone(id)
            setCheckInQueue(prev => prev.slice(1)) // Remove first, show next
            setShowSuccessToast(true) // Show good vibes
          }}
          onNo={() => {
            const id = currentCheckIn.id
            markHabitPaid(id) // Mark as paid (separate from done)
            setCheckInQueue(prev => prev.slice(1)) // Remove first, show next
          }}
        />
      )}
    </div>
  )
}

export default App
