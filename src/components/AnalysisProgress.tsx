
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Github, 
  FolderOpen, 
  FileCode, 
  Brain, 
  FileText,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface AnalysisProgressProps {
  repositoryUrl: string;
  currentStep?: string;
  currentDescription?: string;
}

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ 
  repositoryUrl, 
  currentStep,
  currentDescription 
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps: ProgressStep[] = [
    {
      id: 'clone',
      title: 'Repository 접근',
      description: currentStep === 'clone' ? currentDescription || 'GitHub API를 통해 Repository에 접근 중...' : 'GitHub API를 통해 Repository에 접근 중...',
      icon: <Github className="h-4 w-4" />,
      completed: false,
      active: false
    },
    {
      id: 'scan',
      title: '프로젝트 구조 분석',
      description: currentStep === 'scan' ? currentDescription || '디렉터리 구조 및 파일 스캔 중...' : '디렉터리 구조 및 파일 스캔 중...',
      icon: <FolderOpen className="h-4 w-4" />,
      completed: false,
      active: false
    },
    {
      id: 'extract',
      title: 'Controller 파일 추출',
      description: currentStep === 'extract' ? currentDescription || 'Spring Boot Controller 파일들을 찾는 중...' : 'Spring Boot Controller 파일들을 찾는 중...',
      icon: <FileCode className="h-4 w-4" />,
      completed: false,
      active: false
    },
    {
      id: 'ai-analyze',
      title: 'AI 코드 분석',
      description: currentStep === 'ai-analyze' ? currentDescription || 'AI 모델이 코드를 분석하는 중...' : 'AI 모델이 코드를 분석하는 중...',
      icon: <Brain className="h-4 w-4" />,
      completed: false,
      active: false
    },
    {
      id: 'generate',
      title: '명세서 생성',
      description: currentStep === 'generate' ? currentDescription || 'Markdown 형식의 API 명세서 생성 중...' : 'Markdown 형식의 API 명세서 생성 중...',
      icon: <FileText className="h-4 w-4" />,
      completed: false,
      active: false
    }
  ];

  const [processSteps, setProcessSteps] = useState(steps);

  useEffect(() => {
    // 현재 단계에 따라 진행률 업데이트
    if (currentStep) {
      const stepIndex = steps.findIndex(step => step.id === currentStep);
      if (stepIndex !== -1) {
        const newProgress = ((stepIndex + 1) / steps.length) * 100;
        setProgress(newProgress);
        setCurrentStepIndex(stepIndex);
        setProcessSteps(prevSteps => 
          prevSteps.map((step, index) => ({
            ...step,
            completed: index < stepIndex,
            active: index === stepIndex,
            description: step.id === currentStep && currentDescription ? currentDescription : step.description
          }))
        );
      }
    } else {
      // 기본 진행률 시뮬레이션
      const timer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1;
          const stepProgress = newProgress / 20;
          const newStepIndex = Math.min(Math.floor(stepProgress), steps.length - 1);
          
          if (newStepIndex !== currentStepIndex) {
            setCurrentStepIndex(newStepIndex);
            setProcessSteps(prevSteps => 
              prevSteps.map((step, index) => ({
                ...step,
                completed: index < newStepIndex,
                active: index === newStepIndex
              }))
            );
          }
          
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 150);

      return () => clearInterval(timer);
    }
  }, [currentStep, currentDescription, currentStepIndex, steps.length]);

  const repositoryName = repositoryUrl.split('/').pop() || 'Unknown';

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-400" />
            AI 분석 진행 중
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Github className="h-4 w-4" />
            <span>{repositoryName}</span>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              분석 중
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">전체 진행률</span>
              <span className="text-slate-400">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-slate-700" />
          </div>

          <div className="space-y-4">
            {processSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-300 ${
                  step.active
                    ? 'bg-blue-500/10 border border-blue-500/30'
                    : step.completed
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-slate-700/30 border border-slate-600'
                }`}
              >
                <div className={`flex-shrink-0 p-2 rounded-full ${
                  step.active
                    ? 'bg-blue-500/20 text-blue-400'
                    : step.completed
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-600 text-slate-400'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : step.active ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium ${
                    step.active ? 'text-blue-300' : step.completed ? 'text-green-300' : 'text-slate-300'
                  }`}>
                    {step.title}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    step.active ? 'text-blue-400' : step.completed ? 'text-green-400' : 'text-slate-500'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-700/30 border-slate-600">
        <CardContent className="pt-4">
          <div className="text-center text-slate-400">
            <Brain className="h-8 w-8 mx-auto mb-2 text-blue-400" />
            <p className="text-sm">실제 Repository를 분석하고 AI가 코드를 해석하는 중입니다...</p>
            <p className="text-xs mt-1 text-slate-500">GitHub API 호출 및 AI 모델 응답 대기 중</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisProgress;
