<template>
  <div>
    <div v-if="num === 1" class="flex items-center justify-center gap-4">
      <div class="flex relative">
        <div class="w-14 h-14 bg-linear-to-br from-purple-500 to-pink-600 border-2 border-purple-400/50 rounded-xl transform -rotate-6 flex items-center justify-center shadow-xl shadow-purple-500/50 z-10 hover:scale-110 transition-all duration-300 animate-float">
          <span class="text-2xl font-black text-white drop-shadow-lg">1</span>
        </div>
        <div class="w-14 h-14 bg-linear-to-br from-blue-500 to-cyan-600 border-2 border-blue-400/50 rounded-xl transform rotate-12 flex items-center justify-center shadow-xl shadow-blue-500/50 -ml-6 hover:scale-110 transition-all duration-300 animate-float-delayed">
          <span class="text-2xl font-black text-white drop-shadow-lg">1</span>
        </div>
      </div>

      <h1 class="text-5xl font-bold tracking-tight">
        <span class="bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          One
        </span>
        <span class="text-pink-400">o'</span>
        <span class="bg-linear-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
          One
        </span>
      </h1>
    </div>
    <div v-else className="flex items-center justify-center gap-4">
        <div className="relative group">
            <!-- {/* Badge VS */} -->
            <div className="w-16 h-16 bg-linear-to-br from-purple-600 via-pink-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 border-2 border-white/20 group-hover:scale-110 transition-all duration-300">
            <span className="text-xl font-black text-white">VS</span>
            </div>
            <!-- {/* Effet ping */} -->
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-purple-600 to-pink-600 animate-ping opacity-20" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight">
            <span className="text-white">One</span>{{' '}}
            <span className="text-pink-400">o'</span>{{' '}}
            <span className="text-white">One</span>
        </h1>
    </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Titles', // Optionnel mais recommandé
  props: {
    num: {
      type: Number,
      default: 1
    }
  }
})
</script>

<style scoped>
/* Tes animations sont parfaites, rien à changer ici ! */
@keyframes float {
    0%, 100% { transform: translateY(0px) rotate(-6deg); }
    50% { transform: translateY(-10px) rotate(-6deg); }
}
@keyframes float-delayed {
    0%, 100% { transform: translateY(0px) rotate(12deg); }
    50% { transform: translateY(-10px) rotate(12deg); }
}
.animate-float {
    animation: float 3s ease-in-out infinite;
}
.animate-float-delayed {
    animation: float-delayed 3s ease-in-out infinite;
    animation-delay: 0.3s;
}
</style>