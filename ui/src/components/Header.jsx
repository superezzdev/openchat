import ConnectionStatus from './ConnectionStatus';

const Header = ({ connectionStatus }) => {
  return (
    <header className="w-full mt-6 bg-primary rounded-3xl border-thick shadow-[0_4px_0_0_#111] overflow-hidden flex flex-col sm:flex-row justify-between items-center px-6 sm:px-10 py-6 sm:py-8">
      <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-xblack m-0 mb-1">
          Sportz
        </h1>
        <p className="text-sm sm:text-base font-medium text-xblack opacity-80 m-0">
          Real-time match data demo
        </p>
      </div>
      
      <div className="mt-4 sm:mt-0">
        <ConnectionStatus status={connectionStatus} />
      </div>
    </header>
  );
};

export default Header;
