import { useState } from 'react'

function SkipCostEditor({ skipCost, onSave, onBack }) {
  const [amount, setAmount] = useState(skipCost.toString())
  const [customInput, setCustomInput] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const handleSave = () => {
    const value = parseFloat(amount)
    if (!isNaN(value) && value >= 0) {
      onSave(value)
    }
  }

  const handleCustomSubmit = () => {
    const value = parseFloat(customInput)
    if (!isNaN(value) && value >= 0) {
      setAmount(value.toString())
      setShowCustom(false)
      setCustomInput('')
    }
  }

  const presets = [0.25, 0.5, 1, 2, 5, 10]

  return (
    <div className="h-full flex flex-col bg-[#fcfcfc] px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 py-4 mb-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center active:scale-95 transition-transform"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">Skip Cost</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {/* Current Amount Display */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
          <p className="text-gray-500 text-sm mb-2">Cost per missed habit</p>
          <div className="flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-900">${parseFloat(amount).toFixed(2)}</span>
          </div>
        </div>

        {/* Quick Select */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-gray-900 font-semibold">Quick Select</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {presets.map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                className={`py-3 rounded-xl font-semibold transition-all active:scale-95 ${
                  parseFloat(amount) === val
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                ${val.toFixed(2)}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="text-gray-900 font-semibold">Custom Amount</span>
          </div>
          
          {showCustom ? (
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  autoFocus
                  className="w-full pl-7 pr-3 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <button
                type="button"
                onClick={handleCustomSubmit}
                className="px-4 py-3 bg-orange-500 text-white rounded-xl font-semibold active:scale-95 transition-transform"
              >
                Set
              </button>
              <button
                type="button"
                onClick={() => { setShowCustom(false); setCustomInput('') }}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold active:scale-95 transition-transform"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className="w-full py-3 rounded-xl font-semibold bg-white text-gray-700 border border-gray-200 active:scale-95 transition-transform"
            >
              Enter custom amount...
            </button>
          )}
        </div>

        {/* Tip */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-gray-500 text-sm text-center">
            💡 Higher stakes = stronger motivation. Start small and increase as you build consistency.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        className="w-full bg-orange-500 text-white font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform mt-6"
      >
        Save Changes
      </button>
    </div>
  )
}

export default SkipCostEditor
