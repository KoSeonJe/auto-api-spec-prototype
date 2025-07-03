import { AnalysisResult } from './apiAnalyzer';
import { DocumentationTemplate, CustomTemplate } from '@/types/templates';

export const renderWithTemplate = (
  result: AnalysisResult,
  template: DocumentationTemplate,
  customTemplate?: CustomTemplate
): string => {
  switch (template) {
    case 'basic':
      return renderBasicTemplate(result);
    case 'detailed':
      return renderDetailedTemplate(result);
    case 'swagger':
      return renderSwaggerTemplate(result);
    case 'postman':
      return renderPostmanTemplate(result);
    case 'custom':
      return renderCustomTemplate(result, customTemplate);
    default:
      return renderBasicTemplate(result);
  }
};

const renderApiSummaryTable = (result: AnalysisResult): string => {
  let table = `## API 요약\n\n`;
  table += `| API 이름 | Method | Endpoint | 설명 |\n`;
  table += `|----------|--------|----------|------|\n`;
  
  result.endpoints.forEach(endpoint => {
    const apiName = endpoint.description || `${endpoint.method} ${endpoint.path}`;
    table += `| ${apiName} | ${endpoint.method} | ${endpoint.path} | ${endpoint.description || '-'} |\n`;
  });
  
  table += `\n---\n\n`;
  return table;
};

const renderBasicTemplate = (result: AnalysisResult): string => {
  let markdown = `# ${result.projectName} API 명세서\n\n`;
  
  if (result.description) {
    markdown += `## 개요\n${result.description}\n\n`;
  }
  
  // Add API summary table
  markdown += renderApiSummaryTable(result);
  
  markdown += `## 상세 API 명세\n\n`;
  
  result.endpoints.forEach(endpoint => {
    markdown += `### ${endpoint.method} ${endpoint.path}\n`;
    if (endpoint.description) {
      markdown += `${endpoint.description}\n\n`;
    }
    
    if (endpoint.requestBody) {
      markdown += `**요청 본문**:\n`;
      markdown += `\`\`\`json\n${JSON.stringify(endpoint.requestBody.example || endpoint.requestBody.schema, null, 2)}\n\`\`\`\n\n`;
    }
    
    if (endpoint.responses && endpoint.responses.length > 0) {
      endpoint.responses.forEach(response => {
        if (response.example) {
          markdown += `**응답 (${response.statusCode})**:\n`;
          markdown += `\`\`\`json\n${JSON.stringify(response.example, null, 2)}\n\`\`\`\n\n`;
        }
      });
    }
  });
  
  return markdown;
};

const renderDetailedTemplate = (result: AnalysisResult): string => {
  let markdown = `# ${result.projectName} API 명세서\n\n`;
  
  if (result.description) {
    markdown += `## 개요\n${result.description}\n\n`;
  }
  
  // Add API summary table
  markdown += renderApiSummaryTable(result);
  
  markdown += `## 인증\nBearer Token이 필요할 수 있습니다.\n\n`;
  markdown += `## 상세 API 명세\n\n`;
  
  result.endpoints.forEach(endpoint => {
    markdown += `### ${endpoint.method} ${endpoint.path}\n\n`;
    
    if (endpoint.description) {
      markdown += `**설명**: ${endpoint.description}\n\n`;
    }
    
    if (endpoint.parameters && endpoint.parameters.length > 0) {
      markdown += `**파라미터**:\n`;
      endpoint.parameters.forEach(param => {
        markdown += `- **${param.name}** (${param.type}): ${param.description || '설명 없음'}\n`;
      });
      markdown += `\n`;
    }
    
    if (endpoint.requestBody) {
      markdown += `**📤 요청**:\n`;
      markdown += `\`\`\`json\n${JSON.stringify(endpoint.requestBody.example || endpoint.requestBody.schema, null, 2)}\n\`\`\`\n\n`;
    }
    
    if (endpoint.responses && endpoint.responses.length > 0) {
      markdown += `**응답**:\n`;
      endpoint.responses.forEach(response => {
        markdown += `- **${response.statusCode}**: ${response.description}\n`;
        if (response.example) {
          markdown += `**✅ 응답 예시 (${response.statusCode})**:\n`;
          markdown += `\`\`\`json\n${JSON.stringify(response.example, null, 2)}\n\`\`\`\n`;
        }
      });
      markdown += `\n`;
    }
    
    markdown += `---\n\n`;
  });
  
  return markdown;
};

