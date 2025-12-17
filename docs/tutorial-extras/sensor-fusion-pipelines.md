---
sidebar_position: 1
---

# 1. Building Sensor Fusion Pipelines with `robot_localization`

Sensor fusion is critical for robust robot autonomy, combining data from multiple sensors to achieve a more accurate and reliable estimate of a robot's state (position, velocity, orientation) than any single sensor can provide. This tutorial will guide you through setting up a basic Extended Kalman Filter (EKF) using the `robot_localization` package in ROS 2, leveraging data from odometry and an Inertial Measurement Unit (IMU).

## 1.1 Understanding `robot_localization` and EKF

The `robot_localization` package is a versatile tool in ROS 2 that implements various state estimation algorithms, including the Extended Kalman Filter (EKF) and Unscented Kalman Filter (UKF). An EKF (discussed conceptually in Chapter 2) is particularly well-suited for fusing data from sensors with different update rates and noise characteristics, producing a smooth and accurate state estimate.

**Why Sensor Fusion?**
*   **Accuracy:** Combining data mitigates individual sensor errors and noise.
*   **Robustness:** If one sensor temporarily fails or provides noisy data, others can compensate.
*   **Completeness:** Different sensors provide different types of information (e.g., IMU for orientation, odometry for relative position). Fusion provides a more complete picture.
*   **Drift Reduction:** Odometry can drift over time, while IMU provides good short-term accuracy but integrates to drift. Fusing them can reduce overall drift.

**Possible Pitfalls:** Incorrectly configured sensor covariances can lead to poor estimates. Ensure your IMU provides linear acceleration and angular velocity, and that odometry provides position/velocity.

## 1.2 Setting Up Your Launch File

We'll create a ROS 2 launch file to bring up the EKF node and configure it. For this tutorial, assume you have a robot in Gazebo (from Tutorial 3) that publishes `/odom` (odometry) and `/imu` (IMU data).

### 1.2.1 Create a `robot_localization` Configuration

First, create a `config` folder in your `my_robot_bringup` package (from Tutorial 3) and a YAML file named `ekf_config.yaml`:

```yaml
# In my_robot_bringup/config/ekf_config.yaml
# Configuration for the EKF node
ekf_filter_node:
  ros__parameters:
    frequency: 30.0 # EKF update frequency
    sensor_timeout: 0.1 # Max time without sensor data

    # State variables to estimate (x, y, z, roll, pitch, yaw, vx, vy, vz, vroll, vpitch, vyaw, ax, ay, az)
    map_frame: map # The frame in which the filter will operate
    odom_frame: odom # The odometry frame (e.g., from wheel encoders)
    base_link_frame: base_link # The robot's base frame
    world_frame: odom # Typically 'odom' for wheel-based robots, 'map' if using global localization

    # --- INPUTS ---
    # Odometry input: typically from wheel encoders or visual odometry
    odom0: /odom
    odom0_config: [true,  true,  false, # x, y, z (position)
                   false, false, false, # roll, pitch, yaw (orientation)
                   true,  true,  false, # vx, vy, vz (linear velocity)
                   false, false, false, # vroll, vpitch, vyaw (angular velocity)
                   false, false, false] # ax, ay, az (linear acceleration)
    odom0_differential: false # Set to true if odometry reports cumulative changes

    # IMU input: provides orientation and angular velocity
    imu0: /imu
    imu0_config: [false, false, false, # x, y, z
                  true,  true,  true,  # roll, pitch, yaw (orientation, if IMU is fused for absolute orientation)
                  false, false, false, # vx, vy, vz
                  true,  true,  true,  # vroll, vpitch, vyaw (angular velocity from gyro)
                  false, false, false] # ax, ay, az (linear acceleration from accelerometer)
    imu0_differential: false
    imu0_remove_gravitational_acceleration: true # Important for accelerometers
```
**Explanation:** This configuration tells the EKF node what frames to operate in (`map_frame`, `odom_frame`, `base_link_frame`), and which state variables to estimate. Crucially, `odom0_config` and `imu0_config` specify which values from the `/odom` and `/imu` topics should be used in the filter. For example, `imu0_config` fuses roll, pitch, yaw, and their velocities from the IMU.

