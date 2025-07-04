import os

# Bind to 0.0.0.0 to be accessible from outside the container
bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"

# Number of worker processes
workers = int(os.environ.get('WEB_CONCURRENCY', 3))

# Set a reasonable timeout
timeout = 120
