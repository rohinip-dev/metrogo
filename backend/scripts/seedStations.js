const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();
const Station = require("../models/Station");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const purpleLine = [
  "Whitefield", "Krishnarajapuram", "Baiyappanahalli", "Indiranagar",
  "Trinity", "MG Road", "Cubbon Park", "Vidhana Soudha",
  "Sir M Visvesvaraya", "Nadaprabhu Kempegowda", "Magadi Road",
  "Vijayanagar", "Attiguppe", "Deepanjali Nagar", "Mysuru Road",
  "Nayandahalli", "Rajarajeshwari Nagar", "Jnanabharathi", "Pattanagere",
  "Kengeri Bus Terminal", "Kengeri", "Challaghatta"
];

const greenLine = [
  "Madavara", "Chikkabidarakallu", "Manjunathanagar", "Nagasandra",
  "Dasarahalli", "Jalahalli", "Peenya Industry", "Peenya",
  "Goraguntepalya", "Yeshwanthpur", "Sandal Soap Factory", "Mahalakshmi",
  "Rajajinagar", "Kuvempu Road", "Srirampura", "Mantri Square Sampige Road",
  "Nadaprabhu Kempegowda", "Chickpete", "Krishna Rajendra Market",
  "National College", "Lalbagh", "South End Circle", "Jayanagar",
  "Rashtreeya Vidyalaya Road", "Banashankari", "Jayaprakash Nagar",
  "Yelachenahalli", "Konanakunte Cross", "Doddakallasandra",
  "Vajarahalli", "Thalaghattapura", "Silk Institute"
];

const stations = [];

const terminalStations = ["Whitefield", "Challaghatta", "Madavara", "Silk Institute"];

function buildFacilities(name, isInterchange) {
  const isTerminal = terminalStations.includes(name);

  if (isInterchange) {
    return {
      parking: true, restroom: true, atm: true,
      wheelchairAccess: true, elevator: true, foodCourt: true, wifi: true,
    };
  }
  if (isTerminal) {
    return {
      parking: true, restroom: true, atm: true,
      wheelchairAccess: true, elevator: true, foodCourt: false, wifi: true,
    };
  }
  return {
    parking: false, restroom: true, atm: false,
    wheelchairAccess: true, elevator: true, foodCourt: false, wifi: true,
  };
}

function buildExits(name) {
  return [`${name} Gate 1 (North)`, `${name} Gate 2 (South)`];
}

purpleLine.forEach((name, index) => {
  const isInterchange = name === "Nadaprabhu Kempegowda";
  stations.push({
    name,
    code: "P" + (index + 1) + name.substring(0, 2).toUpperCase(),
    line: "Purple Line",
    order: index + 1,
    isInterchange,
    facilities: buildFacilities(name, isInterchange),
    exits: buildExits(name),
  });
});

greenLine.forEach((name, index) => {
  if (!stations.find((s) => s.name === name)) {
    const isInterchange = name === "Nadaprabhu Kempegowda";
    stations.push({
      name,
      code: "G" + (index + 1) + name.substring(0, 2).toUpperCase(),
      line: "Green Line",
      order: index + 1,
      isInterchange,
      facilities: buildFacilities(name, isInterchange),
      exits: buildExits(name),
    });
  }
});

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Station.deleteMany({});
    console.log("🗑️  Old station data cleared");

    await Station.insertMany(stations);
    console.log(`✅ ${stations.length} stations added successfully!`);

    process.exit(0);
  } catch (error) {
    console.log("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();