"""
start_dev.py - Dragon Gold Android Development Launcher

Starts the Pixel 9 AVD emulator (if not already running), waits for full
boot, then launches the Expo Metro bundler for the Dragon Gold mobile app.

Usage:
    python start_dev.py [avd_name]

Arguments:
    avd_name    Optional. Override the default AVD name to search for.
                Default search pattern: "Pixel_9"

Examples:
    python start_dev.py
    python start_dev.py Pixel_9_API_35
"""

import subprocess
import sys
import os
import time
import ctypes

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

ANDROID_SDK    = r"C:\Users\ediaz\AppData\Local\Android\Sdk"
EMULATOR_EXE   = os.path.join(ANDROID_SDK, "emulator", "emulator.exe")
ADB_EXE        = os.path.join(ANDROID_SDK, "platform-tools", "adb.exe")
MOBILE_PROJECT = r"R:\Coding_Projects\_dragonGold"

DEFAULT_AVD_PATTERN  = "Pixel_9"
BOOT_TIMEOUT_SECONDS = 120
BOOT_POLL_INTERVAL   = 3


# ---------------------------------------------------------------------------
# Console color support
# ---------------------------------------------------------------------------

def _enable_windows_ansi():
    """Enable ANSI escape code processing on Windows 10+ consoles."""
    try:
        kernel32 = ctypes.windll.kernel32
        handle = kernel32.GetStdHandle(-11)  # STD_OUTPUT_HANDLE
        mode = ctypes.c_ulong(0)
        kernel32.GetConsoleMode(handle, ctypes.byref(mode))
        kernel32.SetConsoleMode(handle, mode.value | 0x0004)  # ENABLE_VIRTUAL_TERMINAL_PROCESSING
        return True
    except Exception:
        return False


_ANSI_ENABLED = _enable_windows_ansi()

_RESET  = "\033[0m"  if _ANSI_ENABLED else ""
_BOLD   = "\033[1m"  if _ANSI_ENABLED else ""
_GREEN  = "\033[92m" if _ANSI_ENABLED else ""
_YELLOW = "\033[93m" if _ANSI_ENABLED else ""
_RED    = "\033[91m" if _ANSI_ENABLED else ""
_CYAN   = "\033[96m" if _ANSI_ENABLED else ""
_DIM    = "\033[2m"  if _ANSI_ENABLED else ""


def log_info(msg):
    print(f"{_CYAN}[INFO]{_RESET}  {msg}")

def log_ok(msg):
    print(f"{_GREEN}[OK]{_RESET}    {msg}")

def log_warn(msg):
    print(f"{_YELLOW}[WARN]{_RESET}  {msg}")

def log_error(msg):
    print(f"{_RED}[ERROR]{_RESET} {msg}", file=sys.stderr)

def log_step(msg):
    print(f"\n{_BOLD}{_CYAN}>>> {msg}{_RESET}")

def log_dim(msg):
    print(f"{_DIM}        {msg}{_RESET}")


# ---------------------------------------------------------------------------
# AVD helpers
# ---------------------------------------------------------------------------

def list_avds():
    """
    Return a list of available AVD names from the local SDK.
    Raises RuntimeError if emulator.exe cannot be run.
    """
    try:
        result = subprocess.run(
            [EMULATOR_EXE, "-list-avds"],
            capture_output=True,
            text=True,
            timeout=15
        )
        avds = [line.strip() for line in result.stdout.splitlines() if line.strip()]
        return avds
    except FileNotFoundError:
        raise RuntimeError(
            f"emulator.exe not found at: {EMULATOR_EXE}\n"
            f"Verify Android SDK path: {ANDROID_SDK}"
        )
    except subprocess.TimeoutExpired:
        raise RuntimeError("emulator.exe -list-avds timed out after 15 seconds.")


