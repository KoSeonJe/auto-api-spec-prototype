
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Key, Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type AIModel = 'gemini' | 'openai';

interface APIKeyInputProps {
  aiModel: AIModel;
  value: string;
  onChange: (value: string) => void;
}

const APIKeyInput: React.FC<APIKeyInputProps> = ({ aiModel, value, onChange }) => {
  const [showKey, setShowKey] = useState(false);

  const modelInfo = {
    gemini: {
      name: 'Google Gemini',
      placeholder: 'AIzaSy...',
      getKeyUrl: 'https://makersuite.google.com/app/apikey',
      description: 'Google AI Studio에서 무료로 발급 가능'
    },
    openai: {
      name: 'OpenAI GPT',
      placeholder: 'sk-...',
      getKeyUrl: 'https://platform.openai.com/api-keys',
      description: 'OpenAI 플랫폼 계정 필요'
    }
  };

  const currentModel = modelInfo[aiModel];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="api-key" className="text-slate-300 flex items-center gap-2">
          <Key className="h-4 w-4" />
          {currentModel.name} API Key
        </Label>
        <div className="relative">
          <Input
            id="api-key"
            type={showKey ? 'text' : 'password'}
            placeholder={currentModel.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? (
              <EyeOff className="h-4 w-4 text-slate-400" />
            ) : (
              <Eye className="h-4 w-4 text-slate-400" />
            )}
          </Button>
        </div>
      </div>

      <Alert className="bg-amber-900/20 border-amber-800 text-amber-300">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          API Key는 안전하게 처리되며 서버에 저장되지 않습니다. 분석 완료 후 자동으로 삭제됩니다.
        </AlertDescription>
      </Alert>

      <Card className="bg-slate-700/30 border-slate-600">
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-300">API Key 발급</h4>
                <p className="text-xs text-slate-400">{currentModel.description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => window.open(currentModel.getKeyUrl, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                발급받기
              </Button>
            </div>
            
            <div className="text-xs text-slate-500 space-y-1">
              <p>• API Key는 메모리에서만 사용되며 저장되지 않습니다</p>
              <p>• 분석이 완료되면 자동으로 삭제됩니다</p>
              <p>• 프로토타입 버전으로 최소한의 API 호출만 수행합니다</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIKeyInput;
