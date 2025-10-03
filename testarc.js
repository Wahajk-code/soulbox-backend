const fs = require("fs");

// Define possible values
const temperatures = [
  "Searching",
  "Anxious",
  "Numb",
  "Ashamed",
  "Lonely",
  "Grieving",
  "Bitter",
  "Restless",
  "Hopeful",
];
const postures = [
  "Assertive",
  "Stewarding",
  "Reflective",
  "Open",
  "Guarded",
  "Rebellious",
  "Resigned",
];
const yearnings = [
  "To be free",
  "To belong",
  "To understand",
  "To change",
  "To be seen",
];

// Special cases
const specialCases = {
  "Anxious-Assertive-To change": {
    system: "resilient-leadership",
    label: "Resilient Leadership",
    rule_fired: "anxious_assertive_change",
  },
  "Anxious-Stewarding-To change": {
    system: "resilient-stewardship",
    label: "Resilient Stewardship",
    rule_fired: "anxious_stewarding_change",
  },
  "Anxious-Stewarding-To be seen": {
    system: "resilient-visibility",
    label: "Resilient Visibility",
    rule_fired: "anxious_stewarding_be_seen",
  },
};

// Generate arcMap
const arcMap = {
  default: {
    system: "balanced-open",
    label: "Balance and Openness",
    rule_fired: "default",
  },
};

temperatures.forEach((temp) => {
  postures.forEach((post) => {
    yearnings.forEach((yearn) => {
      const key = `${temp}-${post}-${yearn}`;
      if (specialCases[key]) {
        arcMap[key] = specialCases[key];
      } else {
        const system = `${temp.toLowerCase()}-${yearn
          .toLowerCase()
          .replace(/ /g, "-")}-${post.toLowerCase()}`;
        const label = `${post} ${temp} ${yearn.replace("To ", "")}`;
        const rule_fired = `${temp.toLowerCase()}_${post.toLowerCase()}_${yearn
          .toLowerCase()
          .replace(/ /g, "_")}`;
        arcMap[key] = { system, label, rule_fired };
      }
    });
  });
});

// Save to file
fs.writeFileSync("arc_map.json", JSON.stringify(arcMap, null, 2), "utf8");
console.log(
  `Generated arc_map.json with ${
    Object.keys(arcMap).length - 1
  } combinations plus default`
);
