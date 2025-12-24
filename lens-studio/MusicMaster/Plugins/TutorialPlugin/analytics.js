import * as Analytics from "LensStudio:Analytics";
import { TutorialsContainerDescriptor } from "./Resources/descriptor.js";

const PluginID = 'Com.Snap.TutorialPanel';
const TutorialOpen = "LENSSTUDIO_PLUGIN_EVENT_OPEN";
const TutorialStaus = "LENSSTUDIO_PLUGIN_EVENT_TUTORIAL_COMPLETION";
const TutorialID = TutorialsContainerDescriptor.id;

// decorator function for enabling optional logging
function logEvent(eventData) {
    eventData.event_value = PluginID;
    Analytics.logEvent(eventData);
}

/** * Logs the opening of the tutorial plugin.
 * This function is called when the tutorial plugin is opened.
 */
export function logEventOpen() {
    const eventData = {
        "event_name": TutorialOpen,
    };
    logEvent(eventData);
}

/** * Logs the completion status of a tutorial.
 * @param {string} completedId - The ID of the completed tutorial.
 */
export function logEventTutorialStatus(sectionId) {
    const eventData = {
        "event_name": TutorialStaus,
        "tutorial_id": TutorialID,
        "section_id": sectionId,
    };
    logEvent(eventData);
}