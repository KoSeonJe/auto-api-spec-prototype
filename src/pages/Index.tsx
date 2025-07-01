
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileArchive, Sparkles, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import JarFileUpload from '@/components/JarFileUpload';
import AIModelSelector from '@/components/AIModelSelector';
import APIKeyInput from '@/components/APIKeyInput';
import AnalysisProgress from '@/components/AnalysisProgress';
import SpecificationViewer from '@/components/SpecificationViewer';
import { analyzeJarFile, convertToMarkdown } from '@/utils/apiAnalyzer';

type Step = 'input' | 'analyzing' | 'result';
type AIModel = 'gemini' | 'openai';

interface ProjectData {
  jarFile: File | null;
  aiModel: AIModel;
  apiKey: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [projectData, setProjectData] = useState<ProjectData>({
    jarFile: null,
    aiModel: 'gemini',
    apiKey: ''
  });
  const [generatedSpec, setGeneratedSpec] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>('');

  const handleInputComplete = async (data: ProjectData) => {
    if (!data.jarFile) return;
    
    setProjectData(data);
    setCurrentStep('analyzing');
    setIsAnalyzing(true);
    setAnalysisError('');
    
    try {
      console.log('Starting JAR analysis with data:', { fileName: data.jarFile.name, aiModel: data.aiModel });
      
      const analysisResult = await analyzeJarFile(
        data.jarFile,
        data.aiModel,
        data.apiKey,
        (step, description) => {
          console.log(`Analysis step: ${step} - ${description}`);
        }
      );
      
      const markdownSpec = convertToMarkdown(analysisResult);
      setGeneratedSpec(markdownSpec);
      setCurrentStep('result');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError(error instanceof Error ? error.message : 'JAR 파일 분석 중 오류가 발생했습니다.');
      setCurrentStep('input');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetProcess = () => {
    setCurrentStep('input');
    setProjectData({
      jarFile: null,
      aiModel: 'gemini',
      apiKey: ''
    });
    setGeneratedSpec('');
    setAnalysisError('');
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
            JAR 파일을 분석하여 자동으로 API 명세서를 생성합니다
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
              <FileArchive className="h-5 w-5" />
            )}
            <span className="font-medium">JAR 파일 업로드</span>
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
                  <FileArchive className="h-5 w-5 text-blue-400" />
                  프로젝트 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <JarFileUpload
                  selectedFile={projectData.jarFile}
                  onFileSelect={(file) => setProjectData(prev => ({ ...prev, jarFile: file }))}
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
                
                {analysisError && (
                  <div className="bg-red-900/20 border border-red-800 text-red-300 p-4 rounded-lg">
                    <p className="font-medium">분석 실패</p>
                    <p className="text-sm mt-1">{analysisError}</p>
                  </div>
                )}
                
                <Button
                  onClick={() => handleInputComplete(projectData)}
                  disabled={!projectData.jarFile || !projectData.apiKey || isAnalyzing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isAnalyzing ? '분석 중...' : 'API 명세서 생성하기'}
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 'analyzing' && (
            <AnalysisProgress repositoryUrl={projectData.jarFile?.name || 'JAR 파일'} />
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
