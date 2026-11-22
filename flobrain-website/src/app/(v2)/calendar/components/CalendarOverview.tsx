
"use client";

import { useMemo, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  CalendarDays,
  Clock,
  Check,
  Trash2,
  Pencil,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCalendarEvents,
  fetchTodos,
  v2Keys,
  type CalendarEventApi,
  type TodoApi,
} from "@/lib/v2-api";
import { apiClient } from "@/lib/axios";

type CalendarEvent = {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
};

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

const monthNames = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapEvent(e: CalendarEventApi): CalendarEvent {
  return { id: e.id, title: e.title, date: e.date, startTime: e.start_time, endTime: e.end_time };
}

function mapTodo(t: TodoApi): Todo {
  return { id: t.id, title: t.title, completed: t.completed };
}

export function CalendarOverview() {
  const queryClient = useQueryClient();

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(formatDate(today));
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [todoDraft, setTodoDraft] = useState("");
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [newTodoDraft, setNewTodoDraft] = useState("");

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState(formatDate(today));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const { data: eventsData } = useQuery({
    queryKey: v2Keys.calendarEvents,
    queryFn: fetchCalendarEvents,
  });

  const { data: todosData } = useQuery({
    queryKey: v2Keys.todos,
    queryFn: fetchTodos,
  });

  const events: CalendarEvent[] = useMemo(
    () => (eventsData ?? []).map(mapEvent),
    [eventsData],
  );

  const todos: Todo[] = useMemo(
    () => (todosData ?? []).map(mapTodo),
    [todosData],
  );

  // ----- Event mutations -----

  const createEventMutation = useMutation({
    mutationFn: (body: { title: string; date: string; start_time: string; end_time: string }) =>
      apiClient.post("/api/calendar/events/", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: v2Keys.calendarEvents }),
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: number; title: string; date: string; start_time: string; end_time: string }) =>
      apiClient.patch(`/api/calendar/events/${id}/`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: v2Keys.calendarEvents }),
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/calendar/events/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: v2Keys.calendarEvents }),
  });

  // ----- Todo mutations -----

  const createTodoMutation = useMutation({
    mutationFn: (title: string) =>
      apiClient.post("/api/calendar/todos/", { title, completed: false }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: v2Keys.todos }),
  });

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: number; title?: string; completed?: boolean }) =>
      apiClient.patch(`/api/calendar/todos/${id}/`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: v2Keys.todos }),
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/calendar/todos/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: v2Keys.todos }),
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const calendarCells = useMemo(
    () => [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ],
    [firstDay, daysInMonth],
  );

  function changeMonth(direction: number) {
    setCurrentMonth(new Date(year, month + direction, 1));
  }

  // ---------------- TODO FUNCTIONS ----------------

  function toggleTodo(id: number) {
    const todo = todos.find((t) => t.id === id);
    if (todo) updateTodoMutation.mutate({ id, completed: !todo.completed });
  }

  function startEditingTodo(todo: Todo) {
    setEditingTodoId(todo.id);
    setTodoDraft(todo.title);
  }

  function saveTodoEdit(id: number) {
    const trimmedTitle = todoDraft.trim();
    if (!trimmedTitle) {
      deleteTodoMutation.mutate(id);
    } else {
      updateTodoMutation.mutate({ id, title: trimmedTitle });
    }
    setEditingTodoId(null);
    setTodoDraft("");
  }

  function cancelTodoEdit() {
    setEditingTodoId(null);
    setTodoDraft("");
  }

  function handleTodoKeyDown(event: KeyboardEvent<HTMLInputElement>, id: number) {
    if (event.key === "Enter") { event.preventDefault(); saveTodoEdit(id); }
    if (event.key === "Escape") { event.preventDefault(); cancelTodoEdit(); }
  }

  function addTodo() {
    setIsAddingTodo(true);
    setNewTodoDraft("");
  }

  function saveNewTodo() {
    const trimmedTitle = newTodoDraft.trim();
    if (trimmedTitle) createTodoMutation.mutate(trimmedTitle);
    setIsAddingTodo(false);
    setNewTodoDraft("");
  }

  function cancelNewTodo() {
    setIsAddingTodo(false);
    setNewTodoDraft("");
  }

  function handleNewTodoKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") { event.preventDefault(); saveNewTodo(); }
    if (event.key === "Escape") { event.preventDefault(); cancelNewTodo(); }
  }

  function deleteTodo(id: number) {
    deleteTodoMutation.mutate(id);
    if (editingTodoId === id) cancelTodoEdit();
  }

  // ---------------- EVENT FUNCTIONS ----------------

  function openNewEventModal() {
    setEditingEventId(null);
    setEventName("");
    setEventDate(selectedDate);
    setStartTime("09:00");
    setEndTime("10:00");
    setShowEventModal(true);
  }

  function openEditEventModal(calendarEvent: CalendarEvent) {
    setEditingEventId(calendarEvent.id);
    setEventName(calendarEvent.title);
    setEventDate(calendarEvent.date);
    setStartTime(calendarEvent.startTime);
    setEndTime(calendarEvent.endTime);
    setSelectedDate(calendarEvent.date);
    setShowEventModal(true);
  }

  function closeEventModal() {
    setShowEventModal(false);
    setEditingEventId(null);
  }

  function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!eventName.trim()) return;
    if (endTime <= startTime) {
      window.alert("End time must be later than start time.");
      return;
    }

    const body = {
      title: eventName.trim(),
      date: eventDate,
      start_time: startTime,
      end_time: endTime,
    };

    if (editingEventId !== null) {
      updateEventMutation.mutate({ id: editingEventId, ...body });
    } else {
      createEventMutation.mutate(body);
    }

    setSelectedDate(eventDate);
    const [eventYear, eventMonth] = eventDate.split("-").map(Number);
    setCurrentMonth(new Date(eventYear, eventMonth - 1, 1));
    closeEventModal();
  }

  function deleteEvent() {
    if (editingEventId === null) return;
    const confirmed = window.confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;
    deleteEventMutation.mutate(editingEventId);
    closeEventModal();
  }

  function handleEventKeyDown(
    event: KeyboardEvent<HTMLSpanElement>,
    calendarEvent: CalendarEvent,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      openEditEventModal(calendarEvent);
    }
  }

  // ---------------- UI ----------------

  return (
    <div
      className="flex h-full min-h-[560px] flex-col gap-4"
      style={{ color: "var(--fb-v2-text)" }}
    >
      {/* Calendar heading */}
      <div
        className="flex items-center justify-between gap-3 border-b pb-4"
        style={{ borderColor: "var(--fb-v2-border)" }}
      >
        <p
          className="text-sm"
          style={{ color: "var(--fb-v2-text-muted)" }}
        >
          View and manage your schedule
        </p>

        <button
          type="button"
          onClick={openNewEventModal}
          className="flex cursor-pointer items-center gap-2 rounded-md bg-[#1748f5] px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
        >
          <Plus size={15} />
          New Event
        </button>
      </div>

      {/* Calendar and To-Do */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1.65fr)_minmax(190px,0.8fr)]">

        {/* Monthly calendar */}
        <section
          className="flex min-h-[480px] min-w-0 flex-col rounded-lg border p-3"
          style={{
            background: "var(--fb-v2-surface)",
            borderColor: "var(--fb-v2-border)",
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
              className="cursor-pointer rounded-md border p-2 transition-all duration-200 hover:bg-white/10 hover:border-blue-400 active:scale-95"
              style={{ borderColor: "var(--fb-v2-border)" }}
            >
              <ChevronLeft size={17} />
            </button>

            <h2 className="text-sm font-semibold">
              {monthNames[month]} {year}
            </h2>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="Next month"
              className="cursor-pointer rounded-md border p-2 transition-all duration-200 hover:bg-white/10 hover:border-blue-400 active:scale-95"
              style={{ borderColor: "var(--fb-v2-border)" }}
            >
              <ChevronRight size={17} />
            </button>
          </div>

          {/* Weekday headings */}
          <div className="mb-2 grid grid-cols-7 gap-[3px]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div
                  key={day}
                  className="py-1 text-center text-[11px] font-semibold"
                  style={{ color: "var(--fb-v2-text-muted)" }}
                >
                  {day}
                </div>
              ),
            )}
          </div>

          {/* Calendar days */}
          <div className="grid flex-1 grid-cols-7 grid-rows-5 gap-[3px]">
            {calendarCells.map((day, index) => {
              const dateKey = day
                ? formatDate(new Date(year, month, day))
                : "";

              const dayEvents = events.filter(
                (calendarEvent) => calendarEvent.date === dateKey,
              );

              const isSelected = dateKey === selectedDate;

              return (
                <button
                  key={index}
                  type="button"
                  disabled={!day}
                  onClick={() => day && setSelectedDate(dateKey)}
                  className="relative flex min-h-[55px] flex-col items-start rounded-md border p-1.5 text-left transition-all duration-200 hover:border-blue-400"
                  style={{
                    background: isSelected ? "#193d9e" : "#303030",
                    borderColor: isSelected ? "#2459ff" : "#555555",
                    color: "#ffffff",
                  }}
                >
                  {day && (
                    <>
                      <span className="text-[10px]">{day}</span>

                      {dayEvents.map((calendarEvent) => (
                        <span
                          key={calendarEvent.id}
                          role="button"
                          tabIndex={0}
                          title={`${calendarEvent.title} — Click to edit`}
                          onClick={(clickEvent) => {
                            clickEvent.stopPropagation();
                            openEditEventModal(calendarEvent);
                          }}
                          onKeyDown={(keyboardEvent) =>
                            handleEventKeyDown(keyboardEvent, calendarEvent)
                          }
                          className="mt-1 w-full cursor-pointer rounded px-1 py-1 text-[10px] transition-all duration-200 hover:brightness-125 hover:ring-1 hover:ring-blue-300"
                          style={{
                            background: "#55516f",
                            color: "#ffffff",
                          }}
                        >
                          <span className="block truncate font-semibold">
                            {calendarEvent.title}
                          </span>

                          <span className="mt-0.5 block text-[9px] text-gray-300">
                            {calendarEvent.startTime} - {calendarEvent.endTime}
                          </span>
                        </span>
                      ))}

                      {dayEvents.length > 0 && (
                        <span
                          className="absolute bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full"
                          style={{ background: "#38a3ff" }}
                        />
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* To-Do panel */}
        <section
          className="flex min-h-[480px] min-w-0 flex-col overflow-hidden rounded-lg border"
          style={{
            background: "var(--fb-v2-surface)",
            borderColor: "var(--fb-v2-border)",
          }}
        >
          {/* To-Do header */}
          <div
            className="flex items-center justify-between border-b px-3 py-3"
            style={{ borderColor: "var(--fb-v2-border)" }}
          >
            <h2 className="text-sm font-semibold">To-Do</h2>

            <button
              type="button"
              aria-label="Add to-do"
              onClick={addTodo}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#1748f5] text-white transition-all duration-200 hover:bg-blue-700 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
            >
              <Plus size={15} />
            </button>
          </div>

          {/* To-Do items */}
          <div className="flex-1">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-2 border-b px-3 py-3 transition-colors duration-200 hover:bg-white/5"
                style={{ borderColor: "var(--fb-v2-border)" }}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  aria-label={`Mark ${todo.title || "task"} as completed`}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
                />

                {editingTodoId === todo.id ? (
                  <input
                    autoFocus
                    value={todoDraft}
                    onChange={(event) => setTodoDraft(event.target.value)}
                    onKeyDown={(event) => handleTodoKeyDown(event, todo.id)}
                    onBlur={() => saveTodoEdit(todo.id)}
                    placeholder="Enter task name"
                    aria-label="Edit task name"
                    className="min-w-0 flex-1 rounded border border-blue-500 bg-[#292929] px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <span
                    className={`min-w-0 flex-1 text-left text-[12px] ${
                      todo.completed ? "line-through opacity-50" : ""
                    }`}
                  >
                    {todo.title}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (editingTodoId === todo.id) {
                      saveTodoEdit(todo.id);
                    } else {
                      startEditingTodo(todo);
                    }
                  }}
                  aria-label={editingTodoId === todo.id ? "Save task" : "Edit task"}
                  title={editingTodoId === todo.id ? "Save task" : "Edit task"}
                  className="shrink-0 cursor-pointer rounded p-1 text-gray-400 transition-all duration-200 hover:bg-blue-500/20 hover:text-blue-300 active:scale-95"
                >
                  {editingTodoId === todo.id ? (
                    <Check size={14} />
                  ) : (
                    <Pencil size={13} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label="Delete task"
                  title="Delete task"
                  className="shrink-0 cursor-pointer rounded p-1 text-gray-400 transition-all duration-200 hover:bg-red-500/20 hover:text-red-300 active:scale-95"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            {/* Inline new-todo input */}
            {isAddingTodo && (
              <div
                className="flex items-center gap-2 border-b px-3 py-3"
                style={{ borderColor: "var(--fb-v2-border)" }}
              >
                <input
                  type="checkbox"
                  disabled
                  className="mt-0.5 h-4 w-4 shrink-0 opacity-30"
                />
                <input
                  autoFocus
                  value={newTodoDraft}
                  onChange={(event) => setNewTodoDraft(event.target.value)}
                  onKeyDown={handleNewTodoKeyDown}
                  onBlur={saveNewTodo}
                  placeholder="Enter task name"
                  aria-label="New task name"
                  className="min-w-0 flex-1 rounded border border-blue-500 bg-[#292929] px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={saveNewTodo}
                  aria-label="Save new task"
                  title="Save"
                  className="shrink-0 cursor-pointer rounded p-1 text-gray-400 transition-all duration-200 hover:bg-blue-500/20 hover:text-blue-300 active:scale-95"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  onClick={cancelNewTodo}
                  aria-label="Cancel new task"
                  title="Cancel"
                  className="shrink-0 cursor-pointer rounded p-1 text-gray-400 transition-all duration-200 hover:bg-red-500/20 hover:text-red-300 active:scale-95"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {todos.length === 0 && !isAddingTodo && (
              <p className="px-3 py-6 text-center text-xs text-gray-400">
                No tasks yet. Click + to add a task.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* New Event / Edit Event modal */}
      {showEventModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEventModal();
            }
          }}
        >
          <form
            onSubmit={saveEvent}
            className="w-full max-w-[420px] overflow-hidden rounded-lg border shadow-2xl"
            style={{
              background: "#454344",
              borderColor: "#575454",
              color: "#ffffff",
            }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{ borderColor: "#5b5959" }}
            >
              <h2 className="text-base font-semibold">
                {editingEventId !== null ? "Edit Event" : "New Event"}
              </h2>

              <button
                type="button"
                onClick={closeEventModal}
                aria-label="Close event form"
                className="cursor-pointer rounded-md p-1 transition-all duration-200 hover:bg-white/10 hover:text-gray-300 active:scale-95"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-3 p-4">
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-gray-300">
                  Event Name
                </span>

                <input
                  required
                  value={eventName}
                  onChange={(event) => setEventName(event.target.value)}
                  placeholder="e.g. Design review"
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  style={{
                    background: "#292929",
                    borderColor: "#555555",
                  }}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-gray-300">
                  Date
                </span>

                <span className="relative block">
                  <CalendarDays
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    required
                    type="date"
                    value={eventDate}
                    onChange={(event) => setEventDate(event.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    style={{
                      background: "#292929",
                      borderColor: "#555555",
                      colorScheme: "dark",
                    }}
                  />
                </span>
              </label>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-gray-300">
                  Time
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <label className="relative">
                    <Clock
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      required
                      type="time"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      className="w-full rounded-md border px-2 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      style={{
                        background: "#292929",
                        borderColor: "#555555",
                        colorScheme: "dark",
                      }}
                    />
                  </label>

                  <label className="relative">
                    <Clock
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      required
                      type="time"
                      value={endTime}
                      onChange={(event) => setEndTime(event.target.value)}
                      className="w-full rounded-md border px-2 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      style={{
                        background: "#292929",
                        borderColor: "#555555",
                        colorScheme: "dark",
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 pb-4">
              {editingEventId !== null ? (
                <button
                  type="button"
                  onClick={deleteEvent}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-red-500/50 px-3 py-2 text-xs font-semibold text-red-300 transition-all duration-200 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/10 active:scale-95"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              ) : (
                <span />
              )}

              <button
                type="submit"
                className="flex cursor-pointer items-center gap-2 rounded-md bg-[#1748f5] px-5 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
              >
                <Check size={14} />
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
