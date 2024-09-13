import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Line } from "react-chartjs-2";
import { onSnapshot } from "firebase/firestore";
import { UserAuth } from "../context/authContext";
import TrackerServices from "../context/trackerServices";
import TimeCalculator from "../Functions/TimeCalculator";
import Loading from "./Loading";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import AmountCalculator from "../Functions/Amount";
// Removed unused NavigationBar import

export default function CompareEfforts() {
  const { user } = UserAuth();
  const [days, setDays] = useState(0);
  const [dates, setDates] = useState([]);
  const [percent, setPercent] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeWithPercent, setTimeWithPercent] = useState([]);
  const [classNameOfTask, setClassNameOfTask] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalHours, setTotalHours] = useState("");
  const [isToolsBoxOpen, setIsToolsBoxOpen] = useState(false);
  const [amountPerHour, setAmountPerHour] = useState(540);
  const [fromDate, setFromDate] = useState("");
  const [needAmt, setNeedAmt] = useState(true);

  const titleText = useMemo(() => {
    return `Totaly ${totalHours} of ${selectedTask} ${
      selectedTask.toLowerCase() === "freelancing"
        ? totalHours === "" || !needAmt
          ? ""
          : "Earned " + AmountCalculator.getAmountFromTime(amountPerHour, totalHours)
        : ""
    }`;
  }, [totalHours, selectedTask, needAmt, amountPerHour]);

  // Use useCallback for memoizing getDatas
  const getDatas = useCallback(async () => {
    if (days > 1 && days <= 60 && selectedTask !== "") {
      setIsLoading(true);
      const query = await TrackerServices.getNDaysTaskEffortQuery(
        user.uid,
        selectedTask,
        days,
        fromDate
      );
      const data = { dates: [], percent: [], timeWithPercent: [] };
      let count = 0;
      const format = new Intl.DateTimeFormat("en-us");
      const today = fromDate === ''
        ? format.format(new Date()).split("/").join("-")
        : format.format(new Date(fromDate)).split("/").join("-");
      let date = TimeCalculator.getyesterday(today, count);
      let totalHoursInPercent = 0;

      onSnapshot(query, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          while (days > count) {
            data.dates.push(date);
            if (doc.id === date) {
              totalHoursInPercent += doc.data().percent;
              data.percent.push(doc.data().percent);
              data.timeWithPercent.push(
                `${TimeCalculator.percentToHrs(doc.data().percent)} - (${parseFloat(doc.data().percent).toFixed(2)}%)`
              );
              date = TimeCalculator.getyesterday(today, ++count);
              break;
            } else {
              data.percent.push(0);
              data.timeWithPercent.push("00 : 00 : 00 - (0%)");
              date = TimeCalculator.getyesterday(today, ++count);
            }
          }
        });

        while (days > count) {
          data.dates.push(date);
          data.percent.push(0);
          data.timeWithPercent.push("00 : 00 : 00 - (0%)");
          count++;
          date = TimeCalculator.getyesterday(today, count);
        }

        setDates(data.dates.reverse());
        setPercent(data.percent.reverse());
        setTimeWithPercent(data.timeWithPercent.reverse());
        setIsLoading(false);
        setTotalHours(TimeCalculator.percentToHrs(totalHoursInPercent));
      });
    }
  }, [days, selectedTask, fromDate, user.uid]);

  useEffect(() => {
    if (days > 60) {
      setDays(60);
    } else {
      getDatas();
    }
  }, [days, getDatas]);

  // Use useCallback for memoizing getTasks
  const getTasks = useCallback(async () => {
    try {
      const tasksData = await TrackerServices.getTasks(user.uid);
      if (tasksData.data() !== undefined) {
        const TASKSINDB = tasksData.data().Tasks;
        setTasks(TASKSINDB);
        setClassNameOfTask(new Array(TASKSINDB.length).fill("task"));
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user.uid]);

  useEffect(() => {
    setIsLoading(true);
    getTasks();
  }, [getTasks]); // getTasks is added as dependency

  const handleClick = (i) => {
    setSelectedTask(tasks[i]);
    setClassNameOfTask((prevClassNames) => {
      const updatedClassNames = new Array(tasks.length).fill("task");
      updatedClassNames[i] = "task Active";
      return updatedClassNames;
    });
  };

  return (
    <div className="compareEfforts">
      {isLoading && <Loading />}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{
          y: 0,
          opacity: 1,
          width: isToolsBoxOpen ? "350px" : "43px",
          height: isToolsBoxOpen ? "400px" : "30px",
        }}
        transition={{
          ease: "easeInOut",
          delay: isToolsBoxOpen ? 0 : 0.3,
        }}
        className="inputContainer"
      >
        <div className="ToolsBoxControllerContainer">
          <motion.div
            initial={{ x: 0 }}
            animate={{ rotate: isToolsBoxOpen ? 0 : 180 }}
            transition={{ ease: "easeInOut" }}
            className="ToolsBoxController"
          >
            <FontAwesomeIcon
              onClick={() => setIsToolsBoxOpen((prev) => !prev)}
              className="font-extrabold"
              icon={faAngleRight}
            />
          </motion.div>
        </div>
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: isToolsBoxOpen ? 0 : -100, opacity: isToolsBoxOpen ? 1 : 0 }}
          transition={{ ease: "easeInOut", delay: isToolsBoxOpen ? 0.2 : 0, duration: 0.2 }}
          className="daysInput"
        >
          <div className="indInpContainer">
            <label className="inputLabels">Compare From</label>
            <div className="inputTextBox">
              <input
                style={{
                  width: "70%",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  paddingTop: "2px",
                  paddingBottom: "2px",
                }}
                type="date"
                min={2}
                max={30}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
          </div>
          <div className="indInpContainer">
            <label className="inputLabels">No. of Days to compare</label>
            <div className="inputTextBox">
              <input
                style={{
                  width: "70%",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  paddingTop: "2px",
                  paddingBottom: "2px",
                }}
                type="number"
                min={2}
                max={30}
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>
          </div>

          {selectedTask.toLowerCase() === "freelancing" && (
            <>
              <div className="indInpContainer" style={{ opacity: !needAmt ? 0.5 : 1 }}>
                <label className="inputLabels">Amount Per Day</label>
                <div className="inputTextBox">
                  <input
                    style={{
                      width: "70%",
                      paddingLeft: "10px",
                      paddingRight: "10px",
                      paddingTop: "2px",
                      paddingBottom: "2px",
                    }}
                    disabled={!needAmt}
                    type="number"
                    min={1}
                    max={20000}
                    value={amountPerHour}
                    onChange={(e) => setAmountPerHour(e.target.value)}
                  />
                </div>
              </div>
              <div className="indInpContainer">
                <label className="inputLabels">Need Amount</label>
                <div className="">
                  <input
                    style={{
                      width: "15px",
                      paddingLeft: "10px",
                      paddingRight: "10px",
                      paddingTop: "2px",
                      paddingBottom: "2px",
                    }}
                    type="checkbox"
                    checked={needAmt}
                    onChange={(e) => setNeedAmt(e.target.checked)}
                  />
                </div>
              </div>
            </>
          )}
        </motion.div>
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: isToolsBoxOpen ? 0 : -100, opacity: isToolsBoxOpen ? 1 : 0 }}
          transition={{ ease: "easeInOut", delay: isToolsBoxOpen ? 0.35 : 0.1 }}
          className="inputTasksContainer"
        >
          <div className="taskInput">
            {tasks.map((task, index) => (
              <div
                key={index}
                onClick={() => handleClick(index)}
                className={classNameOfTask[index]}
              >
                {task}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
      <div className="charContainer">
        {days > 1 && selectedTask !== "" && (
          <Line
            data={{
              labels: dates,
              datasets: [
                {
                  label: "Percent",
                  data: percent,
                  borderWidth: 4,
                  borderColor: "white",
                  hoverBorderWidth: 5,
                  hoverBackgroundColor: "rgba(232,105,90,0.8)",
                  hoverBorderColor: "orange",
                },
              ],
            }}
            height={400}
            width={700}
            options={{
              maintainAspectRatio: false,
              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    color: "white",
                  },
                },
                y: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    color: "white",
                  },
                },
              },
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  titleAlign: "center",
                  callbacks: {
                    label: function (t) {
                      return timeWithPercent[t.dataIndex];
                    },
                  },
                },
                title: {
                  display: true,
                  text: titleText,
                  color: "white",
                  font: {
                    size: 16,
                  },
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
