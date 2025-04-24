package com.hackoclock;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.WindowCompat;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactPackage;
import com.facebook.react.ReactPackageList;
import com.facebook.react.ReactPackageManager;
import com.facebook.react.ReactPackages;
import com.facebook.react.healthconnect.HealthConnectPackage;
import java.util.List;

public class MainActivity extends AppCompatActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
    if (savedInstanceState == null) {
      getSupportFragmentManager().beginTransaction().replace(R.id.container, new MainActivityFragment()).commit();
    }
  }

  @Override
  protected List<ReactPackage> getPackages() {
    List<ReactPackage> packages = new ReactPackageList(this).getPackages();
    packages.add(new HealthConnectPackage());
    return packages;
  }
} 