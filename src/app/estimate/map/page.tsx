import { redirect } from 'next/navigation';

// The simplified map — Place Charger / Place Panel with auto-calculated
// trench, conduit, and wire lengths (trunk-and-branch topology) — is now
// embedded directly in the guided flow's Step 5 (InlineMapPrompt). The
// older standalone MapTakeoffWorkspace drawing tool was redundant, so
// this route just sends users into the guided flow where the map lives.
export default function MapPage() {
  redirect('/estimate');
}
