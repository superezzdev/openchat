const LiveStatus = ({ status }) => {
  if (status !== 'live') {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-muted"></span>
        <span className="text-sm font-bold text-muted capitalize tracking-wide">{status}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full bg-live animate-pulse"></span>
      <span className="text-sm font-bold text-live tracking-wide">Live</span>
    </div>
  );
};

export default LiveStatus;