def find_avd(avd_pattern, avds):
    """
    Search for an AVD whose name contains avd_pattern (case-insensitive).
    Returns the exact AVD name string.
    Exits with a clear message if not found.
    """
    pattern_lower = avd_pattern.lower()
    matches = [a for a in avds if pattern_lower in a.lower()]

    if not matches:
        log_error(f"No AVD matching '{avd_pattern}' was found.")
        log_error(f"Available AVDs ({len(avds)}):")
        for avd in avds:
            log_error(f"  - {avd}")
        log_error("Fix: Create a Pixel 9 AVD in Android Studio's AVD Manager.")
        sys.exit(1)

    if len(matches) > 1:
        log_warn(f"Multiple AVDs match '{avd_pattern}':")
        for m in matches:
            log_warn(f"  - {m}")
        log_warn(f"Using first match: {matches[0]}")

    return matches[0]


# ---------------------------------------------------------------------------
# Running emulator detection
# ---------------------------------------------------------------------------

def get_running_emulator_serials():
    """
    Return a list of serial IDs for emulators currently connected via adb.
    Example return: ["emulator-5554", "emulator-5556"]
    """
    try:
        result = subprocess.run(
            [ADB_EXE, "devices"],
            capture_output=True,
            text=True,
            timeout=10
        )
    except FileNotFoundError:
        raise RuntimeError(
            f"adb.exe not found at: {ADB_EXE}\n"
            f"Verify Android SDK path: {ANDROID_SDK}"
        )

    serials = []
    for line in result.stdout.splitlines():
        parts = line.strip().split()
        if len(parts) >= 2 and parts[0].startswith("emulator-") and parts[1] == "device":
            serials.append(parts[0])
    return serials


def get_avd_name_for_serial(serial):
    """
    Query the AVD name of a running emulator by its adb serial.
    Uses `adb -s <serial> emu avd name` which returns:
        Pixel_9
        OK
    Returns the AVD name string, or None if it cannot be determined.
    """
    try:
        result = subprocess.run(
            [ADB_EXE, "-s", serial, "emu", "avd", "name"],
            capture_output=True,
            text=True,
            timeout=5
        )
        lines = [l.strip() for l in result.stdout.splitlines() if l.strip()]
        # First non-empty line is the AVD name; second is "OK"
        if lines and lines[0] != "OK":
            return lines[0]
    except Exception:
        pass
    return None


def find_running_emulator_for_avd(avd_name):
    """
    Check all running emulators and return the serial of one matching avd_name.
    Returns None if no matching emulator is running.
    """
    serials = get_running_emulator_serials()
    for serial in serials:
        name = get_avd_name_for_serial(serial)
        if name and name.lower() == avd_name.lower():
            return serial
    return None


# ---------------------------------------------------------------------------
# Emulator launch
# ---------------------------------------------------------------------------

def launch_emulator(avd_name):
    """
    Start the emulator in a new detached process (independent console window).
    Returns immediately; the emulator boots in the background.
    """
    log_step(f"Launching emulator: {avd_name}")

    # CREATE_NEW_CONSOLE launches the emulator in its own window
    # so it does not block or share stdio with this script.
    CREATE_NEW_CONSOLE = 0x00000010

    try:
        proc = subprocess.Popen(
            [EMULATOR_EXE, "-avd", avd_name],
            creationflags=CREATE_NEW_CONSOLE,
            close_fds=True
        )
        log_ok(f"Emulator process started (PID {proc.pid}).")
        return proc
    except FileNotFoundError:
        log_error(f"emulator.exe not found at: {EMULATOR_EXE}")
        sys.exit(1)


# ---------------------------------------------------------------------------
# Boot wait logic
# ---------------------------------------------------------------------------

