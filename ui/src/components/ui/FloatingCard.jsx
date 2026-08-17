export const FloatingCard = ({ name, country, flag, seed, rotateClass }) => (
  <div className={`w-[120px] p-[14px] rounded-3xl md:w-[180px] bg-white/20 backdrop-blur-2xl border border-white/30 md:rounded-[32px] md:p-6 flex flex-col items-center shadow-[0_24px_48px_rgba(0,0,0,0.15)] transition-transform duration-500 ease-out cursor-default hover:rotate-0 hover:scale-105 ${rotateClass}`}>
    <div className="w-[52px] h-[52px] mb-2 md:w-[84px] md:h-[84px] rounded-full bg-[#003cff] overflow-hidden border-[3px] border-white/30 md:mb-3 shrink-0 shadow-inner">
      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=003cff`}
        alt="Avatar" className="w-full h-full object-cover"/>
    </div>
    <p className="font-black text-xs md:text-[17px] text-white m-0 font-['Inter',system-ui,sans-serif] drop-shadow-md tracking-tight">{name}</p>
    <p className="text-[9px] mt-1 md:text-[12px] font-bold text-white/80 md:mt-1 font-['Inter',system-ui,sans-serif] truncate w-full text-center">{flag} {country}</p>
    <p className="text-[9px] md:text-[10px] text-[#4ade80] mt-1.5 flex items-center justify-center gap-1 font-['Inter',system-ui,sans-serif] font-semibold whitespace-nowrap drop-shadow-sm">
      <span className="w-1 h-1 md:w-[5px] md:h-[5px] rounded-full bg-[#4ade80] inline-block"/>
      online now
    </p>
  </div>
);
