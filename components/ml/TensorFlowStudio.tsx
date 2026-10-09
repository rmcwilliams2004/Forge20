import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Code2, 
  Play, 
  Download, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Layers, 
  Sparkles, 
  Terminal, 
  Cpu, 
  Flame,
  Activity,
  HardDrive
} from 'lucide-react';
import { TensorFlowModelConfig, TensorFlowLayer, TensorFlowLayerType } from '../../types';
import { DEFAULT_TENSORFLOW_MODEL } from '../../constants';
import { dispatchMilestoneAlert } from '../../services/notificationService';

interface TensorFlowStudioProps {
  onTriggerComputeEvent?: (type: string, details: string, cost: number) => void;
  className?: string;
}

export const TensorFlowStudio: React.FC<TensorFlowStudioProps> = ({
  onTriggerComputeEvent,
  className = ''
}) => {
  const [modelConfig, setModelConfig] = useState<TensorFlowModelConfig>(DEFAULT_TENSORFLOW_MODEL);
  const [activeTab, setActiveTab] = useState<'architecture' | 'code' | 'export' | 'train'>('architecture');
  const [isCopied, setIsCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'saved_model' | 'tflite' | 'tfjs'>('saved_model');
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // Calculate parameters
  const totalParameters = useMemo(() => {
    return modelConfig.layers.reduce((sum, layer) => sum + (layer.paramCount || 0), 0);
  }, [modelConfig.layers]);

  // Generated Python code for TensorFlow & Keras
  const generatedKerasCode = useMemo(() => {
    return `import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import datetime

print(f"[TensorFlow Version]: {tf.__version__}")
print(f"[Available Devices]: {tf.config.list_physical_devices()}")

# -------------------------------------------------------------
# Model Definition: ${modelConfig.name} (${modelConfig.modelType})
# Total Parameters: ${totalParameters.toLocaleString()}
# -------------------------------------------------------------
model = keras.Sequential([
${modelConfig.layers.map((l, i) => {
  if (l.type === 'Conv2D') {
    const isFirst = i === 0;
    return `    layers.Conv2D(filters=${l.params.filters}, kernel_size=${l.params.kernel_size}, activation='${l.params.activation || 'relu'}'${isFirst ? `, input_shape=(64, 64, 3)` : ''}),`;
  }
  if (l.type === 'MaxPooling2D') return `    layers.MaxPooling2D(pool_size=(2, 2)),`;
  if (l.type === 'BatchNormalization') return `    layers.BatchNormalization(),`;
  if (l.type === 'GlobalAveragePooling2D') return `    layers.GlobalAveragePooling2D(),`;
  if (l.type === 'Flatten') return `    layers.Flatten(),`;
  if (l.type === 'Dropout') return `    layers.Dropout(rate=${l.params.rate || 0.25}),`;
  if (l.type === 'Dense') return `    layers.Dense(units=${l.params.units}, activation='${l.params.activation || 'softmax'}'),`;
  return `    # ${l.type}`;
}).join('\n')}
], name="${modelConfig.name}")

# Compile Model with Optimizer & Metrics
model.compile(
    optimizer=keras.optimizers.${modelConfig.optimizer.toUpperCase()}(learning_rate=${modelConfig.learningRate}),
    loss='${modelConfig.loss}',
    metrics=['accuracy', 'top_k_categorical_accuracy']
)

model.summary()

# -------------------------------------------------------------
# TensorBoard Callbacks & Pipeline
# -------------------------------------------------------------
log_dir = "${modelConfig.logDir}" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
tensorboard_callback = keras.callbacks.TensorBoard(
    log_dir=log_dir,
    histogram_freq=1,
    write_graph=True,
    write_images=True,
    update_freq='epoch',
    profile_batch='10, 20'  # Enable Profiler plugin
)

early_stopping = keras.callbacks.EarlyStopping(
    monitor='val_loss',
    patience=4,
    restore_best_weights=True
)

# Export Pipelines:
# 1. SavedModel Format
model.save("${modelConfig.name.toLowerCase()}_savedmodel")

# 2. TFLite Quantized Edge Converter
converter = tf.lite.TFLiteConverter.from_saved_model("${modelConfig.name.toLowerCase()}_savedmodel")
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()
with open("${modelConfig.name.toLowerCase()}.tflite", "wb") as f:
    f.write(tflite_model)
