type AnalogClockProps = {
  date: Date;
};

export function AnalogClock({ date }: AnalogClockProps) {
  const seconds = date.getSeconds();
  const minutes = date.getMinutes() + seconds / 60;
  const hours = (date.getHours() % 12) + minutes / 60;
  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6;
  const hourDeg = hours * 30;

  return (
    <div className="relative h-64 w-64 rounded-full border border-white bg-gradient-to-br from-white to-sky-50 shadow-2xl shadow-sky-200/70">
      {Array.from({ length: 12 }, (_, index) => {
        const number = index + 1;
        const angle = number * 30;
        return (
          <span
            key={number}
            className="absolute left-1/2 top-1/2 text-lg font-semibold text-slate-700"
            style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-105px) rotate(-${angle}deg)` }}
          >
            {number}
          </span>
        );
      })}
      <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950" />
      <span
        className="absolute left-1/2 top-1/2 h-20 w-1.5 origin-bottom rounded-full bg-slate-950"
        style={{ transform: `translate(-50%, -100%) rotate(${hourDeg}deg)` }}
      />
      <span
        className="absolute left-1/2 top-1/2 h-28 w-1 origin-bottom rounded-full bg-slate-700"
        style={{ transform: `translate(-50%, -100%) rotate(${minuteDeg}deg)` }}
      />
      <span
        className="absolute left-1/2 top-1/2 h-28 w-0.5 origin-bottom rounded-full bg-sky-500"
        style={{ transform: `translate(-50%, -100%) rotate(${secondDeg}deg)` }}
      />
    </div>
  );
}
