import { motion } from 'framer-motion'

export function PyTorchLogoVisual() {
  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-orange/10 via-accent/10 to-coral/10 rounded-2xl overflow-hidden border-2 border-orange/30 flex items-center justify-center">
      <motion.div
        className="relative"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg width="200" height="200" viewBox="0 0 200 200">
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="oklch(0.70 0.20 40)"
            strokeWidth="8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <motion.circle
            cx="100"
            cy="100"
            r="60"
            fill="none"
            stroke="oklch(0.75 0.18 50)"
            strokeWidth="6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.3, ease: "easeInOut" }}
          />
          <motion.circle
            cx="100"
            cy="100"
            r="40"
            fill="none"
            stroke="oklch(0.65 0.20 15)"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.6, ease: "easeInOut" }}
          />
          
          <motion.circle
            cx="100"
            cy="20"
            r="15"
            fill="oklch(0.70 0.20 40)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 2 }}
          />
          <motion.circle
            cx="180"
            cy="100"
            r="15"
            fill="oklch(0.75 0.18 50)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 2.2 }}
          />
          <motion.circle
            cx="100"
            cy="180"
            r="15"
            fill="oklch(0.65 0.20 15)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 2.4 }}
          />
        </svg>
      </motion.div>
      
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        <motion.div
          className="text-6xl font-bold bg-gradient-to-r from-orange via-accent to-coral bg-clip-text text-transparent"
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⚡
        </motion.div>
      </motion.div>
    </div>
  )
}
