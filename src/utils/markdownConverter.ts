
import { AnalysisResult } from '@/types/api';

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
