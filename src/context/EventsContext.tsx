import React, { createContext, useContext, useState, ReactNode } from "react";
import * as Notifications from "expo-notifications";

type Event = { id: string; title: string; date: string; venue: string; image: string };

type EventsContextType = {
  events: Event[];
  saved: string[];
  registered: string[];
  toggleSave: (id: string) => void;
  registerEvent: (id: string) => void;
  addEvent: (event: Omit<Event, "id">) => void;
  updateEvent: (id: string, event: Omit<Event, "id">) => void;
  deleteEvent: (id: string) => void;
};

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "AI & ML Summit 2025",
      date: "2025-08-30T16:00:00",
      venue: "Auditorium A",
      image: "https://placekitten.com/400/200",
    },
    {
      id: "2",
      title: "Music Fest",
      date: "2025-09-03T18:00:00",
      venue: "Main Stage",
      image: "https://placekitten.com/401/200",
    },
  ]);

  const [saved, setSaved] = useState<string[]>([]);
  const [registered, setRegistered] = useState<string[]>([]);

  const toggleSave = (id: string) => {
    setSaved((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  };

  const registerEvent = async (id: string) => {
    if (!registered.includes(id)) {
      setRegistered([...registered, id]);
      const event = events.find((e) => e.id === id);
      if (event) {
        const eventDate = new Date(event.date);
        const triggerTime = new Date(eventDate.getTime() - 10 * 60 * 1000);
        if (triggerTime > new Date()) {
          await Notifications.scheduleNotificationAsync({
  content: {
    title: "⏰ Event Reminder",
    body: `${event.title} starts soon`,
    sound: true,
  },
  trigger: {
    // 🚀 No `type` field here!
    year: triggerTime.getFullYear(),
    month: triggerTime.getMonth() + 1,
    day: triggerTime.getDate(),
    hour: triggerTime.getHours(),
    minute: triggerTime.getMinutes(),
  },
});

        }
      }
    }
  };

  const addEvent = (event: Omit<Event, "id">) => {
    setEvents((prev) => [...prev, { id: Date.now().toString(), ...event }]);
  };

  const updateEvent = (id: string, updated: Omit<Event, "id">) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setSaved((prev) => prev.filter((e) => e !== id));
    setRegistered((prev) => prev.filter((e) => e !== id));
  };

  return (
    <EventsContext.Provider
      value={{ events, saved, registered, toggleSave, registerEvent, addEvent, updateEvent, deleteEvent }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be inside EventsProvider");
  return ctx;
}