def wait_for_emulator_serial(avd_name, timeout=BOOT_TIMEOUT_SECONDS):
    """
    Poll adb devices until an emulator running avd_name appears as connected.
    Returns the serial string (e.g. "emulator-5554").
    Exits on timeout.
    """
    log_info("Waiting for emulator transport to connect to adb...")
    deadline = time.time() + timeout
    poll_count = 0

    while time.time() < deadline:
        serial = find_running_emulator_for_avd(avd_name)
        if serial:
            log_ok(f"Emulator transport connected: {serial}")
            return serial
        poll_count += 1
        if poll_count % 5 == 0:
            elapsed = int(time.time() - (deadline - timeout))
            log_dim(f"Still waiting for transport... ({elapsed}s elapsed)")
        time.sleep(BOOT_POLL_INTERVAL)

    log_error(f"Emulator transport did not appear within {timeout} seconds.")
    log_error("Possible causes:")
    log_error("  - Insufficient RAM to start the emulator")
    log_error("  - Virtualization (HAXM/WHPX) not enabled in BIOS")
    log_error("  - Emulator crashed on startup")
    sys.exit(1)


def wait_for_boot_completed(serial, timeout=BOOT_TIMEOUT_SECONDS):
    """
    Wait for Android to fully boot on the given emulator serial.

    Phase 1: adb wait-for-device (blocks until device is in device state).
    Phase 2: Poll sys.boot_completed every BOOT_POLL_INTERVAL seconds
             until it returns "1".
    """
    log_step(f"Waiting for Android boot on {serial}...")

    # Phase 1: wait-for-device (confirms transport state)
    log_info("Phase 1: Waiting for adb device state...")
    try:
        subprocess.run(
            [ADB_EXE, "-s", serial, "wait-for-device"],
            timeout=60,
            check=True,
            capture_output=True
        )
        log_ok("Device state confirmed.")
    except subprocess.TimeoutExpired:
        log_warn("wait-for-device timed out. Continuing to poll boot_completed.")
    except subprocess.CalledProcessError as e:
        log_warn(f"wait-for-device returned error: {e}. Continuing anyway.")

    # Phase 2: Poll sys.boot_completed
    log_info("Phase 2: Polling sys.boot_completed (this takes ~30-60 seconds)...")
    deadline = time.time() + timeout
    poll_count = 0

    while time.time() < deadline:
        try:
            result = subprocess.run(
                [ADB_EXE, "-s", serial, "shell", "getprop", "sys.boot_completed"],
                capture_output=True,
                text=True,
                timeout=8
            )
            if result.stdout.strip() == "1":
                log_ok("Android boot completed.")
                log_dim("Allowing 3 seconds for system services to settle...")
                time.sleep(3)
                return
        except subprocess.TimeoutExpired:
            # adb shell can hang during early boot; just retry
            pass
        except Exception as e:
            log_dim(f"getprop poll error (non-fatal): {e}")

        poll_count += 1
        elapsed = int(time.time() - (deadline - timeout))
        if poll_count % 4 == 0:
            remaining = int(deadline - time.time())
            log_dim(f"Waiting for boot... ({elapsed}s elapsed, {remaining}s remaining)")
        time.sleep(BOOT_POLL_INTERVAL)

    log_error(f"Android did not finish booting within {timeout} seconds.")
    log_error("The emulator may be too slow for the configured timeout.")
    log_error(f"You can increase BOOT_TIMEOUT_SECONDS (currently {timeout}s) in the script.")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Expo launcher
# ---------------------------------------------------------------------------

