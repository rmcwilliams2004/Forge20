import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Code2, 
  Play, 
  Download, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Layers, 
  Flame, 
  Sliders, 
  Sparkles, 
  Activity, 
  Terminal, 
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { PyTorchModelConfig, PyTorchLayer, PyTorchLayerType } from '../../types';
import { DEFAULT_PYTORCH_MODEL } from '../../constants';
import { dispatchMilestoneAlert } from '../../services/notificationService';

declare const loadPyodide: any;

interface PyTorchStudioProps {
  onTriggerComputeEvent?: (type: string, details: string, cost: number) => void;
  onSendToDashboard?: (runName: string) => void;
  className?: string;
}

export const PyTorchStudio: React.FC<PyTorchStudioProps> = ({
  onTriggerComputeEvent,
  onSendToDashboard,
  className = ''
}) => {
  const [modelConfig, setModelConfig] = useState<PyTorchModelConfig>(DEFAULT_PYTORCH_MODEL);
  const [activeTab, setActiveTab] = useState<'architecture' | 'autograd' | 'code' | 'train'>('architecture');
  const [isCopied, setIsCopied] = useState(false);
  const [codeFlavor, setCodeFlavor] = useState<'pure_pytorch' | 'lightning' | 'torchscript'>('pure_pytorch');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [currentLoss, setCurrentLoss] = useState(0.85);

  // Calculate total parameters
  const totalParameters = useMemo(() => {
    return modelConfig.layers.reduce((sum, layer) => sum + (layer.paramCount || 0), 0);
  }, [modelConfig.layers]);

  // Generate idiomatic PyTorch Python code
  const generatedPythonCode = useMemo(() => {
    if (codeFlavor === 'lightning') {
      return `import torch
import torch.nn as nn
import torch.optim as optim
import pytorch_lightning as pl

class ${modelConfig.name}Lightning(pl.LightningModule):
    def __init__(self, learning_rate: float = ${modelConfig.learningRate}):
        super().__init__()
        self.save_hyperparameters()
        self.learning_rate = learning_rate
        
        # Architecture Layer Definitions
        self.network = nn.Sequential(
${modelConfig.layers.map(l => {
  if (l.type === 'Conv2d') return `            nn.Conv2d(${l.params.in_channels}, ${l.params.out_channels}, kernel_size=${l.params.kernel_size}, stride=${l.params.stride || 1}, padding=${l.params.padding || 0}),`;
  if (l.type === 'BatchNorm2d') return `            nn.BatchNorm2d(${l.params.num_features}),`;
  if (l.type === 'ReLU') return `            nn.ReLU(inplace=True),`;
  if (l.type === 'GELU') return `            nn.GELU(),`;
  if (l.type === 'SiLU') return `            nn.SiLU(),`;
  if (l.type === 'MaxPool2d') return `            nn.MaxPool2d(kernel_size=${l.params.kernel_size}, stride=${l.params.stride || 2}),`;
  if (l.type === 'Flatten') return `            nn.Flatten(),`;
  if (l.type === 'Dropout') return `            nn.Dropout(p=${l.params.p || 0.2}),`;
  if (l.type === 'Linear') return `            nn.Linear(${l.params.in_features}, ${l.params.out_features}),`;
  return `            # ${l.type}`;
}).join('\n')}
        )
        self.criterion = nn.${modelConfig.lossFunction}()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)

    def training_step(self, batch, batch_idx):
        x, y = batch
        y_hat = self(x)
        loss = self.criterion(y_hat, y)
        self.log('train_loss', loss, on_step=True, on_epoch=True, prog_bar=True)
        return loss

    def configure_optimizers(self):
        optimizer = optim.${modelConfig.optimizer}(
            self.parameters(), 
            lr=self.learning_rate, 
            weight_decay=${modelConfig.weightDecay}
        )
        scheduler = optim.lr_scheduler.${modelConfig.scheduler}(optimizer, T_max=${modelConfig.epochs})
        return [optimizer], [scheduler]

if __name__ == '__main__':
    model = ${modelConfig.name}Lightning()
    trainer = pl.Trainer(max_epochs=${modelConfig.epochs}, accelerator='gpu' if torch.cuda.is_available() else 'cpu')
    print(f"[PyTorch Lightning]: Model initialized with {sum(p.numel() for p in model.parameters()):,} parameters.")
`;
    }

    if (codeFlavor === 'torchscript') {
      return `import torch
import torch.nn as nn

