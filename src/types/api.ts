
export interface APIEndpoint {
  method: string;
  path: string;
  description?: string;
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses?: Response[];
}

export interface Parameter {
  name: string;
  type: 'path' | 'query' | 'header';
  dataType: string;
  required: boolean;
  description?: string;
}

export interface RequestBody {
  contentType: string;
  schema: object;
  example?: object;
}

export interface Response {
  statusCode: number;
  description: string;
  schema?: object;
  example?: object;
}

export interface AnalysisResult {
  projectName: string;
  description: string;
  endpoints: APIEndpoint[];
  models: object[];
}
