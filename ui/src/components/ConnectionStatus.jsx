const ConnectionStatus = ({ status = 'disconnected' }) => {
  return (
    <div className="flex items-center gap-2 bg-xwhite border-thick border-xblack rounded-full px-4 py-2 font-bold text-xs uppercase tracking-wide">
      <div className="relative flex items-center justify-center w-3 h-3">
        {status === 'connected' && (
          <>
            <span className="absolute inline-flex w-full h-full rounded-full bg-success opacity-75 animate-ping"></span>
            <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-success"></span>
          </>
        )}
        {status === 'connecting' && (
          <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
        )}
        {status === 'disconnected' && (
          <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-live"></span>
        )}
      </div>
      <span className="text-xblack mt-0.5 whitespace-nowrap">
        LIVE CONNECTED
      </span>
    </div>
  );
};

export default ConnectionStatus;
