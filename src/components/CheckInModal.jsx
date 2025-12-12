import { useState, useEffect } from 'react'

function CheckInModal({ habitName, skipCost, onYes, onNo }) {
  const [showPayment, setShowPayment] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  // Trigger animation after success screen mounts
  useEffect(() => {
    if (showSuccess) {
      setTimeout(() => setAnimateIn(true), 50)
    }
  }, [showSuccess])

  // Success celebration view
  if (showSuccess) {
    return (
      <div 
        className="fixed inset-0 bg-gray-900/95 flex flex-col items-center justify-center z-50 px-6"
        onClick={onYes}
      >
        <div className={`w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-6 transition-all duration-500 ${
          animateIn ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}>
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className={`text-3xl font-bold text-white mb-2 transition-all duration-500 delay-100 ${
          animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          Crushed it!
        </h1>
        <p className={`text-green-400 font-semibold text-xl mb-8 transition-all duration-500 delay-200 ${
          animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          +1 Streak
        </p>

        <p className={`text-gray-500 text-sm transition-all duration-500 delay-300 ${
          animateIn ? 'opacity-100' : 'opacity-0'
        }`}>
          Tap anywhere to continue
        </p>
      </div>
    )
  }

  // Payment view (or free habit confirmation)
  if (showPayment) {
    // Free habit - just confirm
    if (skipCost === 0) {
      return (
        <div className="fixed inset-0 bg-gray-900/95 flex flex-col items-center justify-center z-50 px-6">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">No worries</h1>
          <p className="text-gray-400 text-center mb-8">
            This is a free habit — no penalty.<br/>
            Try again tomorrow!
          </p>

          <button
            onClick={onNo}
            className="w-full bg-white text-gray-900 font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform"
          >
            Got it
          </button>
        </div>
      )
    }

    // Paid habit - show payment
    return (
      <div className="fixed inset-0 bg-gray-900/95 flex flex-col items-center justify-center z-50 px-6">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">That's okay</h1>
        <p className="text-gray-400 text-center mb-8">
          Tomorrow's a fresh start.<br/>
          Pay up and move forward.
        </p>

        <div className="bg-white/10 rounded-2xl p-6 w-full mb-6 text-center">
          <p className="text-gray-400 text-sm mb-1">Amount due</p>
          <p className="text-4xl font-bold text-white">${skipCost.toFixed(2)}</p>
        </div>

        <button
          onClick={onNo}
          className="w-full bg-white text-gray-900 font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform"
        >
          Pay with Apple Pay
        </button>
      </div>
    )
  }

  // Question view
  return (
    <div className="fixed inset-0 bg-gray-900/95 flex flex-col items-center justify-center z-50 px-6">
      <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-white mb-2 text-center">
        Did you complete this habit?
      </h1>
      <p className="text-xl text-orange-300 font-medium mb-8">
        "{habitName}"
      </p>

      <div className="w-full space-y-3">
        <button
          onClick={() => setShowSuccess(true)}
          className="w-full bg-green-500 text-white font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform"
        >
          Yes, I did it! ✓
        </button>
        
        <button
          onClick={() => setShowPayment(true)}
          className="w-full bg-white/10 text-white font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform"
        >
          No, I missed it
        </button>
      </div>
    </div>
  )
}

export default CheckInModal
