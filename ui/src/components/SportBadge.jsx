const SportBadge = ({ sport }) => {
  return (
    <div className="bg-xwhite border-[2px] border-xblack rounded-full px-4 py-1.5 inline-flex items-center justify-center">
      <span className="text-[10px] sm:text-xs font-black uppercase text-xblack tracking-wider mt-0.5">
        {sport}
      </span>
    </div>
  );
};

export default SportBadge;
