import { useMemo, useState } from 'react'

export default function HabitsPage({ habits, completedToday = [], isClosing, onAddHabit, onEditHabit, onDeleteHabit, onMarkDone, onBack, sharedHabits = [] }) {
  const WEEKDAYS = useMemo(() => (['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']), [])

  const getTodayKey = () => {
    const idx = new Date().getDay()
    return WEEKDAYS[idx]
  }

  const [view, setView] = useState(getTodayKey())

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

  const animationClass = isClosing ? 'animate-sheetDown' : 'animate-sheetUp'

  const headerLabel = view === 'shared' ? 'Shared Habits' : `${view} Habits`

  const displayedHabits = useMemo(() => {
    if (view === 'shared') {
      const derivedShared = habits.filter(h => (h.sharedWith?.length || 0) > 0 || h.isShared)
      const merged = [...derivedShared, ...sharedHabits]
      const byId = new Map()
      for (const h of merged) byId.set(h.id ?? `${h.name}-${h.startTime}-${h.endTime}`, h)
      return Array.from(byId.values())
    }

    return habits.filter(h => {
      const d = h.daysOfWeek
      if (!Array.isArray(d) || d.length === 0) return view === getTodayKey()
      return d.includes(view)
    })
  }, [habits, sharedHabits, view, WEEKDAYS])

  return (
    <div className={`fixed inset-0 bg-[#fcfcfc] flex flex-col px-4 pb-20 pt-[max(1rem,env(safe-area-inset-top))] z-40 ${animationClass}`}>
      {/* Header - matches Home habits card header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0 w-full">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L16.5 11.743m0 0l1.378-1.378a1 1 0 00-1.414-1.414L15.086 10.33m1.414 1.414l-4.95 4.95a1 1 0 01-.39.242l-1.83.61.61-1.83a1 1 0 01.242-.39l4.95-4.95" />
            </svg>
          </div>
          <span className="text-gray-500 text-sm font-medium">{headerLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="h-9 rounded-full bg-gray-100 text-gray-700 text-sm font-medium px-3 focus:outline-none"
          >
            {WEEKDAYS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
            <option value="shared">Shared</option>
          </select>
          <button 
            onClick={onAddHabit}
            className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Habits List - same style as Home */}
      <div className="flex-1 flex flex-col gap-2 min-h-0 w-full overflow-y-auto">
        {displayedHabits.length === 0 ? (
          <button 
            onClick={onAddHabit}
            className="flex-1 flex flex-col items-center justify-center w-full"
          >
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4 text-center">No habits yet</p>
            <div className="bg-gray-200 rounded-full px-8 py-3">
              <span className="text-gray-600 font-medium">Add Your First Habits</span>
            </div>
          </button>
        ) : (
          displayedHabits.map((habit, index) => {
            const isDone = isHabitDone(habit)
            const isFirst = index === 0
            
            return (
              <div
                key={habit.id}
                className={`w-full p-4 rounded-2xl transition-all flex items-center justify-between ${
                  isFirst && !isDone
                    ? 'bg-gray-100'
                    : 'bg-gray-50'
                } ${isDone ? 'opacity-50' : ''}`}
              >
                {/* Habit Info */}
                <button 
                  onClick={() => onEditHabit(habit)}
                  className="flex-1 min-w-0 text-left"
                >
                  <span className={`font-semibold text-lg block truncate ${
                    isFirst && !isDone ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {habit.name}
                  </span>
                  <span className={`text-sm ${
                    isFirst && !isDone ? 'text-gray-500' : 'text-gray-300'
                  }`}>
                    {formatTimeRange(habit)}
                  </span>
                </button>
                
                {/* Done Button */}
                {isDone ? (
                  <span className="text-gray-300 text-lg font-medium ml-4">Done</span>
                ) : (
                  <button
                    onClick={() => onMarkDone(habit.id)}
                    className={`ml-4 text-lg font-medium transition-colors ${
                      isFirst ? 'text-gray-600' : 'text-gray-300'
                    } active:scale-95`}
                  >
                    Done
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
