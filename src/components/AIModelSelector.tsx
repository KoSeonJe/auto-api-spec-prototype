
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Zap, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type AIModel = 'gemini' | 'openai';

interface AIModelSelectorProps {
  value: AIModel;
  onChange: (value: AIModel) => void;
}

const AIModelSelector: React.FC<AIModelSelectorProps> = ({ value, onChange }) => {
  const models = [
    {
      id: 'gemini' as AIModel,
      name: 'Google Gemini',
      description: '빠르고 정확한 코드 분석',
      icon: <Zap className="h-4 w-4" />,
      badge: 'Recommended',
      badgeColor: 'bg-green-500/20 text-green-300 border-green-500/30'
    },
    {
      id: 'openai' as AIModel,
      name: 'OpenAI GPT',
      description: '상세한 명세서 생성',
      icon: <Brain className="h-4 w-4" />,
      badge: 'Premium',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    }
  ];

  return (
    <div className="space-y-4">
      <Label className="text-slate-300 flex items-center gap-2">
        <Star className="h-4 w-4" />
        AI 모델 선택
      </Label>
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
          <SelectValue placeholder="AI 모델을 선택하세요" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-600">
          {models.map((model) => (
            <SelectItem
              key={model.id}
              value={model.id}
              className="text-white hover:bg-slate-700 focus:bg-slate-700"
            >
              <div className="flex items-center gap-3 w-full">
                {model.icon}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{model.name}</span>
                    <Badge variant="secondary" className={model.badgeColor}>
                      {model.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">{model.description}</p>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Selected Model Info */}
      <Card className="bg-slate-700/30 border-slate-600">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            {models.find(m => m.id === value)?.icon}
            <div>
              <h4 className="text-sm font-medium text-slate-300">
                {models.find(m => m.id === value)?.name}
              </h4>
              <p className="text-sm text-slate-400 mt-1">
                {models.find(m => m.id === value)?.description}
              </p>
              <div className="mt-2 text-xs text-slate-500">
                {value === 'gemini' && (
                  <span>Google AI Studio에서 무료 API 키를 발급받을 수 있습니다.</span>
                )}
                {value === 'openai' && (
                  <span>OpenAI 플랫폼에서 API 키를 발급받아야 합니다.</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIModelSelector;
