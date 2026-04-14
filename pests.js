// Pest database — common landscape pests in Southern California
const PESTS = [
  {
    name: "Aphids",
    plantsAffected: ["Roses", "Lantana camera (Lantana)", "Salvia", "Salvia leucantha (Mexican Bush Sage)", "Abutilon palmeri (Palmer's Indian Mallow)", "Sphaeralcea ambigua (Desert Mallow / Apricot Mallow)", "Photinia × fraseri (Fraser Photinia)", "Pittosporum"],
    symptoms: "Small green, yellow, or black insects clustered on new growth and undersides of leaves. Leaves curl, yellow, or distort. Sticky honeydew on leaves below.",
    treatment: "1. Spray with strong water stream to dislodge. 2. Apply insecticidal soap or neem oil, covering undersides of leaves. 3. Introduce ladybugs or lacewings for biological control. 4. Repeat every 5–7 days as needed.",
    severity: "Medium"
  },
  {
    name: "Whiteflies",
    plantsAffected: ["Lantana camera (Lantana)", "Salvia", "Myoporum parvifolium", "Senecio mandraliscae (Blue Senecio)", "Gazania rigens", "Carissa macrocarpa (Natal Plum)"],
    symptoms: "Tiny white flying insects rise in clouds when plant is disturbed. Yellow, stippled leaves. Sticky honeydew beneath plants.",
    treatment: "1. Hang yellow sticky traps near affected plants. 2. Spray with insecticidal soap or neem oil, targeting underside of leaves. 3. Apply horticultural oil. 4. Remove heavily infested leaves.",
    severity: "Medium"
  },
  {
    name: "Scale (Hard & Soft)",
    plantsAffected: ["Pittosporum", "Olea europaea 'Little Ollie'", "Olea europaea (Olive Tree)", "Juniperus chinensis 'Torulosa' (Juniper)", "Carissa macrocarpa (Natal Plum)", "Rhaphiolepis indica (Indian Hawthorn)", "Buxus 'Green Beauty'"],
    symptoms: "Brown, tan, or white bumps on stems and leaves that don't rub off. Sticky honeydew. Yellowing leaves, dieback of branches.",
    treatment: "1. Scrub off with soft brush and soapy water. 2. Apply horticultural oil (dormant or summer oil). 3. Use systemic insecticide for severe infestations. 4. Prune out heavily infested branches.",
    severity: "High"
  },
  {
    name: "Spider Mites",
    plantsAffected: ["Lomandra", "Lomandra longifolia 'Breeze'", "Phormium tenax (New Zealand Flax)", "Olea europaea 'Little Ollie'", "Juniperus chinensis 'Torulosa' (Juniper)", "Roses", "Pittosporum"],
    symptoms: "Fine stippling or mottling on leaves. Webbing between leaves and stems in severe cases. Leaves look dusty or faded. Thrives in hot, dry conditions.",
    treatment: "1. Spray plants with strong water stream to knock off mites. 2. Apply insecticidal soap or neem oil every 3–5 days. 3. Increase humidity around plants. 4. Use miticide if severe.",
    severity: "High"
  },
  {
    name: "Powdery Mildew",
    plantsAffected: ["Roses", "Salvia leucantha (Mexican Bush Sage)", "Nepeta 'Walker's Low'", "Lantana camera (Lantana)", "Gaillardia pulchella (Indian Blanket)", "Photinia × fraseri (Fraser Photinia)", "Viburnum davidii"],
    symptoms: "White to gray powdery coating on leaves, stems, and buds. Leaves may curl or distort. Reduced plant vigor.",
    treatment: "1. Remove and discard infected leaves (do not compost). 2. Improve air circulation. 3. Apply fungicide (sulfur-based, neem oil, or baking soda solution). 4. Water at base, not on foliage.",
    severity: "Medium"
  },
  {
    name: "Verticillium Wilt",
    plantsAffected: ["Olea europaea 'Little Ollie'", "Olea europaea (Olive Tree)", "Roses", "Viburnum davidii", "Rhaphiolepis indica (Indian Hawthorn)", "Photinia × fraseri (Fraser Photinia)"],
    symptoms: "Wilting of one or more branches. Leaves curl, turn yellow, then brown. Brown discoloration visible in sapwood when branch is cut. Often fatal.",
    treatment: "1. Prune out affected branches well below the discoloration (sterilize pruners between cuts). 2. Improve drainage. 3. Avoid overwatering. 4. Remove and destroy severely infected plants. No effective chemical control — prevention is key.",
    severity: "High"
  },
  {
    name: "Root Rot (Phytophthora / Pythium)",
    plantsAffected: ["Lomandra", "Lomandra longifolia 'Breeze'", "Buxus 'Green Beauty'", "Viburnum davidii", "Rhaphiolepis indica (Indian Hawthorn)", "Bougainvillea spectabilis (Bougainvillea)"],
    symptoms: "Sudden wilting despite adequate water. Brown roots that feel mushy. Outer root cortex sloughs off. Leaves turn dull green or yellow. Stem base turns dark and soft.",
    treatment: "1. Improve drainage immediately. 2. Reduce watering frequency. 3. Apply metalaxyl or phosphonate fungicide as soil drench. 4. Remove and destroy badly infected plants. 5. Replant with resistant species.",
    severity: "High"
  },
  {
    name: "Gophers",
    plantsAffected: ["Lomandra longifolia 'Breeze'", "Lomandra", "Myoporum parvifolium", "Senecio mandraliscae (Blue Senecio)", "Heuchera maxima (Coral Bells)", "Iris douglasiana (Douglas Iris)", "Achillea millefolium (Common Yarrow)", "Bougainvillea spectabilis (Bougainvillea)"],
    symptoms: "Mound of fresh dirt in crescent or fan shape. Sunken areas or tunnels visible. Plants suddenly wilt or disappear. Root systems eaten.",
    treatment: "1. Trap using Macabee or box traps placed in main run. 2. Use gopher bait (zinc phosphide) in burrows. 3. Install underground gopher wire baskets around valuable plants. 4. Encourage natural predators (owls, snakes).",
    severity: "High"
  },
  {
    name: "Squirrels",
    plantsAffected: ["Lomandra", "Lomandra longifolia 'Breeze'", "Myoporum parvifolium", "Senecio mandraliscae (Blue Senecio)", "Heuchera maxima (Coral Bells)", "Achillea millefolium (Common Yarrow)", "Bougainvillea spectabilis (Bougainvillea)"],
    symptoms: "Chewed stems and roots at soil level. Plants pushed up from soil. Digging damage to root balls. Leaf damage.",
    treatment: "1. Trap and relocate. 2. Use hot sauce or predator urine around planting areas. 3. Install 1/2-inch hardware cloth barriers in soil. 4. Remove food sources (fallen fruit/nuts).",
    severity: "Medium"
  }
];

if (typeof module !== "undefined" && module.exports) module.exports = PESTS;
