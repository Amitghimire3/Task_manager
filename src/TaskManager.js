import React, { useReducer, useMemo, useRef, useEffect, useContext, useCallback } from "react";
import ThemeContext from "./ThemeContext";

// Initial state
const initialState = {
  tasks: JSON.parse(localStorage.getItem('tasks')) || [],  // Load tasks from localStorage if available
  filter: "all",
};

// Action types
const ADD_TASK = "ADD_TASK";
const DELETE_TASK = "DELETE_TASK";
const UPDATE_TASK = "UPDATE_TASK";
const TOGGLE_COMPLETED = "TOGGLE_COMPLETED";
const SET_FILTER = "SET_FILTER";

// Reducer
function taskReducer(state, action) {
  switch (action.type) {
    case ADD_TASK:
      return { ...state, tasks: [...state.tasks, action.payload] };
    case DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    case UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates }
            : task
        ),
      };
    case TOGGLE_COMPLETED:
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? { ...task, completed: !task.completed }
            : task
        ),
      };
    case SET_FILTER:
      return { ...state, filter: action.payload };
    default:
      return state;
  }
}

function TaskManager() {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { tasks, filter } = state;
  const { theme, toggleTheme } = useContext(ThemeContext);

  const taskInputRef = useRef(null);
  const [task, setTask] = React.useState("");
  const [description, setDescription] = React.useState("");

  // New State for Editing
  const [editingTaskId, setEditingTaskId] = React.useState(null);
  const [editingDescription, setEditingDescription] = React.useState("");

  useEffect(() => {
    if (taskInputRef.current) {
      taskInputRef.current.focus();
    }
  }, []);

  const handleAddTask = useCallback(() => {
    if (task.trim() === "" || description.trim() === "") {
      alert("Both Task Title and Description are required!");
      return;
    }

    const newTask = {
      id: Date.now(),
      title: task,
      description,
      completed: false,
    };
    dispatch({ type: ADD_TASK, payload: newTask });

    // Save tasks to localStorage
    localStorage.setItem('tasks', JSON.stringify([...tasks, newTask]));

    setTask("");
    setDescription("");
  }, [task, description, tasks]);

  const handleDeleteTask = useCallback((id) => {
    dispatch({ type: DELETE_TASK, payload: id });

    // Save updated tasks to localStorage
    const updatedTasks = tasks.filter((task) => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  }, [tasks]);

  const handleToggleCompletion = useCallback((id) => {
    dispatch({ type: TOGGLE_COMPLETED, payload: id });

    // Save updated tasks to localStorage
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  }, [tasks]);

  const handleUpdateTask = useCallback((id, updatedDescription) => {
    dispatch({
      type: UPDATE_TASK,
      payload: { id, updates: { description: updatedDescription } },
    });

    // Save updated tasks to localStorage
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, description: updatedDescription } : task
    );
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  }, [tasks]);

  const handleFilterChange = (filterValue) => {
    dispatch({ type: SET_FILTER, payload: filterValue });
  };

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case "completed":
        return tasks.filter((task) => task.completed);
      case "incomplete":
        return tasks.filter((task) => !task.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  return (
    <div className={theme === "dark" ? "dark-theme" : "light-theme"}>
      <h2>Task Manager</h2>

      <input
        ref={taskInputRef}
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Enter task title"
        className="task-input"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter task description"
        className="task-input"
      />
      <button onClick={handleAddTask}>Add Task</button>

      {/* Filters */}
      <button onClick={() => handleFilterChange("all")}>Show All</button>
      <button onClick={() => handleFilterChange("completed")}>Show Completed</button>
      <button onClick={() => handleFilterChange("incomplete")}>Show Incomplete</button>

      {/* Theme Toggle */}
      <button onClick={toggleTheme}>
        Switch to {theme === "light" ? "Dark" : "Light"} Mode
      </button>

      <ul>
        {filteredTasks.map((t) => (
          <li
            key={t.id}
            className={t.completed ? "completed" : "incomplete"}
          >
            <strong>{t.title}</strong> -{" "}
            {editingTaskId === t.id ? (
              <>
                <textarea
                  className="task-input"
                  value={editingDescription}
                  onChange={(e) => setEditingDescription(e.target.value)}
                />
                <button
                  onClick={() => {
                    handleUpdateTask(t.id, editingDescription);
                    setEditingTaskId(null);
                    setEditingDescription("");
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingTaskId(null);
                    setEditingDescription("");
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {t.description}
                <button
                  onClick={() => {
                    setEditingTaskId(t.id);
                    setEditingDescription(t.description);
                  }}
                >
                  Update
                </button>
              </>
            )}
            <button onClick={() => handleToggleCompletion(t.id)}>
              {t.completed ? "Mark as Incomplete" : "Mark as Completed"}
            </button>
            <button onClick={() => handleDeleteTask(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskManager;
