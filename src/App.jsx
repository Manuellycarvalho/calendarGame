import React, { useState, useEffect } from "react";
import "./index.css";

const Calendar2 = () => {
  const [today] = useState(new Date());
  const [activeDay, setActiveDay] = useState(today.getDate());
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [eventsArr, setEventsArr] = useState([]);
  const [days, setDays] = useState([]);
  const [events, setEvents] = useState([]);
  const [inputDate, setInputDate] = useState("");
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  useEffect(() => {
    const savedEvents = localStorage.getItem("events");
    if (savedEvents) {
      setEventsArr(JSON.parse(savedEvents));
    }
  }, []);

  useEffect(() => {
    initCalendar();
    updateEvents(activeDay);
  }, [month, year, eventsArr, activeDay]);

  const initCalendar = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevDaysCount = new Date(year, month, 0).getDate();
    const daysArray = [];

    // Dias do mês anterior
    for (let x = firstDay.getDay(); x > 0; x--) {
      daysArray.push(<div key={`prev-${x}`} className="day prev-date">{prevDaysCount - x + 1}</div>);
    }

    // Dias do mês atual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const hasEvent = eventsArr.some(eventObj =>
        eventObj.day === i && eventObj.month === month + 1 && eventObj.year === year
      );
      const isToday = i === today.getDate() && year === today.getFullYear() && month === today.getMonth();

      daysArray.push(
        <div
          key={`day-${i}`}
          className={`day ${isToday ? 'today active' : ''} ${hasEvent ? 'event' : ''}`}
          onClick={() => setActiveDay(i)}
        >
          {i}
        </div>
      );
    }

    // Dias do próximo mês
    const nextDaysCount = 7 - lastDay.getDay() - 1;
    for (let j = 1; j <= nextDaysCount; j++) {
      daysArray.push(<div key={`next-${j}`} className="day next-date">{j}</div>);
    }

    setDays(daysArray);
  };

  const changeMonth = (delta) => {
    setMonth(prev => {
      const newMonth = prev + delta;
      if (newMonth < 0) {
        setYear(year => year - 1);
        return 11;
      } else if (newMonth > 11) {
        setYear(year => year + 1);
        return 0;
      }
      return newMonth;
    });
  };

  const handleTodayClick = () => {
    const currentDate = new Date();
    setActiveDay(currentDate.getDate());
    setMonth(currentDate.getMonth());
    setYear(currentDate.getFullYear());
  };

  const getActiveDayInfo = () => {
    const day = new Date(year, month, activeDay);
    const dayName = obterNomeDiaEmPortugues(day.getDay());
    return { day: dayName, date: `${activeDay} ${months[month]} ${year}` };
  };

  const obterNomeDiaEmPortugues = (diaSemana) => {
    const diasDaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return diasDaSemana[diaSemana];
  };

  const updateEvents = (date) => {
    const eventsArray = eventsArr.filter(event =>
      date === event.day && month + 1 === event.month && year === event.year
    );

    const eventComponents = eventsArray.flatMap(event =>
      event.events.map(eventItem => (
        <div key={eventItem.title} className="event">
          <div className="title">
            <i className="fas fa-circle"></i>
            <h3 className="event-title">{eventItem.title}</h3>
          </div>
          <div className="event-time">
            <span className="event-time">{eventItem.time}</span>
          </div>
        </div>
      ))
    );

    setEvents(eventComponents.length === 0 ? 
      <div key="no-event" className="no-event"><h3>No Events</h3></div> : 
      eventComponents
    );
  };

  const handleInputChange = (e) => {
    setInputDate(e.target.value);
  };

  const handleGotoDate = () => {
    const [inputMonth, inputYear] = inputDate.split("/");
    const monthNumber = parseInt(inputMonth, 10) - 1;
    const yearNumber = parseInt(inputYear, 10);

    if (monthNumber >= 0 && monthNumber <= 11 && yearNumber) {
      setMonth(monthNumber);
      setYear(yearNumber);
      setActiveDay(1); // Reseta para o primeiro dia do mês selecionado
    } else {
      alert("Por favor, insira uma data válida no formato mm/yyyy.");
    }
  };

  const handleAddEventClick = () => {
    setShowAddEventForm((prev) => !prev);
  };

  const handleSaveEvent = () => {
    if (!newEventTitle || !newEventTime) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const newEvent = {
      day: activeDay,
      month: month + 1,
      year: year,
      events: [{ title: newEventTitle, time: newEventTime }]
    };

    // Verifica se já existem eventos para esse dia
    const existingEventIndex = eventsArr.findIndex(event => 
      event.day === activeDay && event.month === month + 1 && event.year === year
    );

    let updatedEventsArr;
    if (existingEventIndex > -1) {
      // Atualiza os eventos existentes
      const existingEvent = eventsArr[existingEventIndex];
      updatedEventsArr = [...eventsArr];
      updatedEventsArr[existingEventIndex] = {
        ...existingEvent,
        events: [...existingEvent.events, newEvent.events[0]]
      };
    } else {
      // Adiciona novo evento
      updatedEventsArr = [...eventsArr, newEvent];
    }

    setEventsArr(updatedEventsArr);
    localStorage.setItem("events", JSON.stringify(updatedEventsArr));

    setNewEventTitle("");
    setNewEventTime("");
    setShowAddEventForm(false);
    updateEvents(activeDay);
  };

  return (
    <div className="container">
      <div className="left">
        <div className="calendar">
          <div className="month">
            <div className="date">{months[month]} {year}</div>
          </div>
          <div className="weekdays">
            <div>D</div>
            <div>S</div>
            <div>T</div>
            <div>Q</div>
            <div>Q</div>
            <div>S</div>
            <div>S</div>
          </div>
          <div className="days">{days}</div>
          <div className="goto-today">
            <div className="goto">
              <input
                type="text"
                placeholder="mm/yyyy"
                className="date-input"
                value={inputDate}
                onChange={handleInputChange}
              />
              <button className="goto-btn" onClick={handleGotoDate}>Ir</button>
            </div>
            <button className="today-btn" onClick={handleTodayClick}>Hoje</button>
          </div>
        </div>
      </div>
      <div className="right">
        <div className="today-date">
          <div className="event-day">{getActiveDayInfo()?.day}</div>
          <div className="event-date">{getActiveDayInfo()?.date}</div>
        </div>
        <div className="events">{events}</div>
        <div className="add-event-wrapper">
          {showAddEventForm && (
            <div className="add-event-form">
              <input
                type="text"
                placeholder="Título do Evento"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
              />
              <input
                type="time"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
              />
              <button onClick={handleSaveEvent}>Salvar</button>
            </div>
          )}
        </div>
      </div>
      <button className="add-event" onClick={handleAddEventClick}>
        <i className="fas fa-plus"></i> Adicionar
      </button>
    </div>
  );
};

export default Calendar2;
