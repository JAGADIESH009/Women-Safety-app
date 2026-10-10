import { NativeModule, requireOptionalNativeModule } from 'expo-modules-core';

declare class ExpoDirectSmsModule extends NativeModule<{}> {
  sendSmsAsync(phoneNumber: string, message: string): Promise<boolean>;
  makeCallAsync(phoneNumber: string): Promise<boolean>;
}

export default requireOptionalNativeModule<ExpoDirectSmsModule>('ExpoDirectSms');
