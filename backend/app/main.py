from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine

# 👇 models (important for table creation)
from app.models import user, incentive_rule

# 👇 routers
from app.routers import auth, analytics, roles, dashboard, incentive_rule,cost_center_user_map,users,states,districts,pincodes,user_state_targets,voucher, quotations, stock_groups, item_gp,stock_alerts,item_sales,stock_ageing

# --------------------------------------------------
# CREATE TABLES
# --------------------------------------------------
Base.metadata.create_all(bind=engine)

# --------------------------------------------------
# FASTAPI APP
# --------------------------------------------------
app = FastAPI(title="BB Admin API")

# --------------------------------------------------
# CORS
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# ROUTERS (NO EXTRA PREFIX)
# --------------------------------------------------
app.include_router(auth.router)
app.include_router(analytics.router)
app.include_router(roles.router)
app.include_router(dashboard.router)
app.include_router(incentive_rule.router)  
app.include_router(cost_center_user_map.router)
app.include_router(users.router)
app.include_router(states.router)
app.include_router(districts.router)
app.include_router(pincodes.router)
app.include_router(user_state_targets.router)
app.include_router(voucher.router)
app.include_router(quotations.router)
app.include_router(stock_groups.router)
app.include_router(item_gp.router)
app.include_router(stock_alerts.router)
app.include_router(item_sales.router)
app.include_router(stock_ageing.router)

