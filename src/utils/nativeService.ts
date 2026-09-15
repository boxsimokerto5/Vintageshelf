import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { App } from '@capacitor/app';

class NativeBridgeService {
  private wakeLockSentinel: any = null;
  private backButtonListenerRegistered = false;

  /**
   * Check if running as native Android/iOS APK
   */
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Enter full immersive reading mode (hide status bar and expand to notch)
   */
  async enterImmersiveReadingMode(): Promise<void> {
    if (this.isNative()) {
      try {
        await StatusBar.hide();
        await StatusBar.setOverlaysWebView({ overlay: true });
      } catch (err) {
        console.warn('Native status bar hide not supported:', err);
      }
    }
    // Also request screen stay awake while reading
    this.keepScreenAwake(true);
  }

  /**
   * Exit immersive reading mode (restore status bar)
   */
  async exitImmersiveReadingMode(): Promise<void> {
    if (this.isNative()) {
      try {
        await StatusBar.show();
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (err) {
        console.warn('Native status bar show error:', err);
      }
    }
    // Release screen stay awake
    this.keepScreenAwake(false);
  }

  /**
   * Keep screen awake while reading without dimming
   * Works on modern Android WebView via Web Wake Lock API
   */
  async keepScreenAwake(enable: boolean): Promise<void> {
    try {
      if (enable) {
        if ('wakeLock' in navigator && !this.wakeLockSentinel) {
          this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
          this.wakeLockSentinel.addEventListener('release', () => {
            this.wakeLockSentinel = null;
          });
        }
      } else {
        if (this.wakeLockSentinel) {
          await this.wakeLockSentinel.release();
          this.wakeLockSentinel = null;
        }
      }
    } catch (e) {
      // Non-critical, fail silently if battery saver overrides
    }
  }

  /**
   * Lock screen orientation if desired (e.g. landscape for 2-page spread)
   */
  async lockOrientation(orientation: 'portrait' | 'landscape' | 'auto'): Promise<void> {
    if (this.isNative()) {
      try {
        if (orientation === 'auto') {
          await ScreenOrientation.unlock();
        } else {
          await ScreenOrientation.lock({ orientation });
        }
      } catch (err) {
        console.warn('Screen orientation lock error:', err);
      }
    }
  }

  /**
   * Register hardware back button listener for Android
   */
  registerBackButtonHandler(onBackPressed: () => boolean): void {
    if (this.isNative() && !this.backButtonListenerRegistered) {
      this.backButtonListenerRegistered = true;
      App.addListener('backButton', () => {
        // If handler returns true, the action was handled (e.g., closed book)
        // If false, allow Android default behavior
        const handled = onBackPressed();
        if (!handled) {
          App.exitApp();
        }
      });
    }
  }
}

export const NativeBridge = new NativeBridgeService();
