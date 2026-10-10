import { registerWebModule, NativeModule } from 'expo';

class ExpoDirectSmsModule extends NativeModule<{}> {
  async sendSmsAsync(phoneNumber: string, message: string): Promise<boolean> {
    return false;
  }
  async makeCallAsync(phoneNumber: string): Promise<boolean> {
    return false;
  }
}

export default registerWebModule(ExpoDirectSmsModule, 'ExpoDirectSmsModule');
