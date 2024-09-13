import React, { useState, useEffect, useCallback } from "react";
import { UserAuth } from "../context/authContext";
import TrackerServices from "../context/trackerServices";
import TimeCalculator from "../Functions/TimeCalculator";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faMarker, faSave, faXmark } from '@fortawesome/free-solid-svg-icons';
import Loading from '../Components/Loading';

export default function Tracker() {
    const { user } = UserAuth();
    const [tasks, setTasks] = useState([]);
    const [editedTasks, setEditedTasks] = useState([]);
    const [task, setTask] = useState('');
    const [classNameOfTask, setClassNameOfTask] = useState([]);
    const [isInEditMode, setIsInEditMode] = useState(false);
    const [activeTask, setActiveTask] = useState(undefined);
    const [activeTaskFor, setActiveTaskFor] = useState('00:00:00');
    const [obtainMillies, setObtainMillies] = useState('');
    const [taskPercent, setTaskPercent] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Wrap getData in useCallback to avoid it being recreated on every render
    const getData = useCallback(async () => {
        try {
            const tasksResponse = await TrackerServices.getTasks(user.uid);
            const activeTaskResponse = await TrackerServices.getActiveTask(user.uid);
            const tasksData = tasksResponse.data();
            const activeTaskData = activeTaskResponse.data();

            if (!tasksData || tasksData.Tasks.length === 0) {
                setIsInEditMode(true);
                setIsLoading(false);
                return;
            }

            const activeTask = activeTaskData?.task || 'Not in Track';
            setTasks(tasksData.Tasks);
            setClassNameOfTask(
                tasksData.Tasks.map(task => (task === activeTask ? 'task Active' : 'task'))
            );

            if (activeTask !== 'Not in Track') {
                const taskEffort = await TrackerServices.getTaskEffortPerDay(user.uid, activeTask, activeTaskData.Date);
                setTaskPercent(taskEffort.data());
            }

            setActiveTask(activeTaskData);

            if (activeTaskData) {
                if (TimeCalculator.isToday(activeTaskData.Date)) {
                    setObtainMillies(activeTaskData.startAt.toMillis());
                    setActiveTaskFor(TimeCalculator.inBetween(activeTaskData.startAt.toMillis()));
                } else {
                    const today = new Date(TimeCalculator.formated().format(new Date()).split('/').join('-')).getTime();
                    setObtainMillies(today);
                    setActiveTaskFor(TimeCalculator.inBetween(today));
                }
            }
        } catch (error) {
            console.error("Error fetching data: ", error);
        } finally {
            setIsLoading(false);
        }
    }, [user.uid]);

    useEffect(() => {
        getData();
    }, [getData]); // Include getData in the dependency array

    useEffect(() => {
        const timer = setInterval(() => {
            if (obtainMillies) {
                const updateTime = TimeCalculator.inBetween(parseInt(obtainMillies, 10));
                if (!updateTime.includes("NaN")) {
                    setActiveTaskFor(updateTime);
                }
            }
        }, 1000);

        return () => clearInterval(timer); // Cleanup interval
    }, [obtainMillies]); // Added obtainMillies as dependency

    const addNewTask = () => {
        if (task && !tasks.includes(task)) {
            setEditedTasks(prevTasks => [...prevTasks, task]);
            setClassNameOfTask(prevClass => [...prevClass, 'task']);
            setTask('');
        }
    };

    const handleEvents = (event) => {
        if (event.key === 'Enter') addNewTask();
    };

    const scheduledTask = async (index) => {
        const startAt = TrackerServices.getServerTimeStamp();
        let isFirst = false;

        const resetTimer = async () => {
            try {
                const active = await TrackerServices.getActiveTask(user.uid);
                setActiveTask(active.data());
                setObtainMillies(active.data().startAt.toMillis());
                if (isFirst) {
                    setTimeout(() => {
                        setActiveTaskFor(TimeCalculator.inBetween(active.data().startAt.toMillis()));
                    }, 1100);
                }
                if (active.data().task !== 'Not in Track') {
                    const taskEffort = await TrackerServices.getTaskEffortPerDay(user.uid, active.data().task, active.data().Date);
                    setTaskPercent(taskEffort.data());
                }
            } catch (error) {
                console.error("Error resetting timer: ", error);
            }
        };

        try {
            if (activeTask) {
                let taskToAdd = {};
                let percent = {};
                taskToAdd = {
                    task: activeTask.task,
                    startAt: activeTask.startAt,
                    endAt: startAt,
                    time: activeTaskFor,
                    seconds: TimeCalculator.timeToSeconds(activeTaskFor),
                    percent: TimeCalculator.percentOfDay(TimeCalculator.timeToSeconds(activeTaskFor))
                };
                percent = {
                    date: startAt,
                    percent: parseFloat(taskToAdd.percent),
                    dateNow: Date.now()
                };

                if (tasks[index] === activeTask.task) {
                    const value = {
                        startAt,
                        task: "Not in Track",
                        Date: TimeCalculator.formated().format(new Date()).split('/').join('-')
                    };
                    await TrackerServices.setActiveTask(user.uid, value);

                    if (!TimeCalculator.isToday(activeTask.Date)) {
                        await TrackerServices.setTasksOfTheDay(user.uid, TimeCalculator.formated().format(new Date()).split('/').join('-'), taskToAdd);
                        await TrackerServices.setTaskEffortPerDay(user.uid, activeTask.task, TimeCalculator.formated().format(new Date()).split('/').join('-'), percent);
                        const time = TimeCalculator.inBetween(activeTask.startAt.toMillis(), TimeCalculator.getTomorrow(new Date(activeTask.Date)));
                        taskToAdd = {
                            ...taskToAdd,
                            time,
                            seconds: TimeCalculator.timeToSeconds(time),
                            percent: TimeCalculator.percentOfDay(TimeCalculator.timeToSeconds(time))
                        };
                        percent = taskPercent || { date: startAt, percent: 0 };
                        percent.percent += parseFloat(taskToAdd.percent);
                        percent.dateNow = activeTask.Date.split('-').map((val, index) => index === 1 && val.length === 1 ? '0' + val : val).join('-');
                        await TrackerServices.setTaskEffortPerDay(user.uid, activeTask.task, activeTask.Date, percent);
                        await TrackerServices.setTasksOfTheDay(user.uid, activeTask.Date, taskToAdd);
                    } else {
                        percent.percent += taskPercent?.percent || 0;
                        percent.dateNow = activeTask.Date.split('-').map((val, index) => index === 1 && val.length === 1 ? '0' + val : val).join('-');
                        await TrackerServices.setTaskEffortPerDay(user.uid, activeTask.task, TimeCalculator.formated().format(new Date()).split('/').join('-'), percent);
                        await TrackerServices.setTasksOfTheDay(user.uid, TimeCalculator.formated().format(new Date()).split('/').join('-'), taskToAdd);
                    }
                    resetTimer();
                    setClassNameOfTask(new Array(tasks.length).fill('task'));
                    return;
                }

                const value = {
                    startAt,
                    task: tasks[index],
                    Date: TimeCalculator.formated().format(new Date()).split('/').join('-')
                };
                await TrackerServices.setActiveTask(user.uid, value);

                if (activeTask.task !== "Not in Track") {
                    if (!TimeCalculator.isToday(activeTask.Date)) {
                        await TrackerServices.setTasksOfTheDay(user.uid, TimeCalculator.formated().format(new Date()).split('/').join('-'), taskToAdd);
                        await TrackerServices.setTaskEffortPerDay(user.uid, activeTask.task, TimeCalculator.formated().format(new Date()).split('/').join('-'), percent);
                        const time = TimeCalculator.inBetween(activeTask.startAt.toMillis(), TimeCalculator.getTomorrow(new Date(activeTask.Date)));
                        taskToAdd = {
                            ...taskToAdd,
                            time,
                            seconds: TimeCalculator.timeToSeconds(time),
                            percent: TimeCalculator.percentOfDay(TimeCalculator.timeToSeconds(time))
                        };
                        percent = taskPercent || { date: activeTask.startAt, percent: 0 };
                        percent.percent += parseFloat(taskToAdd.percent);
                        await TrackerServices.setTasksOfTheDay(user.uid, activeTask.Date, taskToAdd);
                        await TrackerServices.setTaskEffortPerDay(user.uid, activeTask.task, activeTask.Date, percent);
                    } else {
                        percent.percent += taskPercent?.percent || 0;
                        await TrackerServices.setTaskEffortPerDay(user.uid, activeTask.task, TimeCalculator.formated().format(new Date()).split('/').join('-'), percent);
                        await TrackerServices.setTasksOfTheDay(user.uid, TimeCalculator.formated().format(new Date()).split('/').join('-'), taskToAdd);
                    }
                }
            } else {
                isFirst = true;
                const value = {
                    startAt,
                    task: tasks[index],
                    Date: TimeCalculator.formated().format(new Date()).split('/').join('-')
                };
                await TrackerServices.setActiveTask(user.uid, value);
                resetTimer();
            }

            setClassNameOfTask(prevClass => {
                const updatedClass = new Array(tasks.length).fill('task');
                updatedClass[index] = 'task Active';
                return updatedClass;
            });
        } catch (error) {
            console.error("Error scheduling task: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    const editLabels = (bool) => {
        setIsInEditMode(bool);
        if (!bool) addNewTasksInDB();
    };

    const addNewTasksInDB = async () => {
        try {
            setTasks(editedTasks);
            await TrackerServices.updateTasks(user.uid, { Tasks: editedTasks });
        } catch (error) {
            console.error("Error updating tasks in database: ", error);
        }
    };

    const deleteTasks = (index) => {
        setEditedTasks(prevTasks => prevTasks.filter((_, i) => i !== index));
    };

    return (
        <div className="tracker">
            {isLoading && <Loading />}
            <div className="timercontainer">
                <div className="timer">
                    {tasks.length === 0 ?
                        <div className="timerTitle">{`${user.displayName}, Add Tasks And Begin Tracking`}</div>
                        :
                        <div className="timerTitle">{`${user.displayName}, Your Current Task is `}
                            <span className="activeTask">{activeTask?.task || ''}</span>
                        </div>
                    }
                    <div className="timerDisplay">
                        <div className="subTimerDisplay">
                            <h2>{activeTaskFor}</h2>
                        </div>
                    </div>
                </div>
                <div className="timerLable">
                    <div className="timerControllers">
                        {isInEditMode ?
                            <div className="controlBox">
                                <input
                                    className="labelTB"
                                    value={task}
                                    onKeyPress={handleEvents}
                                    onChange={(e) => setTask(e.target.value)}
                                />
                                <FontAwesomeIcon className="icon save" icon={faSave} onClick={() => editLabels(false)} />
                                <FontAwesomeIcon className="icon cancle" icon={faXmark} onClick={() => setIsInEditMode(false)} />
                            </div>
                            :
                            <FontAwesomeIcon className="icon edit" icon={faMarker} onClick={() => editLabels(true)} />
                        }
                    </div>
                    <div className="tasksContainer">
                        {isInEditMode ? editedTasks.map((task, index) => (
                            <div key={index} className={classNameOfTask[index]}>
                                {task}
                                <FontAwesomeIcon className="icon delete" icon={faTrash} onClick={() => deleteTasks(index)} />
                            </div>
                        )) :
                            tasks.map((task, index) => (
                                <div
                                    key={index}
                                    onClick={() => { setIsLoading(true); scheduledTask(index); }}
                                    className={classNameOfTask[index]}
                                >
                                    {task}
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
