export interface SubjectFormData {
  name: string;
  nameAr: string;
  profName: string;
  profNameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  color: string;
}

export interface SubjectFormErrors {
  name?: string;
  profName?: string;
}

export interface SubjectBoundaryHit {
  fieldId: string;
  key: string;
  time: number;
}

export interface ColorOption {
  label: string;
  value: string;
}
