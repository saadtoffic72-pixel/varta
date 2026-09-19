from abc import ABC, abstractmethod
from typing import Any, Dict

class AbstractAIModel(ABC):
    """
    Abstract Base Class for all AI/ML models in the VARTA architecture.
    Provides standardized hooks for model weight loading, preprocessing,
    inference, post-processing, and performance metric reporting.
    Future deep learning models (PyTorch / ONNX / TensorRT) will inherit directly from this.
    """

    def __init__(self, model_name: str, version: str):
        self.model_name = model_name
        self.version = version
        self.is_loaded = False

    @abstractmethod
    def load_weights(self, weights_path: str = "") -> bool:
        """Load pretrained model weights or initialize computational graph."""
        pass

    @abstractmethod
    def preprocess(self, inputs: Dict[str, Any]) -> Any:
        """Standardize raw sensor, satellite, or numerical model inputs."""
        pass

    @abstractmethod
    def predict(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Perform forward pass / inference and generate raw predictions."""
        pass

    @abstractmethod
    def postprocess(self, raw_outputs: Any) -> Dict[str, Any]:
        """Convert tensor/mathematical outputs to standardized meteorological domain formats."""
        pass

    def get_metadata(self) -> Dict[str, Any]:
        """Return model architecture and versioning metadata."""
        return {
            "model_name": self.model_name,
            "version": self.version,
            "is_loaded": self.is_loaded,
        }
