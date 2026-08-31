from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from backend.schemas.product import ProductResponse
from backend.schemas.activity import ActivityResponse

class TaskItem(BaseModel):
    id: str
    title: str
    description: str
    category: str
    completed: bool = False
    dueDate: str = "Today"

class BusinessHealthStats(BaseModel):
    totalProducts: int = 0
    marketplaceReadyProducts: int = 0
    marketplaceReadyCount: int = 0
    healthScore: int = 0
    estimatedMonthlyRevenue: float = 0.0
    monthlyViews: int = 0
    inquiriesReceived: int = 0
    activeOrders: int = 0
    completedTasksCount: int = 0

class DashboardResponse(BaseModel):
    user: Dict[str, Any]
    stats: BusinessHealthStats
    tasks: List[TaskItem] = Field(default_factory=list)
    recentProducts: List[ProductResponse] = Field(default_factory=list)
    recentActivity: List[ActivityResponse] = Field(default_factory=list)
