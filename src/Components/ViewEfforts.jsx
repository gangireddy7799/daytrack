import React, { useState, useEffect } from "react";
import { onSnapshot } from 'firebase/firestore';
import TrackerServices from "../context/trackerServices";
import { UserAuth } from "../context/authContext";
import TimeCalculator from '../Functions/TimeCalculator';
import { Pie } from "react-chartjs-2";
import Loading from '../Components/Loading';

// Define the ViewEfforts component
const ViewEfforts = () => {
    const { user } = UserAuth();
    const [date, setDate] = useState("");
    const [times, setTimes] = useState([]);
    const [labels, setLabels] = useState([]);
    const [labelsWithTime, setLabelsWithTime] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch the selected day's effort when the date changes
    useEffect(() => {
        if (date) {
            getSelectedDayEffort();
        }
    }, [date]); // Include date in dependency array

    const getSelectedDayEffort = async () => {
        setIsLoading(true);

        try {
            const query = await TrackerServices.getDaysQuery(user.uid, date);
            const activeTaskColl = await TrackerServices.getActiveTask(user.uid);

            if (!activeTaskColl.data()) {
                setIsLoading(false);
                return;
            }

            const data = { tasks: [], timings: [], tasksWithTime: [] };
            let lastTaskStartAt = '';
            let sumOfPercent = 0;

            onSnapshot(query, (querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const docData = doc.data();
                    data.timings.push(parseFloat(docData.percent));
                    data.tasks.push(docData.task);
                    data.tasksWithTime.push(`${docData.time} - (${parseFloat(docData.percent)}%)`);
                    lastTaskStartAt = docData.endAt?.toMillis() ?? 0;
                    sumOfPercent += parseFloat(docData.percent);
                });

                if (TimeCalculator.isToday(date)) {
                    if (activeTaskColl.data().task !== 'Not in Track') {
                        const task = `Still - ${activeTaskColl.data().task}`;
                        lastTaskStartAt = activeTaskColl.data().startAt.toMillis();
                        const time = TimeCalculator.inBetween(parseInt(lastTaskStartAt));
                        const percent = TimeCalculator.percentOfDay(TimeCalculator.timeToSeconds(time));
                        data.tasks.push(task);
                        data.timings.push(parseFloat(percent));
                        data.tasksWithTime.push(`${time} - (${percent}%)`);
                    }
                } else if (new Date(date.split('-').join('/')).getTime() < Date.now()) {
                    const obtainedPercent = parseFloat(100 - sumOfPercent).toFixed(2);
                    if (obtainedPercent > 0.06) {
                        const between = TimeCalculator.percentToHrs(obtainedPercent);
                        data.tasks.unshift('Not in Track');
                        data.timings.unshift(parseFloat(obtainedPercent));
                        data.tasksWithTime.unshift(`${between} - (${obtainedPercent}%)`);
                    }
                }

                setTimes(data.timings);
                setLabels(data.tasks);
                setLabelsWithTime(data.tasksWithTime);
            });
        } catch (error) {
            console.error("Error fetching day efforts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateChange = (event) => {
        const inputDate = event.target.value;
        if (inputDate) {
            const formattedDate = new Intl.DateTimeFormat('en-US').format(new Date(inputDate)).split('/').join('-');
            setDate(formattedDate);
        }
    };

    return (
        <div className="viewEfforts">
            {isLoading && <Loading />}
            <input type="date" onChange={handleDateChange} />
            <div className="chart">
                {labels.length > 0 && times.length > 0 && (
                    <Pie
                        data={{
                            labels: labels,
                            datasets: [
                                {
                                    label: "Percent",
                                    data: times,
                                    backgroundColor: ['#36a2eb', '#ff6384', '#4bc0c0', '#ff9f40', '#9966ff', '#ffcd56', '#c9cbcf'],
                                    hoverBackgroundColor: "rgba(232,105,90,0.8)",
                                    hoverBorderColor: "orange",
                                }
                            ]
                        }}
                        height={800}
                        width={800}
                        options={{
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        color: 'white',
                                    }
                                },
                                tooltip: {
                                    titleAlign: 'center',
                                    callbacks: {
                                        label: function (tooltipItem) {
                                            return labelsWithTime[tooltipItem.dataIndex];
                                        }
                                    }
                                }
                            }
                        }}
                    />
                )}
                {date !== '' && labels.length === 0 && times.length === 0 && (
                    <Pie
                        data={{
                            labels: [new Date(date.split('-').join('/')).getTime() > Date.now() ? 'Yet to Track' : 'Not in Track'],
                            datasets: [
                                {
                                    label: "Percent",
                                    data: [100]
                                }
                            ]
                        }}
                        height={600}
                        width={600}
                        options={{
                            maintainAspectRatio: false,
                            plugins: {
                                tooltip: {
                                    titleAlign: 'center',
                                },
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        color: 'white',
                                    }
                                }
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ViewEfforts;
