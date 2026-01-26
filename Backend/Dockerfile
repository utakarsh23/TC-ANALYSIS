FROM ubuntu:22.04

# Install required languages and tools
RUN apt-get update && apt-get install -y \
    g++ \
    openjdk-17-jdk \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /sandbox

# Set resource limits (optional but recommended)
ENV MEMORY_LIMIT=512m
ENV CPU_LIMIT=1

# Default command
CMD ["/bin/bash"]
