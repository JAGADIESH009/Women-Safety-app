package expo.modules.directsms

import android.telephony.SmsManager
import android.content.Intent
import android.app.PendingIntent
import android.net.Uri
import java.util.ArrayList
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

class ExpoDirectSmsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoDirectSms")

    AsyncFunction("sendSmsAsync") { phoneNumber: String, message: String, promise: Promise ->
      try {
        val context = appContext.reactContext ?: throw Exception("React context is null")
        val smsManager = SmsManager.getDefault()
        val parts = smsManager.divideMessage(message)
        
        val sentIntents = ArrayList<PendingIntent>()
        for (i in parts.indices) {
            val intent = Intent("SMS_SENT_ACTION")
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                0,
                intent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )
            sentIntents.add(pendingIntent)
        }
        
        smsManager.sendMultipartTextMessage(phoneNumber, null, parts, sentIntents, null)
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("SMS_FAILED", e.message ?: "Failed to send SMS", e)
      }
    }

    AsyncFunction("makeCallAsync") { phoneNumber: String, promise: Promise ->
      try {
        val intent = Intent(Intent.ACTION_CALL)
        intent.data = Uri.parse("tel:$phoneNumber")
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        appContext.reactContext?.startActivity(intent)
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("CALL_FAILED", e.message ?: "Failed to make call", e)
      }
    }
  }
}
