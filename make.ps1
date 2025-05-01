param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "clean", "build-backend", "build-frontend", "run", "dev", "install", "test", "fresh")]
    [string]$target = "all"
)

function Clean {
    Write-Host "Cleaning build artifacts..."
    & .\mvnw.cmd clean
    Remove-Item -Path "src\main\resources\static\*" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "src\frontend\build" -Recurse -Force -ErrorAction SilentlyContinue
}

function Build-Backend {
    Write-Host "Building backend..."
    & .\mvnw.cmd clean package -DskipTests
}

function Build-Frontend {
    Write-Host "Building frontend..."
    Set-Location src\frontend
    & npm install
    & npm run build
    Set-Location ..\..
    Remove-Item -Path "src\main\resources\static\*" -Recurse -Force -ErrorAction SilentlyContinue
    Copy-Item -Path "src\frontend\build\*" -Destination "src\main\resources\static\" -Recurse -Force
}

function Run {
    Write-Host "Running application..."
    & java -jar target\SWI125-0.0.1-SNAPSHOT.jar
}

function Dev {
    Write-Host "Running in development mode..."
    & .\mvnw.cmd spring-boot:run
}

function Install {
    Write-Host "Installing dependencies..."
    & .\mvnw.cmd install
    Set-Location src\frontend
    & npm install
    Set-Location ..\..
}

function Test {
    Write-Host "Running tests..."
    & .\mvnw.cmd test
}

switch ($target) {
    "all" {
        Clean
        Build-Backend
        Build-Frontend
    }
    "clean" { Clean }
    "build-backend" { Build-Backend }
    "build-frontend" { Build-Frontend }
    "run" { Run }
    "dev" { Dev }
    "install" { Install }
    "test" { Test }
    "fresh" {
        Clean
        Install
        Run
    }
} 