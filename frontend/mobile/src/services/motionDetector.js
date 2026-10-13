import { Accelerometer } from 'expo-sensors';
import { Platform } from 'react-native';

class MotionDetector {
  constructor() {
    this.subscription = null;
    this.isEnabled = false;
    this.onShakeCallback = null;
    
    // Shake detection parameters
    this.SHAKE_THRESHOLD = 1.8; // Calibrated g-force delta above 1g baseline
    this.WINDOW_MS = 1200;      // 1.2s window for multi-directional reversal
    this.REQUIRED_REVERSALS = 3;// At least 3 directional shifts
    this.COOLDOWN_MS = 3500;    // 3.5s cooldown between trigger events
    
    this.lastX = 0;
    this.lastY = 0;
    this.lastZ = 0;
    this.reversalCount = 0;
    this.firstReversalTime = 0;
    this.lastTriggerTime = 0;
  }

  isAvailableAsync = async () => {
    try {
      if (Platform.OS === 'web') return false;
      return await Accelerometer.isAvailableAsync();
    } catch (e) {
      console.warn('[MotionDetector] Accelerometer availability check failed:', e.message);
      return false;
    }
  };

  startListening = (onShake) => {
    if (this.subscription) {
      this.stopListening();
    }

    this.onShakeCallback = onShake;
    this.isEnabled = true;
    this.reversalCount = 0;
    this.firstReversalTime = 0;

    try {
      Accelerometer.setUpdateInterval(80); // 80ms sampling rate (~12.5Hz)
      this.subscription = Accelerometer.addListener(this._handleSensorData);
      console.log('[MotionDetector] Accelerometer shake detection started.');
    } catch (e) {
      console.warn('[MotionDetector] Failed to attach Accelerometer listener:', e.message);
    }
  };

  stopListening = () => {
    this.isEnabled = false;
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.reversalCount = 0;
    console.log('[MotionDetector] Accelerometer shake detection stopped.');
  };

  _handleSensorData = ({ x, y, z }) => {
    if (!this.isEnabled || !this.onShakeCallback) return;

    const now = Date.now();
    // Guard against triggering during cooldown period
    if (this.lastTriggerTime > 0 && (now - this.lastTriggerTime < this.COOLDOWN_MS)) {
      return;
    }


    // Calculate total instantaneous acceleration magnitude
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const delta = Math.abs(magnitude - 1.0); // subtract static earth gravity (~1g)

    if (delta > this.SHAKE_THRESHOLD) {
      // Check for directional reversal across primary axes
      const deltaX = Math.abs(x - this.lastX);
      const deltaY = Math.abs(y - this.lastY);
      const deltaZ = Math.abs(z - this.lastZ);

      if (deltaX > 1.2 || deltaY > 1.2 || deltaZ > 1.2) {
        if (this.reversalCount === 0 || (now - this.firstReversalTime > this.WINDOW_MS)) {
          // Start a new shake sequence window
          this.reversalCount = 1;
          this.firstReversalTime = now;
        } else {
          this.reversalCount += 1;
        }

        // Qualifying deliberate shake pattern verified
        if (this.reversalCount >= this.REQUIRED_REVERSALS) {
          console.log('[MotionDetector] Deliberate qualifying shake pattern detected!');
          this.lastTriggerTime = now;
          this.reversalCount = 0;
          this.firstReversalTime = 0;
          
          if (typeof this.onShakeCallback === 'function') {
            this.onShakeCallback();
          }
        }
      }
    } else {
      // Reset window if past window time and no movement
      if (this.reversalCount > 0 && (now - this.firstReversalTime > this.WINDOW_MS)) {
        this.reversalCount = 0;
        this.firstReversalTime = 0;
      }
    }

    this.lastX = x;
    this.lastY = y;
    this.lastZ = z;
  };
}

export const motionDetector = new MotionDetector();
