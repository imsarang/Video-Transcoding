'use client'

import { useState } from "react"
import { AnimatePresence, motion } from 'framer-motion'
import Login from "./Login"
import Signup from "./Signup"
import Image from "next/image"

export default function AuthComponent() {
  const [isLogin, setIsLogin] = useState(true)

  const variantsLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  const variantsRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="relative w-2/3 h-[60vh] bg-white rounded-3xl shadow-lg flex">

        <div
        className={`duration-500
        ${isLogin ? "opacity-100 w-2/5" : "opacity-0 w-3/5"}
        `}>
          <Login/>
        </div>
        <div
        className={`duration-500
        ${isLogin ? 'opacity-0 w-3/5' : 'opacity-100 w-2/5'}
        `}>
          <Signup/>
        </div>

        {/* toggle */}
        <div
        className={`absolute h-full w-3/5 bg-gray-800 flex flex-col justify-center items-center duration-500 ease-in-out
          ${isLogin ? "transform translate-x-2/3 rounded-l-[25%] md:rounded-l-[75%] rounded-r-3xl" : "transform -translate-x-1 rounded-r-[25%] md:rounded-r-[75%] rounded-l-3xl"}
        `}>
          <Image
          src="/color-trancoding.jpg"
          alt="color-trancoding"
          width={100}
          height={100}
          className={`
            w-full h-full shadow gradient mask rounded-2xl absolute top-0 left-0 z-0 opacity-20 duration-500 ease-in-out
            ${isLogin ? "rounded-l-[25%] md:rounded-l-[75%] rounded-r-3xl": "rounded-r-[25%] md:rounded-r-[75%] rounded-l-3xl"}
            `}
          />
          <span
            className="z-40 text-2xl font-bold absolute top-[40%] text-white text-center px-4 whitespace-normal break-words max-w-[80%]"
          >
            {isLogin
              ? "New here? Take off by registering"
              : "Already have an account? Just login"}
          </span>

          <button
          className="absolute translate-y-24 px-4 py-2 w-2/5 z-40 bg-blue-300 rounded-xl shadow hover:bg-blue-400 active:scale-95 duration-200 cursor-pointer"
          onClick={()=>setIsLogin(!isLogin)}
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </div>
        {/* Left half (Login) */}
        {/* <div className="w-1/2 flex items-center justify-center relative z-10">
          <AnimatePresence mode="wait">
            {isLogin && (
              <motion.div
                key="login"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variantsLeft}
                transition={{ duration: 0.4 }}
                className="w-full px-6"
              >
                <Login />
              </motion.div>
            )}
          </AnimatePresence>
        </div> */}

        {/* Right half (Signup) */}
        {/* <div className="w-1/2 flex items-center justify-center relative z-10">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="signup"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variantsRight}
                transition={{ duration: 0.4 }}
                className="w-full px-6"
              >
                <Signup />
              </motion.div>
            )}
          </AnimatePresence>
        </div> */}

        {/* Sliding overlay with toggle button */}
        {/* <motion.div
          layout
          animate={{ x: isLogin ? "100%" : "0%" }}
          transition={{ type: "spring", stiffness: 70, damping: 15 }}
          className="absolute top-0 left-0 w-1/2 h-full bg-purple-200 flex items-center justify-center z-0"
        >
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="px-6 py-2 bg-purple-500 text-white rounded-xl shadow"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </motion.div> */}
      </div>
    </div>
  )
}
