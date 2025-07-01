
export const generateAnalysisPrompt = (javaFiles: string[]): string => {
  return `
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
- 반드시 유효한 JSON 형식으로 반환해주세요
`;
};
