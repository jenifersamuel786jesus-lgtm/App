import React, { useState, useEffect } from 'react';
import { Scale, Ruler, User2, Calendar, Heart, Activity } from 'lucide-react';

interface BMICategory {
  range: string;
  status: string;
  color: string;
  advice: string;
}

function App() {
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(60);
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [bmi, setBmi] = useState<number>(0);
  const [minWeight, setMinWeight] = useState<number>(0);
  const [maxWeight, setMaxWeight] = useState<number>(0);

  const getBMICategory = (bmi: number): BMICategory => {
    if (bmi < 18.5) return {
      range: '偏瘦',
      status: '体重过轻',
      color: 'text-yellow-600',
      advice: '建议适当增加营养摄入，进行力量训练增加肌肉量。'
    };
    if (bmi < 24.9) return {
      range: '正常',
      status: '健康体重',
      color: 'text-green-600',
      advice: '继续保持健康的生活方式和均衡的饮食习惯。'
    };
    if (bmi < 29.9) return {
      range: '过重',
      status: '轻度肥胖',
      color: 'text-orange-600',
      advice: '建议控制饮食摄入，增加有氧运动频率。'
    };
    return {
      range: '肥胖',
      status: '重度肥胖',
      color: 'text-red-600',
      advice: '建议在医生指导下进行减重，注意控制饮食并坚持运动。'
    };
  };

  useEffect(() => {
    const heightInMeters = height / 100;
    const currentBMI = weight / (heightInMeters * heightInMeters);
    setBmi(Math.round(currentBMI * 10) / 10);

    // 基础BMI范围
    let minBMI = 18.5;
    let maxBMI = 24.9;

    // 根据年龄和性别调整BMI范围
    if (age > 65) {
      minBMI += 1;
      maxBMI += 1;
    }
    if (gender === 'female') {
      minBMI -= 0.5;
      maxBMI -= 0.5;
    }
    
    const minIdealWeight = Math.round(minBMI * heightInMeters * heightInMeters);
    const maxIdealWeight = Math.round(maxBMI * heightInMeters * heightInMeters);
    
    setMinWeight(minIdealWeight);
    setMaxWeight(maxIdealWeight);
  }, [height, weight, age, gender]);

  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Scale className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-800">智能体重计算器</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                性别
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setGender('male')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    gender === 'male'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  男性
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    gender === 'female'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  女性
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                年龄
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  min="1"
                  max="120"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                身高 (厘米)
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  min="100"
                  max="250"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                当前体重 (公斤)
              </label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  min="20"
                  max="300"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-indigo-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                身体质量指数 (BMI)
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">您的BMI：</span>
                  <span className={`font-bold text-xl ${bmiCategory.color}`}>
                    {bmi}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${Math.min((bmi / 40) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>偏瘦</span>
                  <span>正常</span>
                  <span>过重</span>
                  <span>肥胖</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-indigo-100 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-800">健康状态</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className={`font-medium ${bmiCategory.color}`}>
                    {bmiCategory.status}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {bmiCategory.advice}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    您的标准体重范围：
                    <span className="font-medium text-indigo-600">
                      {minWeight} - {maxWeight}
                    </span> 
                    公斤
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="text-red-500 w-4 h-4" />
                <h3 className="text-sm font-medium text-gray-700">健康提示</h3>
              </div>
              <p className="text-sm text-gray-600">
                BMI仅作为健康参考指标，不同年龄、性别和体型的人可能有所差异。
                建议结合专业医生的建议来评估您的健康状况。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;