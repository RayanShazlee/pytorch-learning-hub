import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Play,
  ArrowCounterClockwise,
  Copy,
  ArrowSquareOut,
  Spinner,
  Warning,
} from '@phosphor-icons/react'
import { PYTORCH_KEYWORDS, type KeywordExplanation } from './HoverableCode'

/**
 * In-browser Python playground powered by Pyodide.
 * - Loads Pyodide on demand (first Run click) from the CDN
 * - numpy is auto-loaded so tensor-style examples work
 * - PyTorch is NOT available in the browser (too large for WASM); for torch-specific
 *   code we provide a "Open in Colab" button that copies the code and opens a new Colab notebook.
 * - A lightweight `torch` compatibility shim (built on numpy) lets many basic examples run here
 *   — enough to get a feel for tensors, shapes, autograd-style forward passes, etc.
 */

declare global {
  interface Window {
    loadPyodide?: (config?: { indexURL?: string }) => Promise<PyodideInstance>
    __pyodidePromise?: Promise<PyodideInstance>
  }
}

type PyodideInstance = {
  runPythonAsync: (code: string) => Promise<unknown>
  loadPackage: (pkg: string | string[]) => Promise<void>
  setStdout: (cfg: { batched: (msg: string) => void }) => void
  setStderr: (cfg: { batched: (msg: string) => void }) => void
  globals: { set: (k: string, v: unknown) => void }
}

