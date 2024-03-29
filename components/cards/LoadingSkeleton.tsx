import React from 'react'

function LoadingSkeleton({ count, large = false }) {
  const cardList = Array(count).fill(1)

  return (
    <div className='mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
      {cardList.map((_, index) => (
        <div
          key={index + Date.now().toString()}
          className='relative before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-blue-300/10 before:to-transparent isolate overflow-hidden shadow-xl shadow-black/5 before:border-t before:border-blue-400/10'
        >
          <div className='space-y-5 rounded-2xl bg-blue-300 p-4'>
            <div className='h-24 rounded-lg bg-blue-100/10'></div>
            <div className='space-y-3'>
              {large && (
                <div>
                  <div className='h-3 w-3/5 rounded-lg bg-blue-100/10'></div>
                  <div className='h-3 w-4/5 rounded-lg bg-blue-100/20'></div>
                  <div className='h-3 w-2/5 rounded-lg bg-blue-100/20'></div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default LoadingSkeleton
