import { useState, useRef, useEffect } from 'react'

function HabitAdder({ habit, onSave, onDelete, onBack }) {
  const [name, setName] = useState(habit?.name || '')
  const [allDay, setAllDay] = useState(habit?.allDay ?? false)
  const [startTime, setStartTime] = useState(habit?.startTime || '06:00')
  const [endTime, setEndTime] = useState(habit?.endTime || '07:00')
  const [skipCost, setSkipCost] = useState(habit?.skipCost ?? null)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustomValue, setIsCustomValue] = useState(false) // Track if current skipCost is a custom value
  const customInputRef = useRef(null)

  // Scroll custom input into view when it appears
  useEffect(() => {
    if (showCustomInput && customInputRef.current) {
      setTimeout(() => {
        customInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [showCustomInput])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      ...(habit || {}),
      name: name.trim(),
      allDay,
      startTime: allDay ? '00:00' : startTime,
      endTime: allDay ? '23:59' : endTime,
      skipCost,
    })
  }

  const formatTime = (timeStr) => {
    const [hour, min] = timeStr.split(':').map(Number)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${min.toString().padStart(2, '0')}${ampm}`
  }

  return (
    <div className="h-full flex flex-col bg-[#fcfcfc] px-4 pb-0 animate-slideUp pt-[max(1rem,env(safe-area-inset-top))] relative">
      {/* Header */}
      <div className="flex items-center justify-between py-3 mb-2 flex-shrink-0">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center tap-bounce"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          {habit ? 'Edit Habit' : 'New Habit'}
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-36">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Habit Name */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Habit Name</span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Wake up, Exercise, Read..."
              className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 rounded-xl p-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>

          {/* Time Frame */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Time Window</span>
            </div>
            
            {/* All Day Toggle */}
            <button
              type="button"
              onClick={() => setAllDay(!allDay)}
              className={`w-full flex items-center justify-between p-3 rounded-xl mb-4 transition-all ${
                allDay ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  allDay ? 'bg-orange-500' : 'bg-gray-300'
                }`}>
                  {allDay && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`font-medium text-sm ${allDay ? 'text-orange-700' : 'text-gray-600'}`}>All Day</span>
              </div>
              <span className="text-xs text-gray-400">No specific time</span>
            </button>

            {!allDay && (
              <>
                <p className="text-gray-400 text-xs mb-3">
                  Complete this habit between these times
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-wide">From</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => {
                        const newStart = e.target.value
                        setStartTime(newStart)
                        // Auto-adjust end time to 1 hour after start
                        const [hours, mins] = newStart.split(':').map(Number)
                        const endHours = (hours + 1) % 24
                        const newEnd = `${endHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
                        setEndTime(newEnd)
                      }}
                      className="w-full bg-gray-50 text-gray-800 rounded-xl p-3 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-wide">Until</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-gray-50 text-gray-800 rounded-xl p-3 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Stakes */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">What's at stake?</span>
            </div>
            <p className="text-gray-400 text-xs mb-4 ml-10">
              What should be the cost of skipping this habit?
            </p>
            
            {!showCustomInput ? (
              <>
                <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                  {[0, 0.5, 1].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setSkipCost(val)
                        setIsCustomValue(false)
                      }}
                      className={`py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                        skipCost === val && !isCustomValue
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {val === 0 ? 'Free' : `$${val}`}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[2, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setSkipCost(val)
                        setIsCustomValue(false)
                      }}
                      className={`py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                        skipCost === val && !isCustomValue
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomInput(true)
                      if (isCustomValue && skipCost !== null) {
                        setCustomAmount(skipCost.toString())
                      }
                    }}
                    className={`py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                      isCustomValue
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {isCustomValue && skipCost !== null ? `$${skipCost}` : 'Custom'}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={customAmount}
                    onChange={(e) => {
                      // Only allow numbers and decimal point
                      const val = e.target.value.replace(/[^0-9.]/g, '')
                      // Prevent multiple decimal points
                      const parts = val.split('.')
                      if (parts.length > 2) return
                      setCustomAmount(val)
                    }}
                    placeholder="0.00"
                    autoFocus
                    className="w-full pl-7 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const val = parseFloat(customAmount)
                    if (!isNaN(val) && val >= 0) {
                      setSkipCost(val)
                      setIsCustomValue(true)
                      setShowCustomInput(false)
                    }
                  }}
                  className="px-4 py-3 bg-orange-500 text-white font-semibold rounded-xl active:scale-95 transition-transform"
                >
                  Set
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="px-3 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl active:scale-95 transition-transform"
                >
                  ✕
                </button>
              </div>
            )}
            
            {skipCost === null && !showCustomInput && (
              <p className="text-orange-500 text-xs mt-3 text-center font-medium">
                Please select your stakes to continue
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] z-50">
        <div className="max-w-md mx-auto space-y-3">
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || skipCost === null}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-base active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {habit ? 'Save Changes' : 'Add Habit'}
          </button>

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="w-full bg-white text-rose-500 py-4 rounded-xl font-bold text-base border border-rose-100 active:bg-rose-50 transition-colors"
            >
              Delete Habit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default HabitAdder
