function TicketFullView({ ticket, onClose }) {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center px-6 py-10">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#FBF6EC] border border-[#E4D9C4] text-[#3E332A] text-xl flex items-center justify-center"
      >
        ✕
      </button>

      <p className="font-['JetBrains_Mono'] text-xs tracking-[0.2em] text-[#E08E52] mb-2">
        METROGO · SCAN AT GATE
      </p>

      <h1 className="font-['Fraunces'] text-2xl font-semibold text-[#3E332A] mb-1 text-center">
        {ticket.source} → {ticket.destination}
      </h1>
      <p className="font-['Inter'] text-sm text-[#7A6C5D] mb-8">
        {ticket.sourceLine} {ticket.sourceLine !== ticket.destinationLine ? `→ ${ticket.destinationLine}` : ""}
      </p>

      {/* Large, high-contrast QR code */}
      <div className="bg-white border-4 border-[#3E332A] rounded-2xl p-4">
        <img
          src={ticket.qrCode}
          alt="Ticket QR Code"
          className="w-64 h-64 md:w-80 md:h-80"
        />
      </div>

      <div className="mt-8 grid grid-cols-3 gap-8 text-center">
        <div>
          <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">STOPS</p>
          <p className="font-['Fraunces'] text-xl font-semibold mt-1 text-[#3E332A]">{ticket.numberOfStops}</p>
        </div>
        <div>
          <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">FARE</p>
          <p className="font-['Fraunces'] text-xl font-semibold mt-1 text-[#8FAF7D]">₹{ticket.fare}</p>
        </div>
        <div>
          <p className="font-['JetBrains_Mono'] text-[10px] text-[#A89985] tracking-widest">STATUS</p>
          <p className="font-['Fraunces'] text-xl font-semibold mt-1 text-[#3E332A] capitalize">{ticket.status}</p>
        </div>
      </div>

      <p className="font-['Inter'] text-xs text-[#A89985] mt-8 text-center max-w-xs">
        Tip: turn up your screen brightness for the fastest scan at the gate.
      </p>
    </div>
  );
}

export default TicketFullView;