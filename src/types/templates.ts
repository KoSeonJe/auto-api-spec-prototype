
export type DocumentationTemplate = 'basic' | 'detailed' | 'swagger' | 'postman' | 'custom';

export interface TemplateOption {
  id: DocumentationTemplate;
  name: string;
  description: string;
  preview: string;
}

export interface CustomTemplate {
  name: string;
  format: string;
  sections: string[];
  includeExamples: boolean;
  includeErrorCodes: boolean;
  includeAuthentication: boolean;
}
