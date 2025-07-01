
// 실제 GitHub Repository 분석 및 AI API 호출 구현
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

// GitHub Repository 내용을 가져오는 함수
const fetchRepositoryContents = async (repositoryUrl: string): Promise<any[]> => {
  // GitHub API URL로 변환 (github.com/user/repo -> api.github.com/repos/user/repo/contents)
  const urlParts = repositoryUrl.replace('https://github.com/', '').split('/');
  const owner = urlParts[0];
  const repo = urlParts[1];
  
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`);
    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status}`);
    }
    
    const contents = await response.json();
    return contents;
  } catch (error) {
    console.error('Failed to fetch repository contents:', error);
    throw error;
  }
};

// 재귀적으로 파일 탐색하여 Java/Spring 파일들 찾기
const findJavaFiles = async (repositoryUrl: string, path: string = ''): Promise<string[]> => {
  const urlParts = repositoryUrl.replace('https://github.com/', '').split('/');
  const owner = urlParts[0];
  const repo = urlParts[1];
  
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) return [];
    
    const contents = await response.json();
    const javaFiles: string[] = [];
    
    for (const item of contents) {
      if (item.type === 'file' && item.name.endsWith('.java')) {
        // Controller 파일인지 확인
        if (item.name.includes('Controller') || item.path.includes('controller')) {
          const fileResponse = await fetch(item.download_url);
          const fileContent = await fileResponse.text();
          javaFiles.push(fileContent);
        }
      } else if (item.type === 'dir' && !item.name.startsWith('.')) {
        // 하위 디렉터리 재귀 탐색
        const subFiles = await findJavaFiles(repositoryUrl, item.path);
        javaFiles.push(...subFiles);
      }
    }
    
    return javaFiles;
  } catch (error) {
    console.error(`Failed to fetch files from ${path}:`, error);
    return [];
  }
};

// AI API 호출 (Gemini)
const callGeminiAPI = async (apiKey: string, prompt: string): Promise<string> => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw error;
  }
};

// AI API 호출 (OpenAI)
const callOpenAIAPI = async (apiKey: string, prompt: string): Promise<string> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert API documentation generator. Analyze the provided Java Spring Boot code and generate comprehensive API documentation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    throw error;
  }
};

// 실제 Repository 분석 함수
export const analyzeRepository = async (
  repositoryUrl: string,
  aiModel: 'gemini' | 'openai',
  apiKey: string,
  onProgress?: (step: string, description: string) => void
): Promise<AnalysisResult> => {
  
  console.log('Starting repository analysis:', repositoryUrl);
  
  try {
    // 1단계: Repository 구조 확인
    onProgress?.('clone', 'GitHub Repository에서 파일 구조를 가져오는 중...');
    const contents = await fetchRepositoryContents(repositoryUrl);
    
    // 2단계: Java Controller 파일들 찾기
    onProgress?.('scan', '프로젝트 구조를 분석하고 Controller 파일들을 찾는 중...');
    const javaFiles = await findJavaFiles(repositoryUrl);
    
    if (javaFiles.length === 0) {
      throw new Error('Java Controller 파일을 찾을 수 없습니다. Spring Boot 프로젝트인지 확인해주세요.');
    }
    
    // 3단계: AI 분석을 위한 프롬프트 생성
    onProgress?.('extract', 'AI 모델이 코드를 분석할 수 있도록 데이터를 준비 중...');
    
    const codeAnalysisPrompt = `
다음은 Spring Boot 프로젝트의 Controller 파일들입니다. 이 코드를 분석하여 REST API 명세서를 생성해주세요.

Controller 파일들:
${javaFiles.map((file, index) => `
=== Controller File ${index + 1} ===
${file}
`).join('\n')}

다음 형식으로 분석 결과를 JSON으로 반환해주세요:
{
  "projectName": "프로젝트 이름",
  "description": "프로젝트 설명",
  "endpoints": [
    {
      "method": "HTTP 메소드 (GET, POST, PUT, DELETE 등)",
      "path": "API 경로 (예: /api/users/{id})",
      "description": "엔드포인트 설명",
      "parameters": [
        {
          "name": "파라미터 이름",
          "type": "path | query | header",
          "dataType": "데이터 타입",
          "required": true/false,
          "description": "파라미터 설명"
        }
      ],
      "requestBody": {
        "contentType": "application/json",
        "schema": {},
        "example": {}
      },
      "responses": [
        {
          "statusCode": 200,
          "description": "응답 설명",
          "example": {}
        }
      ]
    }
  ]
}

주의사항:
- @RestController, @Controller, @RequestMapping, @GetMapping, @PostMapping 등의 어노테이션을 분석해주세요
- PathVariable, RequestParam, RequestBody 등을 파라미터로 추출해주세요
- 응답 타입과 상태코드를 추론해주세요
- 가능한 한 상세하고 정확한 분석을 해주세요
`;

    // 4단계: AI API 호출
    onProgress?.('ai-analyze', 'AI 모델이 코드 구조를 분석하고 API 명세를 생성 중...');
    
    let aiResponse: string;
    if (aiModel === 'gemini') {
      aiResponse = await callGeminiAPI(apiKey, codeAnalysisPrompt);
    } else {
      aiResponse = await callOpenAIAPI(apiKey, codeAnalysisPrompt);
    }
    
    // 5단계: AI 응답 파싱
    onProgress?.('generate', 'AI 분석 결과를 처리하고 최종 명세서를 생성 중...');
    
    // JSON 추출 (AI 응답에서 JSON 부분만 추출)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 응답에서 유효한 JSON을 찾을 수 없습니다.');
    }
    
    const analysisResult = JSON.parse(jsonMatch[0]);
    
    console.log('Analysis completed successfully:', analysisResult);
    return analysisResult;
    
  } catch (error) {
    console.error('Repository analysis failed:', error);
    throw error;
  }
};

// 분석 결과를 Markdown으로 변환
export const convertToMarkdown = (result: AnalysisResult): string => {
  let markdown = `# ${result.projectName} API 명세서\n\n`;
  
  if (result.description) {
    markdown += `## 개요\n${result.description}\n\n`;
  }
  
  markdown += `## API 엔드포인트\n\n`;
  
  result.endpoints.forEach(endpoint => {
    markdown += `### ${endpoint.method} ${endpoint.path}\n\n`;
    
    if (endpoint.description) {
      markdown += `**설명**: ${endpoint.description}\n\n`;
    }
    
    if (endpoint.parameters && endpoint.parameters.length > 0) {
      markdown += `**파라미터**:\n`;
      endpoint.parameters.forEach(param => {
        const required = param.required ? '(필수)' : '(선택)';
        markdown += `- \`${param.name}\` (${param.type}) ${required}: ${param.description || '설명 없음'}\n`;
      });
      markdown += `\n`;
    }
    
    if (endpoint.requestBody) {
      markdown += `**요청 본문**:\n`;
      markdown += `\`\`\`json\n${JSON.stringify(endpoint.requestBody.example || endpoint.requestBody.schema, null, 2)}\n\`\`\`\n\n`;
    }
    
    if (endpoint.responses && endpoint.responses.length > 0) {
      markdown += `**응답**:\n`;
      endpoint.responses.forEach(response => {
        markdown += `**${response.statusCode}**: ${response.description}\n`;
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
