from datetime import datetime, time, timedelta

start_hour = 19
today = datetime.today().date()
today_at_start = datetime.combine(today, time(start_hour, 0))

recording_length = 24 * 60 * 60  # seconds in 24 hours

with open("time_test.csv", "w") as f:
    f.writelines(f"time\tannotation\tdate\n")
    for idx in range(recording_length):
        f.writelines(f"{idx}\tN\t{today_at_start + timedelta(seconds=idx)}\n")
