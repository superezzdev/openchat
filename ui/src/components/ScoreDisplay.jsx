const ScoreDisplay = ({ score }) => {
  return (
    <div className="flex items-center justify-center min-w-[40px] h-[40px] px-2 bg-xwhite border-thick border-xblack rounded-[10px] shadow-[0_2px_0_0_#111]">
      <span className="font-black text-xl text-xblack leading-none mt-0.5">{score}</span>
    </div>
  );
};

export default ScoreDisplay;
