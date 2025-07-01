
// API 분석 유틸리티 (프로토타입용)
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

// GitHub Repository 분석을 위한 함수들
export const analyzeRepository = async (
  repositoryUrl: string,
  aiModel: 'gemini' | 'openai',
  apiKey: string
): Promise<AnalysisResult> => {
  // 실제 구현에서는 여기서 GitHub API 호출, 코드 클론, AI 분석 등을 수행
  // 프로토타입에서는 목업 데이터 반환
  
  console.log('Analyzing repository:', repositoryUrl);
  console.log('Using AI model:', aiModel);
  console.log('API Key provided:', !!apiKey);

  // 시뮬레이션 지연
  await new Promise(resolve => setTimeout(resolve, 2000));

  const projectName = repositoryUrl.split('/').pop() || 'Unknown Project';
  
  return {
    projectName,
    description: '자동 분석된 Spring Boot API 프로젝트',
    endpoints: [
      {
        method: 'GET',
        path: '/api/users',
        description: '사용자 목록 조회',
        responses: [
          {
            statusCode: 200,
            description: '성공',
            example: {
              users: [
                {
                  id: 1,
                  name: 'John Doe',
                  email: 'john@example.com'
                }
              ]
            }
          }
        ]
      },
      {
        method: 'POST',
        path: '/api/users',
        description: '새 사용자 생성',
        requestBody: {
          contentType: 'application/json',
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' }
            }
          },
          example: {
            name: 'Jane Doe',
            email: 'jane@example.com'
          }
        },
        responses: [
          {
            statusCode: 201,
            description: '생성됨',
            example: {
              id: 2,
              name: 'Jane Doe',
              email: 'jane@example.com',
              createdAt: '2024-01-01T00:00:00Z'
            }
          }
        ]
      }
    ],
    models: []
  };
};

// 분석 결과를 Markdown으로 변환
export const convertToMarkdown = (result: AnalysisResult): string => {
  let markdown = `# ${result.projectName} API 명세서\n\n`;
  
  if (result.description) {
    markdown += `## 개요\n${result.description}\n\n`;
  }
  
  markdown += `## 엔드포인트\n\n`;
  
  result.endpoints.forEach(endpoint => {
    markdown += `### ${endpoint.method} ${endpoint.path}\n\n`;
    
    if (endpoint.description) {
      markdown += `**설명**: ${endpoint.description}\n\n`;
    }
    
    if (endpoint.parameters && endpoint.parameters.length > 0) {
      markdown += `**파라미터**:\n`;
      endpoint.parameters.forEach(param => {
        markdown += `- ${param.name} (${param.type}): ${param.description || '설명 없음'}\n`;
      });
      markdown += `\n`;
    }
    
    if (endpoint.requestBody) {
      markdown += `**요청**:\n`;
      markdown += `\`\`\`json\n${JSON.stringify(endpoint.requestBody.example || endpoint.requestBody.schema, null, 2)}\n\`\`\`\n\n`;
    }
    
    if (endpoint.responses && endpoint.responses.length > 0) {
      markdown += `**응답**:\n`;
      endpoint.responses.forEach(response => {
        markdown += `- ${response.statusCode}: ${response.description}\n`;
        if (response.example) {
          markdown += `\`\`\`json\n${JSON.stringify(response.example, null, 2)}\n\`\`\`\n`;
        }
      });
      markdown += `\n`;
    }
    
    markdown += `---\n\n`;
  });
  
  return markdown;
};
