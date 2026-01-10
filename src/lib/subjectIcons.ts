import archiveAnim from "react-useanimations/lib/archive/archive.json";
import activityAnim from "react-useanimations/lib/activity/activity.json";
import editAnim from "react-useanimations/lib/edit/edit.json";
import settingsAnim from "react-useanimations/lib/settings/settings.json";
import folderAnim from "react-useanimations/lib/folder/folder.json";
import bookmarkAnim from "react-useanimations/lib/bookmark/bookmark.json";
import exploreAnim from "react-useanimations/lib/explore/explore.json";
import codepenAnim from "react-useanimations/lib/codepen/codepen.json";
import infinityAnim from "react-useanimations/lib/infinity/infinity.json";
import zoomInAnim from "react-useanimations/lib/zoomIn/zoomIn.json";
import alertCircleAnim from "react-useanimations/lib/alertCircle/alertCircle.json";

// Map DB icon names to best-matching Lottie animations
// Map DB icon names to best-matching Lottie animations
export const SUBJECT_ICON_MAP: Record<string, unknown> = {
  // Books / General
  BookOpen: bookmarkAnim,
  Book: bookmarkAnim,
  Library: archiveAnim,
  Briefcase: folderAnim,

  // Science
  FlaskConical: activityAnim,
  Microscope: zoomInAnim,
  Atom: infinityAnim,
  Beaker: activityAnim,
  TestTube: activityAnim,

  // CS / Tech
  Code: codepenAnim,
  Binary: codepenAnim,
  Terminal: codepenAnim,
  Cpu: settingsAnim,
  Settings: settingsAnim,

  // Arts / Media
  Palette: editAnim,
  Image: editAnim,
  Music: activityAnim,
  Camera: exploreAnim,
  Film: exploreAnim,

  // Geography / History
  Globe: exploreAnim,
  Map: exploreAnim,

  // Math
  Calculator: infinityAnim,
  Infinity: infinityAnim,

  // Fallbacks / Others
  Lightbulb: alertCircleAnim,
  Edit: editAnim,
  Pen: editAnim,
  Key: settingsAnim,
};

export const DEFAULT_SUBJECT_ANIMATION = archiveAnim;

export function getSubjectAnimation(iconName: string) {
  return SUBJECT_ICON_MAP[iconName] || DEFAULT_SUBJECT_ANIMATION;
}

// Curated list of distinct animations for the picker (No duplicates)
export const PICKER_OPTIONS = [
  "BookOpen", // Bookmark
  "Library", // Archive
  "Briefcase", // Folder
  "FlaskConical", // Activity
  "Microscope", // ZoomIn
  "Atom", // Infinity
  "Code", // Codepen
  "Cpu", // Settings
  "Palette", // Edit
  "Globe", // Explore
  "Lightbulb", // Alert
];

// Full list for validation if needed, but UI should use PICKER_OPTIONS
export const AVAILABLE_SUBJECT_ICONS = Object.keys(SUBJECT_ICON_MAP);
