# =========================
# Stage 1: Build ASP.NET Core
# =========================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY Server/MetroVerify360/MetroVerify360.csproj Server/MetroVerify360/

RUN dotnet restore Server/MetroVerify360/MetroVerify360.csproj

COPY Server/MetroVerify360/ Server/MetroVerify360/

RUN dotnet publish Server/MetroVerify360/MetroVerify360.csproj \
    -c Release \
    -o /app/publish \
    --no-restore


# =========================
# Stage 2: Runtime
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

# Install Python and Linux dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        python3-venv \
        python-is-python3 \
        libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*

# Copy ASP.NET application
COPY --from=build /app/publish .

# Copy bundled ML engine
COPY Server/ML ./ML

# Install Python ML dependencies
RUN python -m pip install \
    --no-cache-dir \
    --break-system-packages \
    -r ./ML/requirements.txt

ENV ASPNETCORE_ENVIRONMENT=Production

# Render provides the actual PORT at runtime
EXPOSE 10000

CMD ["sh", "-c", "dotnet MetroVerify360.dll --urls http://0.0.0.0:${PORT:-10000}"]