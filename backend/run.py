#!/usr/bin/env python3
"""
Run the development server.
"""

import uvicorn
from app.config import config

if __name__ == "__main__":
    print(f"Starting server on http://{config.HOST}:{config.PORT}")
    print(f"API docs: http://localhost:{config.PORT}/docs")
    print(f"Mode: {config.ENV}")
    print()

    uvicorn.run(
        "app.main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True,
    )