const renderSwaggerTemplate = (result: AnalysisResult): string => {
  const swagger = {
    openapi: '3.0.0',
    info: {
      title: result.projectName,
      description: result.description,
      version: '1.0.0'
    },
    paths: {} as any
  };
  
  result.endpoints.forEach(endpoint => {
    if (!swagger.paths[endpoint.path]) {
      swagger.paths[endpoint.path] = {};
    }
    
    swagger.paths[endpoint.path][endpoint.method.toLowerCase()] = {
      summary: endpoint.description,
      parameters: endpoint.parameters?.map(param => ({
        name: param.name,
        in: param.type,
        required: param.required,
        schema: { type: param.dataType },
        description: param.description
      })),
      responses: endpoint.responses?.reduce((acc, response) => {
        acc[response.statusCode] = {
          description: response.description,
          content: response.example ? {
            'application/json': {
              example: response.example
            }
          } : undefined
        };
        return acc;
      }, {} as any)
    };
  });
  
  return `\`\`\`yaml\n${JSON.stringify(swagger, null, 2)}\n\`\`\``;
};

const renderPostmanTemplate = (result: AnalysisResult): string => {
  const collection = {
    info: {
      name: `${result.projectName} API Collection`,
      description: result.description,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: result.endpoints.map(endpoint => ({
      name: endpoint.description || `${endpoint.method} ${endpoint.path}`,
      request: {
        method: endpoint.method,
        header: [],
        url: {
          raw: `{{baseUrl}}${endpoint.path}`,
          host: ['{{baseUrl}}'],
          path: endpoint.path.split('/').filter(p => p)
        },
        body: endpoint.requestBody ? {
          mode: 'raw',
          raw: JSON.stringify(endpoint.requestBody.example, null, 2),
          options: {
            raw: {
              language: 'json'
            }
          }
        } : undefined
      },
      response: endpoint.responses?.map(response => ({
        name: response.description,
        originalRequest: {
          method: endpoint.method,
          header: [],
          url: {
            raw: `{{baseUrl}}${endpoint.path}`,
            host: ['{{baseUrl}}'],
            path: endpoint.path.split('/').filter(p => p)
          }
        },
        status: response.description,
        code: response.statusCode,
        _postman_previewlanguage: 'json',
        header: [],
        cookie: [],
        body: response.example ? JSON.stringify(response.example, null, 2) : ''
      })) || []
    })),
    variable: [
      {
        key: 'baseUrl',
        value: 'https://api.example.com',
        type: 'string'
      }
    ]
  };
  
  return `\`\`\`json\n${JSON.stringify(collection, null, 2)}\n\`\`\``;
};

const renderCustomTemplate = (result: AnalysisResult, customTemplate?: CustomTemplate): string => {
  if (!customTemplate) {
    return renderBasicTemplate(result);
  }
  
  let markdown = `# ${result.projectName}\n\n`;
  
  if (result.description) {
    markdown += `## 프로젝트 설명\n${result.description}\n\n`;
  }
  
  // Add API summary table for custom template too
  markdown += renderApiSummaryTable(result);
  
  if (customTemplate.includeAuthentication) {
    markdown += `## 인증\n인증이 필요한 엔드포인트가 있을 수 있습니다.\n\n`;
  }
  
  markdown += `## 상세 API 명세\n\n`;
  
  result.endpoints.forEach(endpoint => {
    markdown += `### ${endpoint.method} ${endpoint.path}\n\n`;
    
    if (endpoint.description) {
      markdown += `**기능**: ${endpoint.description}\n\n`;
    }
    
    if (endpoint.parameters && endpoint.parameters.length > 0) {
      markdown += `**요청 파라미터**:\n`;
      endpoint.parameters.forEach(param => {
        markdown += `- **${param.name}** (${param.type}): ${param.description || '설명 없음'}\n`;
      });
      markdown += `\n`;
    }
    
    if (customTemplate.includeExamples && endpoint.requestBody) {
      markdown += `**📤 요청 예시**:\n`;
      markdown += `\`\`\`json\n${JSON.stringify(endpoint.requestBody.example || endpoint.requestBody.schema, null, 2)}\n\`\`\`\n\n`;
    }
    
    if (endpoint.responses && endpoint.responses.length > 0) {
      if (customTemplate.includeErrorCodes) {
        markdown += `**응답 상태**:\n`;
        endpoint.responses.forEach(response => {
          markdown += `- **${response.statusCode}**: ${response.description}\n`;
        });
        markdown += `\n`;
      }
      
      if (customTemplate.includeExamples) {
        endpoint.responses.forEach(response => {
          if (response.example) {
            markdown += `**✅ 응답 예시 (${response.statusCode})**:\n`;
            markdown += `\`\`\`json\n${JSON.stringify(response.example, null, 2)}\n\`\`\`\n\n`;
          }
        });
      }
    }
    
    markdown += `---\n\n`;
  });
  
  return markdown;
};
