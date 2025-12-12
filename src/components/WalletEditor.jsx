import { useState } from 'react'

function WalletEditor({ wallet, onSave, onBack }) {
  const [amount, setAmount] = useState(wallet.toString())

  const handleSubmit = (e) => {
    e.preventDefault()
    const value = parseFloat(amount)
    if (!isNaN(value) && value >= 0) {
      onSave(value)
    }
  }

  const quickAdd = (addAmount) => {
    const current = parseFloat(amount) || 0
    setAmount((current + addAmount).toString())
  }

  return (
    <div className="max-w-md mx-auto p-5 min-h-full bg-[#fcfcfc]">
      {/* Header */}
      <div className="flex items-center justify-between py-4 mb-6">
        <button 
          onClick={onBack}
          className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95"
        >
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-700 tracking-tight">Edit Wallet</h1>
        <div className="w-12"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current Balance */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl p-8 text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <label className="block text-emerald-100 text-sm font-medium mb-4 uppercase tracking-wider">
            Current Balance
          </label>
          <div className="flex items-center justify-center">
            <span className="text-4xl font-black text-white mr-1">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              className="bg-transparent text-6xl font-black text-white text-center w-44 focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Quick Add</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[5, 10, 20, 50].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => quickAdd(val)}
                className="bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold transition-all active:scale-95"
              >
                +${val}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm font-semibold uppercase tracking-wide">How it works</span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            This is your accountability wallet. Money will be deducted when you skip habits. 
            Think of it as "skin in the game" to keep you motivated.
          </p>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-5 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]"
        >
          Save Changes
        </button>
      </form>
    </div>
  )
}

export default WalletEditor