// A tiny numpy-backed shim so many examples that import torch don't crash.
// It does NOT implement autograd/nn/etc. — we clearly signal that to the user.
const TORCH_SHIM = `
import sys, types, math
import numpy as _np

_torch = types.ModuleType("torch")

def _arr(x):
    if isinstance(x, _Tensor): return x._a
    return _np.asarray(x)

class _Tensor:
    def __init__(self, data, dtype=None, device="cpu", requires_grad=False):
        if isinstance(data, _Tensor):
            self._a = data._a.copy()
        else:
            self._a = _np.asarray(data)
        if dtype is not None:
            try: self._a = self._a.astype(dtype)
            except Exception: pass
        self.device = device
        self.requires_grad = requires_grad
        self.grad = None
    @property
    def shape(self):
        class _S(tuple):
            def __repr__(s): return f"torch.Size({list(s)})"
        return _S(self._a.shape)
    @property
    def dtype(self): return self._a.dtype
    @property
    def ndim(self): return self._a.ndim
    @property
    def T(self): return _Tensor(self._a.T)
    def numpy(self): return self._a
    def tolist(self): return self._a.tolist()
    def size(self, dim=None): return self._a.shape if dim is None else self._a.shape[dim]
    def dim(self): return self._a.ndim
    def numel(self): return int(self._a.size)
    def item(self): return self._a.item()
    def to(self, *a, **k): return self
    def cuda(self): return self
    def cpu(self): return self
    def detach(self): return _Tensor(self._a)
    def clone(self): return _Tensor(self._a.copy())
    def float(self): return _Tensor(self._a.astype(_np.float32))
    def long(self): return _Tensor(self._a.astype(_np.int64))
    def int(self): return _Tensor(self._a.astype(_np.int32))
    def unsqueeze(self, d): return _Tensor(_np.expand_dims(self._a, d))
    def squeeze(self, d=None): return _Tensor(_np.squeeze(self._a, d) if d is not None else _np.squeeze(self._a))
    def view(self, *shape):
        if len(shape)==1 and isinstance(shape[0], (tuple,list)): shape = tuple(shape[0])
        return _Tensor(self._a.reshape(shape))
    def reshape(self, *shape):
        if len(shape)==1 and isinstance(shape[0], (tuple,list)): shape = tuple(shape[0])
        return _Tensor(self._a.reshape(shape))
    def flatten(self, start_dim=0):
        s = self._a.shape
        new = s[:start_dim] + (-1,)
        return _Tensor(self._a.reshape(new))
    def permute(self, *dims):
        if len(dims)==1 and isinstance(dims[0], (tuple,list)): dims = tuple(dims[0])
        return _Tensor(self._a.transpose(dims))
    def transpose(self, a, b):
        ax = list(range(self._a.ndim)); ax[a],ax[b] = ax[b],ax[a]
        return _Tensor(self._a.transpose(ax))
    def sum(self, dim=None, keepdim=False): return _Tensor(self._a.sum(axis=dim, keepdims=keepdim))
    def mean(self, dim=None, keepdim=False): return _Tensor(self._a.mean(axis=dim, keepdims=keepdim))
    def max(self, dim=None):
        if dim is None: return _Tensor(self._a.max())
        return (_Tensor(self._a.max(axis=dim)), _Tensor(self._a.argmax(axis=dim)))
    def min(self, dim=None):
        if dim is None: return _Tensor(self._a.min())
        return (_Tensor(self._a.min(axis=dim)), _Tensor(self._a.argmin(axis=dim)))
    def argmax(self, dim=None): return _Tensor(self._a.argmax(axis=dim))
    def abs(self): return _Tensor(_np.abs(self._a))
    def sqrt(self): return _Tensor(_np.sqrt(self._a))
    def exp(self): return _Tensor(_np.exp(self._a))
    def log(self): return _Tensor(_np.log(self._a))
    def clamp(self, min=None, max=None):
        out = self._a
        if min is not None: out = _np.maximum(out, min)
        if max is not None: out = _np.minimum(out, max)
        return _Tensor(out)
    def requires_grad_(self, v=True): self.requires_grad = v; return self
    def zero_(self): self._a = _np.zeros_like(self._a); return self
    def fill_(self, v): self._a = _np.full_like(self._a, v); return self
    def __add__(self, o): return _Tensor(self._a + _arr(o))
    def __radd__(self, o): return _Tensor(_arr(o) + self._a)
    def __sub__(self, o): return _Tensor(self._a - _arr(o))
    def __rsub__(self, o): return _Tensor(_arr(o) - self._a)
    def __mul__(self, o): return _Tensor(self._a * _arr(o))
    def __rmul__(self, o): return _Tensor(_arr(o) * self._a)
    def __truediv__(self, o): return _Tensor(self._a / _arr(o))
    def __rtruediv__(self, o): return _Tensor(_arr(o) / self._a)
    def __neg__(self): return _Tensor(-self._a)
    def __pow__(self, o): return _Tensor(self._a ** _arr(o))
    def __matmul__(self, o): return _Tensor(self._a @ _arr(o))
    def __lt__(self, o): return _Tensor(self._a < _arr(o))
    def __le__(self, o): return _Tensor(self._a <= _arr(o))
    def __gt__(self, o): return _Tensor(self._a > _arr(o))
    def __ge__(self, o): return _Tensor(self._a >= _arr(o))
    def __eq__(self, o):
        try: return _Tensor(self._a == _arr(o))
        except Exception: return False
    def __len__(self): return len(self._a)
    def __iter__(self):
        for row in self._a: yield _Tensor(row)
    def __getitem__(self, i):
        if isinstance(i, _Tensor): i = i._a
        if isinstance(i, tuple):
            i = tuple(x._a if isinstance(x,_Tensor) else x for x in i)
        return _Tensor(self._a[i])
    def __setitem__(self, i, v):
        if isinstance(i, _Tensor): i = i._a
        self._a[i] = v._a if isinstance(v,_Tensor) else v
    def backward(self, *a, **k):
        # Silent no-op so training loops don't crash. Real gradients require Colab.
        pass
    def __repr__(self):
        return f"tensor({self._a.tolist()})"

def _tensor(data, dtype=None, requires_grad=False, device=None):
    return _Tensor(data, dtype=dtype, requires_grad=requires_grad)

def _to_shape(s):
    if len(s)==1 and isinstance(s[0], (tuple,list)): return tuple(s[0])
    return s

_torch.tensor = _tensor
_torch.Tensor = _Tensor
_torch.FloatTensor = _Tensor
_torch.LongTensor = lambda data: _Tensor(data, dtype=_np.int64)
_torch.zeros = lambda *s, **k: _Tensor(_np.zeros(_to_shape(s)))
_torch.ones  = lambda *s, **k: _Tensor(_np.ones(_to_shape(s)))
_torch.empty = lambda *s, **k: _Tensor(_np.empty(_to_shape(s)))
_torch.full  = lambda s, v, **k: _Tensor(_np.full(s, v))
_torch.randn = lambda *s, **k: _Tensor(_np.random.randn(*_to_shape(s)))
_torch.rand  = lambda *s, **k: _Tensor(_np.random.rand(*_to_shape(s)))
_torch.randint = lambda lo, hi, size=None, **k: _Tensor(_np.random.randint(lo, hi, size=size))
_torch.randperm = lambda n, **k: _Tensor(_np.random.permutation(n))
_torch.arange = lambda *a, **k: _Tensor(_np.arange(*a))
_torch.linspace = lambda a, b, n, **k: _Tensor(_np.linspace(a, b, n))
_torch.eye = lambda n, **k: _Tensor(_np.eye(n))
_torch.zeros_like = lambda t, **k: _Tensor(_np.zeros_like(_arr(t)))
_torch.ones_like  = lambda t, **k: _Tensor(_np.ones_like(_arr(t)))
_torch.randn_like = lambda t, **k: _Tensor(_np.random.randn(*_arr(t).shape))
_torch.cat = lambda ts, dim=0: _Tensor(_np.concatenate([_arr(t) for t in ts], axis=dim))
_torch.stack = lambda ts, dim=0: _Tensor(_np.stack([_arr(t) for t in ts], axis=dim))
_torch.mm = lambda a, b: _Tensor(_arr(a) @ _arr(b))
_torch.matmul = lambda a, b: _Tensor(_arr(a) @ _arr(b))
_torch.bmm = lambda a, b: _Tensor(_np.matmul(_arr(a), _arr(b)))
_torch.exp = lambda t: _Tensor(_np.exp(_arr(t)))
_torch.log = lambda t: _Tensor(_np.log(_arr(t)))
_torch.sqrt = lambda t: _Tensor(_np.sqrt(_arr(t)))
_torch.abs = lambda t: _Tensor(_np.abs(_arr(t)))
_torch.sum = lambda t, dim=None, keepdim=False: _Tensor(_arr(t).sum(axis=dim, keepdims=keepdim))
_torch.mean = lambda t, dim=None, keepdim=False: _Tensor(_arr(t).mean(axis=dim, keepdims=keepdim))
_torch.max = lambda t, dim=None: (t.max(dim) if isinstance(t,_Tensor) else _Tensor(_arr(t).max()))
_torch.argmax = lambda t, dim=None: _Tensor(_arr(t).argmax(axis=dim))
_torch.sigmoid = lambda t: _Tensor(1.0 / (1.0 + _np.exp(-_arr(t))))
_torch.tanh = lambda t: _Tensor(_np.tanh(_arr(t)))
_torch.relu = lambda t: _Tensor(_np.maximum(0, _arr(t)))
def _softmax(t, dim=-1):
    a = _arr(t); a = a - a.max(axis=dim, keepdims=True)
    e = _np.exp(a); return _Tensor(e / e.sum(axis=dim, keepdims=True))
_torch.softmax = _softmax
_torch.log_softmax = lambda t, dim=-1: _Tensor(_np.log(_softmax(t,dim)._a + 1e-12))
_torch.equal = lambda a,b: bool(_np.array_equal(_arr(a),_arr(b)))
_torch.manual_seed = lambda s: _np.random.seed(int(s))
_torch.save = lambda *a, **k: print("[torch-shim] torch.save is a no-op in-browser.")
_torch.load = lambda *a, **k: {}
_torch.from_numpy = lambda a: _Tensor(a)
_torch.float32 = _np.float32
_torch.float64 = _np.float64
_torch.int32 = _np.int32
_torch.int64 = _np.int64
_torch.long = _np.int64
_torch.bool = _np.bool_
_torch.__version__ = "shim-0.2 (numpy-backed, browser)"

class _Device:
    def __init__(self, s="cpu", idx=None): self.type = s; self.s = s
    def __repr__(self): return f"device(type='{self.s}')"
_torch.device = _Device

class _Cuda:
    @staticmethod
    def is_available(): return False
    @staticmethod
    def device_count(): return 0
    @staticmethod
    def get_device_name(*a, **k): return "cpu (shim)"
_torch.cuda = _Cuda()

class _NoGrad:
    def __enter__(self): return self
    def __exit__(self, *a): return False
    def __call__(self, fn):
        def wrap(*a, **k): return fn(*a,**k)
        return wrap
_torch.no_grad = lambda: _NoGrad()
_torch.enable_grad = lambda: _NoGrad()
_torch.is_grad_enabled = lambda: True

# ---------------- nn ----------------
_nn = types.ModuleType("torch.nn")

class _Module:
    def __init__(self):
        object.__setattr__(self, "_children", [])
        object.__setattr__(self, "_params", [])
        object.__setattr__(self, "training", True)
    def __setattr__(self, k, v):
        if isinstance(v, _Module) and k != "_children":
            self._children.append((k,v))
        elif isinstance(v, _Tensor) and getattr(v,"requires_grad",False):
            self._params.append((k,v))
        object.__setattr__(self, k, v)
    def __call__(self, *a, **k): return self.forward(*a, **k)
    def forward(self, x): return x
    def parameters(self):
        out = []
        for _,p in getattr(self,"_params",[]): out.append(p)
        for _,c in getattr(self,"_children",[]): out.extend(c.parameters())
        if hasattr(self,"_layer_params"):
            out.extend(self._layer_params)
        return out
    def named_parameters(self):
        out = []
        for n,p in getattr(self,"_params",[]): out.append((n,p))
        for n,c in getattr(self,"_children",[]):
            for sn,sp in c.named_parameters(): out.append((f"{n}.{sn}",sp))
        return out
    def modules(self):
        yield self
        for _,c in getattr(self,"_children",[]):
            yield from c.modules()
    def children(self):
        return [c for _,c in getattr(self,"_children",[])]
    def state_dict(self):
        return dict(self.named_parameters())
    def load_state_dict(self, *a, **k): return self
    def train(self, m=True): self.training = m; return self
    def eval(self): self.training = False; return self
    def to(self, *a, **k): return self
    def zero_grad(self, *a, **k): pass

def _register_layer_param(layer, *arrays):
    # expose numpy weight arrays as parameter-like tensors for optim.
    ps = []
    for arr in arrays:
        if arr is None: continue
        t = _Tensor(arr); t.requires_grad = True
        ps.append(t)
    object.__setattr__(layer, "_layer_params", ps)

class _Linear(_Module):
    def __init__(self, i, o, bias=True):
        super().__init__()
        self.in_features, self.out_features = i, o
        self.weight = _np.random.randn(o, i).astype(_np.float32) * (2.0/i)**0.5
        self.bias = _np.zeros(o, dtype=_np.float32) if bias else None
        _register_layer_param(self, self.weight, self.bias)
    def forward(self, x):
        a = _arr(x)
        y = a @ self.weight.T
        if self.bias is not None: y = y + self.bias
        return _Tensor(y)

class _ReLU(_Module):
    def __init__(self, inplace=False): super().__init__()
    def forward(self, x): return _Tensor(_np.maximum(0, _arr(x)))
class _LeakyReLU(_Module):
    def __init__(self, slope=0.01, inplace=False): super().__init__(); self.s = slope
    def forward(self, x):
        a = _arr(x); return _Tensor(_np.where(a>0, a, a*self.s))
class _Sigmoid(_Module):
    def forward(self, x): return _Tensor(1/(1+_np.exp(-_arr(x))))
class _Tanh(_Module):
    def forward(self, x): return _Tensor(_np.tanh(_arr(x)))
class _GELU(_Module):
    def forward(self, x):
        a = _arr(x); return _Tensor(0.5*a*(1+_np.tanh(_np.sqrt(2/_np.pi)*(a+0.044715*a**3))))
class _Softmax(_Module):
    def __init__(self, dim=-1): super().__init__(); self.dim = dim
    def forward(self, x): return _softmax(x, self.dim)
class _LogSoftmax(_Module):
    def __init__(self, dim=-1): super().__init__(); self.dim = dim
    def forward(self, x): return _torch.log_softmax(x, self.dim)
class _Flatten(_Module):
    def __init__(self, start_dim=1, end_dim=-1): super().__init__(); self.s=start_dim
    def forward(self, x):
        a = _arr(x); new = a.shape[:self.s] + (-1,)
        return _Tensor(a.reshape(new))
class _Dropout(_Module):
    def __init__(self, p=0.5): super().__init__(); self.p = p
    def forward(self, x): return _Tensor(_arr(x))
class _LayerNorm(_Module):
    def __init__(self, d, eps=1e-5): super().__init__(); self.eps = eps
    def forward(self, x):
        a = _arr(x)
        return _Tensor((a - a.mean(-1, keepdims=True)) / (a.std(-1, keepdims=True) + self.eps))
class _BatchNorm1d(_Module):
    def __init__(self, d, **k): super().__init__()
    def forward(self, x):
        a = _arr(x)
        return _Tensor((a - a.mean(0,keepdims=True))/(a.std(0,keepdims=True)+1e-5))
class _BatchNorm2d(_BatchNorm1d): pass
class _Embedding(_Module):
    def __init__(self, n, d, padding_idx=None):
        super().__init__()
        self.num_embeddings, self.embedding_dim = n, d
        self.weight = _np.random.randn(n, d).astype(_np.float32) * 0.1
        _register_layer_param(self, self.weight)
    def forward(self, idx):
        a = _arr(idx).astype(int)
        return _Tensor(self.weight[a])
class _Sequential(_Module):
    def __init__(self, *layers):
        super().__init__()
        self.layers = list(layers)
        for i,l in enumerate(layers):
            setattr(self, f"layer_{i}", l)
    def forward(self, x):
        for l in self.layers: x = l(x)
        return x
    def __iter__(self):
        return iter(self.layers)
    def __getitem__(self, i): return self.layers[i]
    def __len__(self): return len(self.layers)

# Conv / pool stubs: preserve batch dim, approximate output shape.
class _Conv2d(_Module):
    def __init__(self, in_c, out_c, kernel_size=3, stride=1, padding=0, **kw):
        super().__init__()
        k = kw.pop("k", kernel_size)
        self.in_c, self.out_c = in_c, out_c
        self.k = k if isinstance(k,(tuple,list)) else (k,k)
        self.stride = stride if isinstance(stride,(tuple,list)) else (stride,stride)
        self.padding = padding if isinstance(padding,(tuple,list)) else (padding,padding)
        self.weight = _np.random.randn(out_c, in_c, *self.k).astype(_np.float32) * 0.1
        self.bias = _np.zeros(out_c, dtype=_np.float32)
        _register_layer_param(self, self.weight, self.bias)
    def forward(self, x):
        a = _arr(x)
        # naive "conv": just project channels with a 1x1 mix to keep shape sane
        N,C,H,W = a.shape if a.ndim==4 else (1,*a.shape)
        Ho = (H + 2*self.padding[0] - self.k[0]) // self.stride[0] + 1
        Wo = (W + 2*self.padding[1] - self.k[1]) // self.stride[1] + 1
        Ho = max(Ho,1); Wo = max(Wo,1)
        # mean-pool input to (N,C,Ho,Wo) then project to out channels via weight mean
        mix = self.weight.reshape(self.out_c, self.in_c, -1).mean(-1)  # (out,in)
        # simple block pooling
        pool = a.reshape(N,C,H,W)
        pool = pool.mean(axis=(2,3), keepdims=True)  # (N,C,1,1)
        pool = _np.broadcast_to(pool,(N,C,Ho,Wo))
        out = _np.einsum('oc,nchw->nohw', mix, pool) + self.bias.reshape(1,-1,1,1)
        return _Tensor(out)
class _MaxPool2d(_Module):
    def __init__(self, kernel_size=2, stride=None, **kw):
        super().__init__()
        k = kw.pop("k", kernel_size)
        self.k = k if isinstance(k,(tuple,list)) else (k,k)
        s = stride if stride is not None else self.k
        self.s = s if isinstance(s,(tuple,list)) else (s,s)
    def forward(self, x):
        a = _arr(x); N,C,H,W = a.shape
        Ho, Wo = H//self.s[0], W//self.s[1]
        a2 = a[:,:,:Ho*self.s[0],:Wo*self.s[1]].reshape(N,C,Ho,self.s[0],Wo,self.s[1])
        return _Tensor(a2.max(axis=(3,5)))
class _AvgPool2d(_MaxPool2d):
    def forward(self, x):
        a = _arr(x); N,C,H,W = a.shape
        Ho, Wo = H//self.s[0], W//self.s[1]
        a2 = a[:,:,:Ho*self.s[0],:Wo*self.s[1]].reshape(N,C,Ho,self.s[0],Wo,self.s[1])
        return _Tensor(a2.mean(axis=(3,5)))
class _AdaptiveAvgPool2d(_Module):
    def __init__(self, out): super().__init__(); self.out = out if isinstance(out,(tuple,list)) else (out,out)
    def forward(self, x):
        a = _arr(x); N,C,H,W = a.shape
        Ho, Wo = self.out
        # naive: just global mean broadcast
        m = a.mean(axis=(2,3), keepdims=True)
        return _Tensor(_np.broadcast_to(m,(N,C,Ho,Wo)).copy())

# Loss modules
class _MSELoss(_Module):
    def __init__(self, reduction="mean"): super().__init__(); self.r = reduction
    def forward(self, p, t):
        d = (_arr(p) - _arr(t))**2
        return _Tensor(d.mean() if self.r=="mean" else d.sum())
class _L1Loss(_Module):
    def forward(self, p, t): return _Tensor(_np.mean(_np.abs(_arr(p)-_arr(t))))
class _CrossEntropyLoss(_Module):
    def __init__(self, **k): super().__init__()
    def forward(self, logits, targets):
        x = _arr(logits); t = _arr(targets).astype(int)
        x = x - x.max(-1, keepdims=True)
        lse = _np.log(_np.exp(x).sum(-1))
        return _Tensor(float(_np.mean(-x[_np.arange(len(t)), t] + lse)))
class _NLLLoss(_CrossEntropyLoss): pass
class _BCELoss(_Module):
    def forward(self, p, t):
        p = _np.clip(_arr(p),1e-7,1-1e-7); t = _arr(t)
        return _Tensor(float(-_np.mean(t*_np.log(p)+(1-t)*_np.log(1-p))))
class _BCEWithLogitsLoss(_Module):
    def forward(self, logits, targets):
        x, t = _arr(logits), _arr(targets)
        return _Tensor(float(_np.mean(_np.maximum(x,0) - x*t + _np.log1p(_np.exp(-_np.abs(x))))))

_nn.Module = _Module
_nn.Linear = _Linear
_nn.ReLU = _ReLU
_nn.LeakyReLU = _LeakyReLU
_nn.Sigmoid = _Sigmoid
_nn.Tanh = _Tanh
_nn.GELU = _GELU
_nn.Softmax = _Softmax
_nn.LogSoftmax = _LogSoftmax
_nn.Flatten = _Flatten
_nn.Sequential = _Sequential
_nn.Embedding = _Embedding
_nn.Dropout = _Dropout
_nn.LayerNorm = _LayerNorm
_nn.BatchNorm1d = _BatchNorm1d
_nn.BatchNorm2d = _BatchNorm2d
_nn.Conv1d = _Conv2d  # shim shares impl
_nn.Conv2d = _Conv2d
_nn.ConvTranspose2d = _Conv2d
_nn.MaxPool2d = _MaxPool2d
_nn.AvgPool2d = _AvgPool2d
_nn.AdaptiveAvgPool2d = _AdaptiveAvgPool2d
_nn.MSELoss = _MSELoss
_nn.L1Loss = _L1Loss
_nn.CrossEntropyLoss = _CrossEntropyLoss
_nn.NLLLoss = _NLLLoss
_nn.BCELoss = _BCELoss
_nn.BCEWithLogitsLoss = _BCEWithLogitsLoss
_nn.Parameter = lambda t, requires_grad=True: (t if isinstance(t,_Tensor) else _Tensor(t)).requires_grad_(requires_grad)
_nn.Identity = type("Identity",(_Module,),{"forward": lambda self,x: x})

# functional
_F = types.ModuleType("torch.nn.functional")
_F.relu = lambda x, inplace=False: _Tensor(_np.maximum(0,_arr(x)))
_F.leaky_relu = lambda x, s=0.01, inplace=False: _Tensor(_np.where(_arr(x)>0,_arr(x),_arr(x)*s))
_F.sigmoid = lambda x: _Tensor(1/(1+_np.exp(-_arr(x))))
_F.tanh = lambda x: _Tensor(_np.tanh(_arr(x)))
_F.gelu = lambda x: _Tensor(0.5*_arr(x)*(1+_np.tanh(_np.sqrt(2/_np.pi)*(_arr(x)+0.044715*_arr(x)**3))))
_F.softmax = lambda x, dim=-1: _softmax(x, dim)
_F.log_softmax = lambda x, dim=-1: _torch.log_softmax(x, dim)
_F.dropout = lambda x, p=0.5, training=True: _Tensor(_arr(x))
_F.mse_loss = lambda p, t, reduction="mean": _MSELoss(reduction=reduction)(p,t)
_F.l1_loss = lambda p, t, **k: _L1Loss()(p,t)
_F.cross_entropy = lambda l, t, **k: _CrossEntropyLoss()(l,t)
_F.nll_loss = lambda l, t, **k: _CrossEntropyLoss()(l,t)
_F.binary_cross_entropy = lambda p, t, **k: _BCELoss()(p,t)
_F.binary_cross_entropy_with_logits = lambda l, t, **k: _BCEWithLogitsLoss()(l,t)
_F.linear = lambda x, W, b=None: _Tensor(_arr(x) @ _arr(W).T + (0 if b is None else _arr(b)))
_F.max_pool2d = lambda x, k, stride=None, **kw: _MaxPool2d(k, stride)(x)
_F.avg_pool2d = lambda x, k, stride=None, **kw: _AvgPool2d(k, stride)(x)
_F.normalize = lambda x, dim=1, **k: _Tensor(_arr(x)/(_np.linalg.norm(_arr(x),axis=dim,keepdims=True)+1e-12))
_F.one_hot = lambda t, num_classes: _Tensor(_np.eye(num_classes)[_arr(t).astype(int)])
_nn.functional = _F

# ---------------- optim ----------------
_optim = types.ModuleType("torch.optim")
class _Opt:
    def __init__(self, params, lr=1e-3, **k):
        self.params = list(params) if params is not None else []
        self.lr = lr
        self.defaults = dict(lr=lr, **k)
        self.state = {}
        self.param_groups = [{"params": self.params, "lr": lr, **k}]
    def zero_grad(self, set_to_none=True):
        for p in self.params:
            if getattr(p,"grad",None) is not None:
                p.grad = None
    def step(self, closure=None):
        # no-op: autograd is not available in-browser. Training loops still run and print loss.
        if closure is not None: closure()
    def state_dict(self): return {"state": {}, "param_groups": self.param_groups}
    def load_state_dict(self, *a, **k): pass
_optim.Optimizer = _Opt
_optim.SGD = _Opt
_optim.Adam = _Opt
_optim.AdamW = _Opt
_optim.RMSprop = _Opt
_optim.Adagrad = _Opt
_lrsched = types.ModuleType("torch.optim.lr_scheduler")
class _Sched:
    def __init__(self, opt, *a, **k): self.opt = opt
    def step(self, *a, **k): pass
    def get_last_lr(self): return [self.opt.lr]
    def state_dict(self): return {}
_lrsched.StepLR = _Sched
_lrsched.CosineAnnealingLR = _Sched
_lrsched.ReduceLROnPlateau = _Sched
_lrsched.ExponentialLR = _Sched
_optim.lr_scheduler = _lrsched

# ---------------- data ----------------
_utils = types.ModuleType("torch.utils")
_data = types.ModuleType("torch.utils.data")
class _Dataset:
    def __len__(self): return 0
    def __getitem__(self, i): raise NotImplementedError
class _TensorDataset(_Dataset):
    def __init__(self, *tensors):
        self.tensors = [t if isinstance(t,_Tensor) else _Tensor(t) for t in tensors]
    def __len__(self): return len(self.tensors[0]._a)
    def __getitem__(self, i): return tuple(_Tensor(t._a[i]) for t in self.tensors)
class _DataLoader:
    def __init__(self, dataset, batch_size=1, shuffle=False, **k):
        self.ds = dataset; self.bs = batch_size; self.shuffle = shuffle
    def __iter__(self):
        n = len(self.ds)
        idx = _np.random.permutation(n) if self.shuffle else _np.arange(n)
        for s in range(0, n, self.bs):
            batch_idx = idx[s:s+self.bs]
            if hasattr(self.ds,"tensors"):
                yield tuple(_Tensor(t._a[batch_idx]) for t in self.ds.tensors)
            else:
                items = [self.ds[int(i)] for i in batch_idx]
                if isinstance(items[0], tuple):
                    cols = list(zip(*items))
                    yield tuple(_Tensor(_np.stack([_arr(c) for c in col])) for col in cols)
                else:
                    yield _Tensor(_np.stack([_arr(it) for it in items]))
    def __len__(self):
        n = len(self.ds); return (n + self.bs - 1)//self.bs
_data.Dataset = _Dataset
_data.TensorDataset = _TensorDataset
_data.DataLoader = _DataLoader
_data.random_split = lambda ds, lengths, **k: [ds for _ in lengths]
_utils.data = _data

# register
_torch.nn = _nn
_torch.optim = _optim
_torch.utils = _utils
sys.modules["torch"] = _torch
sys.modules["torch.nn"] = _nn
sys.modules["torch.nn.functional"] = _F
sys.modules["torch.optim"] = _optim
sys.modules["torch.optim.lr_scheduler"] = _lrsched
sys.modules["torch.utils"] = _utils
sys.modules["torch.utils.data"] = _data

# ══════════════════════════════════════════════════════════════════════
# AUTOGRAD OVERLAY — real reverse-mode autodiff over the shim tensors.
# Enough to make nn.Linear + activations + MSE/CE losses train correctly
# so in-browser training loops actually converge.
# ══════════════════════════════════════════════════════════════════════

def _unbroadcast(g, shape):
    # Reduce g to match shape by summing along broadcast axes.
    g = _np.asarray(g)
    while g.ndim > len(shape):
        g = g.sum(axis=0)
    for i, s in enumerate(shape):
        if s == 1 and g.shape[i] != 1:
            g = g.sum(axis=i, keepdims=True)
    return g

# Retro-fit: give every _Tensor the autograd slots.
_old_tensor_init = _Tensor.__init__
def _ag_init(self, data, dtype=None, device="cpu", requires_grad=False):
    _old_tensor_init(self, data, dtype, device, requires_grad)
    self._parents = ()
    self._backward = None
_Tensor.__init__ = _ag_init

# Shape helper: tuple-like but with .tolist()  (fixes xb.shape.tolist())
def _shape_prop(self):
    class _S(tuple):
        def __repr__(s): return f"torch.Size({list(s)})"
        def tolist(s): return list(s)
        def numel(s):
            n = 1
            for v in s: n *= int(v)
            return n
    return _S(self._a.shape)
_Tensor.shape = property(_shape_prop)

def _mk(out_a, parents, backward, requires_grad=None):
    t = _Tensor(out_a)
    t._parents = tuple(parents)
    t._backward = backward
    if requires_grad is None:
        requires_grad = any(getattr(p, "requires_grad", False) for p in parents)
    t.requires_grad = requires_grad
    return t

def _accum(p, g):
    # Accumulate gradient g onto parent tensor p.
    if not getattr(p, "requires_grad", False): return
    g = _unbroadcast(g, p._a.shape)
    p.grad = g.copy() if p.grad is None else (p.grad + g)

# ── elementary ops (replace un-tracked versions) ──────────────────────
def _t_add(self, o):
    oa = _arr(o); ot = o if isinstance(o, _Tensor) else None
    parents = (self,) + ((ot,) if ot is not None else ())
    def bw(g):
        _accum(self, g)
        if ot is not None: _accum(ot, g)
    return _mk(self._a + oa, parents, bw)
def _t_sub(self, o):
    oa = _arr(o); ot = o if isinstance(o, _Tensor) else None
    parents = (self,) + ((ot,) if ot is not None else ())
    def bw(g):
        _accum(self, g)
        if ot is not None: _accum(ot, -g)
    return _mk(self._a - oa, parents, bw)
def _t_rsub(self, o):
    ot = _Tensor(_arr(o))
    return _t_sub(ot, self)
def _t_mul(self, o):
    oa = _arr(o); ot = o if isinstance(o, _Tensor) else None
    parents = (self,) + ((ot,) if ot is not None else ())
    def bw(g):
        _accum(self, g * oa)
        if ot is not None: _accum(ot, g * self._a)
    return _mk(self._a * oa, parents, bw)
def _t_div(self, o):
    oa = _arr(o); ot = o if isinstance(o, _Tensor) else None
    parents = (self,) + ((ot,) if ot is not None else ())
    def bw(g):
        _accum(self, g / oa)
        if ot is not None: _accum(ot, -g * self._a / (oa * oa))
    return _mk(self._a / oa, parents, bw)
def _t_neg(self):
    def bw(g): _accum(self, -g)
    return _mk(-self._a, (self,), bw)
def _t_pow(self, o):
    if isinstance(o, _Tensor): oa = o._a
    else: oa = o
    out_a = self._a ** oa
    def bw(g): _accum(self, g * oa * (self._a ** (oa - 1)))
    return _mk(out_a, (self,), bw)
def _t_matmul(self, o):
    oa = _arr(o); ot = o if isinstance(o, _Tensor) else None
    parents = (self,) + ((ot,) if ot is not None else ())
    def bw(g):
        _accum(self, g @ _np.swapaxes(oa, -1, -2))
        if ot is not None: _accum(ot, _np.swapaxes(self._a, -1, -2) @ g)
    return _mk(self._a @ oa, parents, bw)
_Tensor.__add__  = _t_add
_Tensor.__radd__ = lambda self, o: _t_add(self, o)
_Tensor.__sub__  = _t_sub
_Tensor.__rsub__ = _t_rsub
_Tensor.__mul__  = _t_mul
_Tensor.__rmul__ = lambda self, o: _t_mul(self, o)
_Tensor.__truediv__  = _t_div
_Tensor.__rtruediv__ = lambda self, o: _t_div(_Tensor(_arr(o)), self)
_Tensor.__neg__  = _t_neg
_Tensor.__pow__  = _t_pow
_Tensor.__matmul__ = _t_matmul

# ── reductions ────────────────────────────────────────────────────────
def _t_sum(self, dim=None, keepdim=False):
    in_shape = self._a.shape
    out = self._a.sum(axis=dim, keepdims=keepdim)
    def bw(g):
        if dim is None:
            gg = _np.ones(in_shape, dtype=self._a.dtype) * g
        else:
            g_ = g if keepdim else _np.expand_dims(g, dim)
            gg = _np.broadcast_to(g_, in_shape).copy()
        _accum(self, gg)
    return _mk(out, (self,), bw)
def _t_mean(self, dim=None, keepdim=False):
    in_shape = self._a.shape
    n = self._a.size if dim is None else self._a.shape[dim]
    out = self._a.mean(axis=dim, keepdims=keepdim)
    def bw(g):
        if dim is None:
            gg = _np.ones(in_shape, dtype=self._a.dtype) * (g / n)
        else:
            g_ = g if keepdim else _np.expand_dims(g, dim)
            gg = _np.broadcast_to(g_ / n, in_shape).copy()
        _accum(self, gg)
    return _mk(out, (self,), bw)
_Tensor.sum  = _t_sum
_Tensor.mean = _t_mean

# ── transpose ─────────────────────────────────────────────────────────
def _t_T(self):
    def bw(g): _accum(self, g.T)
    return _mk(self._a.T, (self,), bw)
_Tensor.T = property(_t_T)

def _t_transpose(self, a, b):
    ax = list(range(self._a.ndim)); ax[a], ax[b] = ax[b], ax[a]
    def bw(g):
        inv = [0]*len(ax)
        for i,v in enumerate(ax): inv[v] = i
        _accum(self, g.transpose(inv))
    return _mk(self._a.transpose(ax), (self,), bw)
_Tensor.transpose = _t_transpose

def _t_view(self, *shape):
    if len(shape)==1 and isinstance(shape[0], (tuple,list)): shape = tuple(shape[0])
    in_shape = self._a.shape
    def bw(g): _accum(self, g.reshape(in_shape))
    return _mk(self._a.reshape(shape), (self,), bw)
_Tensor.view = _t_view
_Tensor.reshape = _t_view

# ── .backward() — topo order, accumulate grads ────────────────────────
def _t_backward(self, grad=None):
    topo, seen = [], set()
    def build(v):
        if id(v) in seen: return
        seen.add(id(v))
        for p in getattr(v, "_parents", ()): build(p)
        topo.append(v)
    build(self)
    if grad is None:
        if self._a.size != 1:
            raise RuntimeError("grad must be specified for non-scalar outputs")
        self.grad = _np.ones_like(self._a)
    else:
        self.grad = _np.asarray(grad)
    for v in reversed(topo):
        bw = getattr(v, "_backward", None)
        if bw is not None and v.grad is not None:
            bw(v.grad)
_Tensor.backward = _t_backward

# ── tracked activations / losses ──────────────────────────────────────
def _t_relu(x):
    xt = x if isinstance(x, _Tensor) else _Tensor(x)
    mask = (xt._a > 0).astype(xt._a.dtype)
    def bw(g): _accum(xt, g * mask)
    return _mk(xt._a * mask, (xt,), bw)
def _t_sigmoid(x):
    xt = x if isinstance(x, _Tensor) else _Tensor(x)
    s = 1.0 / (1.0 + _np.exp(-xt._a))
    def bw(g): _accum(xt, g * s * (1 - s))
    return _mk(s, (xt,), bw)
def _t_tanh(x):
    xt = x if isinstance(x, _Tensor) else _Tensor(x)
    y = _np.tanh(xt._a)
    def bw(g): _accum(xt, g * (1 - y*y))
    return _mk(y, (xt,), bw)
def _t_exp(x):
    xt = x if isinstance(x, _Tensor) else _Tensor(x)
    y = _np.exp(xt._a)
    def bw(g): _accum(xt, g * y)
    return _mk(y, (xt,), bw)
def _t_log(x):
    xt = x if isinstance(x, _Tensor) else _Tensor(x)
    def bw(g): _accum(xt, g / xt._a)
    return _mk(_np.log(xt._a), (xt,), bw)

_torch.relu    = _t_relu
_torch.sigmoid = _t_sigmoid
_torch.tanh    = _t_tanh
_torch.exp     = _t_exp
_torch.log     = _t_log
_F.relu    = lambda x, inplace=False: _t_relu(x)
_F.sigmoid = _t_sigmoid
_F.tanh    = _t_tanh
_ReLU.forward    = lambda self, x: _t_relu(x)
_Sigmoid.forward = lambda self, x: _t_sigmoid(x)
_Tanh.forward    = lambda self, x: _t_tanh(x)

def _t_mse_loss(pred, target, reduction="mean"):
    p = pred if isinstance(pred, _Tensor) else _Tensor(pred)
    t = target if isinstance(target, _Tensor) else _Tensor(target)
    diff = p - t
    sq = diff * diff
    return sq.mean() if reduction == "mean" else sq.sum()
_MSELoss.forward = lambda self, p, t: _t_mse_loss(p, t, self.r)
_F.mse_loss = lambda p, t, reduction="mean": _t_mse_loss(p, t, reduction)

def _t_ce_loss(logits, targets):
    p = logits if isinstance(logits, _Tensor) else _Tensor(logits)
    ta = _arr(targets).astype(int)
    x = p._a
    xm = x - x.max(-1, keepdims=True)
    logZ = _np.log(_np.exp(xm).sum(-1, keepdims=True))
    lsm = xm - logZ                                 # (N, C)
    N = int(ta.shape[0]) if ta.ndim else 1
    nll = float(-lsm[_np.arange(N), ta].mean())
    sm = _np.exp(lsm)
    onehot = _np.zeros_like(sm); onehot[_np.arange(N), ta] = 1
    grad_logits = (sm - onehot) / N
    def bw(g): _accum(p, g * grad_logits)
    return _mk(_np.array(nll, dtype=_np.float64), (p,), bw)
_CrossEntropyLoss.forward = lambda self, l, t: _t_ce_loss(l, t)
_F.cross_entropy = lambda l, t, **k: _t_ce_loss(l, t)

# ── nn.Linear — real trainable parameters ────────────────────────────
def _linear_init(self, in_features, out_features, bias=True):
    _Module.__init__(self)
    self.in_features, self.out_features = in_features, out_features
    w = _np.random.randn(out_features, in_features).astype(_np.float32) * (2.0/in_features)**0.5
    self.weight = _Tensor(w); self.weight.requires_grad = True
    if bias:
        self.bias = _Tensor(_np.zeros(out_features, dtype=_np.float32))
        self.bias.requires_grad = True
    else:
        self.bias = None
    ps = [self.weight] + ([self.bias] if self.bias is not None else [])
    object.__setattr__(self, "_layer_params", ps)

def _linear_forward(self, x):
    xt = x if isinstance(x, _Tensor) else _Tensor(x)
    y = xt @ self.weight.T
    if self.bias is not None:
        y = y + self.bias
    return y
_Linear.__init__ = _linear_init
_Linear.forward = _linear_forward

# ── Optimizers: SGD and Adam for real ────────────────────────────────
class _RealSGD(_Opt):
    def __init__(self, params, lr=1e-2, momentum=0.0, **k):
        super().__init__(params, lr=lr, **k)
        self.momentum = momentum
        self._v = {}
    def step(self, closure=None):
        for p in self.params:
            if not isinstance(p, _Tensor) or p.grad is None: continue
            if self.momentum:
                v = self._v.get(id(p), _np.zeros_like(p._a))
                v = self.momentum * v + p.grad
                self._v[id(p)] = v
                p._a = p._a - self.lr * v
            else:
                p._a = p._a - self.lr * p.grad

class _RealAdam(_Opt):
    def __init__(self, params, lr=1e-3, betas=(0.9, 0.999), eps=1e-8, **k):
        super().__init__(params, lr=lr, **k)
        self.b1, self.b2 = betas
        self.eps = eps
        self._m, self._v, self._t = {}, {}, 0
    def step(self, closure=None):
        self._t += 1
        for p in self.params:
            if not isinstance(p, _Tensor) or p.grad is None: continue
            g = p.grad.astype(p._a.dtype)
            m = self.b1 * self._m.get(id(p), _np.zeros_like(p._a)) + (1-self.b1) * g
            v = self.b2 * self._v.get(id(p), _np.zeros_like(p._a)) + (1-self.b2) * (g*g)
            self._m[id(p)] = m; self._v[id(p)] = v
            mhat = m / (1 - self.b1 ** self._t)
            vhat = v / (1 - self.b2 ** self._t)
            p._a = p._a - self.lr * mhat / (_np.sqrt(vhat) + self.eps)

def _opt_zero_grad(self, set_to_none=True):
    for p in self.params:
        if isinstance(p, _Tensor): p.grad = None

_Opt.zero_grad = _opt_zero_grad
_optim.SGD     = _RealSGD
_optim.Adam    = _RealAdam
_optim.AdamW   = _RealAdam
_optim.RMSprop = _RealSGD   # close enough for demo training loops

print("[torch-shim v0.3] numpy-backed torch loaded — nn, optim, functional, utils.data importable.")
print("[torch-shim v0.3] Real reverse-mode autograd for Linear + activations + MSE/CE losses.")
print("[torch-shim v0.3] Conv2d / Embedding / BatchNorm are numerical shims (forward only).")
print("[torch-shim v0.3] Click 'Open in Colab' for the genuine PyTorch runtime.")
`

