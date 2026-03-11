const ProgressBars = ({ classes }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6 tracking-wide drop-shadow-md">Class Attendance Overview</h2>
      <div className="space-y-6">
        {classes.map((cls, index) => (
          <div key={cls.id ?? cls.name ?? index} className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <p className="font-semibold text-neutral-200">{cls.name}</p>
              <p className="text-right font-bold text-white tracking-widest text-lg drop-shadow-sm">
                {cls.attendance}%
              </p>
            </div>
            <div className="w-full h-3 bg-black/40 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] overflow-hidden border border-white/5 relative">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-neutral-400 to-white relative`}
                style={{ width: `${cls.attendance}%`, boxShadow: '0 0 10px rgba(255,255,255,0.4)', transition: 'width 1s ease-out' }}
              >
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 blur-sm rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBars;