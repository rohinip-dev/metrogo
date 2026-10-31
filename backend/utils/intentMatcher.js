const fs = require("fs");
const path = require("path");

const intentsPath = path.join(__dirname, "../data/intents.json");
const intentsData = JSON.parse(fs.readFileSync(intentsPath, "utf8"));

const extraResponsesPath = path.join(__dirname, "../data/extraResponses.txt");
const extraResponses = fs
  .readFileSync(extraResponsesPath, "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.length > 0);

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "am", "was", "were", "be", "been",
  "how", "do", "does", "did", "i", "me", "my", "you", "your", "it",
  "to", "of", "for", "in", "on", "at", "and", "or", "please", "can",
  "could", "would", "will", "what", "where", "when", "this", "that",
]);

function removeStopWords(words) {
  return words.filter((w) => !STOP_WORDS.has(w));
}

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();
}

function findBestIntent(userMessage) {
  const normalizedMessage = normalize(userMessage);
  const messageWords = removeStopWords(normalizedMessage.split(" "));

  let bestTag = null;
  let bestScore = 0;

  for (const intent of intentsData.intents) {
    if (intent.tag === "fallback") continue;

    for (const pattern of intent.patterns) {
      const normalizedPattern = normalize(pattern);

      if (normalizedMessage.includes(normalizedPattern)) {
        const score = normalizedPattern.split(" ").length * 2;
        if (score > bestScore) {
          bestScore = score;
          bestTag = intent.tag;
        }
        continue;
      }

      const patternWords = removeStopWords(normalizedPattern.split(" "));
      const overlap = patternWords.filter((w) => messageWords.includes(w)).length;
      if (overlap > bestScore) {
        bestScore = overlap;
        bestTag = intent.tag;
      }
    }
  }

  if (bestScore === 0) return "fallback";
  return bestTag;
}

function getResponseForMessage(userMessage) {
  const tag = findBestIntent(userMessage);
  const intent = intentsData.intents.find((i) => i.tag === tag);

  const responses = intent.responses;
  const chosenResponse = responses[Math.floor(Math.random() * responses.length)];

  const shouldAddExtra = tag !== "fallback" && Math.random() < 0.3;
  const extraLine = shouldAddExtra
    ? " " + extraResponses[Math.floor(Math.random() * extraResponses.length)]
    : "";

  return { tag, reply: chosenResponse + extraLine };
}

const TAG_LABELS = {
  greeting: "Say Hi",
  booking: "How to Book a Ticket",
  cancel_ticket: "Cancel a Ticket",
  wallet_balance: "Check Wallet Balance",
  wallet_recharge: "Recharge Wallet",
  lost_found: "Lost & Found",
  emergency: "Emergency Help",
  help: "What Can You Do?",
  thanks: "Say Thanks",
  goodbye: "Say Bye",
};

function getQuickOptions() {
  const excludedTags = ["fallback", "greeting", "thanks", "goodbye"];

  return intentsData.intents
    .filter((intent) => !excludedTags.includes(intent.tag))
    .map((intent) => ({
      tag: intent.tag,
      label: TAG_LABELS[intent.tag] || intent.tag,
      sampleMessage: intent.patterns[0],
    }));
}

module.exports = { getResponseForMessage, getQuickOptions };