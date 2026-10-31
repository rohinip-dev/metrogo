function ConfirmModal({ isOpen, title, message, confirmText, onConfirm, onCancel, danger }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[#E4D9C4]">
        <h2 className="font-['Fraunces'] text-xl font-semibold text-[#3E332A] mb-2">{title}</h2>
        <p className="font-['Inter'] text-sm text-[#7A6C5D] mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-3 rounded-full border border-[#E4D9C4] text-[#3E332A] font-['Inter'] text-sm hover:bg-[#FBF6EC] transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={"flex-1 px-4 py-3 rounded-full text-white font-['Inter'] text-sm font-medium shadow-md transition-shadow " + (danger ? "bg-red-400 hover:bg-red-500" : "bg-[#E08E52] hover:shadow-lg")}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;