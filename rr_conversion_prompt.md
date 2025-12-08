# Programming Task: Convert R-Peak Time Series to RR Intervals

## Objective

Implement a function that converts a time series of R-peak detections into RR intervals (inter-beat intervals) with proper annotation filtering.

## Input Data Structure

You will receive:

- **R-peak times**: An array/vector of timestamps (in samples) representing detected R-peaks in an ECG signal
- **Annotations**: A corresponding array of single-character annotations for each R-peak, where:
  - 'N' = Normal sinus beat
  - Other values (e.g., 'V', 'A', etc.) = Abnormal beats (ventricular, atrial, artifacts, etc.)

## Required Output

Generate:

- **RR intervals**: Array of time differences between consecutive R-peaks
- **Annotations**: Corresponding array marking each interval as 'N' (normal)
- **Important**: Only include intervals where both R-peaks are normal

## Algorithm Specification

### Step 1: Calculate RR Intervals

For each pair of consecutive R-peaks at positions i and i+1:

```
RR[i] = R_time[i+1] - R_time[i]
```

### Step 2: Apply Annotation Filter

For each calculated RR interval, apply this strict filtering rule:

**Include the interval ONLY if:**

- The annotation at R-peak[i] == 'N' **AND**
- The annotation at R-peak[i+1] == 'N'

**Exclude the interval if:**

- Either R-peak has a non-'N' annotation

### Step 3: Output Construction

The output should contain:

- Only the RR intervals that passed the filter
- All output annotations should be 'N' (since only N-N intervals are included)

## Example

### Input:

```
R_times:      [100, 850, 1600, 2100, 2850]
Annotations:  ['N', 'N',  'V',  'N',  'N']
```

### Processing:

- Interval 0→1: R[1]-R[0] = 750, annotations: N→N ✓ **Include**
- Interval 1→2: R[2]-R[1] = 750, annotations: N→V ✗ **Exclude**
- Interval 2→3: R[3]-R[2] = 500, annotations: V→N ✗ **Exclude**
- Interval 3→4: R[4]-R[3] = 750, annotations: N→N ✓ **Include**

### Output:

```
RR_intervals: [750, 750]
Annotations:  ['N', 'N']
```

## Implementation Guidelines

1. **Iterate through consecutive pairs**: Loop from index 0 to length-2
2. **Check both annotations**: Verify both R-peaks are 'N' before calculating
3. **Skip invalid intervals**: Don't add intervals involving non-normal beats
4. **Maintain alignment**: Ensure RR intervals and annotations arrays remain synchronized

## Purpose

This filtering ensures that heart rate variability analysis is performed only on clean, normal sinus rhythm data, excluding ectopic beats and artifacts that could distort physiological measurements.
