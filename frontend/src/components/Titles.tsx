import { Gamepad2, Zap, Sparkles } from 'lucide-react';
import '../styles/titles.css'


export default function Titles({num}:{num:number}) {
  const version = (num <=5 && num >=1) ? num : 1; 
  
  if (version === 1) return (
    <>
        {/* Version 1: Logo moderne avec cartes qui flottent */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex relative">
              {/* Carte 1 */}
              <div className="w-14 h-14 bg-linear-to-br from-purple-500 to-pink-600 border-2 border-purple-400/50 rounded-xl transform -rotate-6 flex items-center justify-center shadow-xl shadow-purple-500/50 z-10 hover:scale-110 transition-all duration-300 animate-float">
                <span className="text-2xl font-black text-white drop-shadow-lg">1</span>
              </div>
              {/* Carte 2 */}
              <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-cyan-600 border-2 border-blue-400/50 rounded-xl transform rotate-12 flex items-center justify-center shadow-xl shadow-blue-500/50 -ml-6 hover:scale-110 transition-all duration-300 animate-float-delayed">
                <span className="text-2xl font-black text-white drop-shadow-lg">1</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight">
              <span className="bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                One
              </span>{' '}
              <span className="text-pink-400">o'</span>{' '}
              <span className="bg-linear-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                One
              </span>
            </h1>
          </div>
      </>

  )

  if (version === 2) return (
    <>

          <div className="flex items-center justify-center gap-4">
            <div className="relative">
              {/* Cercle externe animé */}
              <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-purple-500 to-pink-500 animate-spin-slow opacity-50 blur" />
              {/* Logo central */}
              <div className="relative w-16 h-16 bg-linear-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50 border-2 border-purple-400/30">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight">
              <span className="bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-linear">
                One o' One
              </span>
            </h1>
          </div>
      </>)

    if (version ===3) return (

      <>
        {/* Version 3: Logo minimaliste avec badge */}

          <div className="flex items-center justify-center gap-4">
            <div className="relative group">
              {/* Badge VS */}
              <div className="w-16 h-16 bg-linear-to-br from-purple-600 via-pink-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 border-2 border-white/20 group-hover:scale-110 transition-all duration-300">
                <span className="text-xl font-black text-white">VS</span>
              </div>
              {/* Effet ping */}
              <div className="absolute inset-0 rounded-full bg-linear-to-br from-purple-600 to-pink-600 animate-ping opacity-20" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight">
              <span className="text-white">One</span>{' '}
              <span className="text-pink-400">o'</span>{' '}
              <span className="text-white">One</span>
            </h1>
          </div>
      </>  
      )

      if(version === 4) return (<>

        {/* Version 4: Logo avec nombre stylisé */}

          <div className="flex items-center justify-center gap-3">
            {/* 1 */}
            <div className="w-16 h-20 bg-linear-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-2xl shadow-purple-500/50 transform hover:rotate-6 transition-all duration-300 border-2 border-purple-400/30">
              <span className="text-4xl font-black text-white">1</span>
            </div>
            {/* vs */}
            <div className="px-3">
              <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
            {/* 1 */}
            <div className="w-16 h-20 bg-linear-to-br from-pink-500 to-pink-700 rounded-xl flex items-center justify-center shadow-2xl shadow-pink-500/50 transform hover:-rotate-6 transition-all duration-300 border-2 border-pink-400/30">
              <span className="text-4xl font-black text-white">1</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-4">One o' One</p>
        </>)

        if(version ===5) return (<>

        {/* Version 5: Logo compact horizontal */}

          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-linear-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 border border-purple-400/30">
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
            <h1 className="text-4xl font-bold">
              <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                1
              </span>
              <span className="text-pink-400 mx-1">o'</span>
              <span className="bg-linear-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                1
              </span>
            </h1>
            <Sparkles className="w-6 h-6 text-pink-400 animate-pulse delay-300" />
          </div>
        
      </>)

}
