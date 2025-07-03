
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { FileText, Settings, Eye } from 'lucide-react';
import { DocumentationTemplate, TemplateOption, CustomTemplate } from '@/types/templates';

interface TemplateSelectorProps {
  selectedTemplate: DocumentationTemplate;
  customTemplate?: CustomTemplate;
  onTemplateChange: (template: DocumentationTemplate) => void;
  onCustomTemplateChange: (template: CustomTemplate) => void;
}

const templateOptions: TemplateOption[] = [
  {
    id: 'basic',
    name: '기본 형식',
    description: '간단하고 명확한 API 문서',
    preview: '# API 명세서\n\n## 엔드포인트\n### GET /api/users\n**설명**: 사용자 목록 조회'
  },
  {
    id: 'detailed',
    name: '상세 형식',
    description: '파라미터, 응답 코드, 예시 포함',
    preview: '# API 명세서\n\n## 인증\nBearer Token 필요\n\n## 엔드포인트\n### GET /api/users\n**파라미터**:\n- page (query): 페이지 번호\n**응답 코드**:\n- 200: 성공\n- 401: 인증 실패'
  },
  {
    id: 'swagger',
    name: 'Swagger 형식',
    description: 'OpenAPI 3.0 스펙 준수',
    preview: 'openapi: 3.0.0\ninfo:\n  title: API\n  version: 1.0.0\npaths:\n  /api/users:\n    get:\n      summary: 사용자 목록 조회'
  },
  {
    id: 'postman',
    name: 'Postman 형식',
    description: 'Postman 컬렉션 형태',
    preview: '{\n  "info": {\n    "name": "API Collection"\n  },\n  "item": [\n    {\n      "name": "Get Users",\n      "request": {\n        "method": "GET",\n        "url": "/api/users"\n      }\n    }\n  ]\n}'
  },
  {
    id: 'custom',
    name: '사용자 정의',
    description: '원하는 형식으로 커스터마이징',
    preview: '사용자가 직접 정의한 형식'
  }
];

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  customTemplate,
  onTemplateChange,
  onCustomTemplateChange
}) => {
  const [previewTemplate, setPreviewTemplate] = useState<DocumentationTemplate | null>(null);

  const handleCustomTemplateUpdate = (field: keyof CustomTemplate, value: any) => {
    const updated = {
      name: customTemplate?.name || '',
      format: customTemplate?.format || '',
      sections: customTemplate?.sections || [],
      includeExamples: customTemplate?.includeExamples || false,
      includeErrorCodes: customTemplate?.includeErrorCodes || false,
      includeAuthentication: customTemplate?.includeAuthentication || false,
      ...{ [field]: value }
    };
    onCustomTemplateChange(updated);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-400" />
          문서화 템플릿 선택
        </CardTitle>
        <p className="text-slate-400 text-sm">
          생성될 API 문서의 형식을 선택하세요
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup 
          value={selectedTemplate} 
          onValueChange={(value) => onTemplateChange(value as DocumentationTemplate)}
        >
          {templateOptions.map((option) => (
            <div key={option.id} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option.id} 
                  id={option.id}
                  className="border-slate-600 text-blue-400"
                />
                <Label 
                  htmlFor={option.id}
                  className="text-slate-300 cursor-pointer flex-1"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{option.name}</span>
                      <p className="text-sm text-slate-400">{option.description}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewTemplate(previewTemplate === option.id ? null : option.id)}
                      className="text-slate-400 hover:text-slate-300"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </Label>
              </div>
              
              {previewTemplate === option.id && (
                <Card className="bg-slate-900/50 border-slate-600 ml-6">
                  <CardContent className="p-3">
                    <h4 className="text-slate-300 text-sm font-medium mb-2">미리보기</h4>
                    <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono">
                      {option.preview}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </RadioGroup>

        {selectedTemplate === 'custom' && (
          <Card className="bg-slate-900/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-slate-300 text-lg">사용자 정의 템플릿</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300">템플릿 이름</Label>
                <Input
                  value={customTemplate?.name || ''}
                  onChange={(e) => handleCustomTemplateUpdate('name', e.target.value)}
                  placeholder="나만의 템플릿"
                  className="bg-slate-800 border-slate-600 text-slate-300"
                />
              </div>
              
              <div>
                <Label className="text-slate-300">문서 형식</Label>
                <Textarea
                  value={customTemplate?.format || ''}
                  onChange={(e) => handleCustomTemplateUpdate('format', e.target.value)}
                  placeholder="원하는 문서 형식을 설명하세요..."
                  className="bg-slate-800 border-slate-600 text-slate-300 h-24"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">포함할 섹션</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="examples"
                      checked={customTemplate?.includeExamples || false}
                      onCheckedChange={(checked) => handleCustomTemplateUpdate('includeExamples', checked)}
                      className="border-slate-600"
                    />
                    <Label htmlFor="examples" className="text-slate-300 text-sm">
                      요청/응답 예시
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="errors"
                      checked={customTemplate?.includeErrorCodes || false}
                      onCheckedChange={(checked) => handleCustomTemplateUpdate('includeErrorCodes', checked)}
                      className="border-slate-600"
                    />
                    <Label htmlFor="errors" className="text-slate-300 text-sm">
                      에러 코드 설명
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auth"
                      checked={customTemplate?.includeAuthentication || false}
                      onCheckedChange={(checked) => handleCustomTemplateUpdate('includeAuthentication', checked)}
                      className="border-slate-600"
                    />
                    <Label htmlFor="auth" className="text-slate-300 text-sm">
                      인증 방법
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateSelector;
