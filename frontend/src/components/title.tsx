// Composant pour ton logo
export default function Title() {
  return (
    <div className="flex items-center space-x-3 mb-6">
      <div className="flex relative">
        <div className="w-10 h-10 bg-gray-800 border-2 border-brand-pink rounded-lg transform -rotate-6 flex items-center justify-center shadow-lg z-10">
          <span className="text-xl font-black text-brand-pink">1</span>
        </div>
        <div className="w-10 h-10 bg-gray-800 border-2 border-brand-blue rounded-lg transform rotate-12 flex items-center justify-center shadow-lg -ml-4">
          <span className="text-xl font-black text-brand-blue">1</span>
        </div>
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-white">
        One <span className="text-brand-pink">o'</span> One
      </h1>
    </div>
  );
}