async function getPyodide(onProgress: (s: string) => void): Promise<PyodideInstance> {
  if (typeof window === 'undefined') throw new Error('Pyodide is browser-only')
  if (window.__pyodidePromise) return window.__pyodidePromise

  window.__pyodidePromise = (async () => {
    if (!window.loadPyodide) {
      onProgress('Loading Pyodide runtime…')
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js'
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('Failed to load Pyodide CDN'))
        document.head.appendChild(s)
      })
    }
    onProgress('Initializing Python…')
    const py = await window.loadPyodide!({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/' })
    onProgress('Installing numpy…')
    await py.loadPackage('numpy')
    onProgress('Installing torch shim…')
    await py.runPythonAsync(TORCH_SHIM)
    return py
  })()
  return window.__pyodidePromise
}

interface Props {
  initialCode: string
}

// ─────────────────────────────────────────────────────────────────────────
// Lightweight Python syntax highlighter for the editable textarea overlay.
// Mirrors the colour scheme used by HoverableCode.
// ─────────────────────────────────────────────────────────────────────────

const PY_KEYWORDS = new Set([
  'def', 'class', 'return', 'import', 'from', 'as', 'if', 'else', 'elif',
  'for', 'while', 'in', 'not', 'and', 'or', 'is', 'None', 'True', 'False',
  'with', 'try', 'except', 'finally', 'raise', 'lambda', 'pass', 'break',
  'continue', 'global', 'nonlocal', 'yield', 'self',
])

