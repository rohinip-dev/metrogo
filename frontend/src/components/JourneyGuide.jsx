import { PURPLE_STATIONS, GREEN_STATIONS, INTERCHANGE_STATION } from "../data/metroLines";

function getDirection(list, fromIndex, toIndex) {
  return toIndex > fromIndex ? list[list.length - 1] : list[0];
}

function JourneyGuide({ source, destination, sourceLine, destinationLine }) {
  const steps = [];
  const sameLine = sourceLine === destinationLine;

  if (sameLine) {
    const list = sourceLine === "Purple Line" ? PURPLE_STATIONS : GREEN_STATIONS;
    const fromIdx = list.indexOf(source);
    const toIdx = list.indexOf(destination);
    const direction = getDirection(list, fromIdx, toIdx);
    const stops = Math.abs(toIdx - fromIdx);

    steps.push({ icon: "🚉", title: `Board at ${source}`, detail: `Get on a ${sourceLine} train heading towards ${direction}.` });
    steps.push({ icon: "🚆", title: `Ride for ${stops} stop${stops !== 1 ? "s" : ""}`, detail: `Stay on board through all intermediate stations on the ${sourceLine}.` });
    steps.push({ icon: "🏁", title: `Alight at ${destination}`, detail: "You've arrived — exit through the station gates." });
  } else {
    const sourceList = sourceLine === "Purple Line" ? PURPLE_STATIONS : GREEN_STATIONS;
    const destList = destinationLine === "Purple Line" ? PURPLE_STATIONS : GREEN_STATIONS;

    const fromIdx = sourceList.indexOf(source);
    const interchangeIdxOnSource = sourceList.indexOf(INTERCHANGE_STATION);
    const dir1 = getDirection(sourceList, fromIdx, interchangeIdxOnSource);
    const stops1 = Math.abs(interchangeIdxOnSource - fromIdx);

    const interchangeIdxOnDest = destList.indexOf(INTERCHANGE_STATION);
    const toIdx = destList.indexOf(destination);
    const dir2 = getDirection(destList, interchangeIdxOnDest, toIdx);
    const stops2 = Math.abs(toIdx - interchangeIdxOnDest);

    steps.push({ icon: "🚉", title: `Board at ${source}`, detail: `Get on a ${sourceLine} train heading towards ${dir1}.` });
    steps.push({ icon: "🚆", title: `Ride for ${stops1} stop${stops1 !== 1 ? "s" : ""}`, detail: `Travel through to the interchange station.` });
    steps.push({ icon: "🔀", title: `Change lines at ${INTERCHANGE_STATION}`, detail: `Exit the ${sourceLine} platform and follow signs to the ${destinationLine} platform. This usually takes 3–5 minutes on foot within the station.` });
    steps.push({ icon: "🚆", title: `Board towards ${dir2}`, detail: `Get on a ${destinationLine} train and ride for ${stops2} stop${stops2 !== 1 ? "s" : ""}.` });
    steps.push({ icon: "🏁", title: `Alight at ${destination}`, detail: "You've arrived — exit through the station gates." });
  }

  return (
    <div className="mt-6 bg-white border border-[#E4D9C4] rounded-2xl p-6">
      <p className="font-['JetBrains_Mono'] text-[10px] tracking-widest text-[#A89985] mb-5">STEP-BY-STEP JOURNEY GUIDE</p>
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="text-lg">{step.icon}</span>
              {i < steps.length - 1 && <div className="w-[2px] flex-1 bg-[#E4D9C4] mt-1"></div>}
            </div>
            <div className="pb-4">
              <p className="font-['Inter'] font-medium text-sm text-[#3E332A]">{step.title}</p>
              <p className="font-['Inter'] text-xs text-[#7A6C5D] mt-1">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JourneyGuide;