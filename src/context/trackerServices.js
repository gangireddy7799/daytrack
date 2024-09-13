import { db } from "../config/firebase-config";
import { collection, setDoc, getDocs, getDoc, addDoc, updateDoc, doc, serverTimestamp, query, orderBy, limit, where } from "firebase/firestore";
import TimeCalculator from "../Functions/TimeCalculator";

class TrackerService {
  getAllDocs(id) {
    const collectionRef = collection(db, id);
    return getDocs(collectionRef);
  }

  getTasks(id) {
    const tasks = doc(db, id, 'listOfTasks');
    return getDoc(tasks);
  }

  updateTasks(id, tasks) {
    const newTasks = doc(db, id, 'listOfTasks');
    return updateDoc(newTasks, tasks);
  }

  addUser(id) {
    const newUser = doc(db, id, 'listOfTasks');
    return setDoc(newUser, { Tasks: [] });
  }

  setActiveTask(id, value) {
    const activeTaskRef = doc(db, id, 'ActiveTask');
    value.startAt = serverTimestamp();
    return setDoc(activeTaskRef, value);
  }

  getActiveTask(id) {
    const activeTaskRef = doc(db, id, 'ActiveTask');
    return getDoc(activeTaskRef);
  }

  setTasksOfTheDay(id, date, value) {
    const tasksOfTheDayRef = collection(db, id, 'TasksOfTheDay', date);
    return addDoc(tasksOfTheDayRef, value);
  }

  getServerTimeStamp() {
    return serverTimestamp();
  }

  getDaysQuery(id, date) {
    const dayColRef = collection(db, id, 'TasksOfTheDay', date);
    const q = query(dayColRef, orderBy('startAt'));
    return q;
  }

  getTaskEffortPerDay(id, task, date) {
    const TaskEffortPerDayRef = doc(db, id, 'TaskEffortPerDay', task, date);
    return getDoc(TaskEffortPerDayRef);
  }

  setTaskEffortPerDay(id, task, date, percent) {
    const TaskEffortPerDayRef = doc(db, id, 'TaskEffortPerDay', task, date);
    return setDoc(TaskEffortPerDayRef, percent);
  }

  getNDaysTaskEffortQuery(id, task, days, from) {
    const dayColRef = collection(db, id, 'TaskEffortPerDay', task);
    const q = from === ''
      ? query(dayColRef, orderBy('date', 'desc'), limit(days))
      : query(dayColRef, where('dateNow', '<=', TimeCalculator.formated().format(new Date(from)).split('/').join('-')), orderBy('dateNow', 'desc'), limit(days));
    return q;
  }
}

const trackerService = new TrackerService();
export default trackerService;
