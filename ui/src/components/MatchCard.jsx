import SportBadge from './SportBadge';
import LiveStatus from './LiveStatus';
import ScoreDisplay from './ScoreDisplay';

const MatchCard = ({ match, onSelect, isSelected }) => {
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`bg-xwhite border-thick rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 w-full shadow-[0_2px_0_0_#111] hover:-translate-y-1 hover:shadow-[0_6px_0_0_#111] ${isSelected ? 'ring-4 ring-primary ring-opacity-50 border-xblack' : 'border-xblack'}`}>
      
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <SportBadge sport={match.sport} />
        <LiveStatus status={match.status} />
      </div>

      {/* Teams and Scores */}
      <div className="flex flex-col gap-4 w-full">
        <div className="flex justify-between items-center w-full">
          <span className="font-bold text-lg sm:text-xl truncate mr-4 text-xblack">{match.homeTeam}</span>
          <ScoreDisplay score={match.homeScore} />
        </div>
        <div className="flex justify-between items-center w-full">
          <span className="font-bold text-lg sm:text-xl truncate mr-4 text-xblack">{match.awayTeam}</span>
          <ScoreDisplay score={match.awayScore} />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-5 border-t-2 border-dashed border-gray-200 flex justify-between items-end">
        <span className="text-xs sm:text-sm font-semibold text-muted uppercase tracking-wide">
          {formatTime(match.startTime)}
        </span>
        <button 
          onClick={onSelect}
          className="bg-primary text-xblack font-bold text-sm sm:text-base border-thick border-xblack rounded-full px-5 py-2 hover:bg-yellow-400 active:scale-95 transition-transform"
        >
          Watch Live
        </button>
      </div>

    </div>
  );
};

export default MatchCard;