const CAT_TEXT_COLOR: Record<KeywordExplanation['category'], string> = {
  core: 'text-cyan-300',
  nn: 'text-fuchsia-300',
  autograd: 'text-amber-300',
  optim: 'text-emerald-300',
  data: 'text-sky-300',
  device: 'text-rose-300',
  op: 'text-violet-300',
  training: 'text-yellow-300',
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Returns highlighted HTML for the given Python source. Keeps whitespace exact. */
function highlightPython(code: string): string {
  // One master regex so we never lose characters.
  const re = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|#[^\n]*|\b\d+(?:\.\d+)?\b|[A-Za-z_][A-Za-z_0-9]*|\s+|[^\s\w])/g
  let html = ''
  let m: RegExpExecArray | null
  let lastIdx = 0
  while ((m = re.exec(code)) !== null) {
    // Any characters the regex skipped (shouldn't happen, but stay safe).
    if (m.index > lastIdx) html += escapeHtml(code.slice(lastIdx, m.index))
    const t = m[0]
    lastIdx = m.index + t.length

    if (t.startsWith('#')) {
      html += `<span class="text-slate-500 italic">${escapeHtml(t)}</span>`
      continue
    }
    if (t.startsWith('"') || t.startsWith("'")) {
      html += `<span class="text-green-300">${escapeHtml(t)}</span>`
      continue
    }
    if (/^\d/.test(t)) {
      html += `<span class="text-orange-300">${escapeHtml(t)}</span>`
      continue
    }
    if (/^[A-Za-z_]/.test(t)) {
      if (PY_KEYWORDS.has(t)) {
        html += `<span class="text-pink-300">${escapeHtml(t)}</span>`
        continue
      }
      const info = PYTORCH_KEYWORDS[t]
      if (info) {
        html += `<span class="${CAT_TEXT_COLOR[info.category]}">${escapeHtml(t)}</span>`
        continue
      }
      html += escapeHtml(t)
      continue
    }
    html += escapeHtml(t)
  }
  if (lastIdx < code.length) html += escapeHtml(code.slice(lastIdx))
  // Textareas show a trailing blank line only if the last char is \n.
  // Mirror that in the overlay with a trailing space so heights match exactly.
  return html + '\n'
}

export function PythonPlayground({ initialCode }: Props) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'running' | 'error'>('idle')
  const [loadMsg, setLoadMsg] = useState<string>('')
  const pyRef = useRef<PyodideInstance | null>(null)
  const taRef = useRef<HTMLTextAreaElement | null>(null)
  const preRef = useRef<HTMLPreElement | null>(null)

  const highlighted = useMemo(() => highlightPython(code), [code])

  // Keep the highlighted overlay perfectly aligned with the textarea while scrolling.
  const onScroll = useCallback(() => {
    const ta = taRef.current
    const pre = preRef.current
    if (!ta || !pre) return
    pre.scrollTop = ta.scrollTop
    pre.scrollLeft = ta.scrollLeft
  }, [])

  // If the parent changes topic, refresh the editor with new starter code.
  useEffect(() => {
    setCode(initialCode)
    setOutput('')
  }, [initialCode])

  const run = useCallback(async () => {
    setOutput('')
    setStatus('loading')
    setLoadMsg('Preparing runtime…')
    try {
      if (!pyRef.current) {
        pyRef.current = await getPyodide((s) => setLoadMsg(s))
      }
      const py = pyRef.current
      let buf = ''
      py.setStdout({ batched: (m) => (buf += m.endsWith('\n') ? m : m + '\n') })
      py.setStderr({ batched: (m) => (buf += m.endsWith('\n') ? m : m + '\n') })
      setStatus('running')
      setLoadMsg('')
      await py.runPythonAsync(code)
      setOutput(buf || '(no output — try a print statement)')
      setStatus('idle')
    } catch (e) {
      setOutput(String(e))
      setStatus('error')
    }
  }, [code])

  const copy = useCallback(() => {
    navigator.clipboard?.writeText(code)
  }, [code])

  const openColab = useCallback(() => {
    // Copy code to clipboard and open a blank Colab notebook — user pastes with Cmd/Ctrl+V
    navigator.clipboard?.writeText(code)
    window.open('https://colab.research.google.com/#create=true', '_blank', 'noopener,noreferrer')
  }, [code])

  const reset = useCallback(() => {
    setCode(initialCode)
    setOutput('')
    setStatus('idle')
  }, [initialCode])

  return (
    <div className="space-y-3">
      <div className="rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 p-3 flex gap-2 items-start text-xs">
        <Warning size={16} className="text-emerald-600 mt-0.5 shrink-0" />
        <div className="leading-relaxed text-muted-foreground">
          Runs Python <strong>in your browser</strong> via Pyodide + NumPy with a numpy-backed
          <code> torch </code> shim. <strong>Real reverse-mode autograd</strong> for
          <code> nn.Linear</code>, activations, MSE / CrossEntropy, SGD and Adam — so training
          loops actually converge. Conv2d, Embedding and BatchNorm are forward-only shims; CUDA
          is not available. Click <strong>Open in Colab</strong> for the genuine PyTorch runtime.
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Button
          size="sm"
          onClick={run}
          disabled={status === 'loading' || status === 'running'}
          className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 border-0 h-8"
        >
          {status === 'loading' || status === 'running' ? (
            <Spinner size={14} className="mr-1 animate-spin" />
          ) : (
            <Play size={14} weight="fill" className="mr-1" />
          )}
          {status === 'loading' ? 'Loading…' : status === 'running' ? 'Running…' : 'Run'}
        </Button>
        <Button size="sm" variant="outline" onClick={reset} disabled={status === 'running'} className="h-8">
          <ArrowCounterClockwise size={14} className="mr-1" /> Reset
        </Button>
        <Button size="sm" variant="outline" onClick={copy} className="h-8">
          <Copy size={14} className="mr-1" /> Copy
        </Button>
        <Button size="sm" variant="outline" onClick={openColab} className="h-8">
          <ArrowSquareOut size={14} className="mr-1" /> Open in Colab
        </Button>
        {loadMsg && (
          <span className="text-xs text-muted-foreground ml-auto italic">{loadMsg}</span>
        )}
      </div>

      <div className="group/editor relative rounded-2xl border border-slate-800/80 bg-slate-950 shadow-lg shadow-black/40 ring-1 ring-white/5 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-900/60">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80 shadow-[0_0_0_1px_rgba(0,0,0,0.3)_inset]" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300/80 shadow-[0_0_0_1px_rgba(0,0,0,0.3)_inset]" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 shadow-[0_0_0_1px_rgba(0,0,0,0.3)_inset]" />
            <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-slate-500 hidden sm:inline">
              python
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 tabular-nums">
            {code.split('\n').length} lines · {code.length} chars
          </div>
        </div>

        {/* Editor — transparent textarea over a highlighted <pre> mirror */}
        <div className="relative bg-slate-950" style={{ maxHeight: 'min(60vh, 520px)' }}>
          <pre
            ref={preRef}
            aria-hidden
            className="absolute inset-0 m-0 p-4 font-mono text-[13px] leading-6 whitespace-pre overflow-auto pointer-events-none scrollbar-none text-slate-100"
            style={{ tabSize: 4 }}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
          <textarea
            ref={taRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onScroll={onScroll}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className="relative block w-full min-h-[260px] p-4 font-mono text-[13px] leading-6 bg-transparent text-transparent caret-emerald-300 selection:bg-emerald-400/30 outline-none resize-y whitespace-pre overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
            style={{ tabSize: 4, maxHeight: 'min(60vh, 520px)' }}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault()
                const t = e.currentTarget
                const s = t.selectionStart
                const ne = code.slice(0, s) + '    ' + code.slice(t.selectionEnd)
                setCode(ne)
                requestAnimationFrame(() => {
                  t.selectionStart = t.selectionEnd = s + 4
                })
              }
            }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800/80 bg-slate-950 shadow-lg shadow-black/40 ring-1 ring-white/5 overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-900/60">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'error'
                  ? 'bg-rose-400 animate-pulse'
                  : status === 'running' || status === 'loading'
                  ? 'bg-amber-300 animate-pulse'
                  : 'bg-emerald-400'
              }`}
            />
            <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
              output
            </span>
          </div>
          <span
            className={`text-[10px] font-mono ${
              status === 'error'
                ? 'text-rose-300'
                : status === 'running'
                ? 'text-amber-200'
                : status === 'loading'
                ? 'text-amber-200'
                : 'text-slate-500'
            }`}
          >
            {status === 'error'
              ? '● error'
              : status === 'running'
              ? '● running'
              : status === 'loading'
              ? '● loading'
              : 'ready'}
          </span>
        </div>
        <pre
          className={`p-3 font-mono text-[12.5px] leading-6 overflow-auto whitespace-pre-wrap scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent ${
            status === 'error' ? 'bg-rose-950/40 text-rose-200' : 'bg-slate-950 text-slate-100'
          }`}
          style={{ minHeight: '120px', maxHeight: 'min(40vh, 320px)' }}
        >
          {output || <span className="text-slate-600 italic">(press Run to execute)</span>}
        </pre>
      </div>
    </div>
  )
}