print("[TFLite]: Quantized model exported for edge robotics and microcontrollers.")
`;
  }, [modelConfig, totalParameters]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedKerasCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([generatedKerasCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${modelConfig.name.toLowerCase()}_keras.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddLayer = (type: TensorFlowLayerType) => {
    const newId = `tf-${Date.now()}`;
    let newLayer: TensorFlowLayer;

    switch (type) {
      case 'Conv2D':
        newLayer = { id: newId, type: 'Conv2D', params: { filters: 128, kernel_size: 3, activation: 'relu' }, inputShape: '(None, 31, 31, 64)', outputShape: '(None, 29, 29, 128)', paramCount: 73856 };
        break;
      case 'Dense':
        newLayer = { id: newId, type: 'Dense', params: { units: 128, activation: 'relu' }, inputShape: '(None, 64)', outputShape: '(None, 128)', paramCount: 8320 };
        break;
      case 'Dropout':
        newLayer = { id: newId, type: 'Dropout', params: { rate: 0.4 }, inputShape: '(None, 128)', outputShape: '(None, 128)', paramCount: 0 };
        break;
      case 'BatchNormalization':
        newLayer = { id: newId, type: 'BatchNormalization', params: {}, inputShape: '(None, 128)', outputShape: '(None, 128)', paramCount: 256 };
        break;
      default:
        newLayer = { id: newId, type, params: {}, paramCount: 0 };
    }

    setModelConfig(prev => ({
      ...prev,
      layers: [...prev.layers, newLayer]
    }));
  };

  const handleRemoveLayer = (id: string) => {
    setModelConfig(prev => ({
      ...prev,
      layers: prev.layers.filter(l => l.id !== id)
    }));
  };

  const handleSimulateTraining = () => {
    setIsTraining(true);
    setCurrentEpoch(0);
    setLogs([
      `[TensorFlow 2.16 / Keras 3]: Compiling graph with XLA JIT optimization...`,
      `[TensorFlow]: Initializing TensorBoard callback at ${modelConfig.logDir}`,
      `[TensorFlow]: Training on batch_size=${modelConfig.batchSize}, total_params=${totalParameters.toLocaleString()}`
    ]);

    let epoch = 0;
    let loss = 0.88;
    let acc = 0.65;
    const interval = setInterval(() => {
      epoch++;
      loss = Math.max(0.015, +(loss * 0.86 + (Math.random() - 0.5) * 0.02).toFixed(4));
      acc = Math.min(0.994, +(acc + (1 - acc) * 0.2 + (Math.random() - 0.5) * 0.01).toFixed(4));
      setCurrentEpoch(epoch);
      setLogs(prev => [
        ...prev,
        `Epoch ${epoch}/${modelConfig.epochs} - ${Math.round(epoch * 45)}ms/step - loss: ${loss} - accuracy: ${acc} - val_loss: ${(loss * 1.05).toFixed(4)} - val_accuracy: ${(acc * 0.98).toFixed(4)}`
      ]);

      if (epoch >= modelConfig.epochs) {
        clearInterval(interval);
        setIsTraining(false);
        setLogs(prev => [
          ...prev,
          `[TensorFlow]: Model weights saved to SavedModel artifact.`,
          `[TensorBoard]: SummaryWriter flushed event log to ${modelConfig.logDir}`
        ]);

        if (onTriggerComputeEvent) {
          onTriggerComputeEvent(
            'TENSORFLOW_MODEL_CONVERGED',
            `TensorFlow Keras model "${modelConfig.name}" converged with final accuracy ${(acc * 100).toFixed(2)}%.`,
            10.0
          );
        }

        dispatchMilestoneAlert({
          type: 'TENSORFLOW_MODEL_CONVERGED',
          title: 'TensorFlow Model Training Finished',
          description: `Keras model "${modelConfig.name}" reached ${(acc * 100).toFixed(1)}% accuracy.`,
          cost: 10.0,
          status: 'VERIFIED'
        });
      }
    }, 400);
  };

  return (
    <div className={`flex flex-col bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-2 flex items-center justify-center shadow-lg shadow-amber-950/40">
            <Box className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white uppercase font-mono">TensorFlow & Keras Forge</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                TensorFlow 2.16 (Keras 3)
              </span>
            </div>
            <p className="text-xs text-slate-400">Sequential & Functional Deep Learning Studio, TensorBoard Callbacks & TFLite Exporter</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'architecture', label: 'Layers', icon: Layers },
            { id: 'code', label: 'Python Code', icon: Code2 },
            { id: 'export', label: 'Edge & TFLite', icon: HardDrive },
            { id: 'train', label: 'Keras Training', icon: Terminal }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition font-mono ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase block">Total Params</span>
            <span className="text-amber-400 font-bold">{totalParameters.toLocaleString()}</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase block">API Style</span>
            <span className="text-cyan-400 font-bold">{modelConfig.modelType}</span>
          </div>
        </div>
      </header>

      {/* Body Content */}
      <div className="p-6">
        {/* 1. ARCHITECTURE TAB */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider font-mono text-slate-200">
                  Keras Layers Pipeline
                </h3>
                <p className="text-xs text-slate-400">Configure convolutional, dense, normalization, and regularization layers.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(['Conv2D', 'BatchNormalization', 'Dropout', 'Dense'] as TensorFlowLayerType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => handleAddLayer(type)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono transition"
                  >
                    <Plus className="w-3 h-3 text-amber-400" />
                    <span>+{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Layer Table */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-12">#</th>
                    <th className="p-3">Layer Type</th>
                    <th className="p-3">Parameters & Hyperparameters</th>
                    <th className="p-3">Input Shape</th>
                    <th className="p-3">Output Shape</th>
                    <th className="p-3">Weights Count</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {modelConfig.layers.map((layer, idx) => (
                    <tr key={layer.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-200 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        layers.{layer.type}
                      </td>
                      <td className="p-3 text-slate-300">
                        {Object.entries(layer.params).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(', ') || 'default'}
                      </td>
                      <td className="p-3 text-amber-400">{layer.inputShape || '-'}</td>
                      <td className="p-3 text-emerald-400">{layer.outputShape || '-'}</td>
                      <td className="p-3 text-slate-400 font-bold">{layer.paramCount?.toLocaleString() || 0}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleRemoveLayer(layer.id)}
                          className="text-slate-500 hover:text-red-400 transition p-1"
                          title="Remove layer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Optimizer</label>
                <select
                  value={modelConfig.optimizer}
                  onChange={e => setModelConfig({ ...modelConfig, optimizer: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="adam">tf.keras.optimizers.Adam</option>
                  <option value="adamw">tf.keras.optimizers.AdamW</option>
                  <option value="sgd">tf.keras.optimizers.SGD</option>
                  <option value="rmsprop">tf.keras.optimizers.RMSprop</option>
                </select>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Loss Function</label>
                <input
                  type="text"
                  value={modelConfig.loss}
                  onChange={e => setModelConfig({ ...modelConfig, loss: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">TensorBoard Log Directory</label>
                <input
                  type="text"
                  value={modelConfig.logDir}
                  onChange={e => setModelConfig({ ...modelConfig, logDir: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. PYTHON CODE TAB */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold border border-slate-700 transition"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy TensorFlow Code'}</span>
              </button>

              <button
                onClick={handleDownloadCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-mono font-bold transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .py</span>
              </button>
            </div>

            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto shadow-2xl max-h-[500px]">
              <pre className="text-slate-200 whitespace-pre">
                <code>{generatedKerasCode}</code>
              </pre>
            </div>
          </div>
        )}

        {/* 3. EDGE & TFLITE EXPORT TAB */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider font-mono text-slate-200">
                Cross-Platform Deployment & Model Quantization
              </h3>
              <p className="text-xs text-slate-400">Export Keras architectures to lightweight, production-ready runtime binaries.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Box className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold font-mono text-slate-200">SavedModel Format</h4>
                <p className="text-[11px] text-slate-400">Complete standard TensorFlow model representation with computation graph and weights for server serving.</p>
                <button
                  onClick={() => alert("Model exported to SavedModel directory.")}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold border border-slate-700 transition"
                >
                  Export SavedModel
                </button>
              </div>

              <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold font-mono text-slate-200">TensorFlow Lite (TFLite)</h4>
                <p className="text-[11px] text-slate-400">INT8 and FP16 quantized model for embedded robotics, microcontrollers, and edge IoT devices.</p>
                <button
                  onClick={() => alert("TFLite quantized binary generated (.tflite).")}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition shadow-sm"
                >
                  Generate .tflite Binary
                </button>
              </div>

              <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold font-mono text-slate-200">TensorFlow.js (TFJS)</h4>
                <p className="text-[11px] text-slate-400">WebAssembly and WebGPU enabled weights for zero-latency client-side browser inference.</p>
                <button
                  onClick={() => alert("TensorFlow.js model shard created (model.json).")}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-mono font-bold transition shadow-sm"
                >
                  Export model.json Bundle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. TRAINING TAB */}
        {activeTab === 'train' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider font-mono text-slate-200">
                  Keras 3 Model Training & TensorBoard Logging
                </h3>
                <p className="text-xs text-slate-400">Execute training session with live telemetry streaming directly into TensorBoard.</p>
              </div>

              <button
                onClick={handleSimulateTraining}
                disabled={isTraining}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition shadow-lg ${
                  isTraining
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/40 hover:scale-[1.02]'
                }`}
              >
                {isTraining ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isTraining ? `Training Epoch ${currentEpoch}/${modelConfig.epochs}...` : 'Run model.fit()'}</span>
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs shadow-2xl h-64 overflow-y-auto space-y-1">
              <div className="text-slate-500 pb-2 border-b border-slate-900 text-[11px]">
                TensorFlow 2.16 Backend Logs (XLA JIT Accelerated)
              </div>
              {logs.length === 0 ? (
                <div className="text-slate-600 italic pt-4">No active training logs. Click "Run model.fit()" to start.</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-slate-300">
                    <span className="text-slate-600 mr-2">{'>'}</span>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
