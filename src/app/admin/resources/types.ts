import { Resource } from "@/types";

export type ResourceType = "pdf" | "link" | "video" | "image" | "document" | "other";

export interface ResourceFormState {
  subjectId: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  type: ResourceType;
  linkUrl: string;
  displayAsFile: boolean;
  file: File | null;
  thumbnailFile: File | null;
  thumbnailUrl: string;
}

export interface EditResourceFormState {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  type: ResourceType;
  url: string;
  displayAsFile: boolean;
  thumbnailUrl: string;
  file: File | null;
}

export interface DeleteTarget {
  resourceId: string;
  subjectId: string;
}

export interface ResourceTypeOption {
  value: ResourceType;
  labelEn: string;
  labelAr: string;
  iconName: "fileText" | "link" | "video" | "image" | "fileCode" | "fileType";
}

export interface ResourceEditState {
  editingResource: Resource | null;
  editForm: EditResourceFormState;
  editUploading: boolean;
}