def launch_expo():
    """
    Start the Expo Metro bundler with --android flag.
    Blocking - the terminal stays attached to Metro output.
    """
    log_step("Launching Expo Metro bundler...")
    log_info(f"Working directory: {MOBILE_PROJECT}")
    log_info("Command: npx expo start --android --clear")
    print()  # Visual separation before Expo output

    if not os.path.isdir(MOBILE_PROJECT):
        log_error(f"Mobile project directory not found: {MOBILE_PROJECT}")
        sys.exit(1)

    try:
        # Use Popen with piped stdin so we can auto-confirm prompts
        # (e.g. "Install the recommended Expo Go version?")
        proc = subprocess.Popen(
            "npx expo start --android --clear",
            shell=True,
            cwd=MOBILE_PROJECT,
            stdin=subprocess.PIPE,
        )

        # Auto-confirm any initial prompt (Expo Go version update)
        proc.stdin.write(b"yes\n")
        proc.stdin.flush()
        proc.stdin.close()

        sys.exit(proc.wait())
    except KeyboardInterrupt:
        print()
        log_info("Expo stopped by user (Ctrl+C).")
        proc.terminate()
        sys.exit(0)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    # Parse optional AVD name argument
    avd_pattern = DEFAULT_AVD_PATTERN
    if len(sys.argv) > 1:
        avd_pattern = sys.argv[1]
        log_info(f"Using AVD pattern from argument: {avd_pattern}")
    else:
        log_info(f"Using default AVD pattern: {avd_pattern}")

    # -----------------------------------------------------------------------
    # Step 1: Validate SDK tools and project directory
    # -----------------------------------------------------------------------
    log_step("Validating Android SDK tools")

    for label, path in [("emulator.exe", EMULATOR_EXE), ("adb.exe", ADB_EXE)]:
        if not os.path.isfile(path):
            log_error(f"{label} not found at: {path}")
            log_error(f"Verify Android SDK is installed at: {ANDROID_SDK}")
            sys.exit(1)
        log_ok(f"Found {label}")

    if not os.path.isdir(MOBILE_PROJECT):
        log_error(f"Mobile project directory not found: {MOBILE_PROJECT}")
        sys.exit(1)
    log_ok(f"Found mobile project: {MOBILE_PROJECT}")

    # -----------------------------------------------------------------------
    # Step 2: List available AVDs and find match
    # -----------------------------------------------------------------------
    log_step("Scanning available AVDs")

    try:
        avds = list_avds()
    except RuntimeError as e:
        log_error(str(e))
        sys.exit(1)

    if not avds:
        log_error("No AVDs found. Create one in Android Studio's AVD Manager.")
        sys.exit(1)

    log_info(f"Found {len(avds)} AVD(s): {', '.join(avds)}")
    avd_name = find_avd(avd_pattern, avds)
    log_ok(f"Target AVD: {avd_name}")

    # -----------------------------------------------------------------------
    # Step 3: Check if emulator is already running
    # -----------------------------------------------------------------------
    log_step("Checking for already-running emulators")

    serial = find_running_emulator_for_avd(avd_name)

    if serial:
        log_ok(f"Emulator '{avd_name}' is already running on {serial}.")
        log_info("Skipping emulator launch.")
    else:
        log_info(f"No running emulator found for '{avd_name}'.")

        # -----------------------------------------------------------------------
        # Step 4: Launch emulator
        # -----------------------------------------------------------------------
        launch_emulator(avd_name)

        # -----------------------------------------------------------------------
        # Step 5: Wait for adb transport to appear
        # -----------------------------------------------------------------------
        serial = wait_for_emulator_serial(avd_name, timeout=BOOT_TIMEOUT_SECONDS)

    # -----------------------------------------------------------------------
    # Step 6: Wait for Android to fully boot
    # -----------------------------------------------------------------------
    # Check if already booted (handles the already-running case)
    try:
        result = subprocess.run(
            [ADB_EXE, "-s", serial, "shell", "getprop", "sys.boot_completed"],
            capture_output=True, text=True, timeout=8
        )
        if result.stdout.strip() == "1":
            log_ok(f"Emulator {serial} is already fully booted.")
        else:
            wait_for_boot_completed(serial, timeout=BOOT_TIMEOUT_SECONDS)
    except Exception:
        wait_for_boot_completed(serial, timeout=BOOT_TIMEOUT_SECONDS)

    # -----------------------------------------------------------------------
    # Step 7: Launch Expo
    # -----------------------------------------------------------------------
    launch_expo()


if __name__ == "__main__":
    main()
