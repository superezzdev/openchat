import MatchCard from './MatchCard';

const MatchSection = ({ matches, loading, error, onRetry, onSelectMatch, selectedMatchId }) => {
  return (
    <section className="w-full">
      <div className="flex items-center gap-4 mb-6 relative">
        {/* Light blue accent line */}
        <div className="w-1.5 h-6 bg-blue-300 rounded-sm"></div>
        <h2 className="text-xl sm:text-2xl font-bold text-xblack m-0">Current Matches</h2>
        <div className="bg-xblack text-xwhite text-xs font-bold px-2 py-1 rounded ml-auto">
          API: {matches.length}
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-xwhite border-thick rounded-3xl p-6 h-[220px] animate-pulse flex flex-col justify-between">
              <div className="flex justify-between items-center w-full">
                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              </div>
              <div className="space-y-4 my-auto">
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded-lg w-10"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-8 bg-gray-200 rounded-lg w-10"></div>
                </div>
              </div>
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-dashed border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-10 bg-gray-200 rounded-full w-28"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="bg-xwhite border-thick border-xblack rounded-3xl p-8 text-center shadow-[0_4px_0_0_#111]">
          <h3 className="text-xl font-bold mb-2">Unable to load matches</h3>
          <p className="text-muted mb-6">{error}</p>
          <button 
            onClick={onRetry}
            className="bg-primary border-thick border-xblack px-6 py-2 rounded-full font-bold hover:translate-y-[-2px] transition-transform active:scale-95 shadow-[0_2px_0_0_#111]"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="bg-xwhite border-thick border-xblack border-dashed rounded-3xl p-12 text-center">
          <h3 className="text-xl font-bold mb-2 text-xblack">No matches available</h3>
          <p className="text-muted">There are currently no matches to display.</p>
        </div>
      )}

      {!loading && !error && matches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
          {matches.map(match => (
            <MatchCard 
              key={match.id} 
              match={match} 
              onSelect={() => onSelectMatch(match.id)}
              isSelected={selectedMatchId === match.id}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default MatchSection;
