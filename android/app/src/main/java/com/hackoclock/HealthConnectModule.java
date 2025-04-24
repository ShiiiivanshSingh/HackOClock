package com.hackoclock;

import androidx.health.connect.client.HealthConnectClient;
import androidx.health.connect.client.records.*;
import androidx.health.connect.client.time.TimeRangeFilter;
import androidx.health.connect.client.permission.HealthPermission;
import androidx.health.connect.client.request.ReadRecordsRequest;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class HealthConnectModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private HealthConnectClient healthConnectClient;
    private final ExecutorService executorService = Executors.newSingleThreadExecutor();

    public HealthConnectModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "HealthConnect";
    }

    @ReactMethod
    public void checkAvailability(Promise promise) {
        try {
            boolean isAvailable = HealthConnectClient.getSdkStatus(reactContext) == HealthConnectClient.SDK_AVAILABLE;
            promise.resolve(isAvailable);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void requestPermissions(Promise promise) {
        try {
            if (healthConnectClient == null) {
                healthConnectClient = HealthConnectClient.getOrCreate(reactContext);
            }

            Set<HealthPermission> permissions = Set.of(
                HealthPermission.getReadPermission(StepsRecord.class),
                HealthPermission.getReadPermission(SleepSessionRecord.class),
                HealthPermission.getReadPermission(HeartRateRecord.class)
            );
            
            executorService.execute(() -> {
                try {
                    healthConnectClient.permissionController
                        .getGrantedPermissions()
                        .addOnSuccessListener(grantedPermissions -> {
                            if (grantedPermissions.containsAll(permissions)) {
                                promise.resolve(true);
                            } else {
                                // Launch permission request activity
                                promise.resolve(false);
                            }
                        })
                        .addOnFailureListener(e -> promise.reject("PERMISSION_ERROR", e.getMessage()));
                } catch (Exception e) {
                    promise.reject("ERROR", e.getMessage());
                }
            });
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getHealthData(Promise promise) {
        try {
            if (healthConnectClient == null) {
                healthConnectClient = HealthConnectClient.getOrCreate(reactContext);
            }

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startOfDay = now.withHour(0).withMinute(0).withSecond(0);
            LocalDateTime endOfDay = now.withHour(23).withMinute(59).withSecond(59);

            TimeRangeFilter timeFilter = new TimeRangeFilter.Builder()
                .setStartTime(startOfDay.atZone(ZoneId.systemDefault()).toInstant())
                .setEndTime(endOfDay.atZone(ZoneId.systemDefault()).toInstant())
                .build();

            WritableMap data = Arguments.createMap();

            executorService.execute(() -> {
                try {
                    // Initialize with default values
                    data.putInt("steps", 0);
                    data.putDouble("sleepHours", 0.0);
                    data.putString("sleepQuality", "Unknown");
                    data.putInt("heartRate", 0);
                    data.putInt("waterIntake", 0);
                    data.putInt("waterIntakeCups", 0);
                    data.putInt("stressLevel", 0);
                    data.putInt("caloriesBurned", 0);
                    data.putInt("weeklyProgress", 0);
                    data.putInt("weeklySteps", 0);
                    data.putInt("activeDays", 0);
                    data.putInt("currentStreak", 0);
                    data.putInt("totalPoints", 0);
                    data.putDouble("morningWalkDistance", 0.0);
                    data.putInt("morningWalkCalories", 0);

                    // Read steps data
                    healthConnectClient.readRecords(new ReadRecordsRequest.Builder<>(StepsRecord.class)
                        .setTimeRangeFilter(timeFilter)
                        .build())
                        .addOnSuccessListener(records -> {
                            long totalSteps = 0;
                            for (StepsRecord record : records) {
                                totalSteps += record.getCount();
                            }
                            data.putInt("steps", (int) totalSteps);
                            data.putInt("weeklySteps", (int) totalSteps * 7); // Simplified weekly calculation
                            data.putInt("weeklyProgress", (int) ((totalSteps / 10000.0) * 100)); // Assuming 10k steps goal
                        })
                        .addOnFailureListener(e -> {
                            // Log error but continue with other data
                            e.printStackTrace();
                        });

                    // Read sleep data
                    healthConnectClient.readRecords(new ReadRecordsRequest.Builder<>(SleepSessionRecord.class)
                        .setTimeRangeFilter(timeFilter)
                        .build())
                        .addOnSuccessListener(records -> {
                            long totalSleepMs = 0;
                            for (SleepSessionRecord record : records) {
                                totalSleepMs += record.getEndTime().toEpochMilli() - record.getStartTime().toEpochMilli();
                            }
                            double sleepHours = totalSleepMs / (1000.0 * 60 * 60);
                            data.putDouble("sleepHours", sleepHours);
                            data.putString("sleepQuality", sleepHours >= 7 ? "Good" : sleepHours >= 6 ? "Fair" : "Poor");
                        })
                        .addOnFailureListener(e -> {
                            // Log error but continue with other data
                            e.printStackTrace();
                        });

                    // Read heart rate data
                    healthConnectClient.readRecords(new ReadRecordsRequest.Builder<>(HeartRateRecord.class)
                        .setTimeRangeFilter(timeFilter)
                        .build())
                        .addOnSuccessListener(records -> {
                            int totalHeartRate = 0;
                            int count = 0;
                            for (HeartRateRecord record : records) {
                                for (HeartRateRecord.Sample sample : record.getSamples()) {
                                    totalHeartRate += sample.getBeatsPerMinute();
                                    count++;
                                }
                            }
                            data.putInt("heartRate", count > 0 ? totalHeartRate / count : 0);

                            // After all data is collected, resolve the promise
                            promise.resolve(data);
                        })
                        .addOnFailureListener(e -> {
                            // If heart rate fails, still resolve with collected data
                            promise.resolve(data);
                        });
                } catch (Exception e) {
                    promise.reject("ERROR", e.getMessage());
                }
            });
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @Override
    public void onCatalystInstanceDestroy() {
        executorService.shutdown();
        super.onCatalystInstanceDestroy();
    }
} 