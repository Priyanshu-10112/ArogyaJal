package com.myapp.ashalogin;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;

public class AshaLoginModule extends ReactContextBaseJavaModule {
  private final FirebaseFirestore firestore;

  public AshaLoginModule(ReactApplicationContext reactContext) {
    super(reactContext);
    firestore = FirebaseFirestore.getInstance();
  }

  @NonNull
  @Override
  public String getName() {
    return "AshaLogin";
  }

  @ReactMethod
  public void checkRegistered(String phoneNumber, Promise promise) {
    if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
      promise.reject("E_INVALID_PHONE", "Phone number is required");
      return;
    }

    // Normalize phone (simple trim). You may want to add country codes here
    final String docId = phoneNumber.trim();

    firestore
      .collection("asha_workers")
      .document(docId)
      .get()
      .addOnSuccessListener(new OnSuccessListener<DocumentSnapshot>() {
        @Override
        public void onSuccess(DocumentSnapshot snapshot) {
          boolean exists = snapshot.exists();
          promise.resolve(exists);
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception e) {
          promise.reject("E_FIRESTORE", e);
        }
      });
  }
}
