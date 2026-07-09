"use client";

import {
  FileCheck,
  FileCode,
  FileText,
  FileType,
  Image as ImageIcon,
  Link as LinkIcon,
  Video,
} from "lucide-react";
import { Resource, Subject } from "@/types";
import { ResourceType, ResourceTypeOption } from "./types";

export const RESOURCE_TYPES: ResourceTypeOption[] = [
  { value: "pdf", iconName: "fileText", labelEn: "PDF", labelAr: "PDF" },
  { value: "link", iconName: "link", labelEn: "Link", labelAr: "رابط" },
  { value: "video", iconName: "video", labelEn: "Video", labelAr: "فيديو" },
  { value: "image", iconName: "image", labelEn: "Image", labelAr: "صورة" },
  { value: "document", iconName: "fileCode", labelEn: "Document", labelAr: "مستند" },
  { value: "other", iconName: "fileType", labelEn: "Other", labelAr: "آخر" },
];

export function getResourceTypeIcon(iconName: ResourceTypeOption["iconName"]) {
  switch (iconName) {
    case "fileText":
      return FileText;
    case "link":
      return LinkIcon;
    case "video":
      return Video;
    case "image":
      return ImageIcon;
    case "fileCode":
      return FileCode;
    default:
      return FileType;
  }
}

export function getResourceIcon(type: ResourceType) {
  switch (type) {
    case "pdf":
      return <FileText className="w-5 h-5" />;
    case "link":
      return <LinkIcon className="w-5 h-5" />;
    case "video":
      return <Video className="w-5 h-5" />;
    case "image":
      return <ImageIcon className="w-5 h-5" />;
    case "document":
      return <FileCode className="w-5 h-5" />;
    default:
      return <FileType className="w-5 h-5" />;
  }
}

export function getDisplayResourceIcon(resource: Resource) {
  return resource.displayAsFile ? (
    <FileCheck className="w-5 h-5" />
  ) : (
    getResourceIcon(resource.type)
  );
}

export function getResourceColor(type: ResourceType) {
  switch (type) {
    case "pdf":
      return "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400";
    case "link":
      return "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400";
    case "video":
      return "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400";
    case "image":
      return "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400";
    case "document":
      return "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400";
  }
}

export function getSubjectOptions(subjects: Subject[], language: string) {
  return subjects.map((subject) => ({
    value: subject.id,
    label: language === "ar" ? subject.nameAr || subject.name : subject.name,
  }));
}
