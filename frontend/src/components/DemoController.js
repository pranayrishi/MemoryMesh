import React, { useState } from 'react';
import { Play, Flame, UtensilsCrossed, Navigation, AlertTriangle, Zap, Film } from 'lucide-react';
import api from '../services/api';

function DemoController() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(null);
  const [continuousLoading, setContinuousLoading] = useState(false);

  const scenarios = [
    {
      id: 'meal_confusion',
      name: 'Meal Confusion',
      description: 'Patient confused about whether they ate lunch',
      icon: UtensilsCrossed,
      color: 'warning'
    },
    {
      id: 'stove_safety',
      name: 'Stove Safety',
      description: 'Burner on with no pot - critical safety issue',
      icon: Flame,
      color: 'danger'
    },
    {
      id: 'wandering',
      name: 'Wandering',
      description: 'Patient attempting to leave the house',
      icon: Navigation,
      color: 'warning'
    },
    {
      id: 'agitation',
      name: 'Agitation',
      description: 'Patient showing signs of distress',
      icon: AlertTriangle,
      color: 'danger'
    }
  ];

  const triggerScenario = async (scenarioId) => {
    setLoading(scenarioId);

    try {
      await api.triggerScenario(scenarioId);
      console.log(`Triggered scenario: ${scenarioId}`);
    } catch (error) {
      console.error('Error triggering scenario:', error);
    } finally {
      setLoading(null);
    }
  };

  const startContinuousDemo = async () => {
    setContinuousLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/demo/continuous/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      console.log('Continuous demo started:', data);
      setIsOpen(false); // Close panel when continuous demo starts
    } catch (error) {
      console.error('Error starting continuous demo:', error);
    } finally {
      setContinuousLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
      >
        <Zap className="w-6 h-6" />
      </button>

      {/* Demo Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-40">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Play className="w-5 h-5 mr-2 text-primary-600" />
                Demo Scenarios
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Click any scenario to see MemoryMesh in action
            </p>

            {/* Continuous Demo Button */}
            <button
              onClick={startContinuousDemo}
              disabled={continuousLoading}
              className="w-full mb-4 p-4 border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Film className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    🎬 Continuous Demo (~72s)
                  </h4>
                  <p className="text-xs text-gray-600">
                    3 scenarios × 24s each - Natural pacing
                  </p>
                </div>
                {continuousLoading && (
                  <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            </button>

            <div className="relative mb-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">or individual scenarios</span>
              </div>
            </div>

            <div className="space-y-3">
              {scenarios.map((scenario) => (
                <ScenarioButton
                  key={scenario.id}
                  scenario={scenario}
                  loading={loading === scenario.id}
                  onClick={() => triggerScenario(scenario.id)}
                />
              ))}
            </div>

            <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-xs text-primary-800">
                <strong>Demo Mode:</strong> These scenarios demonstrate MemoryMesh's AI-powered
                intervention system using Claude, Creao vision API, and voice synthesis.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ScenarioButton({ scenario, loading, onClick }) {
  const Icon = scenario.icon;

  const colorClasses = {
    warning: 'border-warning-200 hover:bg-warning-50',
    danger: 'border-danger-200 hover:bg-danger-50',
    primary: 'border-primary-200 hover:bg-primary-50'
  };

  const iconColorClasses = {
    warning: 'bg-warning-100 text-warning-600',
    danger: 'bg-danger-100 text-danger-600',
    primary: 'bg-primary-100 text-primary-600'
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full p-4 border-2 rounded-lg transition-all duration-200 text-left ${
        colorClasses[scenario.color]
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="flex items-start space-x-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColorClasses[scenario.color]}`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            {scenario.name}
          </h4>
          <p className="text-xs text-gray-600">
            {scenario.description}
          </p>
        </div>

        {loading && (
          <div className="flex-shrink-0">
            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </button>
  );
}

export default DemoController;