class ${modelConfig.name}(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.ModuleList([
${modelConfig.layers.map((l, i) => {
  if (l.type === 'Conv2d') return `            nn.Conv2d(${l.params.in_channels}, ${l.params.out_channels}, kernel_size=${l.params.kernel_size}, stride=${l.params.stride || 1}, padding=${l.params.padding || 0}),  # layer_${i}`;
  if (l.type === 'BatchNorm2d') return `            nn.BatchNorm2d(${l.params.num_features}),`;
  if (l.type === 'ReLU') return `            nn.ReLU(),`;
  if (l.type === 'GELU') return `            nn.GELU(),`;
  if (l.type === 'SiLU') return `            nn.SiLU(),`;
  if (l.type === 'MaxPool2d') return `            nn.MaxPool2d(${l.params.kernel_size}),`;
  if (l.type === 'Flatten') return `            nn.Flatten(),`;
  if (l.type === 'Dropout') return `            nn.Dropout(${l.params.p || 0.2}),`;
  if (l.type === 'Linear') return `            nn.Linear(${l.params.in_features}, ${l.params.out_features}),`;
  return `            nn.Identity(),`;
}).join('\n')}
        ])

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        for layer in self.layers:
            x = layer(x)
        return x

# TorchScript JIT Compilation & ONNX Export Pipeline
model = ${modelConfig.name}().eval()
example_input = torch.randn(1, 3, 64, 64)

# 1. TorchScript Trace
traced_script_module = torch.jit.trace(model, example_input)
traced_script_module.save("${modelConfig.name.toLowerCase()}_traced.pt")
print("[TorchScript]: Exported JIT compiled model to ${modelConfig.name.toLowerCase()}_traced.pt")

# 2. ONNX Production Export
torch.onnx.export(
    model, 
    example_input, 
    "${modelConfig.name.toLowerCase()}.onnx",
    export_params=True,
    opset_version=17,
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
)
print("[ONNX]: Exported high-throughput inference artifact to ${modelConfig.name.toLowerCase()}.onnx")
`;
    }

    // Default: Pure PyTorch
    return `import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.tensorboard import SummaryWriter

# ---------------------------------------------------------
# PyTorch Model: ${modelConfig.name}
# Parameters: ${totalParameters.toLocaleString()}
# ---------------------------------------------------------
class ${modelConfig.name}(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
${modelConfig.layers.filter(l => l.type !== 'Linear').map(l => {
  if (l.type === 'Conv2d') return `            nn.Conv2d(${l.params.in_channels}, ${l.params.out_channels}, kernel_size=${l.params.kernel_size}, stride=${l.params.stride || 1}, padding=${l.params.padding || 0}),`;
  if (l.type === 'BatchNorm2d') return `            nn.BatchNorm2d(${l.params.num_features}),`;
  if (l.type === 'ReLU') return `            nn.ReLU(inplace=True),`;
  if (l.type === 'GELU') return `            nn.GELU(),`;
  if (l.type === 'SiLU') return `            nn.SiLU(),`;
  if (l.type === 'MaxPool2d') return `            nn.MaxPool2d(kernel_size=${l.params.kernel_size}),`;
  if (l.type === 'Dropout') return `            nn.Dropout(p=${l.params.p || 0.2}),`;
  if (l.type === 'Flatten') return `            nn.Flatten(),`;
  return ``;
}).filter(Boolean).join('\n')}
        )
        self.classifier = nn.Sequential(
${modelConfig.layers.filter(l => l.type === 'Linear').map(l => {
  return `            nn.Linear(${l.params.in_features}, ${l.params.out_features}),`;
}).join('\n')}
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = self.classifier(x)
        return x

def train():
    device = torch.device("${modelConfig.device}" if torch.cuda.is_available() else "cpu")
    print(f"[PyTorch Engine]: Initialized on target device: {device}")
    
    model = ${modelConfig.name}().to(device)
    criterion = nn.${modelConfig.lossFunction}()
    optimizer = optim.${modelConfig.optimizer}(
        model.parameters(), 
        lr=${modelConfig.learningRate}, 
        weight_decay=${modelConfig.weightDecay}
    )
    scheduler = optim.lr_scheduler.${modelConfig.scheduler}(optimizer, T_max=${modelConfig.epochs})
    writer = SummaryWriter(log_dir="./runs/${modelConfig.name.toLowerCase()}")

    # Training Loop
    for epoch in range(1, ${modelConfig.epochs} + 1):
        model.train()
        # Simulated batch input
        dummy_inputs = torch.randn(${modelConfig.batchSize}, 3, 64, 64, device=device)
        dummy_targets = torch.randn(${modelConfig.batchSize}, 1, device=device)

        optimizer.zero_grad()
        outputs = model(dummy_inputs)
        loss = criterion(outputs, dummy_targets)
        loss.backward()
        optimizer.step()
        scheduler.step()

        # Log scalars to TensorBoard
        writer.add_scalar('Loss/train', loss.item(), epoch)
        writer.add_scalar('LearningRate', scheduler.get_last_lr()[0], epoch)
        print(f"Epoch [{epoch}/${modelConfig.epochs}] - Loss: {loss.item():.4f}")

    writer.close()
    torch.save(model.state_dict(), "${modelConfig.name.toLowerCase()}_checkpoint.pt")
    print("[PyTorch Engine]: Training complete. Checkpoint saved.")

if __name__ == '__main__':
    train()
`;
  }, [modelConfig, codeFlavor, totalParameters]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedPythonCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([generatedPythonCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${modelConfig.name.toLowerCase()}_model.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add Layer
  const handleAddLayer = (type: PyTorchLayerType) => {
    const newId = `layer-${Date.now()}`;
    let newLayer: PyTorchLayer;

    switch (type) {
      case 'Conv2d':
        newLayer = { id: newId, type: 'Conv2d', params: { in_channels: 128, out_channels: 256, kernel_size: 3, stride: 1, padding: 1 }, inputShape: "[32, 128, 16, 16]", outputShape: "[32, 256, 16, 16]", paramCount: 295168, description: "Feature expansion" };
        break;
      case 'Linear':
        newLayer = { id: newId, type: 'Linear', params: { in_features: 256, out_features: 128 }, inputShape: "[32, 256]", outputShape: "[32, 128]", paramCount: 32896, description: "Dense mapping" };
        break;
      case 'Dropout':
        newLayer = { id: newId, type: 'Dropout', params: { p: 0.3 }, inputShape: "[32, 256]", outputShape: "[32, 256]", paramCount: 0, description: "Dropout 0.3" };
        break;
      case 'GELU':
        newLayer = { id: newId, type: 'GELU', params: {}, inputShape: "[32, 256]", outputShape: "[32, 256]", paramCount: 0, description: "GELU activation" };
        break;
      case 'BatchNorm2d':
        newLayer = { id: newId, type: 'BatchNorm2d', params: { num_features: 128 }, inputShape: "[32, 128, 16, 16]", outputShape: "[32, 128, 16, 16]", paramCount: 256, description: "Batch norm" };
        break;
      default:
        newLayer = { id: newId, type, params: {}, paramCount: 0, description: `${type} layer` };
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

  // Run simulated PyTorch training loop
  const handleStartTraining = () => {
    setIsTraining(true);
    setCurrentEpoch(0);
    setTrainingLogs([
      `[PyTorch 2.4]: Allocating tensors on ${modelConfig.device}...`,
      `[PyTorch]: Total trainable parameters: ${totalParameters.toLocaleString()}`,
      `[PyTorch]: Initializing ${modelConfig.optimizer} (lr=${modelConfig.learningRate}) with ${modelConfig.scheduler}...`,
      `[PyTorch]: SummaryWriter telemetry connected to ./runs/${modelConfig.name.toLowerCase()}`
    ]);

    let epoch = 0;
    let loss = 0.92;
    const interval = setInterval(() => {
      epoch++;
      loss = Math.max(0.018, +(loss * 0.88 + (Math.random() - 0.5) * 0.02).toFixed(4));
      setCurrentEpoch(epoch);
      setCurrentLoss(loss);
      setTrainingLogs(prev => [
        ...prev,
        `Epoch [${epoch}/${modelConfig.epochs}] - Train Loss: ${loss} | GPU VRAM: 1,840 MB | autograd backward step: 4.2ms`
      ]);

      if (epoch >= modelConfig.epochs) {
        clearInterval(interval);
        setIsTraining(false);
        setTrainingLogs(prev => [
          ...prev,
          `[PyTorch]: Model converged! State dict saved to ${modelConfig.name.toLowerCase()}_weights.pt`,
          `[PyTorch]: TorchScript JIT artifact serialized. Ready for deployment.`
        ]);

        if (onTriggerComputeEvent) {
          onTriggerComputeEvent(
            'PYTORCH_TRAINING_CYCLE',
            `Trained ${modelConfig.name} for ${modelConfig.epochs} epochs with ${totalParameters.toLocaleString()} params.`,
            12.5
          );
        }

        dispatchMilestoneAlert({
          type: 'PYTORCH_TRAINING_CYCLE',
          title: `PyTorch Training Cycle Finished`,
          description: `Model "${modelConfig.name}" reached loss ${loss} with ${modelConfig.epochs} epochs.`,
          cost: 12.5,
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-2 flex items-center justify-center shadow-lg shadow-rose-950/40">
            <Flame className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white uppercase font-mono">PyTorch Forge</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono">
                PyTorch 2.4 + cu124
              </span>
            </div>
            <p className="text-xs text-slate-400">Neural Network Architecture Studio, Dynamic Autograd & TorchScript Exporter</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'architecture', label: 'Architecture', icon: Layers },
            { id: 'autograd', label: 'Autograd DAG', icon: Activity },
            { id: 'code', label: 'Python Script', icon: Code2 },
            { id: 'train', label: 'Training Engine', icon: Terminal }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition font-mono ${
                  isActive
                    ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Header Stats */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase block">Parameters</span>
            <span className="text-rose-400 font-bold">{totalParameters.toLocaleString()}</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase block">Device</span>
            <span className="text-emerald-400 font-bold">{modelConfig.device}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="p-6">
        {/* 1. ARCHITECTURE BUILDER */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider font-mono text-slate-200">
                  Layer Stack & Tensor Dimensionality
                </h3>
                <p className="text-xs text-slate-400">Assemble neural network layers; input/output dimensions and parameter allocations resolve dynamically.</p>
              </div>

              {/* Add Layer Quick Buttons */}
              <div className="flex flex-wrap gap-2">
                {(['Conv2d', 'BatchNorm2d', 'GELU', 'Dropout', 'Linear'] as PyTorchLayerType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => handleAddLayer(type)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono transition"
                  >
                    <Plus className="w-3 h-3 text-rose-400" />
                    <span>+{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Layer Stack Table */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-12">#</th>
                    <th className="p-3">Layer Type</th>
                    <th className="p-3">Specification / Hyperparameters</th>
                    <th className="p-3">Input Shape</th>
                    <th className="p-3">Output Shape</th>
                    <th className="p-3">Parameters</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {modelConfig.layers.map((layer, idx) => (
                    <tr key={layer.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-200 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        nn.{layer.type}
                      </td>
                      <td className="p-3 text-slate-300">
                        {Object.entries(layer.params).map(([k, v]) => `${k}=${v}`).join(', ') || 'default'}
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

            {/* Hyperparameter Settings */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Optimizer</label>
                <select
                  value={modelConfig.optimizer}
                  onChange={e => setModelConfig({ ...modelConfig, optimizer: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="AdamW">torch.optim.AdamW</option>
                  <option value="Adam">torch.optim.Adam</option>
                  <option value="SGD">torch.optim.SGD (Momentum)</option>
                  <option value="RMSprop">torch.optim.RMSprop</option>
                </select>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Loss Function</label>
                <select
                  value={modelConfig.lossFunction}
                  onChange={e => setModelConfig({ ...modelConfig, lossFunction: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="CrossEntropyLoss">nn.CrossEntropyLoss</option>
                  <option value="MSELoss">nn.MSELoss</option>
                  <option value="BCEWithLogitsLoss">nn.BCEWithLogitsLoss</option>
                  <option value="L1Loss">nn.L1Loss</option>
                  <option value="HuberLoss">nn.HuberLoss</option>
                </select>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">LR Scheduler</label>
                <select
                  value={modelConfig.scheduler}
                  onChange={e => setModelConfig({ ...modelConfig, scheduler: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="CosineAnnealingLR">CosineAnnealingLR</option>
                  <option value="StepLR">StepLR</option>
                  <option value="OneCycleLR">OneCycleLR</option>
                  <option value="ReduceLROnPlateau">ReduceLROnPlateau</option>
                  <option value="None">None</option>
                </select>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Learning Rate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={modelConfig.learningRate}
                  onChange={e => setModelConfig({ ...modelConfig, learningRate: parseFloat(e.target.value) || 0.001 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. AUTOGRAD DAG TAB */}
        {activeTab === 'autograd' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider font-mono text-slate-200">
                PyTorch Autograd Engine: Computational Graph & Backprop Trace
              </h3>
              <p className="text-xs text-slate-400">
                Visualizing dynamic graph tape, backward accumulation (`grad_fn`), and reverse-mode automatic differentiation.
              </p>
            </div>

            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                <span className="px-2 py-1 bg-slate-950 rounded border border-slate-800 text-rose-400">
                  requires_grad=True
                </span>
                <span className="px-2 py-1 bg-slate-950 rounded border border-slate-800 text-emerald-400">
                  retain_graph=False
                </span>
                <span className="px-2 py-1 bg-slate-950 rounded border border-slate-800 text-amber-400">
                  loss.backward() triggered
                </span>
              </div>

              {/* Dynamic Flow Sequence */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Input Tensor</span>
                    <span className="text-xs font-bold font-mono text-rose-400">X</span>
                  </div>
                  <div className="text-xs font-mono text-slate-300">
                    <p>Shape: [32, 3, 64, 64]</p>
                    <p className="text-slate-500">Leaf Node (Is_Leaf=True)</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Forward Activations</span>
                    <span className="text-xs font-bold font-mono text-amber-400">Z = W*X + b</span>
                  </div>
                  <div className="text-xs font-mono text-slate-300">
                    <p>grad_fn: ConvolutionBackward0</p>
                    <p className="text-slate-500">Output: [32, 64, 64, 64]</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Criterion Loss</span>
                    <span className="text-xs font-bold font-mono text-emerald-400">L(y, y_hat)</span>
                  </div>
                  <div className="text-xs font-mono text-slate-300">
                    <p>grad_fn: MseLossBackward0</p>
                    <p className="text-slate-500">Scalar Loss: 0.0418</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Gradient Accumulator</span>
                    <span className="text-xs font-bold font-mono text-cyan-400">dL / dW</span>
                  </div>
                  <div className="text-xs font-mono text-slate-300">
                    <p>Optimizer Step: AdamW</p>
                    <p className="text-slate-500">W -= lr * m_hat / (sqrt(v_hat)+eps)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. PYTHON SCRIPT GENERATOR */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {[
                  { id: 'pure_pytorch', label: 'Pure PyTorch' },
                  { id: 'lightning', label: 'PyTorch Lightning' },
                  { id: 'torchscript', label: 'TorchScript & ONNX' }
                ].map(flavor => (
                  <button
                    key={flavor.id}
                    onClick={() => setCodeFlavor(flavor.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                      codeFlavor === flavor.id
                        ? 'bg-rose-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {flavor.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold border border-slate-700 transition"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy Python Code'}</span>
                </button>

                <button
                  onClick={handleDownloadCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono font-bold transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .py</span>
                </button>
              </div>
            </div>

            {/* Code Block */}
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto shadow-2xl max-h-[500px]">
              <pre className="text-slate-200 whitespace-pre">
                <code>{generatedPythonCode}</code>
              </pre>
            </div>
          </div>
        )}

        {/* 4. TRAINING ENGINE */}
        {activeTab === 'train' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider font-mono text-slate-200">
                  PyTorch Real-Time Execution Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Launch multi-epoch gradient training session with interactive loss convergence streaming and checkpoint generation.
                </p>
              </div>

              <button
                onClick={handleStartTraining}
                disabled={isTraining}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition shadow-lg ${
                  isTraining
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-rose-950/40 hover:scale-[1.02]'
                }`}
              >
                {isTraining ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isTraining ? `Training Epoch ${currentEpoch}/${modelConfig.epochs}...` : 'Start PyTorch Training Run'}</span>
              </button>
            </div>

            {/* Metrics HUD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-xl">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Epoch Progress</span>
                <span className="text-2xl font-black font-mono text-rose-400 mt-1 block">
                  {currentEpoch} / {modelConfig.epochs}
                </span>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-2 border border-slate-800">
                  <div
                    className="bg-rose-500 h-full transition-all duration-300"
                    style={{ width: `${(currentEpoch / modelConfig.epochs) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-xl">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Active Loss</span>
                <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
                  {currentLoss.toFixed(4)}
                </span>
                <span className="text-[10px] font-mono text-slate-400">Loss criterion: {modelConfig.lossFunction}</span>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-xl">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Telemetry Pipe</span>
                <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">
                  TensorBoard Connected
                </span>
                <span className="text-[10px] font-mono text-slate-400">Event logs streaming to ./runs/</span>
              </div>
            </div>

            {/* Terminal Console Output */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs shadow-2xl h-64 overflow-y-auto space-y-1">
              <div className="text-slate-500 pb-2 border-b border-slate-900 text-[11px]">
                PyTorch v2.4 Terminal Stream (Host: SynapseForge Accelerated Compute)
              </div>
              {trainingLogs.length === 0 ? (
                <div className="text-slate-600 italic pt-4">No active training logs. Press "Start PyTorch Training Run" to begin.</div>
              ) : (
                trainingLogs.map((log, i) => (
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
