function HabitEducation({ habit, onDone }) {
  if (!habit) {
    return null
  }

  const formatTime = (timeStr) => {
    const [hour, min] = timeStr.split(':').map(Number)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${min.toString().padStart(2, '0')} ${ampm}`
  }

  const getCueTime = () => {
    if (habit.allDay) {
      return "Tomorrow morning"
    }
    return `After ${formatTime(habit.endTime)}`
  }

  return (
    <div className="h-full flex flex-col bg-[#fcfcfc] px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-8">
      {/* Header - Commitment Locked */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          Habit Locked
        </h1>
        <p className="text-gray-500 text-lg font-medium">
          "{habit.name}"
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {/* YOUR CUE - The main focus */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
          <p className="text-orange-600 text-xs font-bold uppercase tracking-wider mb-2">
            Your Cue
          </p>
          <p className="text-gray-900 text-2xl font-bold mb-1">
            {getCueTime()}
          </p>
          <p className="text-gray-600 text-sm">
            Come back to check in on this habit
          </p>
        </div>

        {/* YOUR STAKES */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">
            Your Stakes
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Complete</span>
              </div>
              <span className="text-green-600 font-bold">Streak +1</span>
            </div>
            
            <div className="h-px bg-gray-100"></div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Skip</span>
              </div>
              <span className="text-red-500 font-bold">
                {habit.skipCost === 0 ? 'Free' : `-$${habit.skipCost.toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Motivational quote */}
        <div className="text-center py-2">
          <p className="text-gray-400 text-sm italic">
            "Consistency beats intensity"
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onDone}
        className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl active:scale-[0.98] transition-transform"
      >
        I'm Ready
      </button>
    </div>
  )
}

export default HabitEducation
