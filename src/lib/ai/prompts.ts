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
- electrical: { serviceType (120v|208v|240v|480v_3phase|unknown), availableCapacityKnown, availableAmps, breakerSpaceAvailable, panelUpgradeRequired, transformerRequired, switchgearRequired, distanceToPanel_ft, utilityCoordinationRequired, electricalRoomDescription }
- civil: { installationLocationDescription }
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

export function buildSOWParserPrompt(rawText: string): { system: string; user: string } {
  return {
    system: `You are an expert EV charging infrastructure estimator. You extract project scope from natural-language descriptions into a structured JSON object.

Rules:
- Return ONLY valid JSON matching the EstimateInput schema below.
- Do not invent facts. If a field is not stated or implied, set it to null.
- Include an "assumptions" array with any inferences you made.
- Include a "confidence" number from 0 to 1 for overall extraction quality.
- Include a "missingFields" array listing critical fields not found in the text.
- Normalize charger brands to: Tesla, ChargePoint, Blink, SWTCH, EV Connect, Xeal, or the exact brand name.
- Normalize site types to the enum values listed in the schema.
${PRICING_CONSTRAINT}

${ESTIMATE_INPUT_SCHEMA}

Return JSON with this shape:
{
  "parsedInput": { ...partial EstimateInput fields... },
  "confidence": 0.85,
  "missingFields": ["field1", "field2"],
  "assumptions": ["Assumed X because Y"]
}`,
    user: `Parse this project scope of work:\n\n${rawText}`,
  };
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

export function buildPhotoAnalysisPrompt(): string {
  return `You are analyzing a site photo for EV charger installation estimating.

Return ONLY observations visible or strongly inferable from the image. Use confidence scores.

Analyze and return JSON:
{
  "siteDescription": "Brief description of what you see",
  "inferredFields": {
    "parkingEnvironment": { "type": "surface_lot|parking_garage|mixed|null", "surfaceType": "asphalt|concrete|gravel|other|null", "indoorOutdoor": "indoor|outdoor|both|null" },
    "charger": { "mountType": "pedestal|wall|null" }
  },
  "concerns": ["List any installation concerns visible in the photo"],
  "confidence": 0.75
}

Rules:
- Only report what is VISIBLE or strongly implied
- For uncertain observations, lower the confidence
- Never claim hidden electrical capacity or buried conditions
- Do not estimate any costs or prices`;
}
