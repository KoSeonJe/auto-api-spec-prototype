
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Github, Sparkles, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import RepositoryInput from '@/components/RepositoryInput';
import AIModelSelector from '@/components/AIModelSelector';
import APIKeyInput from '@/components/APIKeyInput';
import AnalysisProgress from '@/components/AnalysisProgress';
import SpecificationViewer from '@/components/SpecificationViewer';

type Step = 'input' | 'analyzing' | 'result';
type AIModel = 'gemini' | 'openai';

interface ProjectData {
  repositoryUrl: string;
  aiModel: AIModel;
  apiKey: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [projectData, setProjectData] = useState<ProjectData>({
    repositoryUrl: '',
    aiModel: 'gemini',
    apiKey: ''
  });
  const [generatedSpec, setGeneratedSpec] = useState<string>('');

  const handleInputComplete = (data: ProjectData) => {
    setProjectData(data);
    setCurrentStep('analyzing');
    
    // 실제 분석 시뮬레이션 (프로토타입용)
    setTimeout(() => {
      const mockSpec = `# API 명세서

## 프로젝트: ${data.repositoryUrl.split('/').pop()}

### 개요
자동 생성된 API 명세서입니다.

### 엔드포인트

#### GET /api/users
**설명**: 사용자 목록 조회
**응답**:
\`\`\`json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
\`\`\`

#### POST /api/users
**설명**: 새 사용자 생성
**요청**:
\`\`\`json
{
  "name": "string",
  "email": "string"
}
\`\`\`

**응답**:
\`\`\`json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-01T00:00:00Z"
}
\`\`\`

#### PUT /api/users/{id}
**설명**: 사용자 정보 수정
**파라미터**: 
- id (path): 사용자 ID

**요청**:
\`\`\`json
{
  "name": "string",
  "email": "string"
}
\`\`\`

#### DELETE /api/users/{id}
**설명**: 사용자 삭제
**파라미터**:
- id (path): 사용자 ID

**응답**: 204 No Content
`;
      setGeneratedSpec(mockSpec);
      setCurrentStep('result');
    }, 3000);
  };

  const resetProcess = () => {
    setCurrentStep('input');
    setProjectData({
      repositoryUrl: '',
      aiModel: 'gemini',
      apiKey: ''
    });
    setGeneratedSpec('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">API Spec Generator</h1>
            </div>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              Prototype
            </Badge>
          </div>
          <p className="text-slate-400 mt-2">
            GitHub Repository를 분석하여 자동으로 API 명세서를 생성합니다
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center space-x-8 mb-8">
          <div className={`flex items-center gap-2 ${currentStep === 'input' ? 'text-blue-400' : currentStep === 'analyzing' || currentStep === 'result' ? 'text-green-400' : 'text-slate-500'}`}>
            {currentStep === 'analyzing' || currentStep === 'result' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Github className="h-5 w-5" />
            )}
            <span className="font-medium">Repository 설정</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-500" />
          <div className={`flex items-center gap-2 ${currentStep === 'analyzing' ? 'text-blue-400' : currentStep === 'result' ? 'text-green-400' : 'text-slate-500'}`}>
            {currentStep === 'result' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            <span className="font-medium">AI 분석</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-500" />
          <div className={`flex items-center gap-2 ${currentStep === 'result' ? 'text-blue-400' : 'text-slate-500'}`}>
            <FileText className="h-5 w-5" />
            <span className="font-medium">명세서 생성</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'input' && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Github className="h-5 w-5 text-blue-400" />
                  프로젝트 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RepositoryInput
                  value={projectData.repositoryUrl}
                  onChange={(url) => setProjectData(prev => ({ ...prev, repositoryUrl: url }))}
                />
                <AIModelSelector
                  value={projectData.aiModel}
                  onChange={(model) => setProjectData(prev => ({ ...prev, aiModel: model }))}
                />
                <APIKeyInput
                  aiModel={projectData.aiModel}
                  value={projectData.apiKey}
                  onChange={(key) => setProjectData(prev => ({ ...prev, apiKey: key }))}
                />
                <Button
                  onClick={() => handleInputComplete(projectData)}
                  disabled={!projectData.repositoryUrl || !projectData.apiKey}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  API 명세서 생성하기
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 'analyzing' && (
            <AnalysisProgress repositoryUrl={projectData.repositoryUrl} />
          )}

          {currentStep === 'result' && (
            <SpecificationViewer
              specification={generatedSpec}
              onReset={resetProcess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
