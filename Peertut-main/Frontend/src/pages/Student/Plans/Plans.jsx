import React, { useState, useEffect } from "react";
import styles from "./Plans.module.css";
import { Search, Plus, Check, Edit, Trash2, Eye, Calendar } from "lucide-react";
import PlansModal from "../../../components/Modals/PlansModal/PlansModal";
import { useAxios } from "../../../hooks/useAxios";
import { getUserData } from "../../../utils/localStorage";

const Plans = () => {
  const { request } = useAxios();
  const [studyPlans, setStudyPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [currentModalPlan, setCurrentModalPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = getUserData();

  useEffect(() => {
    if (user?.id) {
      fetchStudyPlans();
    }
  }, [user?.id]);

  const fetchStudyPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await request({
        url: `/study-plans/user/${user.id}`,
        method: "GET",
      });
      setStudyPlans(res.studyPlans || []);
      setActivePlan(0);
    } catch (err) {
      setError("Failed to load study plans.");
      console.error("Fetch study plans error", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (taskDate.getTime() === today.getTime()) return "Today";
    if (taskDate.getTime() === tomorrow.getTime()) return "Tomorrow";
    if (taskDate < today)
      return (
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
        " (Overdue)"
      );

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  const updatePlanTasks = async (planId, tasksList) => {
    const plan = studyPlans.find((p) => p.id === planId);
    if (!plan) return;

    const tasksCount = tasksList.length;
    const completedCount = tasksList.filter((t) => t.completed).length;
    const progressPercent = tasksCount
      ? Math.round((completedCount / tasksCount) * 100)
      : 0;

    const updatedPlan = {
      ...plan,
      tasksList,
      tasks: tasksCount,
      completed: completedCount,
      progress: progressPercent,
    };

    try {
      const res = await request({
        url: `/study-plans/${planId}`,
        method: "PUT",
        body: updatedPlan,
      });
      setStudyPlans((prev) =>
        prev.map((p) => (p.id === planId ? res.studyPlan : p))
      );
    } catch (err) {
      console.error("Update plan tasks failed", err);
    }
  };

  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = (studyPlans[activePlan]?.tasksList || []).map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    updatePlanTasks(studyPlans[activePlan].id, updatedTasks);
  };

  const addTask = () => {
    if (!newTaskTitle.trim() || !newTaskDue) return;

    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      due: newTaskDue,
      completed: false,
    };

    const updatedTasks = [newTask, ...(studyPlans[activePlan]?.tasksList || [])];
    updatePlanTasks(studyPlans[activePlan].id, updatedTasks);
    setNewTaskTitle("");
    setNewTaskDue("");
  };

  const deleteTask = (taskId) => {
    const updatedTasks = (studyPlans[activePlan]?.tasksList || []).filter(
      (task) => task.id !== taskId
    );
    updatePlanTasks(studyPlans[activePlan].id, updatedTasks);
    setEditingTask(null);
  };

  const updateTask = (taskId, newTitle, newDue) => {
    const updatedTasks = (studyPlans[activePlan]?.tasksList || []).map((task) =>
      task.id === taskId
        ? { ...task, title: newTitle || task.title, due: newDue || task.due }
        : task
    );
    updatePlanTasks(studyPlans[activePlan].id, updatedTasks);
    setEditingTask(null);
  };

  const handleSavePlan = async (updatedPlan) => {
    if (modalMode === "create") {
      try {
        const res = await request({
          url: "/study-plans",
          method: "POST",
          body: { ...updatedPlan, userId: user.id },
        });
        setStudyPlans((prev) => [...prev, res.studyPlan]);
        setActivePlan(studyPlans.length);
        setModalOpen(false);
      } catch (err) {
        console.error("Create plan failed", err);
      }
    } else if (modalMode === "edit") {
      try {
        const res = await request({
          url: `/study-plans/${updatedPlan.id}`,
          method: "PUT",
          body: updatedPlan,
        });
        setStudyPlans((prev) =>
          prev.map((p) => (p.id === updatedPlan.id ? res.studyPlan : p))
        );
        setModalOpen(false);
      } catch (err) {
        console.error("Update plan failed", err);
      }
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setCurrentModalPlan(null);
    setModalOpen(true);
  };

  const openEditModal = (planId) => {
    const plan = studyPlans.find((p) => p.id === planId);
    setCurrentModalPlan(plan);
    setModalMode("edit");
    setModalOpen(true);
  };

  const openViewModal = (planId) => {
    const plan = studyPlans.find((p) => p.id === planId);
    setCurrentModalPlan(plan);
    setModalMode("view");
    setModalOpen(true);
  };

  const deletePlan = async (planId) => {
    try {
      await request({ url: `/study-plans/${planId}`, method: "DELETE" });
      const updatedPlans = studyPlans.filter((plan) => plan.id !== planId);
      setStudyPlans(updatedPlans);
      if (activePlan >= updatedPlans.length) {
        setActivePlan(Math.max(0, updatedPlans.length - 1));
      }
    } catch (err) {
      console.error("Delete plan failed", err);
    }
  };

  const filteredPlans = studyPlans.filter(
    (plan) =>
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTasks = studyPlans.reduce(
    (sum, plan) => sum + (plan.tasksList?.length || 0),
    0
  );

  if (loading) {
    return (
      <div className={styles.plansContainer}>
        <p>Loading study plans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.plansContainer}>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  const currentPlan = studyPlans[activePlan] || { tasksList: [] };

  return (
    <div className={styles.plansContainer}>
      {/* Header */}
      <header className={styles.plansHeader}>
        <h1>MY PLANS</h1>
        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <Search size={20} color="#64748b" />
            <input
              type="text"
              placeholder="SEARCH PLANS"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search study plans"
            />
          </div>
          <button className={styles.createPlanBtn} onClick={openCreateModal}>
            <Plus size={20} />
            CREATE PLAN
          </button>
        </div>
      </header>

      {/* Content */}
      <div className={styles.plansContent}>
        {/* Left Panel - plans list */}
        <div className={styles.plansListSection}>
          <h3 className={styles.sectionTitle}>STUDY PLANS</h3>
          <div className={styles.plansList}>
            {filteredPlans.map((plan, index) => (
              <div
                key={plan.id}
                className={`${styles.planCard} ${
                  index === activePlan ? styles.active : ""
                }`}
                onClick={() => setActivePlan(index)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === "Enter" && setActivePlan(index)}
                aria-label={`Select ${plan.title}`}
              >
                <div className={styles.planCardHeader}>
                  <h4 className={styles.planCardTitle}>{plan.title}</h4>
                  <div className={styles.planActions}>
                    <button
                      className={styles.viewBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        openViewModal(plan.id);
                      }}
                      aria-label="View plan details"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      className={styles.editBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(plan.id);
                      }}
                      aria-label="Edit plan"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlan(plan.id);
                      }}
                      aria-label="Delete plan"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className={styles.planCardStats}>
                  <div className={styles.planStat}>
                    <span className={styles.statValue}>
                      {plan.completed}/{plan.tasks}
                    </span>
                    <span className={styles.statLabel}>TASKS</span>
                  </div>
                  <div className={styles.planStat}>
                    <span className={styles.statValue}>
                      {plan.deadline ? new Date(plan.deadline).toLocaleDateString() : "-"}
                    </span>
                    <span className={styles.statLabel}>DEADLINE</span>
                  </div>
                  <div className={styles.planStat}>
                    <span className={styles.statValue}>{plan.progress}%</span>
                    <span className={styles.statLabel}>PROGRESS</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - plan details and tasks */}
        <div className={styles.planDetails}>
          <div className={styles.totalTasksSection}>
            <div className={styles.sectionTitle}>
              TOTAL TASKS
              <span className={styles.taskCount}>{totalTasks} TASKS</span>
            </div>
          </div>

          <div className={styles.planTitleSection}>
            <h2 className={styles.planTitle}>{currentPlan.title || ""}</h2>
            <p className={styles.planDescription}>{currentPlan.description || ""}</p>
          </div>

          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>PROGRESS</span>
              <span className={styles.progressPercentage}>
                {currentPlan.progress || 0}% COMPLETE
              </span>
            </div>
            <div
              className={styles.progressBar}
              role="progressbar"
              aria-valuenow={currentPlan.progress || 0}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                className={styles.progressFill}
                style={{ width: `${currentPlan.progress || 0}%` }}
              ></div>
            </div>
          </div>

          <div className={styles.tasksSection}>
            <div className={styles.tasksHeader}>
              <h3 className={styles.sectionTitle}>TASKS</h3>

              <div className={styles.addTaskSection}>
                <input
                  type="text"
                  placeholder="Add new task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && newTaskDue && addTask()}
                  className={styles.addTaskInput}
                  aria-label="New task title"
                />
                <div className={styles.dateInputWrapper}>
                  <Calendar size={16} className={styles.calendarIcon} />
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className={styles.addTaskDateInput}
                    min={new Date().toISOString().split("T")[0]}
                    aria-label="Task due date"
                  />
                </div>
                <button
                  className={styles.addTaskBtn}
                  onClick={addTask}
                  disabled={!newTaskTitle.trim() || !newTaskDue}
                  aria-label="Add task"
                >
                  <Plus size={20} />
                  ADD TASK
                </button>
              </div>
            </div>

            <div className={styles.tasksList}>
              {currentPlan.tasksList?.map((task) => (
                <div key={task.id} className={styles.taskItem}>
                  <div
                    className={`${styles.taskCheckbox} ${
                      task.completed ? styles.checked : ""
                    }`}
                    onClick={() => toggleTaskCompletion(task.id)}
                    role="checkbox"
                    aria-checked={task.completed}
                    tabIndex={0}
                    onKeyPress={(e) =>
                      e.key === "Enter" && toggleTaskCompletion(task.id)
                    }
                  >
                    {task.completed && <Check size={14} />}
                  </div>
                  <div className={styles.taskContent}>
                    <div
                      className={`${styles.taskTitle} ${
                        task.completed ? styles.completed : ""
                      }`}
                    >
                      {editingTask === task.id ? (
                        <input
                          type="text"
                          defaultValue={task.title}
                          onBlur={(e) =>
                            updateTask(task.id, e.target.value, task.due)
                          }
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            updateTask(task.id, e.target.value, task.due)
                          }
                          autoFocus
                          className={styles.editTaskInput}
                          aria-label="Edit task title"
                        />
                      ) : (
                        task.title
                      )}
                    </div>
                    <div className={styles.taskDue}>
                      {editingTask === task.id ? (
                        <div className={styles.editDateWrapper}>
                          <Calendar size={14} />
                          <input
                            type="date"
                            defaultValue={task.due}
                            onBlur={(e) =>
                              updateTask(task.id, task.title, e.target.value)
                            }
                            onChange={(e) =>
                              updateTask(task.id, task.title, e.target.value)
                            }
                            className={styles.editTaskDateInput}
                            min={new Date().toISOString().split("T")[0]}
                            aria-label="Edit task due date"
                          />
                        </div>
                      ) : (
                        <>
                          <Calendar size={14} />
                          DUE: {formatDate(task.due)}
                        </>
                      )}
                    </div>
                  </div>
                  <div className={styles.taskActions}>
                    <button
                      className={styles.editTaskBtn}
                      onClick={() =>
                        setEditingTask(editingTask === task.id ? null : task.id)
                      }
                      aria-label={
                        editingTask === task.id ? "Save changes" : "Edit task"
                      }
                    >
                      {editingTask === task.id ? <Check size={14} /> : <Edit size={14} />}
                    </button>
                    <button
                      className={styles.deleteTaskBtn}
                      onClick={() => deleteTask(task.id)}
                      aria-label="Delete task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PlansModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        plan={currentModalPlan}
        onSave={handleSavePlan}
      />
    </div>
  );
};

export default Plans;
