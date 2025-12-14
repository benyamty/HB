import { useState, useRef, useEffect } from 'react'

function VerificationModal({ habitName, onVerified, onCancel }) {
  const [challengeNumber] = useState(() => Math.floor(Math.random() * 5) + 1) // 1-5
  const [cameraActive, setCameraActive] = useState(false)
  const [photoTaken, setPhotoTaken] = useState(false)
  const [photoData, setPhotoData] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraActive(true)
    } catch (err) {
      console.error('Camera access denied:', err)
      alert('Camera access is required to verify your habit completion.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(videoRef.current, 0, 0)
      const dataUrl = canvas.toDataURL('image/jpeg')
      setPhotoData(dataUrl)
      setPhotoTaken(true)
      stopCamera()
    }
  }

  const retakePhoto = () => {
    setPhotoTaken(false)
    setPhotoData(null)
    startCamera()
  }

  const confirmVerification = () => {
    stopCamera()
    onVerified()
  }

  const handleCancel = () => {
    stopCamera()
    onCancel()
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="fixed inset-0 dreamy-bg flex flex-col z-50">
      {/* Close button */}
      <button 
        onClick={handleCancel}
        className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 w-10 h-10 rounded-full pill-counter flex items-center justify-center z-10"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-[max(4rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
        
        {!cameraActive && !photoTaken && (
          <>
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Proof</h1>

            {/* Number box with glow */}
            <div className="relative mb-6">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-green-400/30 blur-3xl rounded-full scale-150" />
              
              {/* Number container */}
              <div className="relative w-40 h-40 rounded-3xl glass-card flex items-center justify-center">
                <span className="text-8xl font-bold text-green-500">{challengeNumber}</span>
              </div>
            </div>

            {/* Sparkle icon */}
            <div className="mb-6">
              <svg className="w-8 h-8 text-[color:var(--accent-solid)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zm4.5 12l.75 2.25L20 18l-2.75.75L16.5 21l-.75-2.25L13 18l2.75-.75.75-2.25zM6 15l.75 2.25L9 18l-2.25.75L6 21l-.75-2.25L3 18l2.25-.75L6 15z" />
              </svg>
            </div>

            {/* Take Photo button */}
            <button
              onClick={startCamera}
              className="w-full max-w-xs py-4 rounded-2xl btn-done text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Take Photo
            </button>
          </>
        )}

        {cameraActive && (
          <div className="w-full max-w-md flex flex-col items-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Show the number: <span className="text-green-500 font-bold">{challengeNumber}</span></h2>
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-[3/4] w-full mb-4 glass-card">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={takePhoto}
              className="w-full py-4 rounded-2xl btn-done text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Capture
            </button>
          </div>
        )}

        {photoTaken && photoData && (
          <div className="w-full max-w-md flex flex-col items-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your proof photo</h2>
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-[3/4] w-full mb-4 glass-card">
              <img
                src={photoData}
                alt="Verification photo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={retakePhoto}
                className="flex-1 py-4 rounded-2xl pill-counter text-gray-700 font-medium active:scale-95 transition-transform"
              >
                Retake
              </button>
              <button
                onClick={confirmVerification}
                className="flex-1 py-4 rounded-2xl btn-done text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerificationModal
