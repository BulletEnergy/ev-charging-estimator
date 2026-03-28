import { EstimateInput, EstimateOutput } from '@/lib/estimate/types';

const PRICING_CONSTRAINT = `
CRITICAL CONSTRAINT: You MUST NOT calculate, suggest, or output any dollar amounts, totals, subtotals, or prices. Financial calculations are handled exclusively by the deterministic pricing engine. Your role is to extract/validate field values only. Do not include estimateControls, unitPrice, extendedPrice, or total fields in your output.
`;

const ESTIMATE_INPUT_SCHEMA = `
The EstimateInput has these sections:
- project: { name, salesRep, projectType (full_turnkey|full_turnkey_connectivity|equipment_install_commission|install_commission|equipment_purchase|remove_replace|commission_only|service_work|supercharger), timeline, isNewConstruction }
- customer: { companyName, contactName, contactEmail, contactPhone, billingAddress }
- site: { address, siteType (airport|apartment|event_venue|fleet_dealer|hospital|hotel|industrial|mixed_use|fuel_station|municipal|office|parking_structure|police_gov|recreational|campground|restaurant|retail|school|other), state }
- parkingEnvironment: { type (surface_lot|parking_garage|mixed), hasPTSlab, slabScanRequired, coringRequired, surfaceType (asphalt|concrete|gravel|other), trenchingRequired, boringRequired, trafficControlRequired, indoorOutdoor (indoor|outdoor|both), fireRatedPenetrations, accessRestrictions }
- charger: { brand, model, count, pedestalCount, portType (single|dual|mix), mountType (pedestal|wall|mix|other), isCustomerSupplied, chargingLevel (l2|l3_dcfc), ampsPerCharger, volts }
- electrical: { serviceType (120v|208v|240v|480v_3phase|unknown), availableCapacityKnown, availableAmps, breakerSpaceAvailable, panelUpgradeRequired, transformerRequired, switchgearRequired, distanceToPanel_ft, utilityCoordinationRequired, meterRoomRequired, electricalRoomDescription, pvcConduit4in_ft, pvcConduit3in_ft, pvcConduit1in_ft, wire500mcm_ft }
- civil: { installationLocationDescription, trenchDistance_ft (open trench LF if different from full conduit run), asphaltRemoval_sf, asphaltRestore_sf, encasement_CY, postFoundation_CY, cabinetPad_CY, groundPrepCabinet }
- permit: { responsibility (bullet|client|tbd) }
- designEngineering: { responsibility (bullet|client|tbd), stampedPlansRequired }
- network: { type (none|customer_lan|wifi_bridge|cellular_router|included_in_package), wifiInstallResponsibility }
- accessories: { bollardQty, signQty, wheelStopQty, stripingRequired, padRequired, debrisRemoval }
- makeReady: { responsibility (bullet|client|tbd) }
- chargerInstall: { responsibility (bullet|client|tbd) }
- purchasingChargers: { responsibility (bullet|client|tbd) }
- signageBollards: { responsibility (signage|bollards|signage_bollards|none|tbd) }
- notes: string
`;

const NARRATIVE_SOW_EXTRACTION_RULES = `
Narrative / non-tabular scope extraction (no dollar amounts in output):
- If the text mentions Tesla Supercharger, V3/V4 Supercharger, or DC fast charging fleet install, set project.projectType to "supercharger" when appropriate, charger.chargingLevel to "l3_dcfc", and charger.brand/model accordingly.
- If equipment is "BY OTHERS", "owner furnished", or "customer supplied", set charger.isCustomerSupplied to true and purchasingChargers.responsibility to "client" when stated.
- If switchgear, EV Lite switchgear, or line items mention switchgear, set electrical.switchgearRequired to true.
- If meter pad, meter housing, or submeter appears, set electrical.meterRoomRequired to true when scope implies our work on meter infrastructure.
- Infer electrical.distanceToPanel_ft from the longest single conduit or wire run in LF when clearly stated (e.g. "500 LF 4\\" conduit" → 500).
- If trenching LF is stated separately from the conduit run (e.g. "5 LF trench" vs "30 LF conduit"), set civil.trenchDistance_ft to the open-trench length only.
- If asphalt removal/restoration appears, set parkingEnvironment.surfaceType to "asphalt" and parkingEnvironment.type to "surface_lot" unless garage is stated.
`;

export function buildSOWParserPrompt(rawText: string): { system: string; user: string } {
  return {
    system: `You are an expert EV charging infrastructure estimator. You extract project scope from natural-language descriptions into a structured JSON object.

Rules:
- Return ONLY valid JSON matching the EstimateInput schema below.
- Do not invent facts. If a field is not stated or implied, set it to null.
- Include "sowFormat": "narrative".
- Include an "assumptions" array with any inferences you made.
- Include a "confidence" number from 0 to 1 for overall extraction quality.
- Include a "missingFields" array listing critical fields not found in the text.
- Normalize charger brands to: Tesla, ChargePoint, Blink, SWTCH, EV Connect, Xeal, or the exact brand name.
- Normalize site types to the enum values listed in the schema.
${NARRATIVE_SOW_EXTRACTION_RULES}
${PRICING_CONSTRAINT}

${ESTIMATE_INPUT_SCHEMA}

Return JSON with this shape:
{
  "parsedInput": { ...partial EstimateInput fields... },
  "sowFormat": "narrative",
  "confidence": 0.85,
  "missingFields": ["field1", "field2"],
  "assumptions": ["Assumed X because Y"]
}`,
    user: `Parse this project scope of work:\n\n${rawText}`,
  };
}

const TABULAR_SOW_PRICING_RULES = `
TABULAR / PROPOSAL MODE — you MAY extract dollar amounts, quantities, and unit prices EXACTLY as printed in the document.
- For each priced line item, set quantity, unit (LF, EA, CY, SF, PKG, LS, etc.), unitPrice, and amount (extended line total). Use 0 for TBD rows with no price.
- Skip pure headers, blank rows, and "Subtotal/Total" summary rows as line items (do not duplicate subtotal as a line).
- Include a "rawLineItems" array. Each item: { "description": string, "quantity": number, "unit": string, "unitPrice": number, "amount": number, "category": optional string (CIVIL|ELEC|ELEC LBR|ELEC LBR MAT|ELEC MAT|SITE WORK|DES/ENG|PERMIT|MISC|CHARGER|PEDESTAL|NETWORK|SAFETY|SOFTWARE|MATERIAL), "catalogMatch": optional string }
- Do not invent line items not present in the text. Do not recalculate math; copy numbers from the document when possible.
`;

export function buildTabularSOWParserPrompt(rawText: string): { system: string; user: string } {
  return {
    system: `You are an expert EV charging infrastructure estimator. The user pasted a tabular proposal, bid, or scope with line items and pricing.

Extract BOTH:
1) Structured project fields (parsedInput) for EstimateInput — same schema as narrative mode, including supercharger/BY OTHERS/switchgear/meter rules below.
2) Every priced scope line as rawLineItems with exact numbers from the document.

${TABULAR_SOW_PRICING_RULES}

${NARRATIVE_SOW_EXTRACTION_RULES}

${ESTIMATE_INPUT_SCHEMA}

Return JSON with this shape:
{
  "parsedInput": { ...partial EstimateInput fields... },
  "rawLineItems": [ { "description": "...", "quantity": 1, "unit": "EA", "unitPrice": 100, "amount": 100, "category": "CIVIL" } ],
  "sowFormat": "tabular",
  "confidence": 0.85,
  "missingFields": [],
  "assumptions": []
}`,
    user: `Parse this tabular proposal / scope of work:\n\n${rawText}`,
  };
}

/** Heuristic: tabular proposals with many priced lines vs narrative email */
export function detectTabularSOW(rawText: string): boolean {
  const dollarMatches = rawText.match(/\$[\d,]+\.?\d{0,2}/g) ?? [];
  const hasUnits = /\b(LF|EA|CY|SF|PKG|LS|MI)\b/i.test(rawText);
  const hasSubtotal = /\bsubtotal\b/i.test(rawText);
  const hasQtyColumn = /\b(QTY|QUANTITY)\b/i.test(rawText) || /\d+\s+(CIVIL|ELEC|MISC)\s+/i.test(rawText);
  if (dollarMatches.length >= 8 && hasUnits) return true;
  if (hasSubtotal && hasUnits && dollarMatches.length >= 5) return true;
  if (hasQtyColumn && dollarMatches.length >= 6 && hasUnits) return true;
  return false;
}

export function buildChatBuilderSystemPrompt(currentInput: Partial<EstimateInput>): string {
  return `You are an EV charging infrastructure estimator assistant helping build a project scope.

Your job: Look at the current input fields and ask ONE question about the most impactful missing field. Prioritize:
1. Fields that block pricing (charger brand/model/count, site type, parking type)
2. Safety/compliance risks (PT slab, fire penetrations)
3. Largest cost-swing fields (distance to panel, trenching, parking environment)
4. Nice-to-have refinements (accessories, notes)

When the user answers, extract the structured field value and return it.
${PRICING_CONSTRAINT}

${ESTIMATE_INPUT_SCHEMA}

Current input state:
${JSON.stringify(currentInput, null, 2)}

Return JSON with this shape:
{
  "reply": "Your conversational response",
  "updatedFields": { "section.field": value },
  "nextQuestion": "The next question to ask, or null if all critical fields are complete",
  "inputCompleteness": 0.65
}`;
}

export function buildReviewPrompt(
  input: EstimateInput,
  output: EstimateOutput,
): { system: string; user: string } {
  return {
    system: `You are a senior EV infrastructure estimator reviewing a draft estimate for completeness, accuracy, and potential issues.

Check for:
- Missing line items that the scope implies (e.g., garage install without coring)
- Quantities that seem wrong for the site type
- Scope contradictions (e.g., wall mount in surface lot with no building nearby)
- Items flagged for manual review that you can provide guidance on
- Common oversights (e.g., no network for ChargePoint, no traffic control for active lot)

${PRICING_CONSTRAINT}

For suggested changes, ONLY suggest changes to INPUT fields (not prices). The pricing engine will recalculate.

Return JSON:
{
  "findings": [{ "severity": "warning", "category": "Civil", "message": "...", "affectedLineItems": ["LI-001"] }],
  "overallAssessment": "Brief summary",
  "suggestedChanges": [{ "field": "parkingEnvironment.coringRequired", "currentValue": null, "suggestedValue": true, "reason": "..." }]
}`,
    user: `Review this estimate:

Input:
${JSON.stringify(input, null, 2)}

Output:
${JSON.stringify(output, null, 2)}`,
  };
}

export function buildSatelliteAnalysisPrompt(): string {
  return `You are analyzing a satellite/aerial image of a property for EV charger installation estimating.

Analyze the visible site and return ONLY a JSON response with these fields:

{
  "siteDescription": "Brief description of what you see from above",
  "inferredFields": {
    "parkingEnvironment.type": "surface_lot | parking_garage | mixed | null",
    "parkingEnvironment.surfaceType": "asphalt | concrete | gravel | other | null",
    "site.siteType": "hotel | apartment | retail | office | industrial | fuel_station | other | null",
    "parkingEnvironment.trafficControlRequired": true | false | null
  },
  "estimatedParkingSpaces": null,
  "suggestedChargerCount": { "min": null, "max": null, "reasoning": "..." },
  "concerns": ["List any installation concerns visible from aerial view"],
  "confidence": 0.75
}

Rules:
- Only report what is VISIBLE from the aerial/satellite view
- For uncertain observations, lower the confidence score
- Never claim hidden electrical capacity or buried conditions
- Do not estimate any costs or prices
- estimatedParkingSpaces should be your best count of visible parking spots
- suggestedChargerCount uses 3-5% of parking spaces for EV adoption
${PRICING_CONSTRAINT}`;
}

export function buildEnhancedSatellitePrompt(): string {
  return `You are an expert EV charger site assessor analyzing a satellite/aerial image for commercial EV charger installation.

Analyze the visible site and return ONLY a JSON response:

{
  "siteDescription": "Brief description of what you see from above",
  "inferredFields": {
    "parkingEnvironment.type": "surface_lot | parking_garage | mixed | null",
    "parkingEnvironment.surfaceType": "asphalt | concrete | gravel | other | null",
    "site.siteType": "hotel | apartment | retail | office | industrial | fuel_station | other | null",
    "parkingEnvironment.trafficControlRequired": true | false | null
  },
  "estimatedParkingSpaces": null,
  "suggestedChargerCount": { "min": null, "max": null, "reasoning": "Based on 3-5% EV adoption rate" },
  "parkingLayoutGeometry": {
    "stallOrientation": "angled | perpendicular | parallel | mixed | null",
    "driveAisleWidthEstimate": "narrow | standard | wide | null",
    "adaZonesVisible": false,
    "surfaceTransitions": ["List transitions like 'asphalt-to-concrete at building perimeter'"]
  },
  "electricalInfrastructure": {
    "transformerPadVisible": false,
    "meterClusterVisible": false,
    "utilityPoleNearby": false,
    "estimatedPanelSide": "north | south | east | west side of building, or null"
  },
  "concerns": ["List any EV charger installation concerns"],
  "confidence": 0.75
}

EV CHARGER INSTALLATION FOCUS:
- Identify electrical panel locations, transformer pads, utility meter clusters on building exteriors
- Detect parking lot layout: stall orientation, drive aisle widths, ADA zones
- Assess surface transitions (asphalt-to-concrete boundaries = bore/trench decision points)
- Count parking spaces and suggest charger count (3-5% EV adoption rate)
- Detect existing EV chargers or electrical infrastructure
- Suggest optimal charger placement zones based on parking flow
- Note bollard/protection requirements near drive aisles

Rules:
- Only report what is VISIBLE from the aerial/satellite view
- For uncertain observations, lower the confidence score
- Never claim hidden electrical capacity or buried conditions
${PRICING_CONSTRAINT}`;
}

export function buildEnhancedStreetViewPrompt(): string {
  return `You are an expert EV charger site assessor analyzing a Google Street View image for commercial EV charger installation.

Analyze the ground-level view and return ONLY a JSON response:

{
  "siteDescription": "Brief description of what you see at ground level",
  "inferredFields": {
    "parkingEnvironment.surfaceType": "asphalt | concrete | gravel | other | null",
    "parkingEnvironment.type": "surface_lot | parking_garage | mixed | null",
    "charger.mountType": "pedestal | wall | null",
    "parkingEnvironment.trafficControlRequired": true | false | null
  },
  "observations": {
    "wallSurfaces": "Wall materials, mount points, height, accessibility",
    "electricalInfra": "Visible panels, conduit runs, transformers, meters, junction boxes",
    "parkingCondition": "Surface condition, cracks, drainage, grade",
    "accessPoints": "Driveways, gates, bollards, narrow entries",
    "existingChargers": "Any existing EV chargers or infrastructure visible",
    "heightClearance": "Estimated clearance if garage/covered structure",
    "lightingConditions": "Existing lighting poles, fixtures"
  },
  "electricalObservation": {
    "panelVisible": false,
    "transformerVisible": false,
    "meterClusterVisible": false,
    "existingConduitVisible": false,
    "estimatedPanelLocation": "e.g. northwest corner of building",
    "description": "Detailed description of visible electrical infrastructure"
  },
  "conduitRouting": {
    "existingConduitVisible": false,
    "wallMountFeasibility": "good | fair | poor | null",
    "wallMaterial": "brick | concrete | stucco | metal | wood | null",
    "routingOpportunities": ["e.g. existing conduit run along north wall"]
  },
  "adaCompliance": {
    "adaParkingVisible": false,
    "pathOfTravelClear": true,
    "concerns": ["Any ADA compliance concerns"]
  },
  "mountRecommendation": {
    "type": "pedestal | wall | pole_mount",
    "reason": "Why this mount type suits this location",
    "suggestedLocations": "Where chargers should go"
  },
  "concerns": ["List any installation concerns visible from street level"],
  "confidence": 0.75
}

EV CHARGER INSTALLATION FOCUS:
- Identify electrical panels, transformers, meter banks, junction boxes with location descriptions
- Detect conduit pathways (wall-mounted, underground, overhead)
- Assess wall mounting feasibility (material: brick/concrete/stucco, height, access)
- Identify conduit routing opportunities (existing runs, wall channels, ceiling paths)
- Detect ADA parking and paths of travel
- Assess drive aisle widths for traffic control assessment
- Identify surface transitions indicating bore vs trench sections

Rules:
- Only report what is VISIBLE in the ground-level image
- Pay special attention to electrical panels, conduit paths, and parking layout
- Note any ADA compliance concerns
${PRICING_CONSTRAINT}`;
}

export function buildPlanAnalysisPrompt(): string {
  return `You are reading a site plan, markup, or aerial markup image for commercial EV charging layout.

Return ONLY valid JSON (no markdown fences):
{
  "runs": [
    {
      "runType": "conduit|feeder|trench|bore|concrete_cut",
      "points": [[0.12, 0.35], [0.44, 0.52]]
    }
  ],
  "equipment": [
    {
      "equipmentType": "charger_l2|charger_l3|transformer|switchgear|utility_meter",
      "relativeX": 0.62,
      "relativeY": 0.48,
      "label": "Charger 1"
    }
  ],
  "notes": "Short caveats about uncertainty",
  "confidence": "high|medium|low",
  "needsReview": true
}

Rules:
- relativeX and relativeY are normalized 0–1 on the image (origin top-left of the image).
- Each point in runs is also [relativeX, relativeY] in the same normalized space.
- If conduit paths are unclear, return an empty runs array and explain in notes.
- Prefer marking likely charger locations in equipment even if runs are unknown.
- Never output prices, ampacity, or guaranteed code compliance — this is for placement hints only.`;
}

export function buildPhotoAnalysisPrompt(fileCount: number = 1): string {
  const multiNote = fileCount > 1
    ? `You are analyzing ${fileCount} site photos and/or documents for a single EV charger installation project. Synthesize observations across ALL files into one unified assessment. If a file is a PDF (site plan, proposal, electrical drawing, etc.), extract relevant scope details.`
    : 'You are analyzing a site photo or document for EV charger installation estimating.';

  const fileNotesField = fileCount > 1
    ? `"fileNotes": [{ "fileName": "photo1.jpg", "note": "Brief observation specific to this file" }],`
    : '';

  return `${multiNote}

Return ONLY valid JSON (no markdown fences). Combine all observations into a single response.

{
  "siteDescription": "Comprehensive description synthesized from all provided files",
  "inferredFields": {
    "parkingEnvironment": { "type": "surface_lot|parking_garage|mixed|null", "surfaceType": "asphalt|concrete|gravel|other|null", "indoorOutdoor": "indoor|outdoor|both|null" },
    "charger": { "mountType": "pedestal|wall|null" },
    "electrical": { "panelUpgradeRequired": true|false|null, "transformerRequired": true|false|null, "switchgearRequired": true|false|null },
    "site": { "siteType": "hotel|apartment|retail|office|industrial|fuel_station|restaurant|other|null" }
  },
  ${fileNotesField}
  "concerns": ["List any installation concerns visible across all files"],
  "confidence": 0.75
}

Rules:
- Only report what is VISIBLE or strongly implied from the provided files
- For uncertain observations, lower the confidence
- Never claim hidden electrical capacity or buried conditions
- If a PDF contains scope/line items, note relevant details in siteDescription but do not output prices
- For multiple photos, identify different angles/areas and combine into one coherent site picture
${PRICING_CONSTRAINT}`;
}
