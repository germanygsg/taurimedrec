# GitHub Actions Workflows

This repository contains automated build and release workflows using GitHub Actions.

## 🚀 Workflows

### 1. Build Windows (`build-windows.yml`)
- **Trigger**: Push to main/master/develop branches, pull requests, manual dispatch
- **Runner**: `windows-latest`
- **Outputs**: Windows executable and NSIS installer
- **Artifacts**: Uploaded as `windows-build` (retention: 30 days)

### 2. Build Linux (`build-linux.yml`)
- **Trigger**: Push to main/master/develop branches, pull requests, manual dispatch
- **Runner**: `ubuntu-latest`
- **Outputs**: AppImage and DEB package
- **Artifacts**: Uploaded as `linux-build` (retention: 30 days)

### 3. Release (`release.yml`)
- **Trigger**: Git tags (v*), manual dispatch
- **Runners**: `ubuntu-latest` (coordinator), `windows-latest` + `ubuntu-latest` (builders)
- **Outputs**: Complete release with all platforms
- **Creates**: GitHub release with all binaries

## 📦 Build Artifacts

### Windows
- `patient-management-app.exe` - Standalone executable (~11MB)
- `Patient Management App_x64-setup.exe` - NSIS installer with Webview2 (~4.3MB)
- `Patient Management App_x64_en-US.msi` - MSI installer

### Linux
- `Patient Management App.AppImage` - Portable AppImage
- `patient-management-app_*_amd64.deb` - Debian package
- `patient-management-app` - Standalone binary

## 🔧 Local Development

To test workflows locally, you can use:

```bash
# Install act (GitHub Actions runner)
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Test specific workflow
act -j build-windows
act -j build-linux
```

## 🚀 Usage

### Automatic Builds
Push changes to trigger automatic builds:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

### Manual Builds
Trigger builds manually via GitHub Actions tab in your repository.

### Releases
Create a new release by:
1. Creating a git tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
2. Or using the manual dispatch option in the Release workflow

## 📋 Workflow Dependencies

- All workflows use Rust and Node.js caching for faster builds
- Windows workflow uses Windows-specific optimizations
- Linux workflow installs required GTK and WebKit dependencies
- Release workflow depends on successful completion of both build workflows

## 🔍 Monitoring

- Check the **Actions** tab in your GitHub repository
- Download artifacts from workflow runs
- Monitor build times and success rates

## 🐛 Troubleshooting

### Windows Build Issues
- Check if all Windows dependencies are properly configured
- Verify Tauri configuration for Windows targets

### Linux Build Issues
- Ensure webkit2gtk dependencies are correctly installed
- Check if package names match the target Ubuntu version

### Release Issues
- Verify proper tagging format (vX.Y.Z)
- Check if both build workflows completed successfully
- Ensure GitHub token has necessary permissions