### 1.2.2 Create the Launch File

Now, create a launch file (e.g., `ekf_localization.launch.py`) in your `my_robot_bringup/launch` directory:

```python
# In my_robot_bringup/launch/ekf_localization.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os

def generate_launch_description():
    pkg_dir = get_package_share_directory('my_robot_bringup')
    config_file = os.path.join(pkg_dir, 'config', 'ekf_config.yaml')

    return LaunchDescription([
        Node(
            package='robot_localization',
            executable='ekf_node',
            name='ekf_filter_node',
            output='screen',
            parameters=[config_file],
            remappings=[('odometry/filtered', 'odom/filtered')] # Remap output if needed
        )
    ])
```
**Explanation:** This launch file starts the `ekf_node` from the `robot_localization` package and loads our `ekf_config.yaml` as parameters. It also shows a common remapping, where the filter's output is remapped from its default `odometry/filtered` to `odom/filtered`.

## 1.3 Running the Sensor Fusion Pipeline

To see the EKF in action, you'll need your simulated robot in Gazebo to be running and publishing `/odom` and `/imu` data. Many standard ROS 2 robot models in Gazebo will do this automatically (e.g., `ros_ign_gazebo_demos` provides a simple `diff_drive_robot` with IMU and odometry).

### 1.3.1 Launch Your Robot and EKF

1.  **Terminal 1:** Launch your Gazebo robot simulation (e.g., `ros2 launch ros_gz_sim_demos diff_drive_robot.launch.py`). This should bring up Gazebo with a robot and publish `/odom` and `/imu` topics.
2.  **Terminal 2:** Launch the EKF node: `ros2 launch my_robot_bringup ekf_localization.launch.py`

### 1.3.2 Visualize in RViz 2

Now, visualize the fused odometry and original odometry to see the difference.

1.  **Terminal 3:** Launch RViz 2: `rviz2`
2.  In RViz 2, add two "Odometry" displays:
    *   Set the **Topic** for the first to `/odom` (this is the raw odometry from your robot).
    *   Set the **Topic** for the second to `/odom/filtered` (this is the fused output from the EKF).
    *   Set the **Color** for each to easily distinguish them.
3.  Add a "RobotModel" display and configure the `robot_description` parameter if needed (refer to Tutorial 3).
4.  Move your robot in Gazebo (e.g., by publishing to `/cmd_vel` as shown in Tutorial 4).

You should observe two odometry trails in RViz 2. The `/odom/filtered` trail, powered by the EKF, should generally be smoother and more accurate (less drift) than the raw `/odom` data, especially when the robot performs complex movements or if there's simulated noise.

:::tip Diagram Placeholder
**Diagram 1.2: Sensor Fusion Visualization in RViz 2**
A screenshot-like diagram of RViz 2.
-   Shows a robot model.
-   Two distinct odometry trails: one for raw `/odom` (e.g., red, slightly noisy/drifting) and one for `/odom/filtered` (e.g., green, smoother).
-   The IMU and Odometry displays in the RViz 2 left panel are visible.
:::

**Possible Pitfalls:**
*   **TF Tree Issues:** Ensure your robot's TF tree is correctly published (e.g., `base_link` -> `odom` -> `map` or similar). `robot_localization` relies heavily on a consistent TF tree. Use `ros2 run tf2_ros view_frames` to debug.
*   **Sensor Data Presence:** Verify that your `/odom` and `/imu` topics are actually publishing data. Use `ros2 topic echo` and `ros2 topic info`.
*   **Covariance Values:** The `ekf_config.yaml` can be further tuned with `pose_rejection_threshold`, `twist_rejection_threshold`, and input covariances (`odom0_pose_covariance`, `imu0_linear_acceleration_covariance`) for better performance in noisy environments. These are typically sensor-specific and require calibration.

**Further Resources:**
*   Official `robot_localization` documentation: [link to docs.ros.org/en/latest/p/robot_localization/](https://docs.ros.org/en/latest/p/robot_localization/)
*   Understanding Kalman Filters: [link to relevant robotics tutorial/book chapter]

By successfully fusing sensor data, your robot gains a much more reliable understanding of its own state, which is crucial for advanced capabilities like navigation and precise manipulation.
