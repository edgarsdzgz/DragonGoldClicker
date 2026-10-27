<#
.SYNOPSIS
  Builds the Android game: a playtest APK with the dev tools, or a store bundle without them.

.DESCRIPTION
  playtest  Release APK with Settings > Dev (EXPO_PUBLIC_DEV_TOOLS=1). -Install puts it on the phone.
  store     Release bundle (.aab) for Google Play. The dev tools are forced off: the variable is set
            to 0 here, and a value already in the environment wins over any .env file at bundle time.

  After an APK build it checks the app's Android permissions against the expected list and fails on
  any other, so a library cannot add one unnoticed (app.json blockedPermissions removes the rest).
  It warns when release builds are still signed with the debug key (fine for playtests; Google Play
  will not accept it).

.EXAMPLE
  .\scripts\build-android.ps1 -Kind playtest -Install
  .\scripts\build-android.ps1 -Kind store
#>
param(
  [ValidateSet('playtest', 'store')]
  [string]$Kind = 'playtest',
  [switch]$Install,
  [string]$Device = 'R5CY13MYKXR'
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
$env:EXPO_PUBLIC_DEV_TOOLS = if ($Kind -eq 'playtest') { '1' } else { '0' }

# The permissions the game may have; anything else fails the build
$expected = @(
  'android.permission.INTERNET',
  'android.permission.ACCESS_NETWORK_STATE',
  'android.permission.MODIFY_AUDIO_SETTINGS',
  'android.permission.VIBRATE',
  'com.ediaz.dragongold.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'
)

$gradle = Join-Path $root 'android\app\build.gradle'
if (-not (Test-Path $gradle)) { throw 'No android project: run  npx expo prebuild --platform android --no-install  first' }
if ((Get-Content $gradle -Raw) -match 'release\s*\{[^}]*signingConfig\s+signingConfigs\.debug') {
  Write-Warning 'Release builds are signed with the debug key: fine for playtests, not accepted by Google Play.'
}

$task = if ($Kind -eq 'store') { 'bundleRelease' } else { 'assembleRelease' }
# Gradle does not see EXPO_PUBLIC_DEV_TOOLS change: it would reuse the last JS bundle, so a store build
# right after a playtest one would ship the dev tools. Removing it makes Gradle bundle the JS again.
Remove-Item (Join-Path $root 'android\app\build\generated\assets\createBundleReleaseJsAndAssets') -Recurse -Force -ErrorAction SilentlyContinue
Push-Location (Join-Path $root 'android')
# Gradle and Expo print warnings on stderr; Windows PowerShell would stop on them. The exit code decides.
$ErrorActionPreference = 'Continue'
try {
  & .\gradlew.bat $task -q 2>&1 | Where-Object { "$_" -match 'error|FAIL' } | ForEach-Object { "$_" }
  if ($LASTEXITCODE -ne 0) { throw "Gradle $task failed ($LASTEXITCODE)" }
} finally {
  Pop-Location
  $ErrorActionPreference = 'Stop'
}

if ($Kind -eq 'store') {
  $aab = Join-Path $root 'android\app\build\outputs\bundle\release\app-release.aab'
  Write-Host "Store bundle (dev tools off): $aab"
  return
}

$apk = Join-Path $root 'android\app\build\outputs\apk\release\app-release.apk'
# The newest stable build tools (a name like 36.0.0-rc1 is skipped)
$aapt = Get-ChildItem (Join-Path $env:ANDROID_HOME 'build-tools') -Directory |
  Where-Object { $_.Name -match '^\d+(\.\d+)+$' } |
  Sort-Object { [version]$_.Name } | Select-Object -Last 1 |
  ForEach-Object { Join-Path $_.FullName 'aapt.exe' }
$permissions = & $aapt dump permissions $apk | Select-String "uses-permission: name='([^']+)'" |
  ForEach-Object { $_.Matches[0].Groups[1].Value }
Write-Host 'Permissions:'
$permissions | ForEach-Object { "  $_" }
$unexpected = $permissions | Where-Object { $expected -notcontains $_ }
if ($unexpected) { throw "Unexpected permissions: $($unexpected -join ', '). Block them in app.json (android.blockedPermissions) or add them to the expected list." }

Write-Host "Playtest APK (dev tools on): $apk"
if ($Install) {
  & (Join-Path $env:ANDROID_HOME 'platform-tools\adb.exe') -s $Device install -r $apk
  if ($LASTEXITCODE -ne 0) { throw "Install on $Device failed ($LASTEXITCODE)" }
}
